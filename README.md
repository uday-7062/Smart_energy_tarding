# Community Energy Sharing Platform

![Community Energy](https://img.shields.io/badge/Community-Energy-brightgreen)
![P2P Energy](https://img.shields.io/badge/P2P-Energy-blue)
![Renewable](https://img.shields.io/badge/Renewable-Energy-yellow)

A web-based platform enabling households with solar panels to share or sell excess energy directly to neighbors, creating a local peer-to-peer energy marketplace.

## Demo Video

[Watch our Project Demo Video](https://www.loom.com/share/b01faef93ce2459a8bf5bbc2026a7515?sid=df2f1d48-4896-4f8e-bd0d-aa5f95dcbd31)

## 🌟 Overview

The Community Energy Sharing Platform creates a virtual community grid that simulates energy production based on solar capacity, weather conditions, and time of day, then facilitates energy trading between community members.

**Key Features:**
- Community Energy Grid visualization
- P2P Energy Marketplace with direct trading
- Interactive Network Visualization
- Personal User Portal with statistics
- AI Energy Assistant for personalized recommendations
- Real-time Energy Simulation
- Blockchain Integration for secure transactions

## 👥 Team Members

- Uday Kiran Reddy Cheerla
- Pranavesh Sunil
- Sushama Nimamgadda

## 🛠️ Technology Stack

### Frontend
- **React** - User interface framework
- **Recharts** - Data visualization library
- **React Router** - Navigation between views
- **Axios** - API requests to backend

### Backend
- **Node.js** - Server-side JavaScript runtime
- **Express** - Web application framework
- **MongoDB Atlas** - Cloud-hosted database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **OpenAI API** - AI recommendations system

## 📂 Project Structure

```
community-energy-platform/
├── frontend/                # React frontend application
│   ├── public/              # Public assets
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── CommunityGrid.js
│   │   │   ├── Dashboard.js
│   │   │   ├── EnergyNetwork.js
│   │   │   ├── Marketplace.js
│   │   │   ├── Network.js
│   │   │   ├── UserPortal.js
│   │   │   └── AIEnergyAssistant.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   ├── simulation.js
│   │   │   └── marketplace.js
│   │   ├── App.css
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
└── backend/                 # Node.js/Express backend
    ├── models/              # Mongoose models
    │   ├── Household.js
    │   ├── Transaction.js
    │   └── User.js
    ├── routes/              # API routes
    │   ├── households.js
    │   ├── transactions.js
    │   └── users.js
    ├── middleware/          # Custom middleware
    │   └── auth.js          # Authentication middleware
    ├── server.js            # Main server file
    └── package.json
```

## 🚀 Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account

### Backend Setup
1. Clone the repository:
```bash
git clone https://github.com/your-username/community-energy-platform.git
cd community-energy-platform/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd ../frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

### MongoDB Atlas Setup

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Under "Database Access," create a new database user with read/write permissions
4. Under "Network Access," add your IP address or allow access from anywhere for development
5. Under "Clusters," click "Connect" and select "Connect your application"
6. Copy the connection string and replace the placeholder values in your `.env` file

## 📖 Usage Guide

### Registration and Login
- Create an account with your email and password
- Log in to access the platform

### Creating a Household
- Navigate to Community Grid tab
- Click "Add Household"
- Enter details (name, solar capacity, battery capacity)

### Trading Energy
- Go to Marketplace tab
- View available energy listings
- Set your purchase amount and maximum price
- Click "Purchase" to complete the transaction

### Using the AI Assistant
- Navigate to User Portal
- Click "Show AI Assistant"
- Review personalized recommendations based on your energy usage

## 🔌 API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login and get JWT token
- `GET /api/users/me` - Get current user details

### Households
- `GET /api/households` - Get all households
- `GET /api/households/:id` - Get a specific household
- `POST /api/households` - Create a new household
- `PATCH /api/households/:id` - Update a household
- `POST /api/households/:id/energy` - Add energy data for a household

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/household/:id` - Get transactions for a household
- `POST /api/transactions` - Create a new transaction
- `GET /api/transactions/stats/summary` - Get transaction statistics

## 🔄 Simulation Details

The platform simulates:

- **Solar energy production** based on:
  - Solar panel capacity
  - Time of day (peak at noon)
  - Weather conditions
  - Random variations

- **Energy consumption** based on:
  - Household base consumption
  - Time-of-day patterns (morning/evening peaks)
  - Random variations

- **Battery charging/discharging**
- **Peer-to-peer energy trading** with dynamic pricing

## 🔮 Future Enhancements

- Real-time weather API integration
- Mobile application for monitoring and notifications
- Enhanced AI prediction capabilities for energy usage
- Integration with smart meters for real data
- Advanced battery optimization algorithms
- Community governance features for marketplace rules
- Blockchain-based transaction ledger and smart contracts


## 🙏 Acknowledgments

- OpenAI for providing the AI capabilities
- MongoDB Atlas for cloud database services
- The renewable energy community for inspiration

## 📞 Contact

For any inquiries, please contact team members at:

ucheerl@bgsu.edu
pranavs@bgsu.edu
snimmag@bgsu.edu
