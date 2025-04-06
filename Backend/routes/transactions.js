// routes/transactions.js - Transaction routes
const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Household = require('../models/Household');
const authMiddleware = require('../middleware/auth');

// Get all transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('seller', 'name')
      .populate('buyer', 'name')
      .sort({ timestamp: -1 });
    
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get transactions by household ID (either as seller or buyer)
router.get('/household/:id', async (req, res) => {
  try {
    const householdId = req.params.id;
    
    const transactions = await Transaction.find({
      $or: [
        { seller: householdId },
        { buyer: householdId }
      ]
    })
      .populate('seller', 'name')
      .populate('buyer', 'name')
      .sort({ timestamp: -1 });
    
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('seller', 'name')
      .populate('buyer', 'name');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new transaction (protected route)
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Verify seller and buyer exist
    const seller = await Household.findById(req.body.seller);
    const buyer = await Household.findById(req.body.buyer);
    
    if (!seller || !buyer) {
      return res.status(404).json({ message: 'Seller or buyer household not found' });
    }
    
    // Check if user owns either the seller or buyer household or is admin
    const isSellerOwner = seller.owner.toString() === req.user.id;
    const isBuyerOwner = buyer.owner.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isSellerOwner && !isBuyerOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to create this transaction' });
    }
    
    // Create transaction
    const transaction = new Transaction({
      seller: req.body.seller,
      buyer: req.body.buyer,
      amount: req.body.amount,
      pricePerKwh: req.body.pricePerKwh,
      status: req.body.status || 'completed',
      blockchainReference: req.body.blockchainReference
    });
    
    const newTransaction = await transaction.save();
    
    // Update seller's energy data
    seller.energyData.push({
      timestamp: new Date(),
      production: seller.energyData.length > 0 ? seller.energyData[seller.energyData.length - 1].production : 0,
      consumption: seller.energyData.length > 0 ? seller.energyData[seller.energyData.length - 1].consumption : 0,
      p2pSold: req.body.amount,
      surplus: (seller.energyData.length > 0 ? seller.energyData[seller.energyData.length - 1].surplus : 0) - req.body.amount
    });
    
    // Update buyer's energy data
    buyer.energyData.push({
      timestamp: new Date(),
      production: buyer.energyData.length > 0 ? buyer.energyData[buyer.energyData.length - 1].production : 0,
      consumption: buyer.energyData.length > 0 ? buyer.energyData[buyer.energyData.length - 1].consumption : 0,
      p2pBought: req.body.amount,
      surplus: (buyer.energyData.length > 0 ? buyer.energyData[buyer.energyData.length - 1].surplus : 0) + req.body.amount
    });
    
    await seller.save();
    await buyer.save();
    
    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update transaction status (protected, admin only)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update transaction status' });
    }
    
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    transaction.status = req.body.status;
    const updatedTransaction = await transaction.save();
    
    res.json(updatedTransaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get transaction statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const totalTransactions = await Transaction.countDocuments();
    
    const totalEnergy = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalValue: { $sum: '$price' }
        }
      }
    ]);
    
    const dailyStats = await Transaction.aggregate([
      {
        $group: {
          _id: { 
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } 
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalValue: { $sum: '$price' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 7 }
    ]);
    
    res.json({
      totalTransactions,
      totalEnergy: totalEnergy.length > 0 ? totalEnergy[0].totalAmount : 0,
      totalValue: totalEnergy.length > 0 ? totalEnergy[0].totalValue : 0,
      dailyStats
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;