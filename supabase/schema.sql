-- ============================================================================
-- SEED AI ACADEMY: SUPABASE DATABASE SCHEMA (STAGE 2)
-- Architecture: Next.js 14 App Router + Supabase Auth & PostgreSQL
-- Features: Strict RBAC, Row Level Security, Kid Hero Profiles (PIN protected),
--           Realtime Sync, Storage Buckets, and Notification Automations.
-- ============================================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('guest', 'learner', 'parent', 'instructor', 'super_admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. TABLES

-- 2.1 PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'guest',
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  avatar_key TEXT,
  audience_type TEXT CHECK (audience_type IN ('parent', 'teen', 'adult', 'professional', 'other')),
  professional_track TEXT CHECK (professional_track IN ('accountant', 'content_creator', 'educator', 'other')),
  consent_accepted_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.2 LEARNERS (Hero profiles for kids under parent account, or own accounts for teens/adults)
CREATE TABLE IF NOT EXISTS public.learners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL, -- Hero nickname (no real surnames for kids)
  age_band TEXT NOT NULL CHECK (age_band IN ('6-9', '10-13', '14-18', 'adult')),
  avatar_key TEXT,
  pin_hash TEXT, -- Stored as bcrypt hash via set_child_pin RPC; never queried directly
  xp INT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.3 COURSES
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  track TEXT NOT NULL CHECK (track IN ('coding', 'generative_ai')),
  level_color TEXT NOT NULL, -- lime, lilac, coral
  age_band TEXT NOT NULL,
  description TEXT NOT NULL,
  weeks INT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.4 CLASSES
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  meet_url TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
  capacity INT NOT NULL DEFAULT 20,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.5 ENROLLMENTS
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'waitlist', 'dropped')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (class_id, learner_id)
);

-- 2.6 ATTENDANCE
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  marked_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (class_id, learner_id)
);

-- 2.7 ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  instructions TEXT NOT NULL,
  due_at TIMESTAMPTZ,
  max_points INT NOT NULL DEFAULT 100,
  assigned_to TEXT NOT NULL DEFAULT 'class' CHECK (assigned_to IN ('class', 'learners', 'instructors')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.8 ASSIGNMENT TARGETS
CREATE TABLE IF NOT EXISTS public.assignment_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  learner_id UUID REFERENCES public.learners(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- 2.9 SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
  text_answer TEXT,
  link_url TEXT,
  file_path TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  grade NUMERIC(5,2),
  feedback TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'resubmit_requested')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.10 ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'all' CHECK (audience IN ('all', 'learners', 'parents', 'instructors', 'guests', 'class')),
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  pinned BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.11 MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'dashboard' CHECK (channel IN ('dashboard', 'email', 'both')),
  read_at TIMESTAMPTZ,
  parent_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.12 NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('class_scheduled', 'class_live', 'class_reminder', 'assignment', 'grade', 'announcement', 'message')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.13 LEADS (Free Workshop submissions)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  audience TEXT NOT NULL,
  child_age_band TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.14 AUDIT LOG
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.15 SITE SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_learners_parent ON public.learners(parent_id);
CREATE INDEX IF NOT EXISTS idx_learners_user ON public.learners(user_id);
CREATE INDEX IF NOT EXISTS idx_classes_course ON public.classes(course_id);
CREATE INDEX IF NOT EXISTS idx_classes_instructor ON public.classes(instructor_id);
CREATE INDEX IF NOT EXISTS idx_classes_status ON public.classes(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_class ON public.enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_learner ON public.enrollments(learner_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class ON public.attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON public.submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_learner ON public.submissions(learner_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages(recipient_id);

-- 4. SECURITY DEFINER HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.current_role_name()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT role FROM public.profiles WHERE id = auth.uid()), 'guest'::public.user_role);
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_instructor_of_class(target_class_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classes
    WHERE id = target_class_id AND instructor_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_parent_of_learner(target_learner_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.learners
    WHERE id = target_learner_id AND parent_id = auth.uid()
  );
$$;

-- 5. AUTH USER CREATION TRIGGER
-- Restricts public sign-up role to parent, learner, or guest only. Never allows instructor or super_admin.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  desired_role public.user_role;
  raw_role text;
BEGIN
  raw_role := (new.raw_user_meta_data->>'role');
  IF raw_role IN ('parent', 'learner', 'guest') THEN
    desired_role := raw_role::public.user_role;
  ELSE
    desired_role := 'guest'::public.user_role;
  END IF;

  INSERT INTO public.profiles (
    id,
    role,
    full_name,
    email,
    phone,
    country,
    audience_type,
    professional_track,
    consent_accepted_at,
    is_active
  ) VALUES (
    new.id,
    desired_role,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'country',
    new.raw_user_meta_data->>'audience_type',
    new.raw_user_meta_data->>'professional_track',
    CASE WHEN new.raw_user_meta_data->>'consent' = 'true' THEN now() ELSE null END,
    true
  );

  -- If self-signing learner (teen or adult), create matching learner row
  IF desired_role = 'learner' THEN
    INSERT INTO public.learners (
      user_id,
      parent_id,
      display_name,
      age_band,
      avatar_key
    ) VALUES (
      new.id,
      null,
      COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
      COALESCE(new.raw_user_meta_data->>'age_band', 'adult'),
      COALESCE(new.raw_user_meta_data->>'avatar_key', 'hero-default')
    );
  END IF;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. KID PIN SECURITY FUNCTIONS (RPC)
CREATE OR REPLACE FUNCTION public.set_child_pin(target_learner_id UUID, pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  -- Caller must be the parent of the learner or a super_admin
  IF NOT (public.is_parent_of_learner(target_learner_id) OR public.is_super_admin()) THEN
    RAISE EXCEPTION 'Access denied: not authorized to set PIN for this learner';
  END IF;

  IF length(pin) != 4 OR pin !~ '^[0-9]{4}$' THEN
    RAISE EXCEPTION 'PIN must be exactly 4 numeric digits';
  END IF;

  UPDATE public.learners
  SET pin_hash = crypt(pin, gen_salt('bf', 10))
  WHERE id = target_learner_id;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_child_pin(target_learner_id UUID, pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  stored_hash text;
BEGIN
  SELECT pin_hash INTO stored_hash
  FROM public.learners
  WHERE id = target_learner_id;

  IF stored_hash IS NULL THEN
    RETURN false;
  END IF;

  RETURN (stored_hash = crypt(pin, stored_hash));
END;
$$;

-- 7. AUTOMATED NOTIFICATION TRIGGERS

-- 7.1 Notify on Class Creation / Schedule Change / Going Live
CREATE OR REPLACE FUNCTION public.notify_class_events()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  enrolled RECORD;
BEGIN
  -- Event: Class Goes Live
  IF (TG_OP = 'UPDATE' AND old.status <> 'live' AND new.status = 'live') THEN
    FOR enrolled IN (
      SELECT e.learner_id, l.parent_id, l.user_id
      FROM public.enrollments e
      JOIN public.learners l ON l.id = e.learner_id
      WHERE e.class_id = new.id AND e.status = 'active'
    ) LOOP
      IF enrolled.parent_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, type, title, body, link)
        VALUES (enrolled.parent_id, 'class_live', 'Class is Now Live!', 'Class "' || new.title || '" has started.', '/dashboard/parent');
      END IF;
      IF enrolled.user_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, type, title, body, link)
        VALUES (enrolled.user_id, 'class_live', 'Your Class is Live!', 'Class "' || new.title || '" has started. Jump in now!', '/dashboard/learner');
      END IF;
    END LOOP;
  END IF;

  -- Event: Class Rescheduled
  IF (TG_OP = 'UPDATE' AND (old.starts_at <> new.starts_at OR old.ends_at <> new.ends_at)) THEN
    FOR enrolled IN (
      SELECT e.learner_id, l.parent_id, l.user_id
      FROM public.enrollments e
      JOIN public.learners l ON l.id = e.learner_id
      WHERE e.class_id = new.id AND e.status = 'active'
    ) LOOP
      IF enrolled.parent_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, type, title, body, link)
        VALUES (enrolled.parent_id, 'class_scheduled', 'Class Rescheduled', 'Class "' || new.title || '" time has been updated.', '/dashboard/parent');
      END IF;
      IF enrolled.user_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, type, title, body, link)
        VALUES (enrolled.user_id, 'class_scheduled', 'Class Rescheduled', 'Class "' || new.title || '" time has been updated.', '/dashboard/learner');
      END IF;
    END LOOP;
  END IF;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_class_events ON public.classes;
CREATE TRIGGER trg_notify_class_events
  AFTER UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.notify_class_events();

-- 7.2 Notify on Submission Graded
CREATE OR REPLACE FUNCTION public.notify_graded_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_parent_id UUID;
  v_user_id UUID;
  v_assignment_title TEXT;
BEGIN
  IF (TG_OP = 'UPDATE' AND (old.status <> 'graded' AND new.status = 'graded')) THEN
    SELECT parent_id, user_id INTO v_parent_id, v_user_id
    FROM public.learners
    WHERE id = new.learner_id;

    SELECT title INTO v_assignment_title
    FROM public.assignments
    WHERE id = new.assignment_id;

    IF v_parent_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, type, title, body, link)
      VALUES (v_parent_id, 'grade', 'Assignment Graded', 'Grade for "' || COALESCE(v_assignment_title, 'Assignment') || '": ' || COALESCE(new.grade::text, 'Graded'), '/dashboard/parent');
    END IF;

    IF v_user_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, type, title, body, link)
      VALUES (v_user_id, 'grade', 'Assignment Graded!', 'Your project "' || COALESCE(v_assignment_title, 'Assignment') || '" was graded: ' || COALESCE(new.grade::text, 'Check feedback'), '/dashboard/learner');
    END IF;
  END IF;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_graded_submission ON public.submissions;
CREATE TRIGGER trg_notify_graded_submission
  AFTER UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.notify_graded_submission();

-- 7.3 Notify on New Announcement
CREATE OR REPLACE FUNCTION public.notify_announcement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF new.audience = 'all' THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    SELECT id, 'announcement', new.title, substring(new.body from 1 for 100), '/dashboard'
    FROM public.profiles
    WHERE is_active = true;
  ELSIF new.audience = 'parents' THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    SELECT id, 'announcement', new.title, substring(new.body from 1 for 100), '/dashboard/parent'
    FROM public.profiles
    WHERE role = 'parent' AND is_active = true;
  ELSIF new.audience = 'learners' THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    SELECT id, 'announcement', new.title, substring(new.body from 1 for 100), '/dashboard/learner'
    FROM public.profiles
    WHERE role = 'learner' AND is_active = true;
  ELSIF new.audience = 'instructors' THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    SELECT id, 'announcement', new.title, substring(new.body from 1 for 100), '/dashboard/instructor'
    FROM public.profiles
    WHERE role = 'instructor' AND is_active = true;
  END IF;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_announcement ON public.announcements;
CREATE TRIGGER trg_notify_announcement
  AFTER INSERT ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.notify_announcement();

-- 8. ROW LEVEL SECURITY (RLS) POLICIES

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 8.1 PROFILES POLICIES
CREATE POLICY "Profiles: Super Admin full access" ON public.profiles
  FOR ALL TO authenticated USING (public.is_super_admin());

CREATE POLICY "Profiles: Users read and update their own" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY "Profiles: Users update own details" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "Profiles: Instructors can view names of parents and their learners" ON public.profiles
  FOR SELECT TO authenticated USING (
    public.current_role_name() = 'instructor' AND (
      id = auth.uid() OR
      id IN (
        SELECT l.parent_id FROM public.learners l
        JOIN public.enrollments e ON e.learner_id = l.id
        JOIN public.classes c ON c.id = e.class_id
        WHERE c.instructor_id = auth.uid()
      )
    )
  );

-- 8.2 LEARNERS POLICIES
CREATE POLICY "Learners: Super Admin full access" ON public.learners
  FOR ALL TO authenticated USING (public.is_super_admin());

CREATE POLICY "Learners: Parents manage their own children" ON public.learners
  FOR ALL TO authenticated USING (parent_id = auth.uid());

CREATE POLICY "Learners: Self-learners read and update their own profile" ON public.learners
  FOR ALL TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Learners: Instructors read enrolled learners for their classes" ON public.learners
  FOR SELECT TO authenticated USING (
    id IN (
      SELECT e.learner_id FROM public.enrollments e
      JOIN public.classes c ON c.id = e.class_id
      WHERE c.instructor_id = auth.uid()
    )
  );

-- 8.3 COURSES POLICIES
CREATE POLICY "Courses: Public can read published courses" ON public.courses
  FOR SELECT TO anon, authenticated USING (is_published = true);

CREATE POLICY "Courses: Super Admin full manage" ON public.courses
  FOR ALL TO authenticated USING (public.is_super_admin());

-- 8.4 CLASSES POLICIES
CREATE POLICY "Classes: Super Admin full access" ON public.classes
  FOR ALL TO authenticated USING (public.is_super_admin());

CREATE POLICY "Classes: Instructors manage their assigned classes" ON public.classes
  FOR ALL TO authenticated USING (instructor_id = auth.uid());

CREATE POLICY "Classes: Enrolled learners and parents view class details" ON public.classes
  FOR SELECT TO authenticated USING (
    id IN (
      SELECT class_id FROM public.enrollments e
      JOIN public.learners l ON l.id = e.learner_id
      WHERE l.user_id = auth.uid() OR l.parent_id = auth.uid()
    )
  );

-- 8.5 ENROLLMENTS POLICIES
CREATE POLICY "Enrollments: Super Admin full access" ON public.enrollments
  FOR ALL TO authenticated USING (public.is_super_admin());

CREATE POLICY "Enrollments: Instructors view enrollments for their classes" ON public.enrollments
  FOR SELECT TO authenticated USING (
    class_id IN (SELECT id FROM public.classes WHERE instructor_id = auth.uid())
  );

CREATE POLICY "Enrollments: Parents and learners view own enrollments" ON public.enrollments
  FOR SELECT TO authenticated USING (
    learner_id IN (
      SELECT id FROM public.learners
      WHERE user_id = auth.uid() OR parent_id = auth.uid()
    )
  );

-- 8.6 ATTENDANCE POLICIES
CREATE POLICY "Attendance: Super Admin full access" ON public.attendance
  FOR ALL TO authenticated USING (public.is_super_admin());

CREATE POLICY "Attendance: Instructors mark attendance for their classes" ON public.attendance
  FOR ALL TO authenticated USING (
    class_id IN (SELECT id FROM public.classes WHERE instructor_id = auth.uid())
  );

CREATE POLICY "Attendance: Parents and learners view own records" ON public.attendance
  FOR SELECT TO authenticated USING (
    learner_id IN (SELECT id FROM public.learners WHERE user_id = auth.uid() OR parent_id = auth.uid())
  );

-- 8.7 ASSIGNMENTS POLICIES
CREATE POLICY "Assignments: Super Admin full access" ON public.assignments
  FOR ALL TO authenticated USING (public.is_super_admin());

CREATE POLICY "Assignments: Instructors manage assignments for their classes" ON public.assignments
  FOR ALL TO authenticated USING (
    class_id IN (SELECT id FROM public.classes WHERE instructor_id = auth.uid())
  );

CREATE POLICY "Assignments: Enrolled learners and parents view assignments" ON public.assignments
  FOR SELECT TO authenticated USING (
    class_id IN (
      SELECT class_id FROM public.enrollments e
      JOIN public.learners l ON l.id = e.learner_id
      WHERE l.user_id = auth.uid() OR l.parent_id = auth.uid()
    )
  );

-- 8.8 SUBMISSIONS POLICIES
CREATE POLICY "Submissions: Super Admin full access" ON public.submissions
  FOR ALL TO authenticated USING (public.is_super_admin());

CREATE POLICY "Submissions: Instructors view and grade submissions for their classes" ON public.submissions
  FOR ALL TO authenticated USING (
    assignment_id IN (
      SELECT a.id FROM public.assignments a
      JOIN public.classes c ON c.id = a.class_id
      WHERE c.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Submissions: Learners and parents manage own submissions" ON public.submissions
  FOR ALL TO authenticated USING (
    learner_id IN (SELECT id FROM public.learners WHERE user_id = auth.uid() OR parent_id = auth.uid())
  );

-- 8.9 ANNOUNCEMENTS POLICIES
CREATE POLICY "Announcements: Super Admin full access" ON public.announcements
  FOR ALL TO authenticated USING (public.is_super_admin());

CREATE POLICY "Announcements: Instructors create class announcements" ON public.announcements
  FOR ALL TO authenticated USING (
    class_id IN (SELECT id FROM public.classes WHERE instructor_id = auth.uid())
  );

CREATE POLICY "Announcements: View announcements matching audience" ON public.announcements
  FOR SELECT TO anon, authenticated USING (
    audience = 'all'
    OR (audience = 'guests' AND (auth.role() = 'anon' OR public.current_role_name() = 'guest'))
    OR (audience = 'parents' AND public.current_role_name() = 'parent')
    OR (audience = 'learners' AND public.current_role_name() = 'learner')
    OR (audience = 'instructors' AND public.current_role_name() = 'instructor')
    OR (audience = 'class' AND class_id IN (
      SELECT e.class_id FROM public.enrollments e
      JOIN public.learners l ON l.id = e.learner_id
      WHERE l.user_id = auth.uid() OR l.parent_id = auth.uid()
    ))
  );

-- 8.10 MESSAGES POLICIES
CREATE POLICY "Messages: Super Admin full access" ON public.messages
  FOR ALL TO authenticated USING (public.is_super_admin());

CREATE POLICY "Messages: Sender and Recipient read and write" ON public.messages
  FOR ALL TO authenticated USING (
    sender_id = auth.uid() OR recipient_id = auth.uid()
  );

-- 8.11 NOTIFICATIONS POLICIES
CREATE POLICY "Notifications: Super Admin full access" ON public.notifications
  FOR ALL TO authenticated USING (public.is_super_admin());

CREATE POLICY "Notifications: Users manage own notifications" ON public.notifications
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- 8.12 LEADS POLICIES (Public landing page lead capture)
CREATE POLICY "Leads: Public insert only" ON public.leads
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Leads: Super Admin view leads" ON public.leads
  FOR SELECT TO authenticated USING (public.is_super_admin());

-- 8.13 AUDIT LOG POLICIES
CREATE POLICY "Audit Log: Super Admin view all" ON public.audit_log
  FOR SELECT TO authenticated USING (public.is_super_admin());

CREATE POLICY "Audit Log: Authenticated users insert events" ON public.audit_log
  FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());

-- 8.14 SITE SETTINGS POLICIES
CREATE POLICY "Site Settings: Public read" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Site Settings: Super Admin manage" ON public.site_settings
  FOR ALL TO authenticated USING (public.is_super_admin());

-- 9. STORAGE BUCKETS & STORAGE POLICIES
INSERT INTO storage.buckets (id, name, public)
VALUES ('submissions', 'submissions', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Submissions storage policies (Folder named after learner_id)
DROP POLICY IF EXISTS "Submissions: Learner/Parent folder access" ON storage.objects;
CREATE POLICY "Submissions: Learner/Parent folder access" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'submissions' AND (
      public.is_super_admin() OR
      (storage.foldername(name))[1] IN (
        SELECT id::text FROM public.learners WHERE user_id = auth.uid() OR parent_id = auth.uid()
      ) OR
      (storage.foldername(name))[1] IN (
        SELECT e.learner_id::text FROM public.enrollments e
        JOIN public.classes c ON c.id = e.class_id
        WHERE c.instructor_id = auth.uid()
      )
    )
  );

-- Avatars storage policies (Public read, owner write)
DROP POLICY IF EXISTS "Avatars: Public read" ON storage.objects;
CREATE POLICY "Avatars: Public read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatars: Owner upload" ON storage.objects;
CREATE POLICY "Avatars: Owner upload" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'avatars' AND (
      public.is_super_admin() OR (storage.foldername(name))[1] = auth.uid()::text
    )
  );

-- 10. REALTIME PUBLICATION
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.classes;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION
  WHEN duplicate_object THEN null;
  WHEN others THEN null;
END $$;

-- 11. SEED DEFAULT COURSES & SITE SETTINGS
INSERT INTO public.courses (code, title, track, level_color, age_band, description, weeks)
VALUES
  ('SCRATCH-101', 'Scratch for Kids', 'coding', 'lime', 'Ages 6 to 12', 'Interactive block-based coding. Build animated stories, arcade games and puzzles from scratch.', 6),
  ('WEB-101', 'Web Foundations: HTML and CSS', 'coding', 'lilac', 'Ages 11+', 'Learn the structural language of the web. Build and publish your custom personal portfolio page.', 8),
  ('JS-101', 'JavaScript Essentials', 'coding', 'lime', 'Ages 13+', 'Core programming logic, DOM manipulation, APIs, to-do applications, and mini browser games.', 8),
  ('REACT-101', 'React Fundamentals', 'coding', 'coral', 'Ages 14+', 'Component architecture, modern hooks, responsive state handling, and multi-view interactive web apps.', 10),
  ('GENAI-101', 'Generative AI 101', 'generative_ai', 'lime', 'Ages 6 to adults', 'Foundations of GenAI, language models, safe prompting, audio/video generation and personal AI playbooks.', 6),
  ('GENAI-102', 'Generative AI 102', 'generative_ai', 'lilac', 'Ages 11+', 'AI tools for building real websites, automated layouts, responsive forms, content generation and publishing.', 8),
  ('GENAI-103', 'Generative AI 103', 'generative_ai', 'coral', 'Ages 14+', 'AI agents, vibe coding, full-stack database integrations, and automated business workflows for accountants, educators, and creators.', 12)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.site_settings (key, value)
VALUES
  ('seedai_email', 'seedaiacademy@gmail.com'),
  ('whatsapp_number', '+2349069115484'),
  ('site_url', 'https://seedaiacademy.com')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 12. SUPER ADMIN PROMOTION QUERY (MANUAL STEP)
-- Run this query after creating your account to promote yourself to Super Admin:
--
-- UPDATE public.profiles
-- SET role = 'super_admin'
-- WHERE email = 'YOUR_EMAIL_HERE';
-- ============================================================================
