'use client';

import { useState, useEffect } from 'react';
import { FaDownload, FaTicketAlt, FaPlane, FaFilter, FaClock, FaCalendar, FaUser, FaPhone, FaTimes, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function BookingsPage() {
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  };



  

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
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
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FaTicketAlt className="text-3xl text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
              My Bookings
            </h1>
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
            >
              <option value="all">All Bookings</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
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
