import { getSupabase } from './supabase';

// ===== Instructor data layer — stubbed (full implementation deferred)
// Styles: dashboards now use shells only. All Supabase queries and mutations
// are replaced with empty/stub implementations.



// ---- Types (preserved) ----
export type ClassStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';
export type AttendanceStatus = 'present' | 'absent' | 'late';
export type SubmissionStatus = 'submitted' | 'graded' | 'resubmit_requested';

export interface Course {
  id: string;
  code: string;
  title: string;
  track: 'coding' | 'generative_ai';
  level_color: string;
  age_band: string;
  description: string;
  weeks: number;
  is_published: boolean;
}

export interface InstructorClass {
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
}

export interface RosterEntry {
  enrollment_id: string;
  enrollment_status: 'active' | 'waitlist' | 'dropped';
  learner_id: string;
  display_name: string;
  age_band: string;
  avatar_key: string | null;
  xp: number;
  level: number;
  parent_id: string | null;
  user_id: string | null;
}

export interface AttendanceRow {
  class_id: string;
  learner_id: string;
  status: AttendanceStatus;
  marked_by?: string | null;
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
  classes?: { id: string; title: string } | null;
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
  status: SubmissionStatus;
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

export interface MessageRow {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  body: string;
  channel: 'dashboard' | 'email' | 'both';
  read_at: string | null;
  parent_message_id: string | null;
  created_at: string;
}

export interface MessageContact {
  id: string;
  full_name: string;
  note: string;
}

export interface Availability {
  days: string[];
  start: string;
  end: string;
  note: string;
}

export interface ClassDraft {
  course_id: string;
  title: string;
  description: string;
  date: string; // yyyy-mm-dd
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  capacity: number;
  meet_url: string;
  repeatWeeks: number; // 1 = single class, >1 = weekly recurrence
}

export interface AssignmentDraft {
  class_id: string | null;
  title: string;
  instructions: string;
  due_at: string | null;
  max_points: number;
  assigned_to: 'class' | 'learners' | 'instructors';
  created_by: string | null;
}// ---- Pure helpers ----
export const MEET_URL_RE = /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}(?:[\/?#]|$)/i;
export const isValidMeetUrl = (v: string | undefined | null): boolean => MEET_URL_RE.test(String(v || '').trim());
export const DAY_OPTIONS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
// ---- Stub implementations (all DB-backed functions) ----
// Courses
export async function fetchCourses(): Promise<Course[]> { return []; }

// Classes
export async function fetchMyClasses(instructorId: string): Promise<InstructorClass[]> { return []; }
export async function fetchEnrollmentCounts(classIds: string[]): Promise<Record<string, number>> { return {}; }
export async function createClassRows(draft: ClassDraft, instructorId: string): Promise<{ success: boolean; error?: string; created?: number }> {
  return { success: false, error: 'Dashboard not implemented.' };
}
export async function updateClassRow(classId: string, draft: ClassDraft): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Dashboard not implemented.' };
}
export async function setClassStatus(classId: string, status: ClassStatus): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Dashboard not implemented.' };
}

// Roster & Attendance
export async function fetchClassRoster(classId: string): Promise<RosterEntry[]> { return []; }
export async function fetchClassAttendance(classId: string): Promise<AttendanceRow[]> { return []; }
export async function saveAttendance(rows: AttendanceRow[]): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Dashboard not implemented.' };
}

// Assignments & submissions
export async function fetchMyAssignments(classIds: string[]): Promise<AssignmentRow[]> { return []; }
export async function createAssignment(draft: AssignmentDraft): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Dashboard not implemented.' };
}
export async function updateAssignment(assignmentId: string, patch: Partial<AssignmentDraft>): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Dashboard not implemented.' };
}
export async function deleteAssignment(assignmentId: string): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Dashboard not implemented.' };
}
export async function fetchSubmissions(assignmentIds: string[]): Promise<SubmissionRow[]> { return []; }
export async function gradeSubmission(assignmentId: string, learnerId: string, grade: number, feedback?: string): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Dashboard not implemented.' };
}
export async function getSubmissionFileUrl(path: string): Promise<string | null> {
  return null;
}

// Messaging
export async function fetchMyMessages(profileId: string): Promise<MessageRow[]> { return []; }
export async function fetchClassContacts(classId: string): Promise<MessageContact[]> { return []; }
export async function sendMessage(senderId: string, recipientId: string, subject: string, body: string, channel: 'dashboard' | 'email' | 'both'): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Dashboard not implemented.' };
}
export async function replyToMessage(messageId: string, body: string): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Dashboard not implemented.' };
}
export async function markMessageRead(messageId: string): Promise<void> {
  // Stub
  return;
}

// Announcements
export async function fetchAnnouncements(): Promise<AnnouncementRow[]> { return []; }
export async function createClassAnnouncement(classId: string, title: string, body: string, createdBy: string): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Dashboard not implemented.' };
}

// Profile & Availability
export async function updateInstructorProfile(profileId: string, patch: { full_name?: string; phone?: string | null; availability?: Availability }): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Dashboard not implemented.' };
}
export function parseAvailability(raw: unknown): Availability {
  const fallback: Availability = { days: [], start: '', end: '', note: '' };
  if (!raw || typeof raw !== 'object') return fallback;
  const obj = raw as Partial<Availability>;
  return {
    days: Array.isArray(obj.days) ? obj.days.filter((d) => DAY_OPTIONS.includes(d)) : [],
    start: typeof obj.start === 'string' ? obj.start : '',
    end: typeof obj.end === 'string' ? obj.end : '',
    note: typeof obj.note === 'string' ? obj.note : '',
  };
}