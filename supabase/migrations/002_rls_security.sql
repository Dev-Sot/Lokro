-- Migration 002: RLS Security Improvements
-- Fixes: role escalation, notification spam, message read, payment integrity

-- ─── FIX 1: Allow admins to update any user (needed for setUserRole action) ──
-- The existing users_update_own only allows id = auth.uid(), so admin
-- server actions couldn't change another user's role at all.
-- DROP IF EXISTS prevents failure when policies.sql was already applied.
DROP POLICY IF EXISTS "users_update_admin" ON users;
CREATE POLICY "users_update_admin" ON users
  FOR UPDATE USING (get_user_role() = 'ADMIN');

-- ─── FIX 2: Prevent non-admins from escalating their own role ────────────────
-- Without this, any user could run: UPDATE users SET role = 'ADMIN' WHERE id = auth.uid()
-- and the existing policy would allow it (id = auth.uid() is true).
CREATE OR REPLACE FUNCTION prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND get_user_role() != 'ADMIN' THEN
    RAISE EXCEPTION 'Insufficient privileges to change user role';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_role_change_permissions
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION prevent_role_escalation();

-- ─── FIX 3: Restrict notification inserts to participants ─────────────────────
-- The old policy (WITH CHECK (TRUE)) let any authenticated user insert a
-- notification with any user_id — anyone could spam any other user.
DROP POLICY IF EXISTS "notifications_insert_service" ON notifications;

CREATE POLICY "notifications_insert_participants" ON notifications
  FOR INSERT WITH CHECK (
    -- Admins can insert any notification
    get_user_role() = 'ADMIN'
    -- Participants can notify only the OTHER party in a shared request (not themselves)
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

-- ─── FIX 4: Allow recipients to mark messages as read ────────────────────────
-- The old policy (sender_id = auth.uid()) silently blocked recipients from
-- marking received messages as read (the client was calling this but failing).
DROP POLICY IF EXISTS "messages_update_own" ON messages;

CREATE POLICY "messages_update_participants" ON messages
  FOR UPDATE USING (
    request_id IN (
      SELECT sr.id FROM service_requests sr
      LEFT JOIN provider_profiles pp ON pp.id = sr.provider_id
      WHERE sr.user_id = auth.uid() OR pp.user_id = auth.uid()
    )
  );

-- Prevent any participant from modifying message content (only read can be changed)
CREATE OR REPLACE FUNCTION prevent_message_content_tampering()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.content IS DISTINCT FROM OLD.content AND OLD.sender_id != auth.uid() THEN
    RAISE EXCEPTION 'Cannot modify message content written by another user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_message_content_integrity
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION prevent_message_content_tampering();

-- ─── FIX 5: Payments must only be updated by service role (webhook) ───────────
-- The old policy allowed admin users from the browser to mark any payment as PAID.
-- All legitimate payment updates come from the webhook using service role (bypasses RLS).
DROP POLICY IF EXISTS "payments_update_service_role" ON payments;

-- ─── FIX 6: Provider profile insert requires PROVIDER role ───────────────────
-- Any user could previously create a provider profile for themselves
-- regardless of their role, bypassing the onboarding role selection.
DROP POLICY IF EXISTS "provider_profiles_insert_own" ON provider_profiles;

CREATE POLICY "provider_profiles_insert_own" ON provider_profiles
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND get_user_role() = 'PROVIDER'
  );

-- ─── FIX 7: Prevent tampering with immutable service request fields ───────────
-- Participants could change user_id, provider_id, or category_id on existing requests.
CREATE OR REPLACE FUNCTION prevent_request_field_tampering()
RETURNS TRIGGER AS $$
BEGIN
  IF get_user_role() != 'ADMIN' THEN
    IF NEW.user_id IS DISTINCT FROM OLD.user_id OR
       NEW.provider_id IS DISTINCT FROM OLD.provider_id OR
       NEW.category_id IS DISTINCT FROM OLD.category_id THEN
      RAISE EXCEPTION 'Cannot modify immutable fields on a service request';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_request_immutable_fields
  BEFORE UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION prevent_request_field_tampering();
