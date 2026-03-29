-- Migration: Enable RLS on all tables and create access policies

-- Helper function: check if user is admin or super_admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM members
    WHERE user_id = user_uuid
      AND role IN ('admin', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: check if user is super_admin
CREATE OR REPLACE FUNCTION is_super_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM members
    WHERE user_id = user_uuid
      AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- TENANTS
-- ============================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenants_public_read"
  ON tenants FOR SELECT
  USING (true);

CREATE POLICY "tenants_super_admin_insert"
  ON tenants FOR INSERT
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "tenants_super_admin_update"
  ON tenants FOR UPDATE
  USING (is_super_admin(auth.uid()));

CREATE POLICY "tenants_super_admin_delete"
  ON tenants FOR DELETE
  USING (is_super_admin(auth.uid()));

-- ============================================================
-- MEMBERSHIP_TIERS
-- ============================================================
ALTER TABLE membership_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "membership_tiers_public_read"
  ON membership_tiers FOR SELECT
  USING (true);

CREATE POLICY "membership_tiers_admin_insert"
  ON membership_tiers FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "membership_tiers_admin_update"
  ON membership_tiers FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "membership_tiers_admin_delete"
  ON membership_tiers FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================================
-- MEMBERS
-- ============================================================
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_own_read"
  ON members FOR SELECT
  USING (user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "members_own_update"
  ON members FOR UPDATE
  USING (user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "members_admin_insert"
  ON members FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "members_admin_delete"
  ON members FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================================
-- FAMILY_MEMBERS
-- ============================================================
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "family_members_own_read"
  ON family_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = family_members.member_id
        AND (members.user_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

CREATE POLICY "family_members_own_insert"
  ON family_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = family_members.member_id
        AND (members.user_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

CREATE POLICY "family_members_own_update"
  ON family_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = family_members.member_id
        AND (members.user_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

CREATE POLICY "family_members_admin_delete"
  ON family_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = family_members.member_id
        AND (members.user_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

-- ============================================================
-- EVENTS
-- ============================================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_published_read"
  ON events FOR SELECT
  USING (status = 'published' OR is_admin(auth.uid()));

CREATE POLICY "events_admin_insert"
  ON events FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "events_admin_update"
  ON events FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "events_admin_delete"
  ON events FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================================
-- REGISTRATIONS
-- ============================================================
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "registrations_own_read"
  ON registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = registrations.member_id
        AND (members.user_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

CREATE POLICY "registrations_own_insert"
  ON registrations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = registrations.member_id
        AND members.user_id = auth.uid()
    )
    OR is_admin(auth.uid())
  );

CREATE POLICY "registrations_own_update"
  ON registrations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = registrations.member_id
        AND (members.user_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

CREATE POLICY "registrations_admin_delete"
  ON registrations FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================================
-- PAYMENTS
-- ============================================================
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_own_read"
  ON payments FOR SELECT
  USING (
    (member_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM members
      WHERE members.id = payments.member_id
        AND members.user_id = auth.uid()
    ))
    OR is_admin(auth.uid())
  );

CREATE POLICY "payments_admin_insert"
  ON payments FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "payments_admin_update"
  ON payments FOR UPDATE
  USING (is_admin(auth.uid()));

-- ============================================================
-- APPLICATIONS
-- ============================================================
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "applications_own_read"
  ON applications FOR SELECT
  USING (email = auth.email() OR is_admin(auth.uid()));

CREATE POLICY "applications_own_insert"
  ON applications FOR INSERT
  WITH CHECK (email = auth.email() OR is_admin(auth.uid()));

CREATE POLICY "applications_own_update"
  ON applications FOR UPDATE
  USING (email = auth.email() OR is_admin(auth.uid()));

CREATE POLICY "applications_admin_delete"
  ON applications FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================================
-- DONATIONS
-- ============================================================
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "donations_public_read"
  ON donations FOR SELECT
  USING (show_on_wall = true OR is_admin(auth.uid()));

CREATE POLICY "donations_admin_insert"
  ON donations FOR INSERT
  WITH CHECK (is_admin(auth.uid()) OR true); -- anyone can donate

CREATE POLICY "donations_admin_update"
  ON donations FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "donations_admin_delete"
  ON donations FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================================
-- VOLUNTEERS
-- ============================================================
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "volunteers_admin_select"
  ON volunteers FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "volunteers_admin_insert"
  ON volunteers FOR INSERT
  WITH CHECK (is_admin(auth.uid()) OR true); -- anyone can volunteer

CREATE POLICY "volunteers_admin_update"
  ON volunteers FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "volunteers_admin_delete"
  ON volunteers FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================================
-- CHAT_CONVERSATIONS
-- ============================================================
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_own_read"
  ON chat_conversations FOR SELECT
  USING (
    (member_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM members
      WHERE members.id = chat_conversations.member_id
        AND members.user_id = auth.uid()
    ))
    OR session_id IS NOT NULL
    OR is_admin(auth.uid())
  );

CREATE POLICY "chat_own_insert"
  ON chat_conversations FOR INSERT
  WITH CHECK (true); -- anyone can start a chat

CREATE POLICY "chat_own_update"
  ON chat_conversations FOR UPDATE
  USING (
    (member_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM members
      WHERE members.id = chat_conversations.member_id
        AND members.user_id = auth.uid()
    ))
    OR is_admin(auth.uid())
  );

-- ============================================================
-- AUDIT_LOGS
-- ============================================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_admin_read"
  ON audit_logs FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "audit_logs_system_insert"
  ON audit_logs FOR INSERT
  WITH CHECK (true); -- inserted by server-side functions

-- ============================================================
-- EMAIL_TEMPLATES
-- ============================================================
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_templates_admin_select"
  ON email_templates FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "email_templates_admin_insert"
  ON email_templates FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "email_templates_admin_update"
  ON email_templates FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "email_templates_admin_delete"
  ON email_templates FOR DELETE
  USING (is_admin(auth.uid()));
