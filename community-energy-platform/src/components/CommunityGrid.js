// CommunityGrid.js - Component for visualizing the community of households
import React, { useEffect, useState } from 'react';

const CommunityGrid = ({ households, transactions }) => {
  const [activeTransactions, setActiveTransactions] = useState([]);
  
  // Handle visualizing transactions
  useEffect(() => {
    // Clear old transaction animations
    setActiveTransactions([]);
    
    // Create new transaction animations
    if (transactions.length > 0) {
      const transactionElements = transactions.map(transaction => ({
        id: transaction.id,
        sellerId: transaction.sellerId,
        buyerId: transaction.buyerId,
        amount: transaction.amount,
        price: transaction.price,
      }));
      
      setActiveTransactions(transactionElements);
    }
  }, [transactions]);

  return (
    <div className="community-grid-container">
      <h2>Community Energy Grid</h2>
      <p className="grid-description">
        This visualization shows all households in the community, their current energy production and consumption,
        and real-time energy transactions between neighbors.
      </p>
      
      <div className="community-grid">
        {households.map(household => {
          const energySurplus = household.currentProduction - household.currentConsumption;
          const surplusPercentage = Math.min(100, Math.abs(energySurplus) / (household.solarCapacity / 2) * 100);
          
          let statusLabel;
          if (energySurplus > 0.1) {
            statusLabel = <span className="surplus-label">Selling {energySurplus.toFixed(1)} kWh</span>;
          } else if (energySurplus < -0.1) {
            statusLabel = <span className="deficit-label">Buying {Math.abs(energySurplus).toFixed(1)} kWh</span>;
          } else {
            statusLabel = <span className="neutral-label">Energy Balanced</span>;
          }
          
          // Calculate battery percentage
          const batteryPercentage = (household.battery / household.batteryCapacity) * 100;
          
          // Count active transactions for this household
          const sellingTransactions = activeTransactions.filter(t => t.sellerId === household.id);
          const buyingTransactions = activeTransactions.filter(t => t.buyerId === household.id);
          
          return (
            <div className="household-card" key={household.id}>
              <h3>
                <span className="avatar">{household.name.charAt(0)}</span>
                {household.name}
              </h3>
              
              <div className="household-metrics">
                <div className="metric">
                  <div className="metric-label">Solar Production</div>
                  <div className="metric-value">{household.currentProduction.toFixed(1)} kWh</div>
                </div>
                <div className="metric">
                  <div className="metric-label">Consumption</div>
                  <div className="metric-value">{household.currentConsumption.toFixed(1)} kWh</div>
                </div>
                <div className="metric">
                  <div className="metric-label">Solar Capacity</div>
                  <div className="metric-value">{household.solarCapacity} kW</div>
                </div>
                <div className="metric">
                  <div className="metric-label">Battery</div>
                  <div className="metric-value">{batteryPercentage.toFixed(0)}%</div>
                </div>
              </div>
              
              <div className="energy-status">
                {energySurplus > 0 && (
                  <div 
                    className="energy-surplus" 
                    style={{ width: `${surplusPercentage}%` }}
                  ></div>
                )}
                {energySurplus < 0 && (
                  <div 
                    className="energy-deficit" 
                    style={{ width: `${surplusPercentage}%` }}
                  ></div>
                )}
              </div>
              
              <div className="energy-status-label">
                {statusLabel}
              </div>
              
              <div className="transaction-indicators">
                {sellingTransactions.map(transaction => (
                  <div 
                    key={`sell-${transaction.id}`}
                    className="energy-transaction selling-transaction"
                    style={{ top: '50%', left: '50%' }}
                  ></div>
                ))}
                
                {buyingTransactions.map(transaction => (
                  <div 
                    key={`buy-${transaction.id}`}
                    className="energy-transaction buying-transaction"
                    style={{ top: '50%', left: '50%' }}
                  ></div>
                ))}
              </div>
              
              <div className="p2p-stats">
                {household.p2pSellAmount > 0 && (
                  <div className="p2p-stat sold">Sold to neighbors: {household.p2pSellAmount.toFixed(1)} kWh</div>
                )}
                {household.p2pBuyAmount > 0 && (
                  <div className="p2p-stat bought">Bought from neighbors: {household.p2pBuyAmount.toFixed(1)} kWh</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommunityGrid;