import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CallQueue({ onSelectCustomer }) {
  // Initialize queue as an empty array
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format wait time from created_at timestamp
  const formatWaitTime = (createdAt) => {
    if (!createdAt) return "0:00";
    
    try {
      const created = new Date(createdAt);
      const now = new Date();
      const diffMs = now - created;
      
      const minutes = Math.floor(diffMs / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);
      
      return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    } catch (err) {
      console.error("Error formatting time:", err);
      return "0:00";
    }
  };

  // Mock data for development
  const mockData = [
    {
      id: 1,
      customer_id: 101,
      customer_name: 'John Smith',
      customer_phone: '555-123-4567',
      customer_email: 'john@example.com',
      issue_type: 'Flight cancellation',
      description: 'Flight XY123 cancelled, needs rebooking',
      priority: 'high',
      created_at: new Date(Date.now() - 272000).toISOString(),
      membership_level: 'gold'
    },
    {
      id: 2,
      customer_id: 102,
      customer_name: 'Maria Garcia',
      customer_phone: '555-987-6543',
      customer_email: 'maria@example.com',
      issue_type: 'Hotel booking modification',
      description: 'Needs to change dates for reservation',
      priority: 'medium',
      created_at: new Date(Date.now() - 135000).toISOString(),
      membership_level: 'silver'
    },
    {
      id: 3,
      customer_id: 103,
      customer_name: 'Robert Chen',
      customer_phone: '555-456-7890',
      customer_email: 'robert@example.com',
      issue_type: 'Car rental inquiry',
      description: 'Questions about available vehicles',
      priority: 'low',
      created_at: new Date(Date.now() - 65000).toISOString(),
      membership_level: 'standard'
    }
  ];

  // Fetch call queue data from API or use mock data
  const fetchCallQueue = async () => {
    try {
      setLoading(true);
      
      // Set your backend URL to port 5000
      const backendUrl = 'http://localhost:5000';
      
      try {
        // Use actual API with full URL
        const response = await axios.get(`${backendUrl}/api/calls/queue`);
        console.log('API response:', response.data);
        
        if (Array.isArray(response.data)) {
          setQueue(response.data);
        } else if (response.data && response.data.rows && Array.isArray(response.data.rows)) {
          setQueue(response.data.rows);
        } else {
          console.error('Unexpected API response format:', response.data);
          setQueue(mockData); // Fallback to mock data
        }
        setError(null);
      } catch (apiError) {
        console.error('API error:', apiError);
        setError('Could not connect to backend server. Using demo data.');
        setQueue(mockData);
      }
    } catch (err) {
      console.error('Error fetching call queue:', err);
      setError('Failed to load call queue. Using demo data.');
      setQueue(mockData);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when component mounts
  useEffect(() => {
    fetchCallQueue();
    
    // Set up polling to refresh queue data every 30 seconds
    const intervalId = setInterval(fetchCallQueue, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Handle selecting a customer from the queue
  const handleSelectCustomer = (call) => {
    // Format the call data to match what the parent component expects
    const formattedCall = {
      id: call.id,
      name: call.customer_name,
      phone: call.customer_phone,
      email: call.customer_email,
      waitTime: formatWaitTime(call.created_at),
      priority: call.priority,
      issue: call.issue_type,
      description: call.description,
      customer_id: call.customer_id,
      membership_level: call.membership_level
    };
    
    if (onSelectCustomer && typeof onSelectCustomer === 'function') {
      onSelectCustomer(formattedCall);
    } else {
      console.error("onSelectCustomer is not a function", onSelectCustomer);
    }
  };

  return (
    <div className="call-queue">
      <div className="section-header">
        <h2>Call Queue</h2>
        <span className="queue-stats">{queue.length} waiting</span>
        {error && <div className="error-message">{error}</div>}
        <button onClick={fetchCallQueue} className="refresh-button">
          Refresh Queue
        </button>
      </div>
      
      {loading ? (
        <div className="loading">Loading queue...</div>
      ) : (
        <div className="queue-list">
          {queue.length === 0 ? (
            <div className="no-calls">No calls waiting in queue</div>
          ) : (
            queue.map(call => (
              <div
                key={call.id}
                className={`queue-item priority-${call.priority || 'medium'}`}
                onClick={() => handleSelectCustomer(call)}
              >
                <div className="queue-item-info">
                  <div>
                    <h3>{call.customer_name || 'Unknown Customer'}</h3>
                    <p>{call.issue_type || 'No issue specified'}</p>
                    {call.membership_level && (
                      <span className={`membership-badge ${call.membership_level}`}>
                        {call.membership_level.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="wait-time">
                    <span>{formatWaitTime(call.created_at)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default CallQueue;