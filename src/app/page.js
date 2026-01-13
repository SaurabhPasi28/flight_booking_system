'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SearchFlights from '@/components/SearchFlights';
import FlightList from '@/components/FlightList';

export default function Home() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFlights({});
  }, []);

  const fetchFlights = async (searchParams) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (searchParams.departure) params.append('departure', searchParams.departure);
      if (searchParams.arrival) params.append('arrival', searchParams.arrival);
      if (searchParams.sortBy) params.append('sortBy', searchParams.sortBy);
      if (searchParams.airline) params.append('airline', searchParams.airline);

      // console.log(params.toString(),"______>")

      const response = await fetch(`/api/flights?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setFlights(data.flights);
      }
    } catch (error) {
      console.error('Error fetching flights:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <SearchFlights onSearch={fetchFlights} />
        <FlightList flights={flights} loading={loading} />
      </main>
    </div>
  );
}
