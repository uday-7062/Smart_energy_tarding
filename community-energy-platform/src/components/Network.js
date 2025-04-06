// Network.js - Component for network visualization
import React from 'react';
import EnergyNetwork from './EnergyNetwork';

const Network = ({ households, transactions }) => {
  return (
    <div className="network-container">
      <h2>Community Energy Network</h2>
      <p className="network-description">
        This visualization shows the energy flows between households in the community.
        Green nodes are selling energy, red nodes are buying energy, and yellow lines represent active transactions.
      </p>
      
      <div className="network-visualization">
        <EnergyNetwork />
      </div>
    </div>
  );
};

export default Network;