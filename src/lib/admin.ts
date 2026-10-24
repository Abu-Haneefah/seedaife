// ===== Admin data layer — stubbed (full implementation deferred)
// Styles: dashboards now use shells only. All Supabase queries and mutations
// are replaced with empty/stub implementations.

import { getSupabase, Profile } from './supabase';

// Re-exported so admin components can import Profile from the data layer.


// ---- Types (preserved) ----
export type UserRole = 'guest' | 'learner' | 'parent' | 'instructor' | 'super_admin';
export const ALL_ROLES: UserRole[] = ['guest', 'learner', 'parent', 'instructor', 'super_admin'];
export type ClassStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';

export interface AdminClass {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  instructor_id: string | null;
  starts_at: string;
  ends_at: string;
  meet_url: string | null;
  status: ClassStatus;
  capacity: number;
  created_by: string | null;
  created_at: string;
  courses?: { id: string; code: string; title: string; level_color: string } | null;
  instructor?: { id: string; full_name: string } | null;
}

export interface LearnerRow {
  id: string;
  user_id: string | null;
  parent_id: string | null;
  display_name: string;
  age_band: string;
  avatar_key: string | null;
  xp: number;
  level: number;
  created_at: string;
}
export interface AssignmentRow {
  id: string;
  class_id: string | null;
  title: string;
  instructions: string;
  due_at: string | null;
  max_points: number;
  assigned_to: 'class' | 'learners' | 'instructors';
  created_by: string | null;
  created_at: string;
  classes?: { id: string; title: string; instructor_id: string | null } | null;
}

export interface SubmissionRow {
  id: string;
  assignment_id: string;
  learner_id: string;
  text_answer: string | null;
  link_url: string | null;
  file_path: string | null;
  submitted_at: string;
  grade: number | null;
  feedback: string | null;
  status: 'submitted' | 'graded' | 'resubmit_requested';
  learners?: { id: string; display_name: string; age_band: string } | null;
  assignments?: { id: string; title: string; max_points: number; class_id: string | null } | null;
}

export interface AnnouncementRow {
  id: string;
  title: string;
  body: string;
  audience: 'all' | 'learners' | 'parents' | 'instructors' | 'guests' | 'class';
  class_id: string | null;
  pinned: boolean;
  created_by: string | null;
  expires_at: string | null;
  created_at: string;
  classes?: { id: string; title: string } | null;
}

export interface LeadRow {
  id: string;
  name: string;
  email: string;
  audience: string;
  child_age_band: string | null;
  status: string;
  created_at: string;
}

export interface AuditRow {
  id: string;
  actor_id: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  actor?: { id: string; full_name: string; email: string } | null;
}

export interface AttendanceRow {
  id?: string;
  class_id: string;
  learner_id: string;
  status: 'present' | 'absent' | 'late';
  marked_by?: string | null;
  created_at?: string;
  classes?: { id: string; title: string; starts_at: string } | null;
  learners?: { id: string; display_name: string; age_band: string } | null;
}

export interface MessageRowData {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  body: string;
  channel: string;
  read_at: string | null;
  created_at: string;
  recipient?: { id: string; full_name: string; email: string } | null;
}

export interface SentMessageRow {
  id: string;
  subject: string;
  body: string;
  channel: string;
  read_at: string | null;
  created_at: string;
  recipient?: { id: string; full_name: string; email: string } | null;
}

export interface OverviewData {
  roleCounts: Record<string, number>;
  newGuestsThisWeek: number;
  activeClasses: number;
  classesToday: number;
  pendingGrading: number;
  leadsCount: number;
  liveClasses: AdminClass[];
  classesByCourse: { label: string; value: number }[];
  enrollmentsByMonth: { label: string; value: number }[];
  attendanceRate: { present: number; total: number };
  recentAudit: AuditRow[];
}

export interface CourseRow {
  id: string;
  code: string;
  title: string;
  level_color: string;
  age_band: string;
  description: string;
  weeks: number;
  is_published: boolean;
}

export interface ClassDraft {
  course_id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  meet_url: string;
  repeatWeeks: number;
}

export interface EnrollmentAdminRow {
  id: string;
  learner_id: string;
  class_id: string;
  status: string;
  created_at: string;
  learners?: { id: string; display_name: string; age_band: string } | null;
  classes?: { id: string; title: string; instructor_id: string | null } | null;
}

export interface AdminAssignmentDraft {
  title: string;
  instructions: string;
  due_at: string;
  max_points: number;
  assigned_to: string;
  created_by: string;
}

export type AnnouncementAudience = 'all' | 'learners' | 'parents' | 'instructors' | 'guests' | 'class';
export type MessageChannel = 'dashboard' | 'email' | 'both';
export type MessageAudience = 'all_parents' | 'parents_of_class' | 'parents_of_course' | 'one_person';

export interface MessageTemplate {
  id: string;
  channel: MessageChannel;
  audience: MessageAudience;
  subject: string;
  body: string;
}

export const MESSAGE_TEMPLATES: MessageTemplate[] = [];

export interface MessageContact {
  id: string;
  full_name: string;
  note: string;
}// ---- Pure helpers ----
export const MEET_URL_RE = /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}(?:[\/?#]|$)/i;
export const isValidMeetUrl = (v?: string | null): boolean => MEET_URL_RE.test(String(v || '').trim());

export function levelColor(token?: string | null): string {
  switch (String(token || '').trim().toLowerCase()) {
    case 'lime': return 'var(--lime)';
    case 'lilac': return 'var(--lilac)';
    case 'coral': return 'var(--coral)';
    default: return 'var(--plum)';
  }
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const esc = (v: string | number) => {
    const s = String(v ?? '');
    return /[\",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines: string[] = [headers.map(esc).join(',')];
  for (const row of rows) {
    lines.push(row.map(esc).join(','));
  }
  const csv = lines.join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* logAudit stub */
export async function logAudit(
  actorId: string,
  action: string,
  entity: string,
  entityId?: string | null,
  details?: Record<string, unknown>
): Promise<void> {
  // Stub — audit logging is deferred
  return;
}// ---- Stub implementations (all DB-backed functions) ----
// Overview
export async function fetchOverview(): Promise<OverviewData | null> {
  return null;
}

// Users
export async function fetchUsers(): Promise<Profile[]> { return []; }
export async function fetchInstructors(): Promise<Profile[]> { return []; }
export async function fetchLinkedLearners(userId: string): Promise<LearnerRow[]> { return []; }
export async function fetchLearnerParents(learnerIds: string[]): Promise<Profile[]> { return []; }

/* changeUserRole stub — placeholder */
export async function changeUserRole(
  actorId: string,
  targetId: string,
  role: UserRole
): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Dashboard not implemented.' };
}

/* setUserActive stub — placeholder */
export async function setUserActive(actorId: string, userId: string, active: boolean): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Dashboard not implemented.' };
}

/* addInstructorByEmail stub — placeholder */
export async function addInstructorByEmail(email: string): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Dashboard not implemented.' };
}

export interface LearnerAdminRow extends LearnerRow {}
export async function fetchLearnersAdmin(): Promise<LearnerAdminRow[]> { return []; }

// Courses
export async function fetchCoursesAdmin(): Promise<CourseRow[]> { return []; }
export async function updateCourse(courseId: string, patch: Partial<CourseRow>): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Dashboard not implemented.' };
}

// Classes
export async function fetchClassesAdmin(): Promise<AdminClass[]> { return []; }
export async function createAdminClass(draft: ClassDraft): Promise<{ success: boolean; error?: string; created?: number }> {
  return { success: false, error: 'Dashboard not implemented.' };
}
export async function updateAdminClass(classId: string, draft: ClassDraft): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Dashboard not implemented.' };
}
export async function setClassStatusAdmin(classId: string, status: ClassStatus): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Dashboard not implemented.' };
}

// Enrollments
export async function fetchClassEnrollments(classId: string): Promise<EnrollmentAdminRow[]> { return []; }
export async function enrollLearners(classId: string, learnerIds: string[]): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Dashboard not implemented.' };
}
export async function removeEnrollment(enrollmentId: string): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Dashboard not implemented.' };
}
export async function setEnrollmentStatus(enrollmentId: string, status: string): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Dashboard not implemented.' };
}
export async function approveGuestEnrollment(guestId: string): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Dashboard not implemented.' };
}

// Assignments & submissions
export async function fetchAssignmentsAdmin(): Promise<AssignmentRow[]> { return []; }
export async function fetchSubmissionsAdmin(): Promise<SubmissionRow[]> { return []; }
export async function createAssignmentAdmin(draft: AdminAssignmentDraft): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Dashboard not implemented.' };
}
export async function overrideGrade(assignmentId: string, learnerId: string, grade: number, feedback?: string): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Dashboard not implemented.' };
}

// Announcements
export async function fetchAnnouncementsAdmin(): Promise<AnnouncementRow[]> { return []; }
export async function createAnnouncementAdmin(anouncement: AnnouncementRow): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Dashboard not implemented.' };
}

// Messaging
export async function collectRecipients(audience: MessageAudience, context?: object): Promise<MessageContact[]> { return []; }
export async function sendBroadcast(audience: MessageAudience, subject: string, body: string, templateId?: string): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Dashboard not implemented.' };
}
export async function fetchSentMessages(actorId: string): Promise<SentMessageRow[]> { return []; }

// Reports & other
export async function fetchAttendanceReport(): Promise<AttendanceRow[]> { return []; }
export async function fetchAuditLog(): Promise<AuditRow[]> { return []; }
export async function fetchLeads(): Promise<LeadRow[]> { return []; }
export async function setLeadStatus(actorId: string, leadId: string, status: string): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Dashboard not implemented.' };
}
export async function fetchLearnerRoster(): Promise<LearnerRow[]> { return []; }
export async function fetchGuestRequests(): Promise<Profile[]> { return []; }
export async function fetchSettings(): Promise<Record<string, string>> { return {}; }
export async function saveSettings(actorId: string, settings: Record<string, string>): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Dashboard not implemented.' };
}

// ---- Type-only re-exports ----


// ===== End of admin data layer stub =====