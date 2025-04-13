// components/BookingDetails.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function BookingDetails({ customerId }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modificationData, setModificationData] = useState({
    requested_changes: '',
    reason: '',
    agent_id: 1 // Default agent ID, you might want to get this from context or props
  });
  const [showModificationForm, setShowModificationForm] = useState(false);

  // Check if we're in development or production
  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? '' // Empty string for production (relative URLs)
    : 'http://localhost:5000'; // Development server

  // Update this path based on your actual API structure
  const BOOKINGS_API_PATH = '/api/bookings'; 

  useEffect(() => {
    if (customerId) {
      fetchBookings(customerId);
    } else {
      setBookings([]);
      setLoading(false);
    }
  }, [customerId]);

  // Helper function to safely render potentially complex objects as strings
  const renderValue = (value) => {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch (e) {
        return 'Complex Object';
      }
    }
    
    return String(value);
  };

  const fetchBookings = async (custId) => {
    if (!custId) return;
    
    try {
      setLoading(true);
      console.log(`Fetching bookings for customer ID: ${custId}`);
      
      // Use the customer ID to filter bookings
      const response = await axios.get(`${API_BASE_URL}${BOOKINGS_API_PATH}/customer/${custId}`);
      setBookings(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings for customer:', err);
      
      // Fallback to mock data for development/testing purposes
      if (process.env.NODE_ENV !== 'production') {
        console.log('Using fallback mock data for development');
        
        // Create customer-specific mock data
        const mockBookings = [];
        
        // For customer ID 1
        if (custId === 1 || custId === "1") {
          mockBookings.push(
            {
              id: 101,
              customer_id: 1,
              type: 'Flight',
              reference_number: 'FL-87652',
              status: 'confirmed',
              start_date: '2025-04-20',
              end_date: '2025-04-27',
              details: {
                class: 'Economy',
                origin: 'JFK',
                destination: 'LHR',
                airline: 'British Airways',
                flight_number: 'BA112',
                passengers: 2
              },
              price: 720
            },
            {
              id: 102,
              customer_id: 1,
              type: 'Hotel',
              reference_number: 'HT-34521',
              status: 'confirmed',
              start_date: '2025-04-20',
              end_date: '2025-04-27',
              details: 'Grand Plaza Hotel, London',
              price: 1250
            },
            {
              id: 103,
              customer_id: 1,
              type: 'Flight',
              reference_number: 'FL-45398',
              status: 'cancelled',
              start_date: '2025-05-15',
              end_date: '2025-05-15',
              details: 'NYC to Chicago, One way',
              price: 210
            }
          );
        }
        // For customer ID 2
        else if (custId === 2 || custId === "2") {
          mockBookings.push(
            {
              id: 201,
              customer_id: 2,
              type: 'Flight',
              reference_number: 'FL-22431',
              status: 'confirmed',
              start_date: '2025-05-10',
              end_date: '2025-05-17',
              details: {
                class: 'Business',
                origin: 'LAX',
                destination: 'CDG',
                airline: 'Air France',
                flight_number: 'AF65',
                passengers: 1
              },
              price: 1850
            }
          );
        }
        // For customer ID 3 and others
        else {
          mockBookings.push(
            {
              id: 301 + parseInt(custId, 10),
              customer_id: parseInt(custId, 10),
              type: 'Hotel',
              reference_number: `HT-${10000 + parseInt(custId, 10) * 111}`,
              status: 'pending',
              start_date: '2025-06-01',
              end_date: '2025-06-05',
              details: 'Mountain View Resort, Colorado',
              price: 780
            }
          );
        }
        
        setBookings(mockBookings);
        setError(null);
      } else {
        setError('Failed to load bookings for this customer. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (bookingId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}${BOOKINGS_API_PATH}/${bookingId}`);
      setSelectedBooking(response.data);
    } catch (err) {
      console.error('Error fetching booking details:', err);
      
      // Fallback to finding the booking in our local state
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        setSelectedBooking(booking);
      } else {
        setError('Failed to load booking details. Please try again later.');
      }
    }
  };

  const handleModifyClick = (booking) => {
    setSelectedBooking(booking);
    setShowModificationForm(true);
  };

  const handleModificationChange = (e) => {
    const { name, value } = e.target;
    setModificationData({
      ...modificationData,
      [name]: value
    });
  };

  const submitModificationRequest = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_BASE_URL}${BOOKINGS_API_PATH}/${selectedBooking.id}/modification`, 
        modificationData
      );
      
      // Reset form and state
      setModificationData({
        requested_changes: '',
        reason: '',
        agent_id: 1
      });
      setShowModificationForm(false);
      
      // Show success message or update UI accordingly
      alert('Modification request submitted successfully!');
    } catch (err) {
      console.error('Error submitting modification request:', err);
      setError('Failed to submit modification request. Please try again later.');
      
      // For development, show success anyway
      if (process.env.NODE_ENV !== 'production') {
        alert('Development mode: Modification request simulated successfully!');
        setShowModificationForm(false);
      }
    }
  };

  const renderBookingDetails = (details) => {
    if (!details) return 'No details available';
    
    if (typeof details === 'string') return details;
    
    if (typeof details === 'object') {
      return (
        <div className="booking-details-object">
          {Object.entries(details).map(([key, value]) => (
            <p key={key}>
              <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong>{' '}
              {typeof value === 'object' ? JSON.stringify(value) : value}
            </p>
          ))}
        </div>
      );
    }
    
    return String(details);
  };

  const closeModificationForm = () => {
    setShowModificationForm(false);
    setModificationData({
      requested_changes: '',
      reason: '',
      agent_id: 1
    });
  };

  if (!customerId) {
    return <div className="booking-details">No customer selected</div>;
  }

  if (loading) return <div className="booking-details">Loading bookings for customer #{customerId}...</div>;
  
  if (error && bookings.length === 0) return <div className="booking-details error-message">{error}</div>;

  return (
    <div className="booking-details">
      <div className="section-header">
        <h2>Customer Bookings</h2>
        <span className="count">{bookings.length}</span>
      </div>
      
      {selectedBooking && !showModificationForm && (
        <div className="booking-detail-view">
          <h3>Booking Details</h3>
          <p><strong>Reference:</strong> {selectedBooking.reference_number}</p>
          <p><strong>Type:</strong> {selectedBooking.type || "Standard Booking"}</p>
          <p><strong>Status:</strong> {selectedBooking.status}</p>
          {selectedBooking.created_at && (
            <p><strong>Created:</strong> {new Date(selectedBooking.created_at).toLocaleDateString()}</p>
          )}
          {selectedBooking.start_date && (
            <p><strong>Start Date:</strong> {new Date(selectedBooking.start_date).toLocaleDateString()}</p>
          )}
          {selectedBooking.end_date && (
            <p><strong>End Date:</strong> {new Date(selectedBooking.end_date).toLocaleDateString()}</p>
          )}
          
          <div className="booking-details-section">
            <h4>Details</h4>
            {renderBookingDetails(selectedBooking.details)}
          </div>
          
          {selectedBooking.price && (
            <p><strong>Price:</strong> ${typeof selectedBooking.price === 'number' 
              ? selectedBooking.price.toFixed(2) 
              : selectedBooking.price}</p>
          )}
          <button onClick={() => setSelectedBooking(null)} className="btn btn-secondary">
            Back to List
          </button>
        </div>
      )}

      {showModificationForm && (
        <div className="modification-form">
          <h3>Request Booking Modification</h3>
          <form onSubmit={submitModificationRequest}>
            <div className="form-group">
              <label htmlFor="requested_changes">Requested Changes:</label>
              <textarea
                id="requested_changes"
                name="requested_changes"
                value={modificationData.requested_changes}
                onChange={handleModificationChange}
                required
                className="form-control"
                rows="3"
                placeholder="Describe the changes you need (e.g., change dates, add passenger)"
              />
            </div>
            <div className="form-group">
              <label htmlFor="reason">Reason:</label>
              <textarea
                id="reason"
                name="reason"
                value={modificationData.reason}
                onChange={handleModificationChange}
                required
                className="form-control"
                rows="2"
                placeholder="Explain why the change is needed"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Submit Request</button>
              <button type="button" className="btn btn-secondary" onClick={closeModificationForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!selectedBooking && !showModificationForm && (
        <div className="bookings-list">
          {bookings.length === 0 ? (
            <p>No bookings found for this customer.</p>
          ) : (
            bookings.map(booking => (
              <div key={booking.id} className={`booking-card status-${booking.status.toLowerCase()}`}>
                <div className="booking-header">
                  <span className="booking-type">{booking.type || "Booking"}</span>
                  <span className="booking-reference">{booking.reference_number}</span>
                  <span className={`booking-status status-${booking.status.toLowerCase()}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="booking-body">
                  {booking.start_date && booking.end_date && (
                    <p className="booking-dates">
                      {new Date(booking.start_date).toLocaleDateString()} - 
                      {new Date(booking.end_date).toLocaleDateString()}
                    </p>
                  )}
                  <p className="booking-details-summary">
                    {typeof booking.details === 'object' 
                      ? `${booking.details.origin || ''} to ${booking.details.destination || ''}`
                      : renderValue(booking.details)}
                  </p>
                  {booking.price && <p className="booking-price">
                    ${typeof booking.price === 'number' ? booking.price.toFixed(2) : booking.price}
                  </p>}
                </div>
                <div className="booking-actions">
                  <button className="btn-link" onClick={() => handleViewDetails(booking.id)}>
                    View Details
                  </button>
                  <button className="btn-link" onClick={() => handleModifyClick(booking)}>
                    Modify
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default BookingDetails;