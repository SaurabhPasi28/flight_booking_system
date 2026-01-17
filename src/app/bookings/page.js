'use client';

import { useState, useEffect } from 'react';
import { FaDownload, FaTicketAlt, FaPlane, FaFilter, FaClock, FaCalendar, FaUser, FaPhone, FaTimes, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { generatePDF } from '@/lib/pdfGenerator';
import { useApp } from '@/context/AppContext';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const { fetchWalletBalance, user } = useApp();

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bookings?status=${statusFilter}`);
      const data = await response.json();

      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking? A 10% cancellation fee will be charged.')) {
      return;
    }

    setCancellingBooking(bookingId);
    try {
      const response = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Booking cancelled successfully! ₹${data.refundAmount.toFixed(2)} refunded to your wallet.`);
        fetchBookings();
        fetchWalletBalance(user.id);
      } else {
        alert(data.error || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    } finally {
      setCancellingBooking(null);
    }
  };

  const handleDownloadTicket = (booking) => {
    generatePDF({
      passengerName: booking.passenger_name,
      passengerAge: booking.passenger_age,
      passengerGender: booking.passenger_gender,
      passengerType: booking.passenger_type,
      phoneNumber: booking.phone_number,
      classType: booking.class_type,
      airline: booking.airline,
      flightId: booking.flight_id,
      departure: booking.departure_city,
      arrival: booking.arrival_city,
      departureTime: booking.departure_time ? booking.departure_time.slice(0, 5) : null,
      arrivalTime: booking.arrival_time ? booking.arrival_time.slice(0, 5) : null,
      duration: booking.duration_minutes ? `${Math.floor(booking.duration_minutes / 60)}h ${booking.duration_minutes % 60}m` : null,
      flightDate: booking.flight_date,
      finalPrice: booking.final_price,
      bookingDate: booking.booking_date,
      pnr: booking.pnr,
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200', icon: FaClock },
      completed: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200', icon: FaCheckCircle },
      cancelled: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200', icon: FaTimesCircle }
    };
    const badge = badges[status] || badges.upcoming;
    const Icon = badge.icon;
    return (
      <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1`}>
        <Icon className="text-xs" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading bookings...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <FaTicketAlt className="text-3xl text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
              My Bookings
            </h1>
          </div>
          
          {/* Horizontal Tab Filter */}
          <div className="flex gap-2 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 inline-flex">
            {[
              { value: 'all', label: 'All Bookings', icon: FaTicketAlt },
              { value: 'upcoming', label: 'Upcoming', icon: FaClock },
              { value: 'completed', label: 'Completed', icon: FaCheckCircle },
              { value: 'cancelled', label: 'Cancelled', icon: FaTimesCircle }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all
                    ${statusFilter === tab.value
                      ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                      : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon className="text-sm" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center transition-colors border border-gray-200 dark:border-gray-700">
            <FaPlane className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {statusFilter === 'all' ? 'No bookings yet' : `No ${statusFilter} bookings`}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start booking your flights to see them here
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-semibold transition"
            >
              Search Flights
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusBadge(booking.booking_status)}
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-semibold">
                      {booking.flight_id}
                    </span>
                    <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-semibold">
                      {booking.pnr}
                    </span>
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Flight Details */}
                  <div className="lg:col-span-2">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                      {booking.airline}
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      {/* Route Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FaPlane className="text-blue-600 dark:text-blue-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">Route</span>
                        </div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
                          {booking.departure_city} → {booking.arrival_city}
                        </p>
                        {booking.departure_time && booking.arrival_time && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {booking.departure_time.slice(0, 5)} - {booking.arrival_time.slice(0, 5)}
                            {booking.duration_minutes && ` (${Math.floor(booking.duration_minutes / 60)}h ${booking.duration_minutes % 60}m)`}
                          </p>
                        )}
                      </div>

                      {/* Flight Date */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FaCalendar className="text-green-600 dark:text-green-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">Flight Date</span>
                        </div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {new Date(booking.flight_date).toLocaleDateString('en-IN', { 
                            weekday: 'long',
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>

                      {/* Passenger Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FaUser className="text-purple-600 dark:text-purple-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">Passenger</span>
                        </div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {booking.passenger_name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {booking.passenger_age} years • {booking.passenger_gender} • {booking.passenger_type}
                        </p>
                      </div>

                      {/* Contact & Class */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FaPhone className="text-orange-600 dark:text-orange-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">Contact & Class</span>
                        </div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {booking.phone_number}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {booking.class_type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Booked on: {new Date(booking.booking_date).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="flex flex-col justify-between">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Amount Paid</p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        ₹{parseFloat(booking.final_price).toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={() => handleDownloadTicket(booking)}
                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition shadow-lg hover:shadow-xl"
                      >
                        <FaDownload />
                        Download Ticket
                      </button>
                      
                      {booking.booking_status === 'upcoming' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancellingBooking === booking.id}
                          className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
                        >
                          <FaTimes />
                          {cancellingBooking === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
