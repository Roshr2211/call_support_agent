// App.js
import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import CustomerDetails from './components/CustomerDetails';
import CallQueue from './components/CallQueue';
import BookingDetails from './components/BookingDetails';
import CallControls from './components/CallControls';
import NotesSection from './components/NotesSection';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [callStatus, setCallStatus] = useState('idle'); // idle, active, on-hold
  
  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        <header>
          <h1>TravelEase Support Center</h1>
          <div className="agent-info">
            <span>Agent: Sarah Johnson</span>
            <span className="status online">Online</span>
          </div>
        </header>
        
        <div className="workspace">
          {activeTab === 'dashboard' && (
            <div className="dashboard">
              <CallQueue onSelectCustomer={setSelectedCustomer} />
              {selectedCustomer && (
                <div className="customer-workspace">
                  <div className="top-panel">
                    <CustomerDetails customer={selectedCustomer} />
                    <CallControls 
                      callStatus={callStatus} 
                      setCallStatus={setCallStatus} 
                    />
                  </div>
                  <div className="bottom-panel">
                    <BookingDetails customerId={selectedCustomer.id} />
                    <NotesSection customerId={selectedCustomer.id} />
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'bookings' && <div className="bookings-view">Bookings Management</div>}
          {activeTab === 'knowledge' && <div className="knowledge-base">Knowledge Base</div>}
          {activeTab === 'analytics' && <div className="analytics-view">Call Analytics</div>}
          {activeTab === 'settings' && <div className="settings-view">System Settings</div>}
        </div>
      </div>
    </div>
  );
}

export default App;


