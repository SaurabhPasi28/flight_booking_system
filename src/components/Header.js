'use client';

import { useApp } from '@/context/AppContext';
import { FaMoon, FaSun, FaWallet, FaUser, FaSignOutAlt } from 'react-icons/fa';
import Link from 'next/link';

export default function Header() {
  const { walletBalance, darkMode, toggleDarkMode, user, logout } = useApp();
  console.log(darkMode ,'------------->')

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition">
            ✈️ FlightBook
          </Link>

          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <Link 
                  href="/" 
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium"
                >
                  Search Flights
                </Link>
                <Link 
                  href="/bookings" 
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium"
                >
                  My Bookings
                </Link>
                
                <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 px-4 py-2 rounded-lg shadow-sm">
                  <FaWallet className="text-green-600 dark:text-green-400" />
                  <span className="font-bold text-green-700 dark:text-green-300">
                    ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                  <FaUser className="text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.fullName}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition"
                  title="Logout"
                >
                  <FaSignOutAlt />
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition"
                >
                  Sign Up
                </Link>
              </>
            )}

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-700" />}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
