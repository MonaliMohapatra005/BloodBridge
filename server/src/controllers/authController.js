import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'bloodbridge_default_jwt_secret_change_in_production';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: userId }, secret, { expiresIn });
};

// @desc    Register role-less community member with blood group
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { fullName, phone, email, password, bloodGroup } = req.body;

    if (!fullName || !phone || !password || !bloodGroup) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, phone number, password, and blood group',
      });
    }

    const validGroups = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
    if (!validGroups.includes(bloodGroup)) {
      return res.status(400).json({
        success: false,
        message: `Invalid blood group. Must be one of: ${validGroups.join(', ')}`,
      });
    }

    const existingUser = await User.findOne({ phone: phone.trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this phone number is already registered',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : undefined,
      passwordHash,
      bloodGroup,
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully. Please login to continue.',
      user: {
        _id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        bloodGroup: user.bloodGroup,
        isAvailableToDonate: user.isAvailableToDonate,
        totalDonations: user.totalDonations,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error during registration',
    });
  }
};

// @desc    Authenticate user & return token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phone and password',
      });
    }

    const user = await User.findOne({ phone: phone.trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password',
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        bloodGroup: user.bloodGroup,
        isAvailableToDonate: user.isAvailableToDonate,
        lastDonatedAt: user.lastDonatedAt,
        totalDonations: user.totalDonations,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error during login',
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

// @desc    Update donor availability, cooldown date, or FCM token
// @route   PATCH /api/auth/me/readiness
// @access  Private
export const updateDonorReadiness = async (req, res) => {
  try {
    const { fullName, email, isAvailableToDonate, lastDonatedAt, fcmToken } = req.body;
    const updates = {};

    if (fullName !== undefined) updates.fullName = fullName.trim();
    if (email !== undefined) updates.email = email ? email.trim().toLowerCase() : null;
    if (isAvailableToDonate !== undefined) updates.isAvailableToDonate = isAvailableToDonate;
    if (lastDonatedAt !== undefined) updates.lastDonatedAt = lastDonatedAt === '' ? null : lastDonatedAt;
    if (fcmToken !== undefined) updates.fcmToken = fcmToken;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-passwordHash');

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error updating readiness',
    });
  }
};

