// App.js - Main Application Component
import React, { useState, useEffect } from 'react';
import './App.css';
import CommunityGrid from './components/CommunityGrid';
import Dashboard from './components/Dashboard';
import Marketplace from './components/Marketplace';
import Network from './components/Network';
import UserPortal from './components/UserPortal';
import { generateHouseholds, simulateEnergyProduction, simulateEnergyConsumption } from './utils/simulation';
import { executeMarketplaceTransactions } from './utils/marketplace';

function App() {
  // State for the application
  const [households, setHouseholds] = useState([]);
  const [currentHour, setCurrentHour] = useState(8); // Start at 8 AM
  const [currentDay, setCurrentDay] = useState(1);
  const [weatherCondition, setWeatherCondition] = useState('sunny');
  const [transactions, setTransactions] = useState([]);
  const [simulationSpeed, setSimulationSpeed] = useState(1000); // ms per hour
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [totalEnergySaved, setTotalEnergySaved] = useState(0);
  const [totalMoneySaved, setTotalMoneySaved] = useState(0);
  const [selectedTab, setSelectedTab] = useState('community');

  // Initialize households
  useEffect(() => {
    const initialHouseholds = generateHouseholds(12);
    setHouseholds(initialHouseholds);
  }, []);

  // Weather conditions change
  useEffect(() => {
    if (households.length > 0 && isSimulationRunning) {
      const weatherConditions = ['sunny', 'partly cloudy', 'cloudy', 'rainy'];
      const randomWeatherChangeInterval = Math.floor(Math.random() * 12) + 4;
      
      if (currentHour % randomWeatherChangeInterval === 0) {
        const newWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
        setWeatherCondition(newWeather);
      }
    }
  }, [currentHour, isSimulationRunning, households.length]);

  // Simulation tick effect
  useEffect(() => {
    let simulationInterval;
    
    if (isSimulationRunning && households.length > 0) {
      simulationInterval = setInterval(() => {
        // Update time
        setCurrentHour(prevHour => {
          const nextHour = (prevHour + 1) % 24;
          if (nextHour === 0) {
            setCurrentDay(prevDay => prevDay + 1);
          }
          return nextHour;
        });
        
        // Simulate energy production and consumption
        setHouseholds(prevHouseholds => {
          // First, update all households with new production/consumption
          const updatedHouseholds = prevHouseholds.map(household => {
            const production = simulateEnergyProduction(household, currentHour, weatherCondition);
            const consumption = simulateEnergyConsumption(household, currentHour);
            
            return {
              ...household,
              currentProduction: production,
              currentConsumption: consumption,
              energySurplus: production - consumption,
              battery: Math.min(
                household.batteryCapacity, 
                household.battery + Math.max(0, production - consumption) * 0.5 // Store 50% of excess in battery
              ),
              gridSellAmount: 0, // Reset for this cycle
              gridBuyAmount: 0, // Reset for this cycle
              p2pSellAmount: 0, // Reset for this cycle
              p2pBuyAmount: 0, // Reset for this cycle
            };
          });
          
          // Then, execute marketplace transactions
          const { households: householdsAfterMarket, newTransactions, totalSaved } = 
            executeMarketplaceTransactions(updatedHouseholds);
          
          // Update transactions and savings metrics
          setTransactions(prev => [...prev, ...newTransactions].slice(-100)); // Keep last 100 transactions
          setTotalEnergySaved(prev => prev + totalSaved);
          setTotalMoneySaved(prev => prev + totalSaved * 0.15); // $0.15 per kWh saved from the grid
          
          return householdsAfterMarket;
        });
      }, simulationSpeed);
    }
    
    return () => clearInterval(simulationInterval);
  }, [isSimulationRunning, households.length, currentHour, weatherCondition, simulationSpeed]);

  // Handle starting/stopping the simulation
  const toggleSimulation = () => {
    setIsSimulationRunning(prev => !prev);
  };

  // Speed controls
  const increaseSpeed = () => {
    if (simulationSpeed > 100) {
      setSimulationSpeed(prev => prev / 2);
    }
  };

  const decreaseSpeed = () => {
    if (simulationSpeed < 4000) {
      setSimulationSpeed(prev => prev * 2);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Community Energy Sharing Platform</h1>
        <div className="simulation-controls">
          <div className="time-display">
            Day: {currentDay} | Time: {currentHour}:00 | Weather: {weatherCondition}
          </div>
          <button onClick={toggleSimulation}>
            {isSimulationRunning ? 'Pause Simulation' : 'Start Simulation'}
          </button>
          <button onClick={decreaseSpeed}>Slower</button>
          <button onClick={increaseSpeed}>Faster</button>
        </div>
        <div className="tab-navigation">
          <button 
            className={selectedTab === 'community' ? 'active' : ''} 
            onClick={() => setSelectedTab('community')}>
            Community Grid
          </button>
          <button 
            className={selectedTab === 'marketplace' ? 'active' : ''} 
            onClick={() => setSelectedTab('marketplace')}>
            Energy Marketplace
          </button>
          <button 
            className={selectedTab === 'dashboard' ? 'active' : ''} 
            onClick={() => setSelectedTab('dashboard')}>
            Dashboard
          </button>
          <button 
            className={selectedTab === 'network' ? 'active' : ''} 
            onClick={() => setSelectedTab('network')}>
            Network View
          </button>
          <button 
            className={selectedTab === 'portal' ? 'active' : ''} 
            onClick={() => setSelectedTab('portal')}>
            User Portal
          </button>
        </div>
      </header>
      
      <main className="app-content">
        {selectedTab === 'community' && (
          <CommunityGrid 
            households={households} 
            transactions={transactions.filter(t => t.timestamp >= Date.now() - 10000)} // Only recent transactions
          />
        )}
        
        {selectedTab === 'marketplace' && (
          <Marketplace 
            households={households} 
            transactions={transactions} 
          />
        )}
        
        {selectedTab === 'dashboard' && (
          <Dashboard 
            households={households}
            currentHour={currentHour}
            totalEnergySaved={totalEnergySaved}
            totalMoneySaved={totalMoneySaved}
            transactions={transactions}
          />
        )}
        
        {selectedTab === 'network' && (
          <Network 
            households={households} 
            transactions={transactions} 
          />
        )}
        
        {selectedTab === 'portal' && (
          <UserPortal 
            households={households}
            transactions={transactions}
            currentHour={currentHour}
          />
        )}
      </main>
      
      <footer className="app-footer">
        <div className="stats-summary">
          <div>Total Energy Saved: {totalEnergySaved.toFixed(2)} kWh</div>
          <div>Total Money Saved: ${totalMoneySaved.toFixed(2)}</div>
        </div>
      </footer>
    </div>
  );
}

export default App;