-- Seed data for flights with timings
INSERT INTO flights (flight_id, airline, departure_city, arrival_city, base_price, departure_time, arrival_time, duration_minutes) VALUES
('AI101', 'Air India', 'Mumbai', 'Delhi', 2500.00, '06:00:00', '08:15:00', 135),
('6E202', 'IndiGo', 'Delhi', 'Bangalore', 2800.00, '09:30:00', '12:15:00', 165),
('SG303', 'SpiceJet', 'Bangalore', 'Mumbai', 2300.00, '14:00:00', '15:45:00', 105),
('UK404', 'Vistara', 'Mumbai', 'Kolkata', 2700.00, '07:45:00', '10:30:00', 165),
('AI505', 'Air India', 'Delhi', 'Chennai', 2900.00, '11:00:00', '13:30:00', 150),
('6E606', 'IndiGo', 'Chennai', 'Hyderabad', 2200.00, '16:15:00', '17:30:00', 75),
('SG707', 'SpiceJet', 'Hyderabad', 'Delhi', 2600.00, '18:00:00', '20:15:00', 135),
('UK808', 'Vistara', 'Kolkata', 'Bangalore', 2750.00, '05:30:00', '08:00:00', 150),
('AI909', 'Air India', 'Bangalore', 'Delhi', 2850.00, '21:00:00', '23:30:00', 150),
('6E010', 'IndiGo', 'Mumbai', 'Chennai', 2400.00, '13:15:00', '15:30:00', 135),
('SG111', 'SpiceJet', 'Delhi', 'Mumbai', 2550.00, '08:00:00', '10:15:00', 135),
('UK212', 'Vistara', 'Chennai', 'Kolkata', 2650.00, '10:30:00', '12:45:00', 135),
('AI313', 'Air India', 'Hyderabad', 'Mumbai', 2350.00, '15:45:00', '17:15:00', 90),
('6E414', 'IndiGo', 'Kolkata', 'Delhi', 2800.00, '12:00:00', '14:15:00', 135),
('SG515', 'SpiceJet', 'Mumbai', 'Hyderabad', 2450.00, '19:30:00', '21:00:00', 90),
('UK616', 'Vistara', 'Delhi', 'Kolkata', 2700.00, '06:45:00', '09:00:00', 135),
('AI717', 'Air India', 'Bangalore', 'Chennai', 2100.00, '17:00:00', '18:00:00', 60),
('6E818', 'IndiGo', 'Chennai', 'Mumbai', 2500.00, '20:15:00', '22:30:00', 135),
('SG919', 'SpiceJet', 'Kolkata', 'Hyderabad', 2600.00, '07:15:00', '09:30:00', 135),
('UK020', 'Vistara', 'Hyderabad', 'Bangalore', 2300.00, '22:00:00', '23:00:00', 60)
ON CONFLICT (flight_id) DO UPDATE SET
  departure_time = EXCLUDED.departure_time,
  arrival_time = EXCLUDED.arrival_time,
  duration_minutes = EXCLUDED.duration_minutes;
