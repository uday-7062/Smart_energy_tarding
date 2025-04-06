// EnergyNetwork.js - Component for energy network visualization
import React, { useState, useEffect } from 'react';

// Demo data for our energy community
const generateDemoData = () => {
  const households = [];
  const householdNames = ["Smith Home", "Green House", "Solar Meadows", "Sunnydale", "EcoVilla", 
                          "Brightside", "Power Nest", "SunHaven", "Riverside", "Hilltop", "Oakwood", "Maple Lane"];
  
  for (let i = 0; i < 12; i++) {
    const solarCapacity = Math.round((3 + Math.random() * 7) * 10) / 10;
    const production = Math.max(0, solarCapacity * Math.sin((12 - 6) * Math.PI / 12) * (0.7 + Math.random() * 0.3));
    const consumption = solarCapacity * 0.3 + Math.random() * solarCapacity * 0.4;
    
    households.push({
      id: i + 1,
      name: householdNames[i],
      solarCapacity,
      production,
      consumption,
      energySurplus: production - consumption,
      x: 150 + Math.cos(i * Math.PI * 2 / 12) * 120,
      y: 150 + Math.sin(i * Math.PI * 2 / 12) * 120,
    });
  }
  
  return households;
};

// Generate random energy transactions between households
const generateTransactions = (households) => {
  const transactions = [];
  const sellers = households.filter(h => h.energySurplus > 0);
  const buyers = households.filter(h => h.energySurplus < 0);
  
  // Create 1-3 random transactions
  const numTransactions = Math.floor(Math.random() * 3) + 1;
  
  for (let i = 0; i < numTransactions; i++) {
    if (sellers.length > 0 && buyers.length > 0) {
      const seller = sellers[Math.floor(Math.random() * sellers.length)];
      const buyer = buyers[Math.floor(Math.random() * buyers.length)];
      
      const amount = Math.min(seller.energySurplus, Math.abs(buyer.energySurplus)) * (0.3 + Math.random() * 0.7);
      
      transactions.push({
        id: `tx-${i}`,
        sellerId: seller.id,
        buyerId: buyer.id,
        amount: parseFloat(amount.toFixed(1)),
      });
    }
  }
  
  return transactions;
};

// Helper component for transaction lines
const TransactionLine = ({ transaction, households, isActive }) => {
  const seller = households.find(h => h.id === transaction.sellerId);
  const buyer = households.find(h => h.id === transaction.buyerId);
  
  if (!seller || !buyer) return null;
  
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      <line
        x1={seller.x}
        y1={seller.y}
        x2={buyer.x}
        y2={buyer.y}
        stroke={isActive ? "#FFC107" : "#E0E0E0"}
        strokeWidth={isActive ? 3 : 1}
        strokeDasharray={isActive ? "none" : "5,5"}
      />
      {isActive && (
        <circle
          cx={(seller.x + buyer.x) / 2}
          cy={(seller.y + buyer.y) / 2}
          r="6"
          fill="#FFC107"
        />
      )}
    </svg>
  );
};

const EnergyNetwork = () => {
  const [households, setHouseholds] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTransactionIndex, setActiveTransactionIndex] = useState(0);
  const [simulationRunning, setSimulationRunning] = useState(true);
  
  // Initialize data
  useEffect(() => {
    const initialHouseholds = generateDemoData();
    setHouseholds(initialHouseholds);
  }, []);
  
  // Run simulation
  useEffect(() => {
    let simulationInterval;
    let transactionCycleInterval;
    
    if (simulationRunning && households.length > 0) {
      simulationInterval = setInterval(() => {
        // Update production and consumption with small variations
        setHouseholds(prevHouseholds => {
          return prevHouseholds.map(household => {
            const productionChange = (Math.random() * 0.4) - 0.2; // -0.2 to +0.2
            const consumptionChange = (Math.random() * 0.3) - 0.15; // -0.15 to +0.15
            
            const newProduction = Math.max(0, household.production + productionChange);
            const newConsumption = Math.max(0, household.consumption + consumptionChange);
            
            return {
              ...household,
              production: newProduction,
              consumption: newConsumption,
              energySurplus: newProduction - newConsumption,
            };
          });
        });
        
        // Generate new transactions
        const newTransactions = generateTransactions(households);
        setTransactions(newTransactions);
        
        // Reset active transaction index
        setActiveTransactionIndex(0);
      }, 3000);
      
      // Cycle through transactions to animate them
      transactionCycleInterval = setInterval(() => {
        setActiveTransactionIndex(prevIndex => {
          if (transactions.length === 0) return 0;
          return (prevIndex + 1) % transactions.length;
        });
      }, 1000);
      
      return () => {
        clearInterval(simulationInterval);
        clearInterval(transactionCycleInterval);
      };
    }
  }, [simulationRunning, households, transactions.length]);
  
  // Get active transaction
  const activeTransaction = transactions[activeTransactionIndex];
  
  // Toggle simulation
  const toggleSimulation = () => {
    setSimulationRunning(!simulationRunning);
  };
  
  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-blue-600">Community Energy Network</h2>
        <button 
          onClick={toggleSimulation}
          className="px-4 py-2 rounded-md"
          style={{ 
            backgroundColor: simulationRunning ? '#f44336' : '#4caf50',
            color: 'white'
          }}
        >
          {simulationRunning ? 'Pause Simulation' : 'Start Simulation'}
        </button>
      </div>
      
      <div className="relative w-full h-96 border rounded-lg" style={{ background: '#f8fafc' }}>
        {/* Grid lines */}
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <div key={`h-line-${i}`} className="absolute w-full h-px" 
                 style={{ top: `${25 * i}%`, backgroundColor: '#e2e8f0' }}></div>
          ))}
          {[...Array(5)].map((_, i) => (
            <div key={`v-line-${i}`} className="absolute h-full w-px" 
                 style={{ left: `${25 * i}%`, backgroundColor: '#e2e8f0' }}></div>
          ))}
        </div>
        
        {/* Households */}
        {households.map(household => {
          const size = 16 + (household.solarCapacity * 2); // Size based on capacity
          const isSeller = household.energySurplus > 0;
          const isBuyer = household.energySurplus < 0;
          
          return (
            <div 
              key={household.id}
              className="absolute rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${household.x - size/2}px`,
                top: `${household.y - size/2}px`,
                backgroundColor: isSeller ? '#4caf50' : isBuyer ? '#f44336' : '#9e9e9e',
                color: 'white',
                transition: 'all 0.5s ease-in-out'
              }}
              title={`${household.name}: ${isSeller ? `Selling ${household.energySurplus.toFixed(1)} kWh` : 
                isBuyer ? `Buying ${Math.abs(household.energySurplus).toFixed(1)} kWh` : 'Balanced'}`}
            >
              {household.name.charAt(0)}
            </div>
          );
        })}
        
        {/* Active energy transaction */}
        {activeTransaction && (
          <TransactionLine 
            transaction={activeTransaction}
            households={households}
            isActive={true}
          />
        )}
        
        {/* Other transactions (faded) */}
        {transactions.map((transaction, index) => 
          index !== activeTransactionIndex && (
            <TransactionLine 
              key={transaction.id}
              transaction={transaction}
              households={households}
              isActive={false}
            />
          )
        )}
      </div>
      
      <div className="mt-4 p-3 bg-gray-100 rounded-md">
        <h3 className="font-semibold mb-2">Active Transactions</h3>
        <div className="space-y-2">
          {transactions.length === 0 ? (
            <p className="text-gray-500">No active transactions</p>
          ) : (
            transactions.map((tx, index) => {
              const seller = households.find(h => h.id === tx.sellerId);
              const buyer = households.find(h => h.id === tx.buyerId);
              
              return (
                <div 
                  key={tx.id}
                  className="p-2 rounded"
                  style={{ 
                    backgroundColor: index === activeTransactionIndex ? '#fff9c4' : 'white',
                    border: index === activeTransactionIndex ? '1px solid #ffd54f' : 'none'
                  }}
                >
                  <div className="flex justify-between">
                    <span>
                      <span style={{ fontWeight: 600, color: '#4caf50' }}>{seller?.name}</span> → 
                      <span style={{ fontWeight: 600, color: '#f44336' }}> {buyer?.name}</span>
                    </span>
                    <span style={{ fontWeight: 600 }}>{tx.amount.toFixed(1)} kWh</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default EnergyNetwork;