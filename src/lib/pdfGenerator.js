import { jsPDF } from 'jspdf';

export function generatePDF(bookingData) {
  const {
    passengerName,
    passengerAge,
    passengerGender,
    passengerType,
    phoneNumber,
    classType,
    airline,
    flightId,
    departure,
    arrival,
    departureTime,
    arrivalTime,
    duration,
    flightDate,
    finalPrice,
    bookingDate,
    pnr,
  } = bookingData;

  const doc = new jsPDF();

  // Set colors
  const primaryColor = [41, 98, 255]; // Blue
  const textColor = [33, 33, 33];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('✈ Flight Ticket', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text('FlightBook - XTechon', 105, 30, { align: 'center' });

  // Reset text color
  doc.setTextColor(...textColor);

  // PNR Box
  doc.setFillColor(240, 240, 240);
  doc.rect(15, 50, 180, 20, 'F');
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text(`PNR: ${pnr}`, 105, 63, { align: 'center' });
  doc.setFont(undefined, 'normal');

  // Passenger Details
  let yPos = 85;
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Passenger Details', 15, yPos);
  doc.setFont(undefined, 'normal');
  
  yPos += 10;
  doc.setFontSize(12);
  doc.text('Name:', 15, yPos);
  doc.text(passengerName, 60, yPos);
  
  if (passengerAge) {
    yPos += 8;
    doc.text('Age:', 15, yPos);
    doc.text(`${passengerAge} years`, 60, yPos);
  }
  
  if (passengerGender) {
    yPos += 8;
    doc.text('Gender:', 15, yPos);
    doc.text(passengerGender.charAt(0).toUpperCase() + passengerGender.slice(1), 60, yPos);
  }
  
  if (phoneNumber) {
    yPos += 8;
    doc.text('Contact:', 15, yPos);
    doc.text(phoneNumber, 60, yPos);
  }

  // Flight Details
  yPos += 20;
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Flight Details', 15, yPos);
  doc.setFont(undefined, 'normal');
  
  yPos += 10;
  doc.setFontSize(12);
  doc.text('Airline:', 15, yPos);
  doc.text(airline, 60, yPos);
  
  yPos += 8;
  doc.text('Flight ID:', 15, yPos);
  doc.text(flightId, 60, yPos);
  
  if (classType) {
    yPos += 8;
    doc.text('Class:', 15, yPos);
    doc.text(classType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()), 60, yPos);
  }
  
  if (flightDate) {
    yPos += 8;
    doc.text('Travel Date:', 15, yPos);
    doc.text(new Date(flightDate).toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }), 60, yPos);
  }

  // Route
  yPos += 15;
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Route', 15, yPos);
  doc.setFont(undefined, 'normal');
  
  yPos += 10;
  doc.setFontSize(12);
  doc.text('From:', 15, yPos);
  doc.text(departure, 60, yPos);
  
  if (departureTime) {
    yPos += 8;
    doc.text('Departure Time:', 15, yPos);
    doc.text(departureTime, 60, yPos);
  }
  
  yPos += 8;
  doc.text('To:', 15, yPos);
  doc.text(arrival, 60, yPos);
  
  if (arrivalTime) {
    yPos += 8;
    doc.text('Arrival Time:', 15, yPos);
    doc.text(arrivalTime, 60, yPos);
  }
  
  if (duration) {
    yPos += 8;
    doc.text('Duration:', 15, yPos);
    doc.text(duration, 60, yPos);
  }

  // Price
  yPos += 15;
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Payment Details', 15, yPos);
  doc.setFont(undefined, 'normal');
  
  yPos += 10;
  doc.setFontSize(12);
  doc.text('Amount Paid:', 15, yPos);
  doc.setTextColor(0, 128, 0);
  doc.setFont(undefined, 'bold');
  doc.text(`₹${parseFloat(finalPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 60, yPos);
  doc.setTextColor(...textColor);
  doc.setFont(undefined, 'normal');

  // Booking Date
  yPos += 15;
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Booking Information', 15, yPos);
  doc.setFont(undefined, 'normal');
  
  yPos += 10;
  doc.setFontSize(12);
  doc.text('Booking Date:', 15, yPos);
  doc.text(new Date(bookingDate).toLocaleString('en-IN'), 60, yPos);

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text('This is a computer-generated ticket and does not require a signature.', 105, 270, { align: 'center' });
  doc.text('Thank you for choosing FlightBook!', 105, 280, { align: 'center' });

  // Save PDF
  doc.save(`ticket_${pnr}.pdf`);
}
