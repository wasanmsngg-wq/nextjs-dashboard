CREATE TABLE IF NOT EXISTS hospital (
  hospital_id BIGSERIAL PRIMARY KEY,
  hospital_name VARCHAR(255) NOT NULL,
  hospital_type VARCHAR(50) NOT NULL
    CHECK (hospital_type IN ('General', 'Teaching', 'Specialty', 'Community', 'Children', 'Rehabilitation')),
  ownership_type VARCHAR(50) NOT NULL
    CHECK (ownership_type IN ('Government', 'Private', 'Non-Profit', 'University')),
  address_line VARCHAR(255) NOT NULL,
  city VARCHAR(120) NOT NULL,
  state_province VARCHAR(120) NOT NULL,
  postal_code VARCHAR(30) NOT NULL,
  country VARCHAR(120) NOT NULL DEFAULT 'Thailand',
  phone_number VARCHAR(50),
  email VARCHAR(255) UNIQUE,
  website VARCHAR(255),
  bed_capacity INTEGER NOT NULL CHECK (bed_capacity > 0),
  emergency_service BOOLEAN NOT NULL DEFAULT TRUE,
  ambulance_service BOOLEAN NOT NULL DEFAULT TRUE,
  established_year INTEGER CHECK (
    established_year >= 1800
    AND established_year <= EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
  ),
  accreditation_status VARCHAR(50) NOT NULL
    CHECK (accreditation_status IN ('Accredited', 'Pending', 'Not Accredited')),
  rating NUMERIC(2, 1) CHECK (rating >= 0 AND rating <= 5),
  latitude NUMERIC(9, 6) CHECK (latitude >= -90 AND latitude <= 90),
  longitude NUMERIC(9, 6) CHECK (longitude >= -180 AND longitude <= 180),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS hospital_name_trgm_idx ON hospital USING GIN (hospital_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS hospital_city_trgm_idx ON hospital USING GIN (city gin_trgm_ops);
CREATE INDEX IF NOT EXISTS hospital_state_trgm_idx ON hospital USING GIN (state_province gin_trgm_ops);
CREATE INDEX IF NOT EXISTS hospital_country_trgm_idx ON hospital USING GIN (country gin_trgm_ops);
CREATE INDEX IF NOT EXISTS hospital_type_idx ON hospital (hospital_type);
CREATE INDEX IF NOT EXISTS hospital_ownership_idx ON hospital (ownership_type);

INSERT INTO hospital (
  hospital_name, hospital_type, ownership_type, address_line, city,
  state_province, postal_code, country, phone_number, email, website,
  bed_capacity, emergency_service, ambulance_service, established_year,
  accreditation_status, rating, latitude, longitude
)
SELECT
  'Load Test Hospital ' || LPAD(series_id::TEXT, 5, '0'),
  (ARRAY['General', 'Teaching', 'Specialty', 'Community', 'Children', 'Rehabilitation'])[1 + ((series_id - 1) % 6)],
  (ARRAY['Government', 'Private', 'Non-Profit', 'University'])[1 + ((series_id - 1) % 4)],
  (10 + series_id) || ' Performance Test Road',
  (ARRAY['Bangkok', 'Chiang Mai', 'Phuket', 'Khon Kaen', 'Hat Yai', 'Pattaya', 'Udon Thani', 'Nakhon Ratchasima', 'Surat Thani', 'Hua Hin'])[1 + ((series_id - 1) % 10)],
  (ARRAY['Bangkok', 'Chiang Mai', 'Phuket', 'Khon Kaen', 'Songkhla', 'Chonburi', 'Udon Thani', 'Nakhon Ratchasima', 'Surat Thani', 'Prachuap Khiri Khan'])[1 + ((series_id - 1) % 10)],
  LPAD((10000 + (series_id % 89999))::TEXT, 5, '0'),
  'Thailand',
  '+66-2-' || LPAD(series_id::TEXT, 7, '0'),
  'load-test-hospital-' || series_id || '@example.test',
  'https://hospital-' || series_id || '.example.test',
  25 + ((series_id * 17) % 975),
  series_id % 5 <> 0,
  series_id % 4 <> 0,
  1850 + (series_id % 176),
  (ARRAY['Accredited', 'Accredited', 'Pending', 'Not Accredited'])[1 + ((series_id - 1) % 4)],
  ROUND((3 + ((series_id % 21) / 10.0))::NUMERIC, 1),
  ROUND((5.5 + ((series_id % 1500) / 100.0))::NUMERIC, 6),
  ROUND((97.3 + ((series_id % 800) / 100.0))::NUMERIC, 6)
FROM generate_series(1, 12000) AS generated(series_id)
ON CONFLICT (email) DO NOTHING;

ANALYZE hospital;

-- Minimal dashboard fixtures keep the rest of the starter app usable when the
-- load-test environment replaces its hosted PostgreSQL connection.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  image_url VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id),
  amount INTEGER NOT NULL,
  status VARCHAR(255) NOT NULL,
  date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS revenue (
  month VARCHAR(4) NOT NULL UNIQUE,
  revenue INTEGER NOT NULL
);

INSERT INTO customers (id, name, email, image_url)
VALUES (
  '410544b2-4001-4271-9855-fec4b6a6442a',
  'Local Load Test User',
  'load-test@example.test',
  '/customers/evil-rabbit.png'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO invoices (id, customer_id, amount, status, date)
VALUES
  (
    '3958dc9e-712f-4377-85e9-fec4b6a6442a',
    '410544b2-4001-4271-9855-fec4b6a6442a',
    15000,
    'paid',
    CURRENT_DATE
  ),
  (
    '3958dc9e-742f-4377-85e9-fec4b6a6442a',
    '410544b2-4001-4271-9855-fec4b6a6442a',
    8500,
    'pending',
    CURRENT_DATE - 1
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO revenue (month, revenue)
VALUES
  ('Jan', 2000), ('Feb', 2500), ('Mar', 3000), ('Apr', 2800),
  ('May', 3600), ('Jun', 3900), ('Jul', 4200), ('Aug', 4000),
  ('Sep', 4600), ('Oct', 5000), ('Nov', 5300), ('Dec', 5800)
ON CONFLICT (month) DO NOTHING;
