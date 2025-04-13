// components/CustomerDetails.js
import React from 'react';
import { Phone, MapPin, Mail } from 'lucide-react';

function CustomerDetails({ customer }) {
  // Mock expanded customer data
  const customerData = {
    id: customer.id,
    name: customer.name,
    phone: '+1 (555) 123-4567',
    email: `${customer.name.split(' ')[0].toLowerCase()}@example.com`,
    address: '123 Main St, Anytown, CA 90210',
    membershipLevel: customer.id === 1 ? 'Premium' : 'Standard',
    lastContact: '2023-12-10'
  };
  
  return (
    <div className="customer-details">
      <div className="section-header">
        <h2>Customer Profile</h2>
      </div>
      <div className="customer-profile">
        <div className="avatar">
          {customerData.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="customer-info">
          <h3>{customerData.name}</h3>
          <div className="membership-badge">
            {customerData.membershipLevel} Member
          </div>
          <div className="contact-details">
            <div className="contact-item">
              <Phone size={16} />
              <span>{customerData.phone}</span>
            </div>
            <div className="contact-item">
              <Mail size={16} />
              <span>{customerData.email}</span>
            </div>
            <div className="contact-item">
              <MapPin size={16} />
              <span>{customerData.address}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerDetails;

