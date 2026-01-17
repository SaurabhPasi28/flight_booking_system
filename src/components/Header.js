'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  FaMoon,
  FaSun,
  FaWallet,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from 'react-icons/fa';
import Link from 'next/link';

export default function Header() {
  const { walletBalance, darkMode, toggleDarkMode, user, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors">
      <div className="container mx-auto px-4 py-4">
        {/* Top row */}
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            href="/"
            onClick={closeMenu}
            className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
          >
            ✈️ FlightBook
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-4">
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
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[150px] truncate">
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

            {/* Dark mode */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <FaSun className="text-yellow-400" />
              ) : (
                <FaMoon className="text-gray-700 dark:text-gray-200" />
              )}
            </button>
          </nav>

          {/* Mobile Icons */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Dark mode */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <FaSun className="text-yellow-400" />
              ) : (
                <FaMoon className="text-gray-700 dark:text-gray-200" />
              )}
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <FaTimes className="text-gray-700 dark:text-gray-200" />
              ) : (
                <FaBars className="text-gray-700 dark:text-gray-200" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div className="fixed top-12 right-0 md:hidden mt-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg transform transition-transform ease-in-out">
            <div className="flex flex-col gap-3">
              {user ? (
                <>
                  {/* Wallet */}
                  <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 px-4 py-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FaWallet className="text-green-600 dark:text-green-400" />
                      <span className="font-semibold text-green-700 dark:text-green-300">
                        Wallet
                      </span>
                    </div>
                    <span className="font-bold text-green-700 dark:text-green-300">
                      ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* User */}
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-3 rounded-lg">
                    <FaUser className="text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                      {user.fullName}
                    </span>
                  </div>

                  {/* Links */}
                  <Link
                    href="/"
                    onClick={closeMenu}
                    className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300 font-medium"
                  >
                    Search Flights
                  </Link>
                  <Link
                    href="/bookings"
                    onClick={closeMenu}
                    className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300 font-medium"
                  >
                    My Bookings
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition font-medium"
                  >
                    <FaSignOutAlt />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300 font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium transition text-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

