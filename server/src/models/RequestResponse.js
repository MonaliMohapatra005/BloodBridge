import mongoose from 'mongoose';

const requestResponseSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      required: true,
    },
    responderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: [
        'CONFIRMED_PRIMARY',
        'CONFIRMED_BACKUP',
        'EN_ROUTE',
        'ARRIVED',
        'DONATED',
        'WITHDRAWN',
      ],
      required: true,
    },
    responderLat: {
      type: Number,
      required: true,
    },
    responderLng: {
      type: Number,
      required: true,
    },
    distanceMeters: {
      type: Number,
      default: 0,
    },
    etaSeconds: {
      type: Number,
      default: 0,
    },
    poolRank: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

requestResponseSchema.index({ requestId: 1, responderId: 1 }, { unique: true });
requestResponseSchema.index({ requestId: 1, status: 1, etaSeconds: 1 });

export default mongoose.model('RequestResponse', requestResponseSchema);

