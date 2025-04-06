// marketplace.js - Functions for handling peer-to-peer energy trading

// Execute all marketplace transactions for the current simulation tick
export const executeMarketplaceTransactions = (households) => {
    // Clone households array to avoid direct state mutation
    const updatedHouseholds = [...households];
    const transactions = [];
    let totalEnergySaved = 0;
    
    // Step 1: Identify sellers and buyers
    const sellers = updatedHouseholds
      .filter(household => household.energySurplus > 0.1) // Min 0.1 kWh to sell
      .map(household => ({
        id: household.id,
        availableEnergy: household.energySurplus,
        minPrice: household.sellPriceMin,
      }))
      .sort((a, b) => a.minPrice - b.minPrice); // Sort by lowest asking price first
    
    const buyers = updatedHouseholds
      .filter(household => household.energySurplus < -0.1) // Min 0.1 kWh deficit
      .map(household => ({
        id: household.id,
        neededEnergy: Math.abs(household.energySurplus),
        maxPrice: household.buyPriceMax,
      }))
      .sort((a, b) => b.maxPrice - a.maxPrice); // Sort by highest bid price first
    
    // Step 2: Match buyers and sellers
    for (const buyer of buyers) {
      let remainingNeed = buyer.neededEnergy;
      
      // Try to find matching sellers
      for (const seller of sellers) {
        // Skip if seller has no more energy to sell
        if (seller.availableEnergy <= 0.05) continue;
        
        // Check if price is acceptable
        if (seller.minPrice <= buyer.maxPrice) {
          // Calculate amount to trade (min of what's needed and what's available)
          const tradeAmount = Math.min(remainingNeed, seller.availableEnergy);
          
          // Set the agreed price (midpoint between min sell and max buy)
          const agreedPrice = (seller.minPrice + buyer.maxPrice) / 2;
          const totalPrice = tradeAmount * agreedPrice;
          
          // Record the transaction
          const transaction = {
            id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            sellerId: seller.id,
            buyerId: buyer.id,
            amount: tradeAmount,
            price: totalPrice,
            pricePerKwh: agreedPrice,
            timestamp: Date.now(),
          };
          
          transactions.push(transaction);
          
          // Update seller and buyer energy availability
          seller.availableEnergy -= tradeAmount;
          remainingNeed -= tradeAmount;
          totalEnergySaved += tradeAmount;
          
          // Update the actual household objects
          const sellerIndex = updatedHouseholds.findIndex(h => h.id === seller.id);
          const buyerIndex = updatedHouseholds.findIndex(h => h.id === buyer.id);
          
          if (sellerIndex !== -1 && buyerIndex !== -1) {
            // Update seller
            updatedHouseholds[sellerIndex] = {
              ...updatedHouseholds[sellerIndex],
              energySurplus: updatedHouseholds[sellerIndex].energySurplus - tradeAmount,
              p2pSellAmount: (updatedHouseholds[sellerIndex].p2pSellAmount || 0) + tradeAmount,
            };
            
            // Update buyer
            updatedHouseholds[buyerIndex] = {
              ...updatedHouseholds[buyerIndex],
              energySurplus: updatedHouseholds[buyerIndex].energySurplus + tradeAmount,
              p2pBuyAmount: (updatedHouseholds[buyerIndex].p2pBuyAmount || 0) + tradeAmount,
            };
          }
          
          // If buyer's need is fulfilled, break this loop
          if (remainingNeed <= 0.05) break;
        }
      }
    }
    
    // Step 3: Handle remaining energy surplus/deficit with the grid
    for (const household of updatedHouseholds) {
      // If still has energy surplus after P2P trading, sell to grid
      if (household.energySurplus > 0.1) {
        const gridSellAmount = household.energySurplus;
        household.gridSellAmount = gridSellAmount;
        household.energySurplus = 0; // Reset surplus after selling to grid
      }
      
      // If still has energy deficit after P2P trading, buy from grid
      if (household.energySurplus < -0.1) {
        const gridBuyAmount = Math.abs(household.energySurplus);
        household.gridBuyAmount = gridBuyAmount;
        household.energySurplus = 0; // Reset deficit after buying from grid
      }
    }
    
    return {
      households: updatedHouseholds,
      newTransactions: transactions,
      totalSaved: totalEnergySaved,
    };
  };
  
  // Calculate energy market pricing based on supply, demand, and time of day
  export const calculateMarketPrice = (sellers, buyers, hour) => {
    // Base price
    const basePrice = 0.12; // $0.12/kWh
    
    // Time of day factor (peak pricing)
    let timeOfDayFactor = 1.0;
    if (hour >= 17 && hour <= 21) {
      // Evening peak hours
      timeOfDayFactor = 1.5;
    } else if (hour >= 9 && hour <= 15) {
      // Midday solar peak (lower prices due to high supply)
      timeOfDayFactor = 0.8;
    }
    
    // Supply and demand factor
    const totalSupply = sellers.reduce((sum, seller) => sum + seller.availableEnergy, 0);
    const totalDemand = buyers.reduce((sum, buyer) => sum + buyer.neededEnergy, 0);
    
    let supplyDemandFactor = 1.0;
    if (totalSupply > 0 && totalDemand > 0) {
      const ratio = totalDemand / totalSupply;
      if (ratio > 1.5) {
        // High demand relative to supply
        supplyDemandFactor = 1.3;
      } else if (ratio < 0.5) {
        // Low demand relative to supply
        supplyDemandFactor = 0.7;
      } else {
        supplyDemandFactor = 1.0;
      }
    }
    
    // Calculate the market price
    const marketPrice = basePrice * timeOfDayFactor * supplyDemandFactor;
    
    return {
      marketPrice,
      basePrice,
      timeOfDayFactor,
      supplyDemandFactor,
    };
  };