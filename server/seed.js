import supabase from './config/supabase.js'

const seed = async () => {
    console.log('🌱 Starting seed...')

    // 1. Clean up
    console.log('Cleaning up old data...')
    await supabase.from('flight_crew').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('passengers').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('flights').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('aircraft').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('airports').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('crew').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('airlines').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // 2. Airlines
    console.log('Inserting Airlines...')
    const { data: airlines, error: airlinesError } = await supabase.from('airlines').insert([
        { name: 'American Airlines', code: 'AA', country: 'USA' },
        { name: 'British Airways', code: 'BA', country: 'United Kingdom' },
        { name: 'Emirates', code: 'EK', country: 'UAE' },
        { name: 'Singapore Airlines', code: 'SQ', country: 'Singapore' },
        { name: 'Air France', code: 'AF', country: 'France' }
    ]).select()

    if (airlinesError) {
        console.error('Error inserting airlines:', airlinesError)
        return
    }
    if (!airlines) {
        console.error('No airlines returned after insert.')
        return
    }

    // 3. Airports
    console.log('Inserting Airports...')
    const { data: airports, error: airportsError } = await supabase.from('airports').insert([
        { name: 'John F. Kennedy International', code: 'JFK', city: 'New York', country: 'USA', timezone: 'America/New_York' },
        { name: 'Los Angeles International', code: 'LAX', city: 'Los Angeles', country: 'USA', timezone: 'America/Los_Angeles' },
        { name: 'Heathrow', code: 'LHR', city: 'London', country: 'UK', timezone: 'Europe/London' },
        { name: 'Dubai International', code: 'DXB', city: 'Dubai', country: 'UAE', timezone: 'Asia/Dubai' },
        { name: 'Changi', code: 'SIN', city: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore' },
        { name: 'Charles de Gaulle', code: 'CDG', city: 'Paris', country: 'France', timezone: 'Europe/Paris' },
        { name: "O'Hare International", code: 'ORD', city: 'Chicago', country: 'USA', timezone: 'America/Chicago' },
        { name: 'Haneda', code: 'HND', city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo' },
        { name: 'Kingsford Smith', code: 'SYD', city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney' },
        { name: 'Amsterdam Schiphol', code: 'AMS', city: 'Amsterdam', country: 'Netherlands', timezone: 'Europe/Amsterdam' }
    ]).select()

    if (airportsError) {
        console.error('Error inserting airports:', airportsError)
        return
    }

    // Helper maps
    const airlineMap = Object.fromEntries(airlines.map(a => [a.code, a.id]))
    const airportMap = Object.fromEntries(airports.map(a => [a.code, a.id]))

    // 4. Aircraft
    console.log('Inserting Aircraft...')
    const aircraftData = []
    const configs = [
        { model: 'Boeing 737-800', eco: 150, bus: 20, first: 10 },
        { model: 'Boeing 777-300', eco: 280, bus: 42, first: 14 }
    ]

    let regCounter = 100
    for (const airline of airlines) {
        for (const config of configs) {
            aircraftData.push({
                airline_id: airline.id,
                model: config.model,
                registration: `N${regCounter++}${airline.code}`,
                total_seats: config.eco + config.bus + config.first,
                economy_seats: config.eco,
                business_seats: config.bus,
                first_class_seats: config.first,
                status: 'active'
            })
        }
    }
    const { data: aircraft } = await supabase.from('aircraft').insert(aircraftData).select()

    // 5. Flights
    console.log('Inserting Flights...')
    const flightsData = []
    const statuses = ['scheduled', 'scheduled', 'scheduled', 'boarding', 'delayed', 'arrived']

    // Create realistic routes
    const routes = [
        { from: 'JFK', to: 'LHR', airline: 'AA', time: 7 },
        { from: 'LHR', to: 'DXB', airline: 'BA', time: 7 },
        { from: 'DXB', to: 'SIN', airline: 'EK', time: 7.5 },
        { from: 'SIN', to: 'SYD', airline: 'SQ', time: 8 },
        { from: 'CDG', to: 'JFK', airline: 'AF', time: 8.5 },
        { from: 'LAX', to: 'HND', airline: 'AA', time: 11 },
        { from: 'AMS', to: 'JFK', airline: 'AA', time: 8 },
        { from: 'ORD', to: 'LHR', airline: 'AA', time: 8 },
        { from: 'JFK', to: 'LAX', airline: 'AA', time: 6 },
        { from: 'HND', to: 'SIN', airline: 'SQ', time: 7 }
    ]

    let flightNum = 100
    const today = new Date()

    for (let i = 0; i < 15; i++) {
        const route = routes[i % routes.length]
        const airlineId = airlineMap[route.airline]
        const plane = aircraft.find(a => a.airline_id === airlineId)

        // Randomize time in next 7 days
        const departure = new Date(today)
        departure.setDate(today.getDate() + Math.floor(Math.random() * 7))
        departure.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60))

        const arrival = new Date(departure)
        arrival.setMinutes(arrival.getMinutes() + (route.time * 60))

        const status = statuses[i % statuses.length]

        flightsData.push({
            flight_number: `${route.airline}${flightNum++}`,
            airline_id: airlineId,
            aircraft_id: plane.id,
            origin_airport_id: airportMap[route.from],
            destination_airport_id: airportMap[route.to],
            departure_time: departure.toISOString(),
            arrival_time: arrival.toISOString(),
            duration_minutes: route.time * 60,
            economy_price: 200 + Math.random() * 500,
            business_price: 1000 + Math.random() * 1000,
            first_class_price: 3000 + Math.random() * 2000,
            status: status,
            gate: `B${Math.floor(Math.random() * 30)}`,
            terminal: `T${Math.floor(Math.random() * 4) + 1}`,
            delay_minutes: status === 'delayed' ? Math.floor(Math.random() * 120) : 0
        })
    }
    const { data: flights } = await supabase.from('flights').insert(flightsData).select()

    // 6. Passengers
    console.log('Inserting Passengers...')
    const passengersData = []
    for (let i = 0; i < 20; i++) {
        passengersData.push({
            first_name: `User${i}`,
            last_name: `Test${i}`,
            email: `user${i}@example.com`,
            phone: `555-01${i.toString().padStart(2, '0')}`,
            passport_number: `A${Math.floor(Math.random() * 10000000)}`,
            nationality: 'USA',
            date_of_birth: '1990-01-01'
        })
    }
    const { data: passengers } = await supabase.from('passengers').insert(passengersData).select()

    // 7. Bookings
    console.log('Inserting Bookings...')
    const bookingsData = []
    const classes = ['economy', 'business', 'first_class']

    for (let i = 0; i < 30; i++) {
        const flight = flights[i % flights.length]
        const passenger = passengers[i % passengers.length]
        const seatClass = classes[Math.floor(Math.random() * 3)]

        bookingsData.push({
            booking_reference: Math.random().toString(36).substring(2, 8).toUpperCase(),
            flight_id: flight.id,
            passenger_id: passenger.id,
            seat_class: seatClass,
            seat_number: `${Math.floor(Math.random() * 30)}A`,
            price: flight[`${seatClass}_price`] || 500,
            status: 'confirmed'
        })
    }
    await supabase.from('bookings').insert(bookingsData)

    // 8. Crew
    console.log('Inserting Crew...')
    const crewData = []
    const roles = ['captain', 'first_officer', 'purser', 'flight_attendant', 'engineer']

    for (const airline of airlines) {
        for (let i = 0; i < 2; i++) { // small batch for demo
            crewData.push({
                airline_id: airline.id,
                first_name: `Crew${i}`,
                last_name: `${airline.code}`,
                role: roles[i % roles.length],
                employee_id: `E${Math.floor(Math.random() * 10000)}${airline.code}`,
                is_available: true
            })
        }
    }
    const { data: crew } = await supabase.from('crew').insert(crewData).select()

    // 9. Assign Crew
    console.log('Assigning Crew...')
    const assignments = []
    flights.forEach(f => {
        // pick 3 crew from same airline
        const airlineCrew = crew.filter(c => c.airline_id === f.airline_id)
        if (airlineCrew.length > 0) {
            assignments.push({
                flight_id: f.id,
                crew_id: airlineCrew[0].id,
                role_on_flight: airlineCrew[0].role
            })
        }
    })
    await supabase.from('flight_crew').insert(assignments)

    console.log('✅ Seeded successfully!')
}

seed().catch(err => console.error(err))
