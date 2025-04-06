// models/Household.js - Household model
const mongoose = require('mongoose');

const HouseholdSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  solarCapacity: {
    type: Number,
    required: true,
    min: 0
  },
  batteryCapacity: {
    type: Number,
    required: true,
    min: 0
  },
  currentBatteryLevel: {
    type: Number,
    default: 0,
    min: 0
  },
  baseConsumption: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    type: {
      latitude: Number,
      longitude: Number
    },
    required: false
  },
  energyData: [{
    timestamp: Date,
    production: Number,
    consumption: Number,
    batteryLevel: Number,
    surplus: Number,
    gridSold: Number,
    gridBought: Number,
    p2pSold: Number,
    p2pBought: Number
  }],
  sellPriceMin: {
    type: Number,
    default: 0.08,
    min: 0
  },
  buyPriceMax: {
    type: Number,
    default: 0.15,
    min: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Household', HouseholdSchema);