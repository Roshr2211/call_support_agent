
CREATE TABLE agents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'offline', -- online, offline, break, busy
  role VARCHAR(50) DEFAULT 'agent', -- agent, supervisor, admin
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(20),
  address TEXT,
  membership_level VARCHAR(20) DEFAULT 'standard', -- standard, premium, vip
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE calls (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  agent_id INTEGER REFERENCES agents(id),
  issue_type VARCHAR(50) NOT NULL, -- flight, hotel, car, package, general
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high
  status VARCHAR(20) DEFAULT 'waiting', -- waiting, active, on-hold, completed, transferred
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  wait_duration INTEGER, -- in seconds
  transfer_count INTEGER DEFAULT 0,
  transfer_reason TEXT,
  resolution_status VARCHAR(20), -- resolved, unresolved, escalated, callback
  resolution_note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  booking_type VARCHAR(50) NOT NULL, -- flight, hotel, car, package
  status VARCHAR(20) DEFAULT 'confirmed', -- confirmed, pending, cancelled, completed
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  start_date DATE NOT NULL,
  end_date DATE,
  details JSONB NOT NULL, -- Stores booking-specific details
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE booking_modifications (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id),
  agent_id INTEGER REFERENCES agents(id),
  requested_changes JSONB NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, completed
  processed_by INTEGER REFERENCES agents(id),
  processed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  booking_id INTEGER REFERENCES bookings(id),
  call_id INTEGER REFERENCES calls(id),
  agent_id INTEGER REFERENCES agents(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_calls_customer ON calls(customer_id);
CREATE INDEX idx_calls_agent ON calls(agent_id);
CREATE INDEX idx_calls_status ON calls(status);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_reference ON bookings(reference_number);
CREATE INDEX idx_notes_customer ON notes(customer_id);
CREATE INDEX idx_notes_booking ON notes(booking_id);

-- File: db/seed.sql
-- Seed some sample data

-- Agents
INSERT INTO agents (name, email, password_hash, status, role) VALUES
('Sarah Johnson', 'sarah.j@travelease.com', '$2b$10$EXPjzdeqT91J6lRlp9Rx8eNW3OjB0/UQhLfTTQ8ZsZZ3jAjZK2Liy', 'online', 'agent'),
('Michael Chen', 'michael.c@travelease.com', '$2b$10$EXPjzdeqT91J6lRlp9Rx8eNW3OjB0/UQhLfTTQ8ZsZZ3jAjZK2Liy', 'offline', 'agent'),
('Jessica Rodriguez', 'jessica.r@travelease.com', '$2b$10$EXPjzdeqT91J6lRlp9Rx8eNW3OjB0/UQhLfTTQ8ZsZZ3jAjZK2Liy', 'break', 'supervisor'),
('David Kim', 'david.k@travelease.com', '$2b$10$EXPjzdeqT91J6lRlp9Rx8eNW3OjB0/UQhLfTTQ8ZsZZ3jAjZK2Liy', 'online', 'agent'),
('Lisa Patel', 'lisa.p@travelease.com', '$2b$10$EXPjzdeqT91J6lRlp9Rx8eNW3OjB0/UQhLfTTQ8ZsZZ3jAjZK2Liy', 'busy', 'admin');

-- Customers
INSERT INTO customers (name, email, phone, address, membership_level) VALUES
('John Smith', 'john.smith@example.com', '+1 (555) 123-4567', '123 Main St, Anytown, CA 90210', 'premium'),
('Maria Garcia', 'maria.garcia@example.com', '+1 (555) 987-6543', '456 Oak Ave, Sometown, NY 10001', 'standard'),
('Robert Chen', 'robert.chen@example.com', '+1 (555) 234-5678', '789 Pine Rd, Othertown, TX 75001', 'standard'),
('Emma Johnson', 'emma.johnson@example.com', '+1 (555) 345-6789', '101 Maple Dr, Anycity, FL 33101', 'vip'),
('Mohammed Al-Fayed', 'mohammed.a@example.com', '+1 (555) 456-7890', '202 Cedar Ln, Somewhere, WA 98001', 'premium');

-- Bookings
INSERT INTO bookings (customer_id, reference_number, booking_type, status, price, currency, start_date, end_date, details) VALUES
(1, 'FL-87652', 'flight', 'confirmed', 720.00, 'USD', '2025-04-20', '2025-04-27', 
 '{"origin": "NYC", "destination": "London", "airline": "TransAtlantic Airways", "passengers": 1, "flight_number": "TA345", "class": "economy"}'),
(1, 'HT-34521', 'hotel', 'confirmed', 1250.00, 'USD', '2025-04-20', '2025-04-27',
 '{"hotel_name": "Grand Plaza Hotel", "location": "London", "room_type": "Deluxe", "guests": 1, "amenities": ["Breakfast", "WiFi", "Spa"]}'),
(1, 'FL-45398', 'flight', 'cancelled', 210.00, 'USD', '2025-05-15', '2025-05-15',
 '{"origin": "NYC", "destination": "Chicago", "airline": "American Pacific", "passengers": 1, "flight_number": "AP789", "class": "economy"}'),
(2, 'HT-98765', 'hotel', 'confirmed', 850.00, 'USD', '2025-05-10', '2025-05-17',
 '{"hotel_name": "Beach Resort Inn", "location": "Miami", "room_type": "Ocean View", "guests": 2, "amenities": ["Pool", "Breakfast", "WiFi"]}'),
(3, 'CR-12345', 'car', 'confirmed', 320.00, 'USD', '2025-06-01', '2025-06-05',
 '{"car_class": "Compact", "pickup_location": "Denver Airport", "dropoff_location": "Denver Airport", "insurance": true}'),

 -- Completing the truncated booking entry
(4, 'PK-54321', 'package', 'confirmed', 3200.00, 'USD', '2025-07-15', '2025-07-22',
 '{"destination": "Cancun", "package_name": "All-Inclusive Resort Package", "hotel": "Royal Cancun Resort", "flight_included": true, "transfers_included": true, "activities_included": ["Snorkeling Tour", "Chichen Itza Visit"]}'),
(5, 'FL-65432', 'flight', 'confirmed', 1450.00, 'USD', '2025-06-10', '2025-06-10',
 '{"origin": "NYC", "destination": "Dubai", "airline": "Emirates", "passengers": 1, "flight_number": "EK202", "class": "business"}');

-- Call entries
INSERT INTO calls (customer_id, agent_id, issue_type, description, priority, status, start_time, end_time, resolution_status, resolution_note, created_at) VALUES
(1, 1, 'flight', 'Customer would like to change seat assignment on upcoming flight', 'medium', 'completed', NOW() - INTERVAL '3 hour', NOW() - INTERVAL '2 hour 30 minute', 'resolved', 'Changed seat from 14C to 18A', NOW() - INTERVAL '3 hour'),
(2, 3, 'hotel', 'Request for late check-out', 'low', 'completed', NOW() - INTERVAL '2 day', NOW() - INTERVAL '1 day 23 hour 45 minute', 'resolved', 'Approved late check-out until 2 PM at no additional cost', NOW() - INTERVAL '2 day'),
(3, 2, 'general', 'Question about loyalty program points', 'low', 'completed', NOW() - INTERVAL '5 day', NOW() - INTERVAL '5 day', 'resolved', 'Explained point accumulation system, customer satisfied with explanation', NOW() - INTERVAL '5 day'),
(4, 4, 'package', 'Issue with package booking, missing spa treatment', 'high', 'completed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 'resolved', 'Added spa treatment to booking as promised in original package', NOW() - INTERVAL '1 day'),
(5, 1, 'flight', 'Flight delayed, customer seeking compensation', 'high', 'waiting', NULL, NULL, NULL, NULL, NOW() - INTERVAL '10 minute'),
(1, NULL, 'car', 'Need to add child seat to car rental', 'medium', 'waiting', NULL, NULL, NULL, NULL, NOW() - INTERVAL '5 minute');

-- Notes
INSERT INTO notes (customer_id, booking_id, call_id, agent_id, content, created_at) VALUES
(1, 1, 1, 1, 'Customer mentioned he is traveling for a business conference. Prefers window seats.', NOW() - INTERVAL '3 hour'),
(1, 2, NULL, 1, 'Customer requested information about hotel spa services. Sent brochure via email.', NOW() - INTERVAL '2 day'),
(2, 4, 2, 3, 'Customer mentioned anniversary trip. Added complimentary champagne to room.', NOW() - INTERVAL '2 day'),
(3, 5, 3, 2, 'Customer very concerned about having unlimited mileage on car rental. Confirmed this is included.', NOW() - INTERVAL '5 day'),
(4, 6, 4, 4, 'VIP customer, ensure all special requests are properly handled. Customer has history of providing excellent reviews when treated well.', NOW() - INTERVAL '1 day'),
(5, 7, NULL, 1, 'Customer travels frequently to Dubai for business. Prefers business class aisle seats.', NOW() - INTERVAL '5 day');

-- Booking modifications
INSERT INTO booking_modifications (booking_id, agent_id, requested_changes, reason, status, processed_by, processed_at, created_at) VALUES
(1, 1, '{"seat_change": {"from": "14C", "to": "18A"}}', 'Customer preference for window seat', 'completed', 1, NOW() - INTERVAL '2 hour 30 minute', NOW() - INTERVAL '3 hour'),
(3, 3, '{"refund_request": true}', 'Flight cancelled due to personal emergency', 'approved', 5, NOW() - INTERVAL '10 day', NOW() - INTERVAL '12 day'),
(4, 2, '{"room_upgrade": {"from": "Standard", "to": "Ocean View"}}', 'Customer anniversary celebration', 'completed', 2, NOW() - INTERVAL '15 day', NOW() - INTERVAL '16 day'),
(6, 4, '{"add_activities": ["Spa Treatment"]}', 'Activity missing from original booking', 'completed', 4, NOW() - INTERVAL '23 hour', NOW() - INTERVAL '1 day');

-- Additional indexes for performance
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_calls_created_at ON calls(created_at);
CREATE INDEX idx_calls_resolution ON calls(resolution_status);

-- Create function to calculate call wait time
CREATE OR REPLACE FUNCTION calculate_wait_time() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.start_time IS NOT NULL AND OLD.start_time IS NULL THEN
    NEW.wait_duration := EXTRACT(EPOCH FROM (NEW.start_time - NEW.created_at));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for wait time calculation
CREATE TRIGGER update_wait_duration
BEFORE UPDATE ON calls
FOR EACH ROW
EXECUTE FUNCTION calculate_wait_time();