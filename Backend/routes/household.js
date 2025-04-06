// routes/households.js - Household routes
const express = require('express');
const router = express.Router();
const Household = require('../models/Household');
const authMiddleware = require('../middleware/auth');

// Get all households
router.get('/', async (req, res) => {
  try {
    const households = await Household.find({ active: true }).populate('owner', 'name email');
    res.json(households);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get household by ID
router.get('/:id', async (req, res) => {
  try {
    const household = await Household.findById(req.params.id).populate('owner', 'name email');
    if (!household) {
      return res.status(404).json({ message: 'Household not found' });
    }
    res.json(household);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create household (protected route)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const household = new Household({
      ...req.body,
      owner: req.user.id // Set from auth middleware
    });
    
    const newHousehold = await household.save();
    res.status(201).json(newHousehold);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update household (protected route)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const household = await Household.findById(req.params.id);
    
    if (!household) {
      return res.status(404).json({ message: 'Household not found' });
    }
    
    // Check if user owns the household
    if (household.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this household' });
    }
    
    // Update fields
    const updates = req.body;
    Object.keys(updates).forEach(update => {
      household[update] = updates[update];
    });
    
    const updatedHousehold = await household.save();
    res.json(updatedHousehold);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete household (protected route)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const household = await Household.findById(req.params.id);
    
    if (!household) {
      return res.status(404).json({ message: 'Household not found' });
    }
    
    // Check if user owns the household
    if (household.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this household' });
    }
    
    // Soft delete by setting active to false
    household.active = false;
    await household.save();
    
    res.json({ message: 'Household deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update energy data for a household
router.post('/:id/energy', authMiddleware, async (req, res) => {
  try {
    const household = await Household.findById(req.params.id);
    
    if (!household) {
      return res.status(404).json({ message: 'Household not found' });
    }
    
    // Check if user owns the household
    if (household.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this household' });
    }
    
    // Add new energy data
    const energyData = {
      timestamp: new Date(),
      ...req.body
    };
    
    household.energyData.push(energyData);
    
    // Update current battery level
    if (req.body.batteryLevel !== undefined) {
      household.currentBatteryLevel = req.body.batteryLevel;
    }
    
    const updatedHousehold = await household.save();
    res.json(updatedHousehold);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get energy data for a household
router.get('/:id/energy', async (req, res) => {
  try {
    const household = await Household.findById(req.params.id);
    
    if (!household) {
      return res.status(404).json({ message: 'Household not found' });
    }
    
    // Filter by date range if provided
    let energyData = household.energyData;
    
    if (req.query.from && req.query.to) {
      const fromDate = new Date(req.query.from);
      const toDate = new Date(req.query.to);
      
      energyData = energyData.filter(data => {
        const dataDate = new Date(data.timestamp);
        return dataDate >= fromDate && dataDate <= toDate;
      });
    }
    
    res.json(energyData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;