// File: routes/customers.js
module.exports = (pool) => {
    const router = require('express').Router();
    
    // Get all customers
    router.get('/', async (req, res) => {
      try {
        const result = await pool.query('SELECT * FROM customers ORDER BY id');
        res.json(result.rows);
      } catch (err) {
        console.error('Error fetching customers:', err);
        res.status(500).json({ error: 'Server error' });
      }
    });
    
    // Get customer by ID
    router.get('/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Customer not found' });
        }
        
        res.json(result.rows[0]);
      } catch (err) {
        console.error('Error fetching customer:', err);
        res.status(500).json({ error: 'Server error' });
      }
    });
    
    // Search customers
    router.get('/search', async (req, res) => {
      try {
        const { query } = req.query;
        
        const result = await pool.query(
          `SELECT * FROM customers 
           WHERE 
             name ILIKE $1 OR 
             email ILIKE $1 OR 
             phone ILIKE $1 OR
             CAST(id AS TEXT) = $2
           ORDER BY id
           LIMIT 10`,
          [`%${query}%`, query]
        );
        
        res.json(result.rows);
      } catch (err) {
        console.error('Error searching customers:', err);
        res.status(500).json({ error: 'Server error' });
      }
    });
    
    // Get customer bookings
    router.get('/:id/bookings', async (req, res) => {
      try {
        const { id } = req.params;
        
        const result = await pool.query(
          `SELECT * FROM bookings WHERE customer_id = $1 ORDER BY created_at DESC`,
          [id]
        );
        
        res.json(result.rows);
      } catch (err) {
        console.error('Error fetching customer bookings:', err);
        res.status(500).json({ error: 'Server error' });
      }
    });
    
    return router;
  };
  
  
