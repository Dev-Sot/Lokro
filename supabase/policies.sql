-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── USERS ──────────────────────────────────────────────────────────────────
-- Anyone can read public user info (name, avatar, role)
CREATE POLICY "users_select_public" ON users
  FOR SELECT USING (TRUE);

-- Users can only update their own record (role changes blocked by trigger)
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = auth.uid());

-- Admins can update any user (needed for role management from admin panel)
CREATE POLICY "users_update_admin" ON users
  FOR UPDATE USING (get_user_role() = 'ADMIN');

-- Insert handled by trigger only (service role)
CREATE POLICY "users_insert_trigger" ON users
  FOR INSERT WITH CHECK (id = auth.uid());

-- ─── CATEGORIES ─────────────────────────────────────────────────────────────
CREATE POLICY "categories_select_all" ON categories
  FOR SELECT USING (TRUE);

CREATE POLICY "categories_manage_admin" ON categories
  FOR ALL USING (get_user_role() = 'ADMIN');

-- ─── PROVIDER PROFILES ──────────────────────────────────────────────────────
CREATE POLICY "provider_profiles_select_all" ON provider_profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "provider_profiles_update_own" ON provider_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "provider_profiles_insert_own" ON provider_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid() AND get_user_role() = 'PROVIDER');

-- ─── PROVIDER SPECIALTIES ───────────────────────────────────────────────────
CREATE POLICY "provider_specialties_select_all" ON provider_specialties
  FOR SELECT USING (TRUE);

CREATE POLICY "provider_specialties_manage_own" ON provider_specialties
  FOR ALL USING (
    provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
  );

-- ─── PROVIDER PORTFOLIO ─────────────────────────────────────────────────────
CREATE POLICY "provider_portfolio_select_all" ON provider_portfolio
  FOR SELECT USING (TRUE);

CREATE POLICY "provider_portfolio_manage_own" ON provider_portfolio
  FOR ALL USING (
    provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
  );

-- ─── PROVIDER LOCATIONS ─────────────────────────────────────────────────────
CREATE POLICY "provider_locations_select_all" ON provider_locations
  FOR SELECT USING (TRUE);

CREATE POLICY "provider_locations_upsert_own" ON provider_locations
  FOR ALL USING (
    provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
  );

-- ─── SERVICE REQUESTS ───────────────────────────────────────────────────────
-- Users see their own requests; providers see requests assigned to them
CREATE POLICY "service_requests_select" ON service_requests
  FOR SELECT USING (
    user_id = auth.uid()
    OR provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
    OR get_user_role() = 'ADMIN'
  );

CREATE POLICY "service_requests_insert_user" ON service_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "service_requests_update_participants" ON service_requests
  FOR UPDATE USING (
    user_id = auth.uid()
    OR provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
    OR get_user_role() = 'ADMIN'
  );

-- ─── SERVICE STATUS HISTORY ─────────────────────────────────────────────────
CREATE POLICY "status_history_select" ON service_status_history
  FOR SELECT USING (
    request_id IN (
      SELECT id FROM service_requests
      WHERE user_id = auth.uid()
        OR provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "status_history_insert_participants" ON service_status_history
  FOR INSERT WITH CHECK (
    created_by = auth.uid()
    AND request_id IN (
      SELECT id FROM service_requests
      WHERE user_id = auth.uid()
        OR provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
    )
  );

-- ─── MESSAGES ───────────────────────────────────────────────────────────────
CREATE POLICY "messages_select_participants" ON messages
  FOR SELECT USING (
    request_id IN (
      SELECT id FROM service_requests
      WHERE user_id = auth.uid()
        OR provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "messages_insert_participants" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND request_id IN (
      SELECT id FROM service_requests
      WHERE user_id = auth.uid()
        OR provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
    )
  );

-- Participants can update messages in their requests (read flag + sender can edit content)
-- A trigger prevents non-senders from changing content
CREATE POLICY "messages_update_participants" ON messages
  FOR UPDATE USING (
    request_id IN (
      SELECT sr.id FROM service_requests sr
      LEFT JOIN provider_profiles pp ON pp.id = sr.provider_id
      WHERE sr.user_id = auth.uid() OR pp.user_id = auth.uid()
    )
  );

-- ─── REVIEWS ────────────────────────────────────────────────────────────────
CREATE POLICY "reviews_select_all" ON reviews
  FOR SELECT USING (TRUE);

CREATE POLICY "reviews_insert_participants" ON reviews
  FOR INSERT WITH CHECK (
    author_id = auth.uid()
    AND request_id IN (
      SELECT id FROM service_requests
      WHERE status = 'COMPLETED'
        AND (user_id = auth.uid() OR provider_id IN (
          SELECT id FROM provider_profiles WHERE user_id = auth.uid()
        ))
    )
  );

-- ─── PAYMENTS ───────────────────────────────────────────────────────────────
CREATE POLICY "payments_select_participants" ON payments
  FOR SELECT USING (
    request_id IN (
      SELECT id FROM service_requests
      WHERE user_id = auth.uid()
        OR provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
        OR get_user_role() = 'ADMIN'
    )
  );

CREATE POLICY "payments_insert_user" ON payments
  FOR INSERT WITH CHECK (
    request_id IN (
      SELECT id FROM service_requests WHERE user_id = auth.uid()
    )
  );

-- Payment updates are handled exclusively by the webhook using service role (bypasses RLS).
-- No client-side policy — prevents admins from manually marking payments as PAID.

-- ─── NOTIFICATIONS ──────────────────────────────────────────────────────────
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Participants can notify the other party in a shared request; admins can notify anyone.
-- Old policy (TRUE) allowed any user to spam notifications to anyone.
CREATE POLICY "notifications_insert_participants" ON notifications
  FOR INSERT WITH CHECK (
    get_user_role() = 'ADMIN'
    OR (
      notifications.user_id != auth.uid()
      AND EXISTS (
        SELECT 1
        FROM service_requests sr
        JOIN provider_profiles pp ON pp.id = sr.provider_id
        WHERE (sr.user_id = auth.uid() OR pp.user_id = auth.uid())
          AND (notifications.user_id = sr.user_id OR notifications.user_id = pp.user_id)
      )
    )
  );
