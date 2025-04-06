// simulation.js - Functions for simulating energy production and consumption

// Generate random household names
const householdNames = [
    "Smith Home", "Green House", "Solar Meadows", "Sunnydale", "EcoVilla",
    "Brightside", "Power Nest", "SunHaven", "Riverside", "Hilltop",
    "Oakwood", "Maple Lane", "Sunset Home", "Valley View", "Highland",
    "Lakeside", "Parkview", "Brookside", "Meadowlark", "Sunnyside"
  ];
  
  // Generate a set of households with random properties
  export const generateHouseholds = (count) => {
    const households = [];
    
    for (let i = 0; i < count; i++) {
      // Generate random solar capacity between 3 - 10 kW
      const solarCapacity = Math.round((3 + Math.random() * 7) * 10) / 10;
      
      // Base consumption proportional to solar capacity plus random variation
      const baseConsumption = (solarCapacity * 0.3) + (Math.random() * 0.5);
      
      // Battery capacity proportional to solar capacity
      const batteryCapacity = solarCapacity * (1.5 + Math.random());
      
      // Random initial battery charge between 10% - 50%
      const initialBatteryCharge = batteryCapacity * (0.1 + Math.random() * 0.4);
      
      households.push({
        id: i + 1,
        name: householdNames[i % householdNames.length],
        solarCapacity,
        batteryCapacity,
        battery: initialBatteryCharge,
        baseConsumption,
        currentProduction: 0,
        currentConsumption: 0,
        energySurplus: 0,
        // Tracking for energy transactions
        gridSellAmount: 0,
        gridBuyAmount: 0,
        p2pSellAmount: 0,
        p2pBuyAmount: 0,
        // Energy price preferences ($/kWh)
        sellPriceMin: 0.08 + (Math.random() * 0.04), // $0.08 - $0.12
        buyPriceMax: 0.15 + (Math.random() * 0.05), // $0.15 - $0.20
      });
    }
    
    return households;
  };
  
  // Simulate solar energy production based on time of day and weather
  export const simulateEnergyProduction = (household, hour, weatherCondition) => {
    // Base production curve based on time of day (peak at noon)
    let productionFactor = Math.max(0, Math.sin((hour - 6) * Math.PI / 12));
    
    // Weather impact
    const weatherImpact = {
      'sunny': 1.0,
      'partly cloudy': 0.7,
      'cloudy': 0.4,
      'rainy': 0.2
    };
    
    productionFactor *= weatherImpact[weatherCondition] || 1;
    
    // Random variation (+/- 10%)
    const randomVariation = 0.9 + (Math.random() * 0.2);
    
    // Calculate production
    return household.solarCapacity * productionFactor * randomVariation;
  };
  
  // Simulate energy consumption based on time of day
  export const simulateEnergyConsumption = (household, hour) => {
    // Base consumption from household profile
    let consumption = household.baseConsumption;
    
    // Morning peak (7-9 AM)
    if (hour >= 7 && hour <= 9) {
      consumption *= 1.5 + (Math.random() * 0.5);
    }
    
    // Evening peak (6-10 PM)
    if (hour >= 18 && hour <= 22) {
      consumption *= 2.0 + (Math.random() * 1.0);
    }
    
    // Night time low consumption (11 PM - 5 AM)
    if (hour >= 23 || hour <= 5) {
      consumption *= 0.5 + (Math.random() * 0.3);
    }
    
    // Random variation (+/- 20%)
    const randomVariation = 0.8 + (Math.random() * 0.4);
    
    return consumption * randomVariation;
  };