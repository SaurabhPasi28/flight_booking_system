'use client';

import { useState, useEffect } from 'react';
import { FaSearch, FaPlane, FaSort, FaFilter } from 'react-icons/fa';

export default function SearchFlights({ onSearch }) {
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [sortBy, setSortBy] = useState('price-high');
  const [airline, setAirline] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ departure, arrival, sortBy, airline });
  };


  // console.log(sortBy,"sorting check__>")

  const cities = [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Chennai',
    'Kolkata',
    'Hyderabad',
  ];
  const airlines = [
    "Air India",
    "IndiGo",
    "Vistara",
    "SpiceJet"
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 transition-colors border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-100">
        <FaPlane className="text-blue-600 dark:text-blue-400" />
        Search Flights
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              <FaPlane className="inline mr-1" /> Departure City
            </label>
            <select
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition"
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              <FaPlane className="inline mr-1 transform rotate-45" /> Arrival City
            </label>
            <select
              value={arrival}
              onChange={(e) => setArrival(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition"
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              <FaSort className="inline mr-1" /> Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition"
            >
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="time-early">Departure: Early First</option>
              <option value="time-late">Departure: Late First</option>
              <option value="airline">Airline Name</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              <FaFilter className="inline mr-1" /> Airline
            </label>
            <select
              value={airline}
              onChange={(e) => setAirline(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition"
            >
              <option value="">All Airlines</option>
              {airlines.map((airlineName) => (
                <option key={airlineName} value={airlineName}>
                  {airlineName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition shadow-lg hover:shadow-xl"
        >
          <FaSearch />
          Search Flights
        </button>
      </form>
    </div>
  );
}
