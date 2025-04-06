// models/Transaction.js - Transaction model
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Household',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Household',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  pricePerKwh: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  blockchainReference: {
    type: String,
    required: false
  }
});

// Calculate total amount in pre-save
TransactionSchema.pre('save', function(next) {
  if (!this.isModified('amount') && !this.isModified('pricePerKwh')) {
    return next();
  }
  
  this.price = parseFloat((this.amount * this.pricePerKwh).toFixed(2));
  next();
});

module.exports = mongoose.model('Transaction', TransactionSchema);