// File: routes/bookings.js
module.exports = (pool) => {
    const router = require('express').Router();
    
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
  
  
