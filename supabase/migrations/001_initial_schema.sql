-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Enums
CREATE TYPE user_role AS ENUM ('USER', 'PROVIDER', 'ADMIN');
CREATE TYPE service_status AS ENUM ('PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'REFUNDED');
CREATE TYPE review_type AS ENUM ('TO_PROVIDER', 'TO_USER');
CREATE TYPE notification_type AS ENUM (
  'NEW_REQUEST', 'REQUEST_ACCEPTED', 'PROVIDER_EN_ROUTE',
  'SERVICE_COMPLETED', 'NEW_REVIEW', 'PAYMENT_RECEIVED'
);

-- Users table (mirrors Supabase Auth)
CREATE TABLE users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        user_role NOT NULL DEFAULT 'USER',
  avatar_url  TEXT,
  latitude    DOUBLE PRECISION,
  longitude   DOUBLE PRECISION,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  icon        TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#6366F1',
  description TEXT
);

-- Provider profiles
CREATE TABLE provider_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio             TEXT,
  hourly_rate     INTEGER NOT NULL DEFAULT 0,
  available       BOOLEAN NOT NULL DEFAULT TRUE,
  average_rating  NUMERIC(3,2) NOT NULL DEFAULT 0,
  total_reviews   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Provider specialties
CREATE TABLE provider_specialties (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id  UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  category_id  TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE(provider_id, category_id)
);

-- Provider portfolio
CREATE TABLE provider_portfolio (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  image_url   TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Provider real-time locations
CREATE TABLE provider_locations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL UNIQUE REFERENCES provider_profiles(id) ON DELETE CASCADE,
  latitude    DOUBLE PRECISION NOT NULL,
  longitude   DOUBLE PRECISION NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Service requests
CREATE TABLE service_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id     UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  category_id     TEXT NOT NULL REFERENCES categories(id),
  description     TEXT NOT NULL,
  address         TEXT NOT NULL,
  latitude        DOUBLE PRECISION NOT NULL,
  longitude       DOUBLE PRECISION NOT NULL,
  requested_date  TIMESTAMPTZ NOT NULL,
  status          service_status NOT NULL DEFAULT 'PENDING',
  estimated_price INTEGER,
  final_price     INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Service status history
CREATE TABLE service_status_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id  UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  status      service_status NOT NULL,
  created_by  UUID NOT NULL REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id  UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES users(id),
  content     TEXT NOT NULL,
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id  UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES users(id),
  target_id   UUID NOT NULL REFERENCES users(id),
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  type        review_type NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(request_id, author_id, type)
);

-- Payments
CREATE TABLE payments (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id             UUID NOT NULL UNIQUE REFERENCES service_requests(id) ON DELETE CASCADE,
  amount                 INTEGER NOT NULL,
  platform_fee           INTEGER NOT NULL,
  provider_amount        INTEGER NOT NULL,
  stripe_payment_intent  TEXT,
  status                 payment_status NOT NULL DEFAULT 'PENDING',
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_provider_profiles_user_id ON provider_profiles(user_id);
CREATE INDEX idx_provider_specialties_provider ON provider_specialties(provider_id);
CREATE INDEX idx_provider_specialties_category ON provider_specialties(category_id);
CREATE INDEX idx_service_requests_user ON service_requests(user_id);
CREATE INDEX idx_service_requests_provider ON service_requests(provider_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_messages_request ON messages(request_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_reviews_target ON reviews(target_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
CREATE INDEX idx_provider_locations_provider ON provider_locations(provider_id);

-- Auto-update provider average rating on review insert/delete
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
DECLARE
  prov_user_id UUID;
  prov_profile_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT id INTO prov_profile_id FROM provider_profiles WHERE user_id = NEW.target_id;
  ELSE
    SELECT id INTO prov_profile_id FROM provider_profiles WHERE user_id = OLD.target_id;
  END IF;

  IF prov_profile_id IS NOT NULL THEN
    UPDATE provider_profiles
    SET
      average_rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM reviews
        WHERE target_id = (SELECT user_id FROM provider_profiles WHERE id = prov_profile_id)
          AND type = 'TO_PROVIDER'
      ),
      total_reviews = (
        SELECT COUNT(*)
        FROM reviews
        WHERE target_id = (SELECT user_id FROM provider_profiles WHERE id = prov_profile_id)
          AND type = 'TO_PROVIDER'
      )
    WHERE id = prov_profile_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_change
  AFTER INSERT OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_rating();

-- Auto-create user record on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'USER')
  );

  IF COALESCE(NEW.raw_user_meta_data->>'role', 'USER') = 'PROVIDER' THEN
    INSERT INTO provider_profiles (user_id) VALUES (NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
