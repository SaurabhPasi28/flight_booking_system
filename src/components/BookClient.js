'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { FaPlane, FaClock, FaCalendar, FaSuitcase, FaUser, FaPhone, FaIdCard, FaCheckCircle, FaExclamationTriangle, FaFire, FaMoneyBillWave } from 'react-icons/fa';
import { generatePDF } from '@/lib/pdfGenerator';

export default function BookClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, walletBalance, fetchWalletBalance, sessionId } = useApp();
  
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [surgeData, setSurgeData] = useState(null);
  const [formData, setFormData] = useState({
    passengerName: '',
    passengerAge: '',
    passengerGender: 'male',
    passengerType: 'adult',
    documentNumber: '',
    phoneNumber: '',
    classType: 'economy',
    flightDate: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  const classMultiplier = {
    economy: 1,
    'premium-economy': 1.3,
    business: 2,
    'first-class': 3
  };

  useEffect(() => {
    if (!user) {
      // router.push('/login');
      return;
    }
    
    const flightId = searchParams.get('flightId');
    if (flightId) {
      // First fetch flight details, then record attempt and fetch surge price
      fetchFlightDetails(flightId);
      // Wait a bit to ensure page is ready, then record attempt and fetch surge
      recordBookingAttemptAndUpdatePrice(flightId);
    } else {
      router.push('/');
    }
  }, [user, searchParams]);

  const recordBookingAttemptAndUpdatePrice = async (flightId) => {
    try {
      // Ensure we have a sessionId before recording
      const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      
      console.log('📝 Recording attempt with sessionId:', currentSessionId);
      
      // Record the attempt first
      const attemptResponse = await fetch('/api/bookings/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightId, sessionId: currentSessionId })
      });
      
      const attemptData = await attemptResponse.json();
      console.log('✅ Attempt response:', attemptData);
      
      if (attemptResponse.ok) {
        // Wait a moment for DB to commit, then fetch surge price
        setTimeout(() => {
          fetchSurgePrice(flightId);
        }, 100);
      }
    } catch (error) {
      console.error('Error recording attempt:', error);
      // Still fetch surge price even if recording fails
      fetchSurgePrice(flightId);
    }
  };

  const fetchFlightDetails = async (flightId) => {
    try {
      const response = await fetch(`/api/flights?flightId=${flightId}`);
      const data = await response.json();
      if (data.success && data.flights.length > 0) {
        setFlight(data.flights[0]);
      }
    } catch (error) {
      console.error('Error fetching flight:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSurgePrice = async (flightId) => {
    try {
      console.log('🔄 Fetching surge price for flight:', flightId);
      const response = await fetch(`/api/bookings/surge?flightId=${flightId}`);
      const data = await response.json();
      if (data.success) {
        console.log('✅ Surge data received:', data);
        setSurgeData(data);
      } else {
        console.error('❌ Surge fetch failed:', data.error);
      }
    } catch (error) {
      console.error('Error fetching surge price:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.passengerName.trim()) newErrors.passengerName = 'Name is required';
    if (!formData.passengerAge || formData.passengerAge < 1 || formData.passengerAge > 120) {
      newErrors.passengerAge = 'Valid age is required (1-120)';
    }
    if (!formData.phoneNumber.trim() || !/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Valid 10-digit phone number is required';
    }
    if (!formData.flightDate) {
      newErrors.flightDate = 'Flight date is required';
    } else {
      const selectedDate = new Date(formData.flightDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.flightDate = 'Flight date cannot be in the past';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateFinalPrice = () => {
    if (!flight || !surgeData) return 0;
    const basePrice = parseFloat(flight.base_price);
    const classPrice = basePrice * classMultiplier[formData.classType];
    const childDiscount = formData.passengerType === 'child' ? 0.75 : 1;
    return (classPrice * childDiscount * (surgeData.surgeApplied ? (surgeData.finalPrice / surgeData.basePrice) : 1)).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const finalPrice = calculateFinalPrice();
    if (walletBalance < finalPrice) {
      setErrors({ submit: 'Insufficient wallet balance' });
      return;
    }
    
    setSubmitting(true);
    setErrors({});
    
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flightId: flight.flight_id,
          ...formData,
          sessionId,
          finalPrice
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBookingSuccess(true);
        setBookingData(data);
        await fetchWalletBalance(user.id);
        
        // Generate PDF
        setTimeout(() => {
          generatePDF({
            passengerName: formData.passengerName,
            passengerAge: formData.passengerAge,
            passengerGender: formData.passengerGender,
            passengerType: formData.passengerType,
            phoneNumber: formData.phoneNumber,
            classType: formData.classType,
            airline: data.flight.airline,
            flightId: data.flight.flight_id,
            departure: data.flight.departure_city,
            arrival: data.flight.arrival_city,
            departureTime: data.flight.departure_time?.slice(0, 5),
            arrivalTime: data.flight.arrival_time?.slice(0, 5),
            duration: data.flight.duration_minutes ? `${Math.floor(data.flight.duration_minutes / 60)}h ${data.flight.duration_minutes % 60}m` : null,
            flightDate: formData.flightDate,
            finalPrice: data.booking.final_price,
            bookingDate: data.booking.booking_date,
            pnr: data.booking.pnr
          });
        }, 1000);
      } else {
        setErrors({ submit: data.error || 'Booking failed' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
      console.error('Booking error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading flight details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Flight not found</h2>
            <Link
              href="/"
              className="mt-4 inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              Back to Search
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
            <FaCheckCircle className="text-7xl text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Booking Confirmed!
            </h2>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-6 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">PNR Number</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                {bookingData?.booking.pnr}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Amount Paid</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ₹{parseFloat(bookingData?.booking.final_price).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="space-y-3">
              <Link
                href="/bookings"
                className="block w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-semibold transition"
              >
                View My Bookings
              </Link>
              <Link
                href="/"
                className="block w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-semibold transition"
              >
                Book Another Flight
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const finalPrice = calculateFinalPrice();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-8">
          Complete Your Booking
        </h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Flight Details - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Flight Information Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                <FaPlane className="text-blue-600 dark:text-blue-400" />
                Flight Details
              </h2>
              
              {surgeData?.surgeApplied && (
                <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg flex items-center gap-2">
                  <FaFire className="text-orange-500 text-xl" />
                  <div>
                    <p className="font-medium text-orange-700 dark:text-orange-300">High Demand Alert!</p>
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      Price increased by {((surgeData.finalPrice - surgeData.basePrice) / surgeData.basePrice * 100).toFixed(0)}% due to high demand
                    </p>
                  </div>
                </div>
              )}
              
              {surgeData && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Your Attempts:</strong> {surgeData.attemptCount} visit{surgeData.attemptCount !== 1 ? 's' : ''} in last 5 minutes
                    {surgeData.attemptCount >= 3 && <span className="ml-2">(Surge pricing active)</span>}
                  </p>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Flight Number</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{flight.flight_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Airline</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{flight.airline}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 py-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Departure</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{flight.departure_city}</p>
                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-1">
                      <FaClock className="text-sm" />
                      {flight.departure_time?.slice(0, 5)}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-full h-0.5 bg-gray-300 dark:bg-gray-600 relative mb-2">
                      <FaPlane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600 dark:text-blue-400 text-xl" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {flight.duration_minutes ? `${Math.floor(flight.duration_minutes / 60)}h ${flight.duration_minutes % 60}m` : 'N/A'}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Arrival</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{flight.arrival_city}</p>
                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-end gap-1 mt-1">
                      <FaClock className="text-sm" />
                      {flight.arrival_time?.slice(0, 5)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Baggage & Rules Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                <FaSuitcase className="text-blue-600 dark:text-blue-400" />
                Baggage Allowance & Rules
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">Check-in Baggage</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Economy:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">15 kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Premium Economy:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">20 kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Business:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">30 kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">First Class:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">40 kg</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">Cabin Baggage</h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>• 7 kg (All classes)</p>
                    <p>• Max dimensions: 55x40x20 cm</p>
                    <p>• One laptop bag allowed</p>
                    <p>• Liquids: Max 100ml per item</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Important Rules</h3>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Report 2 hours before departure for domestic flights</li>
                  <li>• Valid photo ID required for all passengers</li>
                  <li>• Children above 2 years require separate seat</li>
                  <li>• Infants (0-2 years) travel at 10% of adult fare</li>
                </ul>
              </div>
            </div>
            
            {/* Passenger Details Form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                <FaUser className="text-blue-600 dark:text-blue-400" />
                Passenger Details
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="passengerName"
                      value={formData.passengerName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border ${errors.passengerName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition`}
                      placeholder="Enter full name as per ID"
                    />
                    {errors.passengerName && <p className="text-red-500 text-xs mt-1">{errors.passengerName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Age *
                    </label>
                    <input
                      type="number"
                      name="passengerAge"
                      value={formData.passengerAge}
                      onChange={handleInputChange}
                      min="1"
                      max="120"
                      className={`w-full px-4 py-3 rounded-lg border ${errors.passengerAge ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition`}
                      placeholder="Enter age"
                    />
                    {errors.passengerAge && <p className="text-red-500 text-xs mt-1">{errors.passengerAge}</p>}
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gender *
                    </label>
                    <select
                      name="passengerGender"
                      value={formData.passengerGender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Passenger Type *
                    </label>
                    <select
                      name="passengerType"
                      value={formData.passengerType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition"
                    >
                      <option value="adult">Adult (12+ years)</option>
                      <option value="child">Child (2-12 years) - 25% off</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition`}
                      placeholder="10-digit mobile number"
                      maxLength="10"
                    />
                    {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Document Number (Optional)
                    </label>
                    <input
                      type="text"
                      name="documentNumber"
                      value={formData.documentNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition"
                      placeholder="Passport/Aadhar number"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Travel Class *
                    </label>
                    <select
                      name="classType"
                      value={formData.classType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition"
                    >
                      <option value="economy">Economy</option>
                      <option value="premium-economy">Premium Economy (+30%)</option>
                      <option value="business">Business Class (+100%)</option>
                      <option value="first-class">First Class (+200%)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Flight Date *
                    </label>
                    <input
                      type="date"
                      name="flightDate"
                      value={formData.flightDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-3 rounded-lg border ${errors.flightDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition`}
                    />
                    {errors.flightDate && <p className="text-red-500 text-xs mt-1">{errors.flightDate}</p>}
                  </div>
                </div>
                
                {errors.submit && (
                  <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 rounded-lg text-red-700 dark:text-red-200 text-sm">
                    {errors.submit}
                  </div>
                )}
              </form>
            </div>
          </div>
          
          {/* Price Summary - Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                <FaMoneyBillWave className="text-green-600 dark:text-green-400" />
                Price Summary
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Base Fare</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    ₹{parseFloat(flight.base_price).toLocaleString('en-IN')}
                  </span>
                </div>
                
                {formData.classType !== 'economy' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Class Upgrade</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      +₹{((parseFloat(flight.base_price) * classMultiplier[formData.classType]) - parseFloat(flight.base_price)).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                
                {formData.passengerType === 'child' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Child Discount</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      -25%
                    </span>
                  </div>
                )}
                
                {surgeData?.surgeApplied && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Surge Pricing</span>
                    <span className="font-semibold text-orange-600 dark:text-orange-400">
                      +{((surgeData.finalPrice - surgeData.basePrice) / surgeData.basePrice * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-800 dark:text-gray-200">Total Amount</span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ₹{parseFloat(finalPrice).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Wallet Balance</p>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                {walletBalance < finalPrice && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    Insufficient balance. Please add funds.
                  </p>
                )}
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={submitting || walletBalance < finalPrice}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Processing...' : 'Confirm Booking'}
              </button>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                By booking, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
