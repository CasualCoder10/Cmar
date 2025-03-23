const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { protect } = require('../middleware/auth');
const Purchase = require('../models/Purchase');
const Listing = require('../models/Listing');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a purchase
router.post('/', protect, async (req, res) => {
  try {
    const { listingId, paymentIntentId } = req.body;
    
    // Verify the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not completed' });
    }
    
    // Get the listing
    const listing = await Listing.findById(listingId);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Create a unique download URL (in production, use signed URLs)
    const downloadToken = uuidv4();
    const downloadExpiry = new Date();
    downloadExpiry.setDate(downloadExpiry.getDate() + 30); // 30 days download window
    
    // Create purchase record
    const purchase = await Purchase.create({
      buyer: req.user._id,
      listing: listing._id,
      amount: listing.price,
      paymentIntentId,
      status: 'completed',
      downloadUrl: `/api/purchases/download/${downloadToken}`,
      downloadExpiry
    });
    
    // Update listing sales count if not already done by webhook
    await Listing.findByIdAndUpdate(listingId, {
      $inc: { sales: 1 }
    });
    
    res.status(201).json({
      message: 'Purchase completed successfully',
      purchaseId: purchase._id,
      downloadUrl: purchase.downloadUrl
    });
  } catch (error) {
    console.error('Purchase creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's purchases
router.get('/my-purchases', protect, async (req, res) => {
  try {
    const purchases = await Purchase.find({ buyer: req.user._id })
      .populate({
        path: 'listing',
        select: 'title price category tags'
      })
      .sort({ createdAt: -1 });
    
    res.json({ purchases });
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download purchased file
router.get('/download/:token', protect, async (req, res) => {
  try {
    const purchase = await Purchase.findOne({
      downloadUrl: { $regex: req.params.token },
      buyer: req.user._id
    }).populate('listing');
    
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    
    // Check if download has expired
    if (purchase.downloadExpiry < new Date()) {
      return res.status(400).json({ message: 'Download link has expired' });
    }
    
    // Check if purchase is completed
    if (purchase.status !== 'completed') {
      return res.status(400).json({ message: 'Purchase is not completed' });
    }
    
    // Send the file
    res.download(purchase.listing.fileUrl);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 