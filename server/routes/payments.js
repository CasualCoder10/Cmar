const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Listing = require('../models/Listing');
const Purchase = require('../models/Purchase');
const { v4: uuidv4 } = require('uuid');

// Create payment request
router.post('/create-request', protect, async (req, res) => {
  try {
    const { listingId } = req.body;
    
    // Get the listing
    const listing = await Listing.findById(listingId);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Check if user is trying to buy their own listing
    if (listing.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot purchase your own listing' });
    }
    
    // Create a unique reference ID
    const referenceId = `CM-${Date.now()}-${uuidv4().substring(0, 6)}`;
    
    // Create pending purchase record
    const purchase = await Purchase.create({
      buyer: req.user._id,
      listing: listing._id,
      amount: listing.price,
      paymentMethod: 'upi',
      paymentReference: referenceId,
      status: 'pending'
    });
    
    res.json({
      purchaseId: purchase._id,
      referenceId,
      amount: listing.price,
      upiId: 'your-business-upi@ybl' // Replace with your actual UPI ID
    });
  } catch (error) {
    console.error('Payment request error:', error);
    res.status(500).json({ message: 'Payment processing error' });
  }
});

// Verify UPI payment
router.post('/verify-upi', protect, async (req, res) => {
  try {
    const { purchaseId, upiTransactionId } = req.body;
    
    // Get the purchase
    const purchase = await Purchase.findById(purchaseId);
    
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    
    // Check if user is the buyer
    if (purchase.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to verify this purchase' });
    }
    
    // Update purchase with UPI transaction ID
    purchase.upiTransactionId = upiTransactionId;
    purchase.status = 'verification_needed';
    await purchase.save();
    
    // In a real app, you would verify the UPI transaction with your bank
    // For demo purposes, we'll mark it as completed
    
    // Create a unique download URL
    const downloadToken = uuidv4();
    const downloadExpiry = new Date();
    downloadExpiry.setDate(downloadExpiry.getDate() + 30); // 30 days download window
    
    purchase.status = 'completed';
    purchase.downloadUrl = `/api/purchases/download/${downloadToken}`;
    purchase.downloadExpiry = downloadExpiry;
    await purchase.save();
    
    // Update listing sales count
    await Listing.findByIdAndUpdate(purchase.listing, {
      $inc: { sales: 1 }
    });
    
    res.json({
      message: 'Payment verified successfully',
      purchaseId: purchase._id,
      downloadUrl: purchase.downloadUrl
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 