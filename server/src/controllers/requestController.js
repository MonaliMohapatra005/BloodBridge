import axios from 'axios';
import BloodRequest from '../models/BloodRequest.js';
import RequestResponse from '../models/RequestResponse.js';
import User from '../models/User.js';

// ==========================================
// 1. BLOOD GROUP COMPATIBILITY MATRIX (RBC)
// ==========================================
// Recipient Compatibility (Inbound): Which donors can donate to a patient with recipientGroup?
const RBC_COMPATIBILITY = {
  'O-': ['O-'],
  'O+': ['O+', 'O-'],
  'A-': ['A-', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'], // Universal Recipient: A, B, O, AB can all donate
};

// Donor Compatibility (Outbound): Which patient blood groups can a donor with donorGroup give to?
const DONOR_CAN_DONATE_TO = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal Donor: can donate to everyone
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

const getCompatibleDonors = (recipientGroup) => {
  return RBC_COMPATIBILITY[recipientGroup] || [];
};

const getRecipientGroupsForDonor = (donorGroup) => {
  return DONOR_CAN_DONATE_TO[donorGroup] || [];
};

const isDonorCompatible = (donorGroup, recipientGroup) => {
  const compatibleDonors = getCompatibleDonors(recipientGroup);
  return compatibleDonors.includes(donorGroup);
};

// ==========================================
// 2. ROAD TRAVEL DISTANCE & ETA CALCULATION
// ==========================================
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

const calculateRoadETA = async (donorLat, donorLng, hospitalLat, hospitalLng) => {
  const osrmBaseUrl = process.env.OSRM_BASE_URL || 'https://router.project-osrm.org';

  try {
    const url = `${osrmBaseUrl}/route/v1/driving/${donorLng},${donorLat};${hospitalLng},${hospitalLat}?overview=false`;
    const response = await axios.get(url, { timeout: 3500 });

    if (response.data && response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      return {
        distanceMeters: Math.round(route.distance),
        etaSeconds: Math.round(route.duration),
        isEstimated: false,
      };
    }
  } catch (err) {
    // Fallback to Haversine if OSRM is offline or slow
  }

  const straightLineMeters = calculateHaversineDistance(donorLat, donorLng, hospitalLat, hospitalLng);
  const estimatedRoadMeters = Math.round(straightLineMeters * 1.25);
  const speedMetersPerSec = 8.33; // ~30 km/h city driving speed
  const estimatedDurationSec = Math.max(120, Math.round(estimatedRoadMeters / speedMetersPerSec));

  return {
    distanceMeters: estimatedRoadMeters,
    etaSeconds: estimatedDurationSec,
    isEstimated: true,
  };
};

// ==========================================
// 3. INTERNAL HELPERS: BROADCAST & POOL
// ==========================================
const broadcastEmergencyAlert = async (bloodRequest, io) => {
  const compatibleGroups = getCompatibleDonors(bloodRequest.bloodGroup);
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const eligibleUsers = await User.find({
    _id: { $ne: bloodRequest.requesterId },
    bloodGroup: { $in: compatibleGroups },
    isAvailableToDonate: true,
    $or: [{ lastDonatedAt: null }, { lastDonatedAt: { $lte: ninetyDaysAgo } }],
  }).select('_id fullName bloodGroup phone fcmToken');

  const eligibleUserIds = eligibleUsers.map((u) => u._id);

  await BloodRequest.findByIdAndUpdate(bloodRequest._id, {
    $addToSet: { notifiedUserIds: { $each: eligibleUserIds } },
  });

  if (io) {
    const alertPayload = {
      requestId: bloodRequest._id,
      patientName: bloodRequest.patientName,
      bloodGroup: bloodRequest.bloodGroup,
      compatibleDonorGroups: compatibleGroups,
      unitsNeeded: bloodRequest.unitsNeeded,
      urgencyLevel: bloodRequest.urgencyLevel,
      hospitalName: bloodRequest.hospitalName,
      hospitalAddress: bloodRequest.hospitalAddress,
      hospitalLat: bloodRequest.hospitalLat,
      hospitalLng: bloodRequest.hospitalLng,
      createdAt: bloodRequest.createdAt,
    };

    eligibleUsers.forEach((user) => {
      io.to(`user:${user._id.toString()}`).emit('emergency:alert', alertPayload);
    });

    console.log(
      `[Broadcast] Alerted ${eligibleUsers.length} compatible users (${compatibleGroups.join(', ')}) for request ${bloodRequest._id}`
    );
  }

  return { notifiedCount: eligibleUsers.length, eligibleUserIds, compatibleDonorGroups: compatibleGroups };
};

const getRankedPool = async (requestId) => {
  return RequestResponse.find({
    requestId,
    status: { $ne: 'WITHDRAWN' },
  })
    .populate('responderId', 'fullName phone bloodGroup reliabilityScore totalDonations')
    .sort({ status: 1, etaSeconds: 1 });
};

const assignResponderToPool = async ({
  requestId,
  responderId,
  responderLat,
  responderLng,
  distanceMeters,
  etaSeconds,
}) => {
  const request = await BloodRequest.findById(requestId);
  if (!request) {
    throw new Error('Blood request not found');
  }

  const primaryCount = await RequestResponse.countDocuments({
    requestId,
    status: { $in: ['CONFIRMED_PRIMARY', 'EN_ROUTE', 'ARRIVED'] },
  });

  const assignedStatus = primaryCount < request.unitsNeeded
    ? 'CONFIRMED_PRIMARY'
    : 'CONFIRMED_BACKUP';

  const totalActive = await RequestResponse.countDocuments({
    requestId,
    status: { $ne: 'WITHDRAWN' },
  });

  const response = await RequestResponse.findOneAndUpdate(
    { requestId, responderId },
    {
      requestId,
      responderId,
      status: assignedStatus,
      responderLat,
      responderLng,
      distanceMeters,
      etaSeconds,
      poolRank: totalActive + 1,
    },
    { new: true, upsert: true, runValidators: true }
  );

  if (request.status === 'BROADCASTING') {
    request.status = 'RESPONDERS_POOLING';
    await request.save();
  }

  return response;
};

const handleResponderWithdrawal = async (requestId, io) => {
  const request = await BloodRequest.findById(requestId);
  if (!request) return null;

  const currentPrimaryCount = await RequestResponse.countDocuments({
    requestId,
    status: { $in: ['CONFIRMED_PRIMARY', 'EN_ROUTE', 'ARRIVED'] },
  });

  if (currentPrimaryCount < request.unitsNeeded) {
    const bestBackup = await RequestResponse.findOne({
      requestId,
      status: 'CONFIRMED_BACKUP',
    }).sort({ etaSeconds: 1 });

    if (bestBackup) {
      bestBackup.status = 'CONFIRMED_PRIMARY';
      await bestBackup.save();

      console.log(`[Pool] Promoted backup responder ${bestBackup.responderId} to primary for request ${requestId}`);

      if (io) {
        io.to(`user:${bestBackup.responderId.toString()}`).emit('emergency:promoted', {
          requestId,
          message: 'You have been promoted to Primary Donor. The patient is counting on your arrival!',
        });

        const updatedPool = await getRankedPool(requestId);
        io.to(`request:${requestId}`).emit('pool:updated', {
          requestId,
          responderPool: updatedPool,
        });
      }

      return bestBackup;
    }
  }

  return null;
};

// ==========================================
// 4. CONTROLLER ACTIONS
// ==========================================

// @desc    Create emergency request and trigger broadcast
// @route   POST /api/requests
// @access  Private
export const createBloodRequest = async (req, res) => {
  try {
    const {
      patientName,
      bloodGroup,
      unitsNeeded = 1,
      urgencyLevel = 'CRITICAL',
      hospitalName,
      hospitalAddress,
      hospitalLat,
      hospitalLng,
      expiresInHours = 12,
    } = req.body;

    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    const targetPoolSize = Number(unitsNeeded) * 2 + 1;

    const request = await BloodRequest.create({
      requesterId: req.user._id,
      patientName: patientName.trim(),
      bloodGroup,
      unitsNeeded: Number(unitsNeeded),
      urgencyLevel,
      hospitalName: hospitalName.trim(),
      hospitalAddress: hospitalAddress.trim(),
      hospitalLat: Number(hospitalLat),
      hospitalLng: Number(hospitalLng),
      targetPoolSize,
      expiresAt,
    });

    const io = req.app.get('io');
    const broadcastResult = await broadcastEmergencyAlert(request, io);

    return res.status(201).json({
      success: true,
      message: `Emergency broadcast triggered to ${broadcastResult.notifiedCount} compatible donors (${broadcastResult.compatibleDonorGroups.join(', ')})`,
      compatibleDonorGroups: broadcastResult.compatibleDonorGroups,
      notifiedDonorsCount: broadcastResult.notifiedCount,
      request,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error creating request',
    });
  }
};

// @desc    Get active emergency requests with donor compatibility
// @route   GET /api/requests
// @access  Private
export const getBloodRequests = async (req, res) => {
  try {
    const { status, mine, compatibleOnly } = req.query;
    const query = {};

    if (mine === 'true') {
      query.requesterId = req.user._id;
    } else {
      if (status) {
        query.status = status;
      } else {
        query.status = { $in: ['BROADCASTING', 'RESPONDERS_POOLING'] };
      }

      // Filter by requests the logged-in donor can medically donate to
      if (compatibleOnly === 'true' && req.user.bloodGroup) {
        const canDonateTo = getRecipientGroupsForDonor(req.user.bloodGroup);
        query.bloodGroup = { $in: canDonateTo };
      }
    }

    const requests = await BloodRequest.find(query)
      .populate('requesterId', 'fullName phone bloodGroup')
      .sort({ createdAt: -1 })
      .limit(50);

    const enrichedRequests = requests.map((item) => {
      const reqObj = item.toObject();
      const compatibleDonors = getCompatibleDonors(item.bloodGroup);
      reqObj.isCompatibleWithMe = compatibleDonors.includes(req.user.bloodGroup);
      reqObj.compatibleDonorGroups = compatibleDonors;
      return reqObj;
    });

    return res.status(200).json({
      success: true,
      myBloodGroup: req.user.bloodGroup,
      canDonateToGroups: getRecipientGroupsForDonor(req.user.bloodGroup),
      count: enrichedRequests.length,
      requests: enrichedRequests,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error fetching requests',
    });
  }
};

// @desc    Get single request details with populated responder pool
// @route   GET /api/requests/:id
// @access  Private
export const getBloodRequestById = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('requesterId', 'fullName phone bloodGroup');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found',
      });
    }

    const pool = await getRankedPool(request._id);

    const myResponse = await RequestResponse.findOne({
      requestId: request._id,
      responderId: req.user._id,
    });

    const compatibleDonors = getCompatibleDonors(request.bloodGroup);

    return res.status(200).json({
      success: true,
      request,
      compatibility: {
        patientBloodGroup: request.bloodGroup,
        myBloodGroup: req.user.bloodGroup,
        isCompatibleWithMe: compatibleDonors.includes(req.user.bloodGroup),
        compatibleDonorGroups: compatibleDonors,
      },
      responderPool: pool,
      myResponse,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error fetching request details',
    });
  }
};

// @desc    Confirm help with one-time current location (No continuous GPS tracking)
// @route   POST /api/requests/:id/respond
// @access  Private
export const respondToRequest = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found',
      });
    }

    if (['FULFILLED', 'CANCELLED', 'EXPIRED'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: `This request is already ${request.status.toLowerCase()}`,
      });
    }

    // Real-World RBC Blood Compatibility Verification
    // e.g. O- can donate to anyone; O+ can donate to all Rh+; A, B, O, AB can all donate to AB+
    const compatibleDonorGroups = getCompatibleDonors(request.bloodGroup);
    const donorGroup = req.user.bloodGroup;
    const isCompatible = compatibleDonorGroups.includes(donorGroup);

    if (!isCompatible) {
      return res.status(400).json({
        success: false,
        message: `Incompatible blood group. Your blood group is ${donorGroup}, but this patient requires ${request.bloodGroup}. Compatible donor blood groups for ${request.bloodGroup} are: ${compatibleDonorGroups.join(', ')}.`,
        donorBloodGroup: donorGroup,
        patientBloodGroup: request.bloodGroup,
        compatibleDonorGroups,
      });
    }

    const roadInfo = await calculateRoadETA(
      Number(lat),
      Number(lng),
      request.hospitalLat,
      request.hospitalLng
    );

    const response = await assignResponderToPool({
      requestId: request._id,
      responderId: req.user._id,
      responderLat: Number(lat),
      responderLng: Number(lng),
      distanceMeters: roadInfo.distanceMeters,
      etaSeconds: roadInfo.etaSeconds,
    });

    const io = req.app.get('io');
    if (io) {
      const updatedPool = await getRankedPool(request._id);
      io.to(`request:${request._id.toString()}`).emit('pool:updated', {
        requestId: request._id,
        responderPool: updatedPool,
      });
    }

    return res.status(200).json({
      success: true,
      message: `You are confirmed as ${response.status === 'CONFIRMED_PRIMARY' ? 'Primary Donor' : 'Backup Donor'}`,
      bloodCompatibility: {
        donorBloodGroup: donorGroup,
        patientBloodGroup: request.bloodGroup,
        isCompatible: true,
        compatibleDonorGroups,
      },
      response,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error confirming response',
    });
  }
};

// @desc    Update responder milestone status (EN_ROUTE, ARRIVED, DONATED, WITHDRAWN)
// @route   PATCH /api/requests/:id/respond/status
// @access  Private
export const updateResponderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const response = await RequestResponse.findOne({
      requestId: req.params.id,
      responderId: req.user._id,
    });

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Response record not found for this user',
      });
    }

    const previousStatus = response.status;
    response.status = status;
    await response.save();

    const io = req.app.get('io');

    if (status === 'WITHDRAWN' && ['CONFIRMED_PRIMARY', 'EN_ROUTE'].includes(previousStatus)) {
      await handleResponderWithdrawal(req.params.id, io);
    }

    if (status === 'DONATED') {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { totalDonations: 1 },
        lastDonatedAt: new Date(),
      });
    }

    if (io) {
      io.to(`request:${req.params.id}`).emit('responder:statusChanged', {
        responseId: response._id,
        responderId: req.user._id,
        status,
        updatedAt: new Date(),
      });

      const updatedPool = await getRankedPool(req.params.id);
      io.to(`request:${req.params.id}`).emit('pool:updated', {
        requestId: req.params.id,
        responderPool: updatedPool,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      response,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error updating status',
    });
  }
};

// @desc    Mark request FULFILLED or CANCELLED
// @route   PATCH /api/requests/:id/status
// @access  Private (Requester only)
export const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found',
      });
    }

    if (request.requesterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the request creator can update request status',
      });
    }

    request.status = status;
    await request.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`request:${request._id}`).emit('request:statusChanged', {
        requestId: request._id,
        status,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Request marked as ${status}`,
      request,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error updating request status',
    });
  }
};
