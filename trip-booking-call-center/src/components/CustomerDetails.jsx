import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Mail } from 'lucide-react';

function CustomerDetails({ customer }) {
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch if we have a customer ID
    if (customer && customer.id) {
      fetchCustomerDetails(customer.id);
    } else {
      setLoading(false);
    }
  }, [customer]);

  const fetchCustomerDetails = async (customerId) => {
    try {
      setLoading(true);
      // Fetch expanded customer details from the backend
      const response = await fetch(`http://localhost:5000/api/customers/${customerId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch customer details');
      }
      
      const data = await response.json();
      
      // Fetch customer bookings
      const bookingsResponse = await fetch(`http://localhost:5000/api/customers/${customerId}/bookings`);
      const bookings = bookingsResponse.ok ? await bookingsResponse.json() : [];
      
      // Combine customer data with bookings
      setCustomerData({
        ...data,
        bookings,
        // If some fields aren't available from the API, set defaults
        email: data.email || `${data.name.split(' ')[0].toLowerCase()}@example.com`,
        membershipLevel: data.membership_level || 'Standard'
      });
    } catch (err) {
      console.error('Error fetching customer details:', err);
      setError('Could not load customer details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading customer details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!customerData) {
    return <div className="no-customer">No customer selected</div>;
  }

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
      
      {customerData.bookings && customerData.bookings.length > 0 && (
        <div className="customer-bookings">
          <h3>Recent Bookings</h3>
          <ul className="bookings-list">
            {customerData.bookings.slice(0, 3).map(booking => (
              <li key={booking.id} className="booking-item">
                <span>{new Date(booking.created_at).toLocaleDateString()}</span>
                <span>{booking.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CustomerDetails;