import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    bloodGroup: {
      type: String,
      enum: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
      required: [true, 'Blood group is required at registration'],
    },
    isAvailableToDonate: {
      type: Boolean,
      default: true,
    },
    lastDonatedAt: {
      type: Date,
      default: null,
    },
    fcmToken: {
      type: String,
      default: null,
    },
    totalDonations: {
      type: Number,
      default: 0,
      min: 0,
    },
    reliabilityScore: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 1,
    },
  },
  { timestamps: true }
);

userSchema.index({ bloodGroup: 1, isAvailableToDonate: 1 });

userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

export default mongoose.model('User', userSchema);
