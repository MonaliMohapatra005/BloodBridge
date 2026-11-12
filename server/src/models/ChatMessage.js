import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Message cannot be empty'],
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

chatMessageSchema.index({ requestId: 1, createdAt: 1 });

export default mongoose.model('ChatMessage', chatMessageSchema);

