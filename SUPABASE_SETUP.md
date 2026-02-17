# SUPABASE SETUP

## Step 1: Create Project
1.  Go to [Supabase Dashboard](https://supabase.com/dashboard)
2.  Click "New Project"
3.  Enter name: `airline-management`
4.  Enter secure password
5.  Select region closest to you
6.  Click "Create new project"
7.  Wait for database to finish provisioning

## Step 2: Get API Keys
1.  Go to Project Settings (gear icon) -> API
2.  Copy `Project URL` -> set as `SUPABASE_URL` in `.env`
3.  Copy `anon` `public` key -> set as `SUPABASE_ANON_KEY` in `.env`

## Step 3: Run SQL Schema
1.  Go to SQL Editor (icon on left sidebar with `>_` symbol)
2.  Click "New query"
3.  Paste the following SQL exactly and click "Run":

```sql
-- AIRLINES
create table airlines (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  code text not null unique,        -- e.g. "AA", "UA", "DL"
  logo text,                        -- image URL
  country text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- AIRPORTS
create table airports (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  code text not null unique,        -- IATA code e.g. "JFK", "LAX"
  city text not null,
  country text not null,
  timezone text not null,           -- e.g. "America/New_York"
  created_at timestamptz default now()
);

-- AIRCRAFT
create table aircraft (
  id uuid default gen_random_uuid() primary key,
  airline_id uuid references airlines(id) on delete cascade,
  model text not null,              -- e.g. "Boeing 737-800"
  registration text not null unique, -- e.g. "N12345"
  total_seats integer not null,
  economy_seats integer not null,
  business_seats integer not null,
  first_class_seats integer not null,
  status text default 'active'
    check (status in ('active','maintenance','retired')),
  created_at timestamptz default now()
);

-- FLIGHTS
create table flights (
  id uuid default gen_random_uuid() primary key,
  flight_number text not null unique,  -- e.g. "AA101"
  airline_id uuid references airlines(id),
  aircraft_id uuid references aircraft(id),
  origin_airport_id uuid references airports(id),
  destination_airport_id uuid references airports(id),
  departure_time timestamptz not null,
  arrival_time timestamptz not null,
  duration_minutes integer not null,
  economy_price numeric(10,2) not null,
  business_price numeric(10,2) not null,
  first_class_price numeric(10,2) not null,
  status text default 'scheduled'
    check (status in (
      'scheduled','boarding','departed',
      'arrived','delayed','cancelled'
    )),
  gate text,
  terminal text,
  delay_minutes integer default 0,
  created_at timestamptz default now()
);

-- PASSENGERS
create table passengers (
  id uuid default gen_random_uuid() primary key,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  passport_number text,
  nationality text,
  date_of_birth date,
  created_at timestamptz default now()
);

-- BOOKINGS
create table bookings (
  id uuid default gen_random_uuid() primary key,
  booking_reference text not null unique, -- e.g. "ABC123" 6 char uppercase
  flight_id uuid references flights(id),
  passenger_id uuid references passengers(id),
  seat_class text not null
    check (seat_class in ('economy','business','first_class')),
  seat_number text,                 -- e.g. "14A"
  price numeric(10,2) not null,
  status text default 'confirmed'
    check (status in (
      'confirmed','cancelled','checked_in','boarded','no_show'
    )),
  payment_status text default 'paid'
    check (payment_status in ('paid','refunded','pending')),
  special_requests text,
  booked_at timestamptz default now()
);

-- CREW
create table crew (
  id uuid default gen_random_uuid() primary key,
  airline_id uuid references airlines(id),
  first_name text not null,
  last_name text not null,
  role text not null
    check (role in (
      'captain','first_officer','purser',
      'flight_attendant','engineer'
    )),
  employee_id text not null unique,
  license_number text,
  is_available boolean default true,
  created_at timestamptz default now()
);

-- FLIGHT CREW ASSIGNMENTS
create table flight_crew (
  id uuid default gen_random_uuid() primary key,
  flight_id uuid references flights(id) on delete cascade,
  crew_id uuid references crew(id),
  role_on_flight text not null,
  created_at timestamptz default now(),
  unique(flight_id, crew_id)
);

-- ROW LEVEL SECURITY (allow all, no auth)
alter table airlines enable row level security;
alter table airports enable row level security;
alter table aircraft enable row level security;
alter table flights enable row level security;
alter table passengers enable row level security;
alter table bookings enable row level security;
alter table crew enable row level security;
alter table flight_crew enable row level security;

create policy "Allow all" on airlines for all using (true);
create policy "Allow all" on airports for all using (true);
create policy "Allow all" on aircraft for all using (true);
create policy "Allow all" on flights for all using (true);
create policy "Allow all" on passengers for all using (true);
create policy "Allow all" on bookings for all using (true);
create policy "Allow all" on crew for all using (true);
create policy "Allow all" on flight_crew for all using (true);
```
