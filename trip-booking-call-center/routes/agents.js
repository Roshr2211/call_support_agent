// File: routes/agents.js
module.exports = (pool) => {
    const router = require('express').Router();
    
    // Get all agents
    router.get('/', async (req, res) => {
      try {
        const result = await pool.query('SELECT * FROM agents ORDER BY id');
        res.json(result.rows);
      } catch (err) {
        console.error('Error fetching agents:', err);
        res.status(500).json({ error: 'Server error' });
      }
    });
    
    // Get agent by ID
    router.get('/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM agents WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Agent not found' });
        }
        
        res.json(result.rows[0]);
      } catch (err) {
        console.error('Error fetching agent:', err);
        res.status(500).json({ error: 'Server error' });
      }
    });
    
    // Update agent status
    router.patch('/:id/status', async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;
        
        const validStatuses = ['online', 'offline', 'break', 'busy'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ error: 'Invalid status' });
        }
        
        const result = await pool.query(
          'UPDATE agents SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
          [status, id]
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Agent not found' });
        }
        
        res.json(result.rows[0]);
      } catch (err) {
        console.error('Error updating agent status:', err);
        res.status(500).json({ error: 'Server error' });
      }
    });
    
    // Get agent stats
    router.get('/:id/stats', async (req, res) => {
      try {
        const { id } = req.params;
        const { period } = req.query; // day, week, month
        
        let timeFilter;
        switch (period) {
          case 'day':
            timeFilter = "created_at > NOW() - INTERVAL '1 day'";
            break;
          case 'week':
            timeFilter = "created_at > NOW() - INTERVAL '1 week'";
            break;
          case 'month':
            timeFilter = "created_at > NOW() - INTERVAL '1 month'";
            break;
          default:
            timeFilter = "created_at > NOW() - INTERVAL '1 day'";
        }
        
        const callsQuery = await pool.query(
          `SELECT 
            COUNT(*) as total_calls,
            AVG(EXTRACT(EPOCH FROM (end_time - start_time)))/60 as avg_duration_minutes,
            COUNT(CASE WHEN resolution_status = 'resolved' THEN 1 END) as resolved_calls
          FROM calls
          WHERE agent_id = $1 AND ${timeFilter}`,
          [id]
        );
        
        res.json(callsQuery.rows[0]);
      } catch (err) {
        console.error('Error fetching agent stats:', err);
        res.status(500).json({ error: 'Server error' });
      }
    });
    
    return router;
  };
  
  