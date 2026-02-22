# EconSim

Real-Time Microeconomic & Macroeconomic Simulation Platform

A full-stack web platform where students and enthusiasts can adjust economic variables and instantly see how supply and demand curves shift, finding the new market equilibrium in real-time.

## Tech Stack

- **Frontend**: React 18, Vite, Chart.js, react-chartjs-2, React Router
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Auth**: JWT, bcrypt

## Architecture

```
Frontend (React + Chart.js) → REST API (Node.js/Express) → PostgreSQL
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Docker)

## Setup

### 1. Clone and install dependencies

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure environment variables

```bash
# Server
cp server/.env.example server/.env
# Edit server/.env with your DATABASE_URL and JWT_SECRET
```

### 3. Set up the database

Using Docker (recommended):
```bash
docker-compose up -d
```

Or manually run the migration:
```bash
psql $DATABASE_URL -f server/db/migrations/001_initial.sql
```

### 4. Run the development servers

```bash
# Terminal 1 - Start the backend server
cd server && npm run dev

# Terminal 2 - Start the frontend dev server
cd client && npm run dev
```

The app will be available at http://localhost:5173.

## API Documentation

All responses follow the format:
- Success: `{ "success": true, "data": {...} }`
- Error: `{ "success": false, "error": "message" }`

### Calculation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/calculate` | Run economics simulation |

**POST /api/calculate** — Body:
```json
{
  "consumerIncome": 50000,
  "productionCost": 20,
  "taxPerUnit": 5,
  "demandElasticity": 1.0,
  "supplyElasticity": 1.0,
  "priceCeiling": null,
  "priceFloor": null,
  "importQuota": null,
  "demandIntercept": 100,
  "supplyIntercept": 10,
  "demandSlope": 2,
  "supplySlope": 1.5
}
```

### Scenarios

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/scenarios` | Save a scenario (auth required) |
| GET | `/api/scenarios` | List public scenarios (paginated) |
| GET | `/api/scenarios/:id` | Get a scenario by ID |
| PUT | `/api/scenarios/:id` | Update a scenario (auth required, owner) |
| DELETE | `/api/scenarios/:id` | Delete a scenario (auth required, owner) |
| GET | `/api/scenarios/share/:slug` | Get a scenario by share slug |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register a new user |
| POST | `/api/users/login` | Login, returns JWT token |
| GET | `/api/users/me` | Get current user (auth required) |

## Economics Engine Formulas

- **Linear Demand**: `Qd = demandIntercept - demandSlope·P + (income/10000) - (tax·0.5)`
- **Linear Supply**: `Qs = supplyIntercept + supplySlope·P - cost·0.5 - tax·0.5`
- **Equilibrium**: Solve `Qd = Qs` for P* and Q*
- **Consumer Surplus**: `0.5 × (Pmax - P*) × Q*`
- **Producer Surplus**: `0.5 × (P* - Pmin) × Q*`
- **Deadweight Loss (tax)**: `0.5 × tax × (Qno_tax - Q*)`
- **Price Ceiling**: When ceiling < P*, shortage = `Qd(ceil) - Qs(ceil)`
- **Price Floor**: When floor > P*, surplus = `Qs(floor) - Qd(floor)`

## Project Structure

```
econsim/
├── client/             # React frontend (Vite)
│   └── src/
│       ├── components/ # Chart, ControlPanel, Dashboard, Auth, Layout
│       ├── pages/      # SimulatorPage, ScenariosPage, LoginPage, RegisterPage
│       ├── hooks/      # useEconomics, useAuth
│       ├── context/    # AuthContext
│       ├── services/   # api.js (axios)
│       └── utils/      # defaults.js
├── server/             # Express backend
│   ├── engine/         # economics.js (math engine)
│   ├── routes/         # calculate.js, scenarios.js, users.js
│   ├── middleware/     # auth.js, errorHandler.js
│   └── db/             # pool + migrations
├── docker-compose.yml
└── README.md
```
# econsim
