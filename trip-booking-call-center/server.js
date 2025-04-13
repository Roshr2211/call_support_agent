// File: server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;
const dotenv = require('dotenv');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

dotenv.config();


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});


// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// Import routes
const agentRoutes = require('./routes/agents');
const customerRoutes = require('./routes/customers');
const callRoutes = require('./routes/calls');
const bookingRoutes = require('./routes/bookings');
const noteRoutes = require('./routes/notes');

// Register routes
app.use('/api/agents', agentRoutes(pool));
app.use('/api/customers', customerRoutes(pool));
app.use('/api/calls', callRoutes(pool));
app.use('/api/bookings', bookingRoutes(pool));
app.use('/api/notes', noteRoutes(pool));

// Root endpoint
app.get('/', (req, res) => {
  res.send('Trip Booking Call Center API is running');
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

