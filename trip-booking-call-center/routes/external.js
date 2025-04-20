module.exports = (pool) => {
    const router = require('express').Router();
  
    // Get booking by reference number
    router.get('/bookings/reference/:ref', async (req, res) => {
      try {
        const { ref } = req.params;
        const result = await pool.query(
          'SELECT id, reference_number, customer_id, status FROM bookings WHERE reference_number = $1',
          [ref]
        );
  
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Booking not found' });
        }
  
        res.json(result.rows[0]);
      } catch (err) {
        console.error('Error fetching booking by reference:', err);
        res.status(500).json({ error: 'Server error' });
      }
    });
  
    // Get booking modifications
    router.get('/bookings/:id/modifications', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await pool.query(
          `SELECT bm.id, bm.requested_changes, bm.reason, bm.status, a.name as agent_name
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
  
    // Create a booking modification
    router.post('/bookings/:id/modification', async (req, res) => {
      try {
        const { id } = req.params;
        const { requested_changes, reason, agent_id } = req.body;
  
        const check = await pool.query('SELECT id FROM bookings WHERE id = $1', [id]);
        if (check.rows.length === 0) {
          return res.status(404).json({ error: 'Booking not found' });
        }
  
        const result = await pool.query(
          `INSERT INTO booking_modifications 
            (booking_id, requested_changes, reason, status, agent_id, created_at) 
           VALUES ($1, $2, $3, 'pending', $4, NOW())
           RETURNING id, booking_id, status`,
          [id, requested_changes, reason, agent_id]
        );
  
        res.status(201).json(result.rows[0]);
      } catch (err) {
        console.error('Error creating booking modification:', err);
        res.status(500).json({ error: 'Server error' });
      }
    });
  
    return router;
  };
  