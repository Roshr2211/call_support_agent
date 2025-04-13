// components/CallQueue.js
import React, { useState } from 'react';

function CallQueue({ onSelectCustomer }) {
  // Mock data
  const [queue, setQueue] = useState([
    {
      id: 1,
      name: 'John Smith',
      waitTime: '4:32',
      priority: 'high',
      issue: 'Flight cancellation'
    },
    {
      id: 2,
      name: 'Maria Garcia',
      waitTime: '2:15',
      priority: 'medium',
      issue: 'Hotel booking modification'
    },
    {
      id: 3,
      name: 'Robert Chen',
      waitTime: '1:05',
      priority: 'low',
      issue: 'Car rental inquiry'
    }
  ]);
  
  return (
    <div className="call-queue">
      <div className="section-header">
        <h2>Call Queue</h2>
        <span className="queue-stats">3 waiting</span>
      </div>
      <div className="queue-list">
        {queue.map(caller => (
          <div 
            key={caller.id} 
            className={`queue-item priority-${caller.priority}`}
            onClick={() => onSelectCustomer(caller)}
          >
            <div className="queue-item-info">
              <div>
                <h3>{caller.name}</h3>
                <p>{caller.issue}</p>
              </div>
              <div className="wait-time">
                <span>{caller.waitTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CallQueue;

