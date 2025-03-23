const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const Listing = require('../models/Listing');
const { protect, admin } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /zip|rar|gz|7z/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only archive files are allowed'));
  }
});

// Get all listings (public)
router.get('/', async (req, res) => {
  try {
    const { category, sort, search } = req.query;
    let query = { isApproved: true };
    
    // Apply category filter
    if (category) {
      query.category = category;
    }
    
    // Apply search filter
    if (search) {
      query.$text = { $search: search };
    }
    
    // Apply sorting
    let sortOption = {};
    if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'popular') {
      sortOption = { sales: -1 };
    } else if (sort === 'price-low') {
      sortOption = { price: 1 };
    } else if (sort === 'price-high') {
      sortOption = { price: -1 };
    } else {
      sortOption = { createdAt: -1 }; // Default sort
    }
    
    const listings = await Listing.find(query)
      .sort(sortOption)
      .populate('seller', 'name')
      .select('-fileUrl'); // Don't send the actual file URL
    
    res.json({ listings });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single listing (public)
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'name')
      .select('-fileUrl'); // Don't send the actual file URL
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    res.json({ listing });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new listing (protected)
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    let tags = req.body.tags;
    
    // Convert tags string to array if needed
    if (typeof tags === 'string') {
      tags = tags.split(',').map(tag => tag.trim());
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }
    
    const newListing = await Listing.create({
      title,
      description,
      price: parseFloat(price),
      category,
      tags,
      fileUrl: req.file.path,
      seller: req.user._id,
      // For demo purposes, auto-approve listings
      // In production, you'd want admin approval
      isApproved: true
    });
    
    res.status(201).json({
      message: 'Listing created successfully',
      listing: {
        id: newListing._id,
        title: newListing.title
      }
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update listing (protected - seller only)
router.put('/:id', protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Check if user is the seller
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }
    
    const { title, description, price, category, tags } = req.body;
    
    // Update fields
    listing.title = title || listing.title;
    listing.description = description || listing.description;
    listing.price = price || listing.price;
    listing.category = category || listing.category;
    
    if (tags) {
      listing.tags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    }
    
    // Save updated listing
    const updatedListing = await listing.save();
    
    res.json({
      message: 'Listing updated successfully',
      listing: {
        id: updatedListing._id,
        title: updatedListing.title
      }
    });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete listing (protected - seller only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Check if user is the seller
    if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }
    
    // Delete the file
    if (listing.fileUrl && fs.existsSync(listing.fileUrl)) {
      fs.unlinkSync(listing.fileUrl);
    }
    
    // Delete the listing
    await listing.remove();
    
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 