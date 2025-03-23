const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentIntentId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'refunded'],
    default: 'pending'
  },
  downloadUrl: {
    type: String
  },
  downloadExpiry: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Purchase', purchaseSchema); 