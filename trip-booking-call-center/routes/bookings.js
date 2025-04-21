// File: routes/bookings.js
module.exports = (pool) => {
    const router = require('express').Router();

    const axios = require('axios');

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const {
      customer_id,
      reference_number,
      booking_type,
      price,
      currency,
      start_date,
      end_date,
      details
    } = req.body;

    // Validate input
    if (!customer_id || !reference_number || !booking_type || !price || !start_date || !details) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO bookings 
        (customer_id, reference_number, booking_type, status, price, currency, start_date, end_date, details, created_at, updated_at)
       VALUES 
        ($1, $2, $3, 'confirmed', $4, $5, $6, $7, $8, NOW(), NOW()) 
       RETURNING *`,
      [customer_id, reference_number, booking_type, price, currency, start_date, end_date, JSON.stringify(details)]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/:id/check-and-apply-visa', async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1: Fetch booking
    const bookingResult = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    const booking = bookingResult.rows[0];

    // Step 2: Check if it's a flight
    if (booking.booking_type.toLowerCase() !== 'flight') {
      return res.status(400).json({ error: 'Visa only applicable for flight bookings' });
    }

    // Step 3: Fetch customer info
    const customerResult = await pool.query('SELECT * FROM customers WHERE id = $1', [booking.customer_id]);
    if (customerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    const customer = customerResult.rows[0];

    // Step 4: Extract details for visa
    const details = booking.details;
    const visaPayload = {
      userId: `user${customer.id}`, // or use UUID if preferred
      name: customer.name,
      passport: details.passport || 'UNKNOWN',
      country: details.nationality || 'UNKNOWN',
      bankBalance: details.bankBalance || 0,
      criminalHistory: details.criminalHistory || false
    };

    // Step 5: Call Visa API
    const visaRes = await axios.post('http://localhost:3000/apply', visaPayload);

    // Step 6: Respond with visa status
    return res.status(200).json({
      booking,
      visaStatus: visaRes.data.status,
      visaMessage: visaRes.data.message
    });

  } catch (err) {
    console.error('Visa integration error:', err.message);
    return res.status(500).json({ error: 'Failed to apply for visa' });
  }
});

// View Visa Applications for a given Booking
router.get('/:id/view-visa-applications', async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1: Fetch booking
    const bookingResult = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    const booking = bookingResult.rows[0];

    // Step 2: Check if it's a flight (Visa applicable only for flight bookings)
    if (booking.booking_type.toLowerCase() !== 'flight') {
      return res.status(400).json({ error: 'Visa only applicable for flight bookings' });
    }

    // Step 3: Fetch customer info
    const customerResult = await pool.query('SELECT * FROM customers WHERE id = $1', [booking.customer_id]);
    if (customerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    const customer = customerResult.rows[0];

    // Step 4: Extract userId and check existing visa applications
    const userId = `user${customer.id}`; // Construct userId from customer ID

    // Step 5: Call Visa Admin API to fetch visa applications for this user
    const visaAppsRes = await axios.get(`http://localhost:3000/my-applications/${userId}`);

    // Step 6: Respond with visa applications
    return res.status(200).json({
      booking,
      visaApplications: visaAppsRes.data // Return the visa applications for the customer
    });

  } catch (err) {
    console.error('Error fetching visa applications:', err.message);
    return res.status(500).json({ error: 'Failed to fetch visa applications' });
  }
});






    
    // Get all bookings
    router.get('/', async (req, res) => {
      try {
        const result = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 50');
        res.json(result.rows);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        res.status(500).json({ error: 'Server error' });
      }
    });
    
    router.post('/:id/modification', async (req, res) => {
      try {
        console.log('POST /:id/modification hit!');
        console.log('Request body:', req.body);
        const { id } = req.params;
        const { requested_changes, reason, agent_id } = req.body;
        
        // First check if booking exists
        const bookingCheck = await pool.query('SELECT id FROM bookings WHERE id = $1', [id]);
        if (bookingCheck.rows.length === 0) {
          return res.status(404).json({ error: 'Booking not found' });
        }
        
        const result = await pool.query(
          `INSERT INTO booking_modifications 
            (booking_id, requested_changes, reason, status, agent_id, created_at) 
          VALUES 
            ($1, $2, $3, 'pending', $4, NOW())
          RETURNING *`,
          [id, requested_changes, reason, agent_id]
        );
        
        res.status(201).json(result.rows[0]);
      } catch (err) {
        console.error('Error creating modification request:', err);
        res.status(500).json({ error: 'Server error' });
      }
    });
    // Get booking by ID

    // Get booking modifications
    router.get('/:id/modifications', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await pool.query(
          `SELECT 
            bm.*,
            a.name as agent_name
          FROM booking_modifications bm
          LEFT JOIN agents a ON bm.agent_id = a.id
          WHERE bm.booking_id = $1
          ORDER BY bm.created_at DESC`,
          [id]
        );
        
        res.json(result.rows);
      } catch (err) {
        console.error('Error fetching booking modifications:', err);
        res.status(500).json({ error: 'Server error' });
      }
    });
    
    router.get('/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Booking not found' });
        }
        
        res.json(result.rows[0]);
      } catch (err) {
        console.error('Error fetching booking:', err);
        res.status(500).json({ error: 'Server error' });
      }
    });
    
    // Get booking by reference number
    router.get('/reference/:ref', async (req, res) => {
      try {
        const { ref } = req.params;
        const result = await pool.query('SELECT * FROM bookings WHERE reference_number = $1', [ref]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Booking not found' });
        }
        
        res.json(result.rows[0]);
      } catch (err) {
        console.error('Error fetching booking by reference:', err);
        res.status(500).json({ error: 'Server error' });
      }
    });
    
    // Update booking status
    router.patch('/:id/status', async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;
        
        const validStatuses = ['confirmed', 'pending', 'cancelled', 'completed'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ error: 'Invalid status' });
        }
        
        const result = await pool.query(
          'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
          [status, id]
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Booking not found' });
        }
        
        res.json(result.rows[0]);
      } catch (err) {
        console.error('Error updating booking status:', err);
        res.status(500).json({ error: 'Server error' });
      }
    });
    
    // Create booking modification request
    
    
    
    return router;
  };
  
  
