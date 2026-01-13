-- CREATE DATABASE flight_booking;

-- Connect to the database and create tables

-- Flights Table
CREATE TABLE IF NOT EXISTS flights (
  flight_id VARCHAR(10) PRIMARY KEY,
  airline VARCHAR(100) NOT NULL,
  departure_city VARCHAR(100) NOT NULL,
  arrival_city VARCHAR(100) NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  pnr VARCHAR(20) UNIQUE NOT NULL,
  flight_id VARCHAR(10) NOT NULL REFERENCES flights(flight_id),
  passenger_name VARCHAR(100) NOT NULL,
  final_price DECIMAL(10, 2) NOT NULL,
  booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id INTEGER,
  FOREIGN KEY (flight_id) REFERENCES flights(flight_id)
);

-- Users Table (for authentication)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallet Table (now per user)
CREATE TABLE IF NOT EXISTS wallet (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id),
  balance DECIMAL(10, 2) DEFAULT 50000.00,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create default user and wallet for backward compatibility
DO $$
DECLARE
  default_user_id INTEGER;
BEGIN
  -- Insert default user if not exists
  INSERT INTO users (email, password, full_name) 
  VALUES ('demo@flightbook.com', '$2a$10$demo', 'Demo User')
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO default_user_id;
  
  -- Get user id if it already existed
  IF default_user_id IS NULL THEN
    SELECT id INTO default_user_id FROM users WHERE email = 'demo@flightbook.com';
  END IF;
  
  -- Insert default wallet
  INSERT INTO wallet (user_id, balance) 
  VALUES (default_user_id, 50000.00)
  ON CONFLICT (user_id) DO NOTHING;
END $$;

-- Booking Attempts Table (for tracking surge pricing)
CREATE TABLE IF NOT EXISTS booking_attempts (
  id SERIAL PRIMARY KEY,
  flight_id VARCHAR(10) NOT NULL REFERENCES flights(flight_id),
  attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  session_id VARCHAR(100) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_flights_departure ON flights(departure_city);
CREATE INDEX IF NOT EXISTS idx_flights_arrival ON flights(arrival_city);
CREATE INDEX IF NOT EXISTS idx_flights_price ON flights(base_price);
CREATE INDEX IF NOT EXISTS idx_booking_attempts_flight ON booking_attempts(flight_id);
CREATE INDEX IF NOT EXISTS idx_booking_attempts_time ON booking_attempts(attempt_time);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
