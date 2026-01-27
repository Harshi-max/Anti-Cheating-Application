const mongoose = require('mongoose');

// Session model is used to bind JWTs to a specific device/session and
// to support server-side invalidation and replay protection.
const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userAgent: {
      type: String,
      required: true
    },
    ip: {
      type: String
    },
    // Optional fingerprint from frontend (can be extended later)
    fingerprint: {
      type: String
    },
    // Whether this session is currently allowed to be used
    isActive: {
      type: Boolean,
      default: true
    },
    // JWTs issued for this session must not be valid beyond this time
    expiresAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

sessionSchema.index({ user: 1, isActive: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Session', sessionSchema);


