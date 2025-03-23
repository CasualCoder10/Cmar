const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['web', 'mobile', 'plugins', 'games', 'ai']
  },
  tags: [{
    type: String,
    trim: true
  }],
  fileUrl: {
    type: String,
    required: true
  },
  previewUrl: {
    type: String
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  sales: {
    type: Number,
    default: 0
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Add text index for search functionality
listingSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Listing', listingSchema); 