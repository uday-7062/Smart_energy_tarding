// AIEnergyAssistant.js - AI-powered energy recommendations
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AIEnergyAssistant = ({ household, weatherCondition, currentHour, forecastData }) => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // API configuration - replace with your actual API key
  const API_KEY = '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';

  const API_URL = 'https://api.openai.com/v1/chat/completions';

  useEffect(() => {
    const generateRecommendations = async () => {
      if (!household) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Prepare data about the household and energy conditions
        const prompt = `
          As an AI Energy Assistant, provide 3 specific, actionable recommendations for optimizing energy usage based on this data:
          
          Current Time: ${currentHour}:00
          Weather: ${weatherCondition}
          Household: ${household.name}
          Solar Capacity: ${household.solarCapacity} kW
          Battery Capacity: ${household.batteryCapacity} kWh
          Current Battery Level: ${((household.battery / household.batteryCapacity) * 100).toFixed(0)}%
          Current Production: ${household.currentProduction?.toFixed(1) || 0} kWh
          Current Consumption: ${household.currentConsumption?.toFixed(1) || 0} kWh
          Energy Balance: ${household.energySurplus?.toFixed(1) || 0} kWh
          
          Energy Price Forecast: Prices expected to be ${
            currentHour >= 17 && currentHour <= 20 ? 'high during evening peak' : 
            currentHour >= 10 && currentHour <= 15 ? 'low due to high solar production' : 
            'moderate'
          }
          
          Weather Forecast: ${
            weatherCondition === 'sunny' ? 'Continued sunny conditions expected for the next 6 hours' :
            weatherCondition === 'partly cloudy' ? 'Mixed clouds and sun expected, with increasing clouds later' :
            weatherCondition === 'cloudy' ? 'Overcast conditions expected to continue' :
            'Rain expected to continue for several hours'
          }
          
          Format your response as a JSON array of 3 recommendation objects, each with "title" and "description" fields. Do not include any markdown, explanations, or other text - only the JSON array.
        `;

        const response = await axios.post(
          API_URL,
          {
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are an AI Energy Assistant that provides specific, actionable recommendations for home energy optimization.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 500
          },
          {
            headers: {
              'Authorization': `Bearer ${API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        // Parse the JSON response
        let jsonResponse;
        try {
            const content = response.data.choices[0].message.content.trim();

            // Remove Markdown-style code block (```json ... ```)
            const jsonStart = content.indexOf('[');
            const jsonEnd = content.lastIndexOf(']') + 1;
            const jsonString = content.slice(jsonStart, jsonEnd);
            
            jsonResponse = JSON.parse(jsonString);
            
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          setError('Failed to parse AI recommendations');
          setRecommendations([
            { title: 'Consider selling excess energy now', description: 'With your current surplus and the market conditions, this is a good time to sell your excess energy.' },
            { title: 'Reduce consumption during evening peak', description: 'Electricity prices will be higher between 6-9 PM. Consider shifting high-energy activities to off-peak hours.' },
            { title: 'Optimize battery charging', description: 'Your battery is at 45%. With the forecast showing cloudy weather tomorrow, consider charging it fully today.' }
          ]);
          setLoading(false);
          return;
        }

        // Update recommendations state with the parsed response
        setRecommendations(jsonResponse);
      } catch (error) {
        console.error('Error fetching AI recommendations:', error);
        setError('Failed to get AI recommendations');
        
        // Fallback recommendations in case of API failure
        setRecommendations([
          { title: 'Consider selling excess energy now', description: 'With your current surplus and the market conditions, this is a good time to sell your excess energy.' },
          { title: 'Reduce consumption during evening peak', description: 'Electricity prices will be higher between 6-9 PM. Consider shifting high-energy activities to off-peak hours.' },
          { title: 'Optimize battery charging', description: 'Your battery is at 45%. With the forecast showing cloudy weather tomorrow, consider charging it fully today.' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    generateRecommendations();
  }, [household, weatherCondition, currentHour, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!household) {
    return <div className="ai-loading">Select a household to get AI recommendations</div>;
  }

  return (
    <div className="ai-assistant">
      <div className="ai-header">
        <h2 className="ai-title">AI Energy Assistant</h2>
        <button 
          className="refresh-button" 
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? 'Thinking...' : 'Get New Advice'}
        </button>
      </div>
      
      {loading ? (
        <div className="ai-loading">
          <div className="ai-spinner"></div>
          <p>Analyzing energy data and generating recommendations...</p>
        </div>
      ) : error ? (
        <div className="ai-error">
          <p>{error}</p>
          <button onClick={handleRefresh}>Try Again</button>
        </div>
      ) : (
        <div className="ai-recommendations">
          {recommendations.map((rec, index) => (
            <div key={index} className="ai-recommendation">
              <h3 className="recommendation-title">{rec.title}</h3>
              <p className="recommendation-description">{rec.description}</p>
            </div>
          ))}
        </div>
      )}
      
      <div className="ai-footer">
        <p>Recommendations based on current conditions, historical data, and energy market trends</p>
      </div>
    </div>
  );
};

export default AIEnergyAssistant;