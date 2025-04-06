// Dashboard.js - Component for analytics and visualizations
import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = ({ households, currentHour, totalEnergySaved, totalMoneySaved, transactions }) => {
  const [hourlyData, setHourlyData] = useState([]);
  const [communityStats, setCommunityStats] = useState({
    totalSolarCapacity: 0,
    totalProduction: 0,
    totalConsumption: 0,
    totalBatteryCapacity: 0,
    totalBatteryCharge: 0,
    peakProduction: 0,
  });

  // Calculate hourly data for charts
  useEffect(() => {
    // Create a 24-hour array for the day
    const newHourlyData = [];
    
    for (let hour = 0; hour < 24; hour++) {
      const isCurrentHourOrPast = hour <= currentHour;
      
      if (isCurrentHourOrPast && households.length > 0) {
        // For past and current hours, use actual values
        const hourData = {
          hour: `${hour}:00`,
          production: households.reduce((sum, h) => {
            // Simulate past production based on time of day
            const production = h.solarCapacity * Math.max(0, Math.sin((hour - 6) * Math.PI / 12)) * 0.9;
            return sum + (hour === currentHour ? h.currentProduction : production);
          }, 0),
          consumption: households.reduce((sum, h) => {
            // Simulate past consumption based on time of day
            const baseConsumption = h.baseConsumption;
            const morningPeak = hour >= 6 && hour <= 9 ? 1.5 : 1;
            const eveningPeak = hour >= 17 && hour <= 21 ? 2 : 1;
            const consumption = baseConsumption * morningPeak * eveningPeak;
            return sum + (hour === currentHour ? h.currentConsumption : consumption);
          }, 0),
          p2pTrading: hour === currentHour ? 
            transactions
              .filter(t => new Date(t.timestamp).getHours() === currentHour)
              .reduce((sum, t) => sum + t.amount, 0) : 
            Math.random() * 5, // mock data for past hours
        };
        
        newHourlyData.push(hourData);
      } else {
        // For future hours, use forecasts
        newHourlyData.push({
          hour: `${hour}:00`,
          production: 0,
          consumption: 0,
          p2pTrading: 0,
        });
      }
    }
    
    setHourlyData(newHourlyData);
    
    // Update community stats
    if (households.length > 0) {
      setCommunityStats({
        totalSolarCapacity: households.reduce((sum, h) => sum + h.solarCapacity, 0),
        totalProduction: households.reduce((sum, h) => sum + h.currentProduction, 0),
        totalConsumption: households.reduce((sum, h) => sum + h.currentConsumption, 0),
        totalBatteryCapacity: households.reduce((sum, h) => sum + h.batteryCapacity, 0),
        totalBatteryCharge: households.reduce((sum, h) => sum + h.battery, 0),
        peakProduction: Math.max(...newHourlyData.map(d => d.production)),
      });
    }
  }, [households, currentHour, transactions]);

  // Generate savings breakdown data
  const savingsBreakdown = [
    { name: 'Grid Import Reduction', value: totalEnergySaved * 0.6 },
    { name: 'Peak Demand Reduction', value: totalEnergySaved * 0.3 },
    { name: 'Grid Export Savings', value: totalEnergySaved * 0.1 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="dashboard">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <div className="dashboard-title">Community Energy Overview</div>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{communityStats.totalSolarCapacity.toFixed(1)} kW</div>
            <div className="stat-label">Total Solar Capacity</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{households.length}</div>
            <div className="stat-label">Participating Households</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{communityStats.totalProduction.toFixed(1)} kWh</div>
            <div className="stat-label">Current Production</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{communityStats.totalConsumption.toFixed(1)} kWh</div>
            <div className="stat-label">Current Consumption</div>
          </div>
        </div>
        
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="production" stroke="#34a853" name="Solar Production" />
              <Line type="monotone" dataKey="consumption" stroke="#ea4335" name="Consumption" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="dashboard-card">
        <div className="dashboard-header">
          <div className="dashboard-title">P2P Energy Trading</div>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{totalEnergySaved.toFixed(1)} kWh</div>
            <div className="stat-label">Total Energy Traded</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">${totalMoneySaved.toFixed(2)}</div>
            <div className="stat-label">Community Savings</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {transactions.length > 0 ? 
                (transactions.reduce((sum, t) => sum + t.price, 0) / transactions.length).toFixed(2) : 
                '0.00'}
            </div>
            <div className="stat-label">Avg. Price per kWh</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{transactions.length}</div>
            <div className="stat-label">Total Transactions</div>
          </div>
        </div>
        
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={savingsBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {savingsBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="dashboard-card full-width">
        <div className="dashboard-header">
          <div className="dashboard-title">Hourly P2P Energy Trading</div>
        </div>
        
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="p2pTrading" fill="#1a73e8" name="P2P Energy Traded (kWh)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="dashboard-card full-width">
        <div className="dashboard-header">
          <div className="dashboard-title">Community Benefits</div>
        </div>
        
        <div className="benefits-list">
          <div className="benefit-item">
            <div className="benefit-icon">🌱</div>
            <div className="benefit-content">
              <div className="benefit-title">Carbon Reduction</div>
              <div className="benefit-description">
                Estimated CO₂ reduction: {(totalEnergySaved * 0.4).toFixed(1)} kg
              </div>
            </div>
          </div>
          
          <div className="benefit-item">
            <div className="benefit-icon">💰</div>
            <div className="benefit-content">
              <div className="benefit-title">Financial Savings</div>
              <div className="benefit-description">
                Average household savings: ${(totalMoneySaved / households.length).toFixed(2)}
              </div>
            </div>
          </div>
          
          <div className="benefit-item">
            <div className="benefit-icon">⚡</div>
            <div className="benefit-content">
              <div className="benefit-title">Grid Resilience</div>
              <div className="benefit-description">
                Peak load reduction: {(communityStats.peakProduction * 0.3).toFixed(1)} kW
              </div>
            </div>
          </div>
          
          <div className="benefit-item">
            <div className="benefit-icon">🔋</div>
            <div className="benefit-content">
              <div className="benefit-title">Battery Utilization</div>
              <div className="benefit-description">
                Community battery charge: {(communityStats.totalBatteryCharge / communityStats.totalBatteryCapacity * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;