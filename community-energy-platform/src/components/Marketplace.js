// Marketplace.js - Component for energy trading and transaction history
import React from 'react';

const Marketplace = ({ households, transactions }) => {
  // Get selling households (those with energy surplus)
  const sellingHouseholds = households.filter(h => h.energySurplus > 0.1)
    .sort((a, b) => b.energySurplus - a.energySurplus);
  
  // Get buying households (those with energy deficit)
  const buyingHouseholds = households.filter(h => h.energySurplus < -0.1)
    .sort((a, b) => a.energySurplus - b.energySurplus);
  
  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="marketplace">
      <div className="transactions-list">
        <h2>Recent Energy Transactions</h2>
        <p>Real-time peer-to-peer energy transactions in the community</p>
        
        {transactions.length === 0 ? (
          <div className="no-transactions">
            No transactions yet. Start the simulation to see energy trading in action.
          </div>
        ) : (
          <div className="transactions-items">
            {transactions.map(transaction => {
              const seller = households.find(h => h.id === transaction.sellerId);
              const buyer = households.find(h => h.id === transaction.buyerId);
              
              return (
                <div className="transaction-item" key={transaction.id}>
                  <div className="transaction-icon seller-icon">S</div>
                  <div className="transaction-details">
                    <div className="transaction-primary">
                      <span className="transaction-household">{seller ? seller.name : 'Unknown'}</span>
                      <span> sold </span>
                      <span className="transaction-amount">{transaction.amount.toFixed(2)} kWh</span>
                      <span> for </span>
                      <span className="transaction-price">${transaction.price.toFixed(2)}</span>
                    </div>
                    <div className="transaction-secondary">
                      to <span className="transaction-household">{buyer ? buyer.name : 'Unknown'}</span>
                      <span className="transaction-time"> at {formatTime(transaction.timestamp)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="energy-listings">
        <div className="listing-section">
          <h3>Available Energy for Sale</h3>
          {sellingHouseholds.length === 0 ? (
            <div className="no-listings">No households currently have surplus energy to sell</div>
          ) : (
            sellingHouseholds.map(household => (
              <div className="listing-item" key={`seller-${household.id}`}>
                <div className="listing-household">
                  <div className="seller-icon">{household.name.charAt(0)}</div>
                  <span>{household.name}</span>
                </div>
                <div className="listing-amount">
                  {household.energySurplus.toFixed(1)} kWh available
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="listing-section">
          <h3>Energy Needed</h3>
          {buyingHouseholds.length === 0 ? (
            <div className="no-listings">No households currently need to buy energy</div>
          ) : (
            buyingHouseholds.map(household => (
              <div className="listing-item" key={`buyer-${household.id}`}>
                <div className="listing-household">
                  <div className="buyer-icon">{household.name.charAt(0)}</div>
                  <span>{household.name}</span>
                </div>
                <div className="listing-amount">
                  {Math.abs(household.energySurplus).toFixed(1)} kWh needed
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="marketplace-stats">
          <h3>Marketplace Statistics</h3>
          <div className="marketplace-stat">
            <div className="stat-label">Total Volume Today</div>
            <div className="stat-value">
              {transactions
                .filter(t => new Date(t.timestamp).toDateString() === new Date().toDateString())
                .reduce((sum, t) => sum + t.amount, 0)
                .toFixed(1)} kWh
            </div>
          </div>
          <div className="marketplace-stat">
            <div className="stat-label">Average Price</div>
            <div className="stat-value">
              {transactions.length > 0 
                ? '$' + (transactions.reduce((sum, t) => sum + t.price, 0) / transactions.length).toFixed(2) + '/kWh'
                : 'N/A'}
            </div>
          </div>
          <div className="marketplace-stat">
            <div className="stat-label">Total Transactions</div>
            <div className="stat-value">{transactions.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;