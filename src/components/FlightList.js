'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlane, FaClock, FaFire } from 'react-icons/fa';

export default function FlightList({ flights, loading }) {
  const router = useRouter();

 
  return (
    <>
      <div className="space-y-4">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Available Flights ({flights.length})
        </h3>
        {flights.map((flight) => {
          const surgeData = surgePrices[flight.flight_id];
          const hasSurge = surgeData && surgeData.surgeApplied;
          const displayPrice = surgeData?.finalPrice || flight.base_price;
          
          return (
            <div
              key={flight.flight_id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all border border-gray-200 dark:border-gray-700"
            >
              {hasSurge && (
                <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg flex items-center gap-2">
                  <FaFire className="text-orange-500" />
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    High Demand! Price increased by {((surgeData.finalPrice - flight.base_price) / flight.base_price * 100).toFixed(0)}%
                  </span>
                </div>
              )}

              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-bold">
                      {flight.flight_id}
                    </span>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                      {flight.airline}
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Departure</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{flight.departure_city}</p>
                      <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <FaClock className="text-sm" />
                        {formatTime(flight.departure_time)}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-full h-0.5 bg-gray-300 dark:bg-gray-600 relative mb-2">
                        <FaPlane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600 dark:text-blue-400 text-xl" />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDuration(flight.duration_minutes)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Arrival</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{flight.arrival_city}</p>
                      <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <FaClock className="text-sm" />
                        {formatTime(flight.arrival_time)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right ml-8">
                  <div>
                    {hasSurge && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-through mb-1">
                        ₹{parseFloat(flight.base_price).toLocaleString('en-IN')}
                      </p>
                    )}
                    <p className={`text-3xl font-bold ${hasSurge ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
                      ₹{parseFloat(displayPrice).toLocaleString('en-IN')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {hasSurge ? 'Current Price' : 'Base Price'}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(``)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white rounded-lg font-bold transition shadow-lg hover:shadow-xl"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
