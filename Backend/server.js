// server.js - Main backend file for Community Energy Sharing Platform
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const householdRoutes = require('./routes/household');
const transactionRoutes = require('./routes/transactions');
const userRoutes = require('./routes/users');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect("mongodb://localhost:27017/")
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/households', householdRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);

// Home route
app.get('/', (req, res) => {
  res.send('Community Energy Sharing Platform API');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});