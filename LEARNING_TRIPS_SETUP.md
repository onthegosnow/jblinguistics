# Learning Trips Admin Setup

## Database Schema

Create this table in your Supabase dashboard:

### Table: `learning_trips`

```sql
CREATE TABLE learning_trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  region TEXT,
  blurb TEXT,
  hero_image TEXT,
  hero_split_left TEXT,
  hero_split_right TEXT,
  hero_split_alt_left TEXT,
  hero_split_alt_right TEXT,
  highlights TEXT[], -- Array of highlight strings
  lengths INTEGER[], -- Array of trip lengths (e.g., [7, 14])
  custom_itinerary JSONB, -- JSON object with day-by-day itinerary
  published BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for slug lookups
CREATE INDEX idx_learning_trips_slug ON learning_trips(slug);

-- Add index for published trips
CREATE INDEX idx_learning_trips_published ON learning_trips(published);

-- Enable Row Level Security (RLS)
ALTER TABLE learning_trips ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to published trips
CREATE POLICY "Public can view published trips"
  ON learning_trips
  FOR SELECT
  USING (published = true);

-- Policy: Allow authenticated users (admins) full access
-- Note: You'll need to adjust this based on your auth setup
CREATE POLICY "Admins have full access"
  ON learning_trips
  FOR ALL
  USING (true);
```

### Custom Itinerary JSON Structure

```json
{
  "1": [
    {
      "title": "Morning Session",
      "lesson": "Introduction to Business English",
      "activity": "Icebreaker activities and city tour"
    }
  ],
  "2": [
    {
      "title": "Corporate Visit",
      "lesson": "Professional communication",
      "activity": "Visit to local company"
    }
  ]
}
```

## Image Storage

Trip images will be stored in the Supabase storage bucket `resumes` under the folder `trip_images/`.

File naming convention:
- `trip_images/{trip-slug}/hero.jpg`
- `trip_images/{trip-slug}/hero-left.jpg`
- `trip_images/{trip-slug}/hero-right.jpg`
- `trip_images/{trip-slug}/gallery/{filename}.jpg`

## Migration

Once the table is created, run the migration endpoint to populate it with existing trips from `src/lib/trips.ts`.

**Endpoint**: `POST /api/admin/trips/migrate`
- Requires admin token header: `x-admin-token`
- Will insert all existing trips into the database

## Next Steps

After creating the table in Supabase:

1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL commands above
3. Verify the table exists in the Table Editor
4. Return to Claude Code to continue with API and UI implementation
