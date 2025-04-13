// components/BookingDetails.js
import React, { useState, useEffect } from 'react';

function BookingDetails({ customerId }) {
  // Mock data
  const [bookings, setBookings] = useState([]);
  
  useEffect(() => {
    // Simulate fetching bookings based on customer
    const mockBookings = [
      {
        id: 101,
        type: 'Flight',
        reference: 'FL-87652',
        status: 'Confirmed',
        dates: 'Apr 20 - Apr 27, 2025',
        details: 'NYC to London, Round trip',
        price: '$720'
      },
      {
        id: 102,
        type: 'Hotel',
        reference: 'HT-34521',
        status: 'Confirmed',
        dates: 'Apr 20 - Apr 27, 2025',
        details: 'Grand Plaza Hotel, London',
        price: '$1,250'
      }
    ];
    
    if (customerId === 1) {
      // Add problem booking for John Smith
      mockBookings.push({
        id: 103,
        type: 'Flight',
        reference: 'FL-45398',
        status: 'Cancelled',
        dates: 'May 15, 2025',
        details: 'NYC to Chicago, One way',
        price: '$210'
      });
    }
    
    setBookings(mockBookings);
  }, [customerId]);
  
  return (
    <div className="booking-details">
      <div className="section-header">
        <h2>Bookings</h2>
        <span className="count">{bookings.length}</span>
      </div>
      <div className="bookings-list">
        {bookings.map(booking => (
          <div key={booking.id} className={`booking-card status-${booking.status.toLowerCase()}`}>
            <div className="booking-header">
              <span className="booking-type">{booking.type}</span>
              <span className="booking-reference">{booking.reference}</span>
              <span className={`booking-status status-${booking.status.toLowerCase()}`}>
                {booking.status}
              </span>
            </div>
            <div className="booking-body">
              <p className="booking-dates">{booking.dates}</p>
              <p className="booking-details">{booking.details}</p>
              <p className="booking-price">{booking.price}</p>
            </div>
            <div className="booking-actions">
              <button className="btn-link">View Details</button>
              <button className="btn-link">Modify</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookingDetails;

