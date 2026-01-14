'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { FaTimes, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { generatePDF } from '@/lib/pdfGenerator';

export default function BookingModal({ flight, onClose }) {
  const { sessionId, walletBalance, fetchWalletBalance } = useApp();
  const [passengerName, setPassengerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flightId: flight.flight_id,
          passengerName,
          sessionId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setBookingData(data);
        await fetchWalletBalance();
        
        // Generate and download PDF
        setTimeout(() => {
          generatePDF({
            passengerName,
            airline: data.flight.airline,
            flightId: data.flight.flight_id,
            departure: data.flight.departure_city,
            arrival: data.flight.arrival_city,
            departureTime: data.flight.departure_time ? data.flight.departure_time.slice(0, 5) : null,
            arrivalTime: data.flight.arrival_time ? data.flight.arrival_time.slice(0, 5) : null,
            duration: data.flight.duration_minutes ? `${Math.floor(data.flight.duration_minutes / 60)}h ${data.flight.duration_minutes % 60}m` : null,
            finalPrice: data.booking.final_price,
            bookingDate: data.booking.booking_date,
            pnr: data.booking.pnr,
          });
        }, 1000);
      } else {
        setError(data.error || 'Booking failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (bookingData) {
      generatePDF({
        passengerName,
        airline: bookingData.flight.airline,
        flightId: bookingData.flight.flight_id,
        departure: bookingData.flight.departure_city,
        arrival: bookingData.flight.arrival_city,
        departureTime: bookingData.flight.departure_time ? bookingData.flight.departure_time.slice(0, 5) : null,
        arrivalTime: bookingData.flight.arrival_time ? bookingData.flight.arrival_time.slice(0, 5) : null,
        duration: bookingData.flight.duration_minutes ? `${Math.floor(bookingData.flight.duration_minutes / 60)}h ${bookingData.flight.duration_minutes % 60}m` : null,
        finalPrice: bookingData.booking.final_price,
        bookingDate: bookingData.booking.booking_date,
        pnr: bookingData.booking.pnr,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transition-colors">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {success ? 'Booking Confirmed!' : 'Book Flight'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            >
              <FaTimes className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {success ? (
            <div className="text-center">
              <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                Booking Successful!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                PNR: <span className="font-bold">{bookingData?.booking.pnr}</span>
              </p>
              
              {bookingData?.pricing.surgeApplied && (
                <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg mb-4">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    <FaExclamationTriangle className="inline mr-2" />
                    Surge pricing applied: {bookingData.pricing.attemptCount} attempts
                  </p>
                </div>
              )}

              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Amount Paid: <span className="font-bold text-green-600 dark:text-green-400">
                    ₹{parseFloat(bookingData?.booking.final_price).toLocaleString('en-IN')}
                  </span>
                </p>
              </div>

              <button
                onClick={handleDownloadPDF}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-semibold mb-3 transition"
              >
                Download Ticket PDF
              </button>
              
              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-semibold transition"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-200">
                  {flight.airline}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {flight.departure_city} → {flight.arrival_city}
                </p>
                
                {flight.departure_time && flight.arrival_time && (
                  <div className="flex items-center gap-4 mb-2 text-sm text-gray-700 dark:text-gray-300">
                    <span>🕐 Departure: <strong>{flight.departure_time.slice(0, 5)}</strong></span>
                    <span>→</span>
                    <span>🕐 Arrival: <strong>{flight.arrival_time.slice(0, 5)}</strong></span>
                  </div>
                )}
                
                {flight.duration_minutes && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Duration: {Math.floor(flight.duration_minutes / 60)}h {flight.duration_minutes % 60}m
                  </p>
                )}
                
                <p className="text-gray-600 dark:text-gray-400">
                  Flight: {flight.flight_id}
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                  ₹{parseFloat(flight.base_price).toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  * Final price may vary due to surge pricing
                </p>
              </div>

              {error && (
                <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Passenger Name *
                  </label>
                  <input
                    type="text"
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition"
                    placeholder="Enter passenger name"
                  />
                </div>

                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-6">
                  <p className="text-gray-700 dark:text-gray-300">
                    Wallet Balance: <span className="font-bold">
                      ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? 'Processing...' : 'Confirm Booking'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
