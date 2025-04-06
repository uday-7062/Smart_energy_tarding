// UserPortal.js - Component for user energy purchasing interface
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const UserPortal = ({ households, transactions, currentHour }) => {
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  const [availableEnergy, setAvailableEnergy] = useState([]);
  const [purchaseAmount, setPurchaseAmount] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0.15);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [energyForecast, setEnergyForecast] = useState([]);
  const [notification, setNotification] = useState(null);

  // Select first household by default
  useEffect(() => {
    if (households.length > 0 && !selectedHousehold) {
      setSelectedHousehold(households[0]);
    }
  }, [households, selectedHousehold]);

  // Update available energy whenever households change
  useEffect(() => {
    if (households.length > 0) {
      // Find sellers with surplus energy
      const sellers = households
        .filter(h => h.energySurplus > 0.1)
        .map(h => ({
          id: h.id,
          name: h.name,
          available: h.energySurplus,
          price: h.sellPriceMin,
        }))
        .sort((a, b) => a.price - b.price);
      
      setAvailableEnergy(sellers);
    }
  }, [households]);

  // Generate energy forecast for the selected household
  useEffect(() => {
    if (selectedHousehold) {
      const forecast = [];
      
      // Generate 24 hours of forecast data
      for (let hour = 0; hour < 24; hour++) {
        // Simple consumption forecast based on time patterns
        let consumption = selectedHousehold.baseConsumption;
        if (hour >= 7 && hour <= 9) consumption *= 1.5;
        if (hour >= 18 && hour <= 22) consumption *= 2.0;
        if (hour >= 23 || hour <= 5) consumption *= 0.5;
        
        forecast.push({
          hour: `${hour}:00`,
          consumption: consumption + (Math.random() * 0.2 - 0.1) * consumption,
          gridEnergy: consumption * 0.7,
          p2pEnergy: consumption * 0.3,
        });
      }
      
      setEnergyForecast(forecast);
    }
  }, [selectedHousehold]);

  // Filter transactions for the selected household
  useEffect(() => {
    if (selectedHousehold && transactions.length > 0) {
      const userTransactions = transactions.filter(
        tx => tx.buyerId === selectedHousehold.id
      ).slice(0, 10); // Get last 10 transactions
      
      setPurchaseHistory(userTransactions);
    }
  }, [selectedHousehold, transactions]);

  // Handle household selection
  const handleHouseholdChange = (e) => {
    const household = households.find(h => h.id === parseInt(e.target.value));
    setSelectedHousehold(household);
  };

  // Handle purchase
  const handlePurchase = () => {
    if (purchaseAmount <= 0) {
      setNotification({ type: 'error', message: 'Please enter a valid amount to purchase' });
      return;
    }
    
    // Find available sellers that match our price criteria
    const affordableSellers = availableEnergy.filter(seller => seller.price <= maxPrice);
    
    if (affordableSellers.length === 0) {
      setNotification({ type: 'error', message: 'No sellers available at your maximum price' });
      return;
    }
    
    // Check if enough energy is available
    const totalAvailable = affordableSellers.reduce((sum, seller) => sum + seller.available, 0);
    
    if (totalAvailable < purchaseAmount) {
      setNotification({ 
        type: 'error', 
        message: `Only ${totalAvailable.toFixed(1)} kWh available at your price point` 
      });
      return;
    }
    
    // Simulate successful purchase
    setNotification({ 
      type: 'success', 
      message: `Successfully purchased ${purchaseAmount} kWh for $${(purchaseAmount * maxPrice).toFixed(2)}` 
    });
    
    // Reset purchase amount
    setPurchaseAmount(0);
    
    // Add to purchase history (simulated)
    const newTransaction = {
      id: `tx-${Date.now()}`,
      sellerId: affordableSellers[0].id,
      buyerId: selectedHousehold.id,
      amount: purchaseAmount,
      price: purchaseAmount * maxPrice,
      timestamp: Date.now()
    };
    
    setPurchaseHistory(prev => [newTransaction, ...prev].slice(0, 10));
  };

  // Format date from timestamp
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!selectedHousehold) {
    return <div className="user-portal-loading">Loading user portal...</div>;
  }

  return (
    <div className="user-portal">
      {/* Header with user selection */}
      <div className="user-portal-header">
        <div className="header-content">
          <div>
            <h1 className="portal-title">Energy User Portal</h1>
            <p className="portal-subtitle">Purchase clean energy directly from your neighbors</p>
          </div>
          
          <div className="household-selector">
            <label className="selector-label">Select Your Household:</label>
            <select 
              className="household-select"
              value={selectedHousehold.id}
              onChange={handleHouseholdChange}
            >
              {households.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Main content grid */}
      <div className="portal-content">
        {/* Household info card */}
        <div className="portal-card">
          <h2 className="card-title">My Energy Profile</h2>
          
          <div className="energy-metrics">
            <div className="metric">
              <div className="metric-label">Current Consumption</div>
              <div className="metric-value">{selectedHousehold.currentConsumption?.toFixed(1) || '0.0'} kWh</div>
            </div>
            
            <div className="metric">
              <div className="metric-label">Solar Production</div>
              <div className="metric-value">{selectedHousehold.currentProduction?.toFixed(1) || '0.0'} kWh</div>
            </div>
            
            <div className="metric">
              <div className="metric-label">Battery Status</div>
              <div className="metric-value">
                {((selectedHousehold.battery / selectedHousehold.batteryCapacity) * 100).toFixed(0)}%
              </div>
            </div>
            
            <div className="metric">
              <div className="metric-label">Energy Balance</div>
              <div className={`metric-value ${selectedHousehold.energySurplus >= 0 ? 'surplus' : 'deficit'}`}>
                {selectedHousehold.energySurplus?.toFixed(1) || '0.0'} kWh
              </div>
            </div>
          </div>
          
          <div className="forecast-section">
            <h3 className="section-title">Energy Forecast</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={energyForecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="consumption" name="Consumption" stroke="#8884d8" />
                  <Line type="monotone" dataKey="p2pEnergy" name="P2P Energy" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Energy marketplace */}
        <div className="portal-card">
          <h2 className="card-title">Energy Marketplace</h2>
          
          <div className="marketplace-section">
            <h3 className="section-title">Available Energy</h3>
            {availableEnergy.length === 0 ? (
              <p className="no-data-message">No energy listings available at the moment</p>
            ) : (
              <div className="energy-listings">
                {availableEnergy.map(seller => (
                  <div key={seller.id} className="energy-listing">
                    <div>
                      <span className="seller-name">{seller.name}</span> 
                      <span className="energy-amount">{seller.available.toFixed(1)} kWh</span>
                    </div>
                    <div className="energy-price">${seller.price.toFixed(2)}/kWh</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="purchase-section">
            <h3 className="section-title">Purchase Energy</h3>
            
            <div className="form-group">
              <label className="form-label">Amount (kWh):</label>
              <input 
                type="number" 
                min="0" 
                step="0.1" 
                className="form-input" 
                value={purchaseAmount} 
                onChange={(e) => setPurchaseAmount(parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Max Price ($/kWh):</label>
              <input 
                type="number" 
                min="0.01" 
                step="0.01" 
                className="form-input" 
                value={maxPrice} 
                onChange={(e) => setMaxPrice(parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div className="estimated-total">
              Estimated Total: ${(purchaseAmount * maxPrice).toFixed(2)}
            </div>
            
            <button 
              className="purchase-button"
              onClick={handlePurchase}
            >
              Purchase Now
            </button>
            
            {notification && (
              <div className={`notification ${notification.type}`}>
                {notification.message}
              </div>
            )}
          </div>
        </div>
        
        {/* Transaction history */}
        <div className="portal-card">
          <h2 className="card-title">Purchase History</h2>
          
          {purchaseHistory.length === 0 ? (
            <div className="no-data-message">No transaction history available</div>
          ) : (
            <div className="transaction-history">
              {purchaseHistory.map(tx => {
                const seller = households.find(h => h.id === tx.sellerId);
                
                return (
                  <div key={tx.id} className="transaction-item">
                    <div className="transaction-header">
                      <span className="transaction-amount">Purchased {tx.amount.toFixed(1)} kWh</span>
                      <span className="transaction-price">${tx.price.toFixed(2)}</span>
                    </div>
                    <div className="transaction-seller">
                      From: {seller ? seller.name : `Household #${tx.sellerId}`}
                    </div>
                    <div className="transaction-time">
                      {formatDate(tx.timestamp)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="savings-section">
            <h3 className="section-title">Energy Savings</h3>
            <div className="savings-metrics">
              <div className="savings-metric">
                <div className="metric-label">This Month</div>
                <div className="metric-value">$47.22</div>
              </div>
              <div className="savings-metric">
                <div className="metric-label">Total Savings</div>
                <div className="metric-value">$182.55</div>
              </div>
              <div className="savings-metric">
                <div className="metric-label">Grid Avoided</div>
                <div className="metric-value">127 kWh</div>
              </div>
              <div className="savings-metric">
                <div className="metric-label">CO₂ Reduction</div>
                <div className="metric-value">52 kg</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPortal;