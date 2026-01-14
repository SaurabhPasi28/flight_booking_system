import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const flightId = searchParams.get('flightId');
    const departureCity = searchParams.get('departure');
    const arrivalCity = searchParams.get('arrival');
    const sortBy = searchParams.get('sortBy') || 'price'; // price, time, airline
    const airline = searchParams.get('airline');

    // If flightId is provided, fetch single flight
    if (flightId) {
      const result = await query(
        'SELECT * FROM flights WHERE flight_id = $1',
        [flightId]
      );
      
      return NextResponse.json({
        success: true,
        flights: result.rows
      });
    }

    let sqlQuery = 'SELECT * FROM flights';
    let params = [];
    let conditions = [];

    if (departureCity) {
      conditions.push('LOWER(departure_city) = LOWER($' + (params.length + 1) + ')');
      params.push(departureCity);
    }

    if (arrivalCity) {
      conditions.push('LOWER(arrival_city) = LOWER($' + (params.length + 1) + ')');
      params.push(arrivalCity);
    }

    if (airline) {
      conditions.push('LOWER(airline) = LOWER($' + (params.length + 1) + ')');
      params.push(airline);
    }

    if (conditions.length > 0) {
      sqlQuery += ' WHERE ' + conditions.join(' AND ');
    }

    // Add sorting
    switch (sortBy) {
      case 'price-low':
        sqlQuery += ' ORDER BY base_price ASC';
        break;
      case 'price-high':
        sqlQuery += ' ORDER BY base_price DESC';
        break;
      case 'time-early':
        sqlQuery += ' ORDER BY departure_time ASC';
        break;
      case 'time-late':
        sqlQuery += ' ORDER BY departure_time DESC';
        break;
      case 'airline':
        sqlQuery += ' ORDER BY airline ASC';
        break;
      default:
        sqlQuery += ' ORDER BY base_price ASC';
    }

    sqlQuery += ' LIMIT 10';

    const result = await query(sqlQuery, params);

    // Get unique airlines for filter
    const airlinesResult = await query('SELECT DISTINCT airline FROM flights ORDER BY airline');
    const airlines = airlinesResult.rows.map(row => row.airline);

    return NextResponse.json({
      success: true,
      flights: result.rows,
      count: result.rows.length,
      airlines: airlines
    });
  } catch (error) {
    console.error('Error fetching flights:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch flights' },
      { status: 500 }
    );
  }
}
