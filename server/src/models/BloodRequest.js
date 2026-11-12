import mongoose from 'mongoose';

const bloodRequestSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
      required: [true, 'Blood group is required'],
    },
    unitsNeeded: {
      type: Number,
      required: true,
      min: [1, 'Must request at least 1 unit'],
      max: [10, 'Cannot exceed 10 units per request'],
      default: 1,
    },
    urgencyLevel: {
      type: String,
      enum: ['CRITICAL', 'URGENT', 'SCHEDULED'],
      default: 'CRITICAL',
    },
    hospitalName: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
    },
    hospitalAddress: {
      type: String,
      required: [true, 'Hospital address is required'],
      trim: true,
    },
    hospitalLat: {
      type: Number,
      required: [true, 'Hospital latitude is required'],
    },
    hospitalLng: {
      type: Number,
      required: [true, 'Hospital longitude is required'],
    },
    status: {
      type: String,
      enum: ['BROADCASTING', 'RESPONDERS_POOLING', 'FULFILLED', 'CANCELLED', 'EXPIRED'],
      default: 'BROADCASTING',
    },
    targetPoolSize: {
      type: Number,
      default: 3,
    },
    notifiedUserIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

bloodRequestSchema.index({ status: 1, bloodGroup: 1 });
bloodRequestSchema.index({ requesterId: 1 });
bloodRequestSchema.index({ createdAt: -1 });

export default mongoose.model('BloodRequest', bloodRequestSchema);

