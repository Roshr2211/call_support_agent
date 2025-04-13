// File: routes/calls.js
module.exports = (pool) => {
    const router = require('express').Router();
    
    // Get call queue
    router.get('/queue', async (req, res) => {
      try {
        const result = await pool.query(
          `SELECT 
            c.id, 
            c.customer_id, 
            c.issue_type, 
            c.description, 
            c.priority,
            c.created_at,
            cu.name as customer_name,
            cu.phone as customer_phone,
            cu.email as customer_email,
            cu.membership_level
          FROM calls c
          JOIN customers cu ON c.customer_id = cu.id
          WHERE c.status = 'waiting'
          ORDER BY 
            CASE 
              WHEN c.priority = 'high' THEN 1
              WHEN c.priority = 'medium' THEN 2
              WHEN c.priority = 'low' THEN 3
            END,
            c.created_at ASC`
        );
        
        res.json(result.rows);
      } catch (err) {
        console.error('Error fetching call queue:', err);
        res.status(500).json({ error: 'Server error' });
      }
    });
    
    // Get call by ID
    router.get('/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await pool.query(
          `SELECT 
            c.*,
            cu.name as customer_name,
            cu.phone as customer_phone,
            cu.email as customer_email,
            a.name as agent_name
          FROM calls c
          LEFT JOIN customers cu ON c.customer_id = cu.id
          LEFT JOIN agents a ON c.agent_id = a.id
          WHERE c.id = $1`,
          [id]
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Call not found' });
        }
        
        res.json(result.rows[0]);
      } catch (err) {
        console.error('Error fetching call:', err);
        res.status(500).json({ error: 'Server error' });
      }
    });
    
    // Create new call
    router.post('/', async (req, res) => {
      try {
        const { customer_id, issue_type, description, priority } = req.body;
        
        const result = await pool.query(
          `INSERT INTO calls 
            (customer_id, issue_type, description, priority, status, created_at) 
          VALUES 
            ($1, $2, $3, $4, 'waiting', NOW())
          RETURNING *`,
          [customer_id, issue_type, description, priority || 'medium']
        );
        
        res.status(201).json(result.rows[0]);
      } catch (err) {
        console.error('Error creating call:', err);
        res.status(500).json({ error: 'Server error' });
      }
    });
    
    // Assign call to agent
    router.patch('/:id/assign', async (req, res) => {
      try {
        const { id } = req.params;
        const { agent_id } = req.body;
        
        const result = await pool.query(
          `UPDATE calls 
          SET 
            agent_id = $1, 
            status = 'active', 
            start_time = NOW(), 
            updated_at = NOW() 
          WHERE id = $2 AND status = 'waiting'
          RETURNING *`,
          [agent_id, id]
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Call not found or already assigned' });
        }
        
        res.json(result.rows[0]);
      } catch (err) {
        console.error('Error assigning call:', err);
        res.status(500).json({ error: 'Server error' });
      }
    });
    
    // Update call status
    router.patch('/:id/status', async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;
        
        let query;
        const validStatuses = ['active', 'on-hold', 'completed', 'transferred'];
        
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ error: 'Invalid status' });
        }
        
        // If call is completed, set end_time
        if (status === 'completed') {
          query = `
            UPDATE calls 
            SET 
              status = $1, 
              end_time = NOW(), 
              updated_at = NOW() 
            WHERE id = $2
            RETURNING *`;
        } else {
          query = `
            UPDATE calls 
            SET 
              status = $1, 
              updated_at = NOW() 
            WHERE id = $2
            RETURNING *`;
        }
        
        const result = await pool.query(query, [status, id]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Call not found' });
        }
        
        res.json(result.rows[0]);
      } catch (err) {
        console.error('Error updating call status:', err);
        res.status(500).json({ error: 'Server error' });
      }
    });
    
    // Transfer call to another agent
    router.post('/:id/transfer', async (req, res) => {
      try {
        const { id } = req.params;
        const { new_agent_id, transfer_reason } = req.body;
        
        const result = await pool.query(
          `UPDATE calls 
          SET 
            agent_id = $1, 
            transfer_reason = $2,
            transfer_count = transfer_count + 1,
            updated_at = NOW() 
          WHERE id = $3
          RETURNING *`,
          [new_agent_id, transfer_reason, id]
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Call not found' });
        }
        
        res.json(result.rows[0]);
      } catch (err) {
        console.error('Error transferring call:', err);
        res.status(500).json({ error: 'Server error' });
      }
    });
    
    // Complete a call
    router.post('/:id/complete', async (req, res) => {
      try {
        const { id } = req.params;
        const { resolution_status, resolution_note } = req.body;
        
        const validResolutions = ['resolved', 'unresolved', 'escalated', 'callback'];
        if (!validResolutions.includes(resolution_status)) {
          return res.status(400).json({ error: 'Invalid resolution status' });
        }
        
        const result = await pool.query(
          `UPDATE calls 
          SET 
            status = 'completed', 
            end_time = NOW(),
            resolution_status = $1,
            resolution_note = $2,
            updated_at = NOW() 
          WHERE id = $3
          RETURNING *`,
          [resolution_status, resolution_note, id]
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Call not found' });
        }
        
        res.json(result.rows[0]);
      } catch (err) {
        console.error('Error completing call:', err);
        res.status(500).json({ error: 'Server error' });
      }
    });
    
    return router;
  };
  
  
