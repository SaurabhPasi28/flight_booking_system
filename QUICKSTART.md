# 🚀 Quick Start Guide - Flight Booking System

## Setup in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup PostgreSQL

1. **Create Database:**
   ```sql
   CREATE DATABASE flight_booking;
   ```

2. **Update .env.local with your credentials:**
   ```env
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=flight_booking
   DB_PASSWORD=your_password
   DB_PORT=5432
   ```

### Step 3: Initialize Database
```bash
node database/setup.js
```

### Step 4: Run Application
```bash
npm run dev
```

Open http://localhost:3000 🎉

## Test the Application

1. **Search Flights**: Select cities and search
2. **Book Flight**: Click "Book Now", enter name, confirm
3. **View History**: Click "My Bookings" in header
4. **Dark Mode**: Toggle with moon/sun icon
5. **PDF Download**: Auto-downloads after booking

## Surge Pricing Test

1. Try booking same flight 3 times quickly
2. Notice price increase by 10%
3. Try 6 times for 20% increase
4. Wait 10 minutes for reset

## Key Features

- ✅ 20 Flights seeded
- ✅ Wallet: ₹50,000
- ✅ Dynamic Pricing
- ✅ PDF Tickets
- ✅ Dark Mode
- ✅ Booking History

## Need Help?

Check README_PROJECT.md for detailed documentation.
