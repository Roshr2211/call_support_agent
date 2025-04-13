// components/Sidebar.js
import React from 'react';
import { Home, Calendar, BookOpen, BarChart2, Settings } from 'lucide-react';

function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home /> },
    { id: 'bookings', label: 'Bookings', icon: <Calendar /> },
    { id: 'knowledge', label: 'Knowledge Base', icon: <BookOpen /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 /> },
    { id: 'settings', label: 'Settings', icon: <Settings /> }
  ];
  
  return (
    <div className="sidebar">
      <div className="logo">
        <span className="logo-text">TravelEase</span>
      </div>
      <nav>
        <ul>
          {navItems.map(item => (
            <li 
              key={item.id} 
              className={activeTab === item.id ? 'active' : ''}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <div className="help-button">
          <span>Help & Support</span>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

