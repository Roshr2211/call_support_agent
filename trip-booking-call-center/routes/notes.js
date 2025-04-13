// File: routes/notes.js
module.exports = (pool) => {
    const router = require('express').Router();
    
    // Get customer notes
    router.get('/customer/:customerId', async (req, res) => {
      try {
        const { customerId } = req.params;
        
        const result = await pool.query(
          `SELECT 
            n.*,
            a.name as agent_name
          FROM notes n
          LEFT JOIN agents a ON n.agent_id = a.id
          WHERE n.customer_id = $1
          ORDER BY n.created_at DESC`,
          [customerId]
        );
        
        res.json(result.rows);
      } catch (err) {
        console.error('Error fetching customer notes:', err);
        res.status(500).json({ error: 'Server error' });
      }
    });
    
    // Get booking notes
    router.get('/booking/:bookingId', async (req, res) => {
      try {
        const { bookingId } = req.params;
        
        const result = await pool.query(
          `SELECT 
            n.*,
            a.name as agent_name
          FROM notes n
          LEFT JOIN agents a ON n.agent_id = a.id
          WHERE n.booking_id = $1
          ORDER BY n.created_at DESC`,
          [bookingId]
        );
        
        res.json(result.rows);
      } catch (err) {
        console.error('Error fetching booking notes:', err);
        res.status(500).json({ error: 'Server error' });
      }
    });
    
    // Create note
    router.post('/', async (req, res) => {
      try {
        const { customer_id, booking_id, call_id, agent_id, content } = req.body;
        
        if (!content) {
          return res.status(400).json({ error: 'Note content is required' });
        }
        
        if (!customer_id && !booking_id) {
          return res.status(400).json({ error: 'Either customer_id or booking_id is required' });
        }
        
        const result = await pool.query(
          `INSERT INTO notes
            (customer_id, booking_id, call_id, agent_id, content, created_at)
          VALUES
            ($1, $2, $3, $4, $5, NOW())
          RETURNING *`,
          [customer_id, booking_id, call_id, agent_id, content]
        );
        
        res.status(201).json(result.rows[0]);
      } catch (err) {
        console.error('Error creating note:', err);
        res.status(500).json({ error: 'Server error' });
      }
    });
    
    return router;
  };
  
  
