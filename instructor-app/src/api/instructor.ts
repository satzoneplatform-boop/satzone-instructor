import { api } from "./client";
import { getAccessToken } from "./tokens";
import type {
  AssessmentCreate,
  AssessmentInstructorRead,
  AssessmentUpdate,
  CourseAnalytics,
  EnrolledStudentRead,
  InstructorCourseCreate,
  InstructorCourseRead,
  InstructorCourseUpdate,
  InstructorProfileRead,
  InstructorProfileUpdate,
  LessonAdminRead,
  LessonCreate,
  LessonUpdate,
  Page,
  PublishStatus,
  QuestionCreate,
  QuestionInstructorRead,
  QuestionUpdate,
  ReorderPayload,
  SectionAdminRead,
  SectionCreate,
  SectionUpdate,
  UploadResponse,
} from "./types";

function qs(params: Record<string, unknown>): string {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    u.set(k, String(v));
  }
  const s = u.toString();
  return s ? `?${s}` : "";
}

function uploadFile<T>(path: string, file: File, extra?: Record<string, string>): Promise<T> {
  const fd = new FormData();
  fd.append("file", file);
  if (extra) for (const [k, v] of Object.entries(extra)) fd.append(k, v);
  return api<T>(path, { method: "POST", body: fd });
}

// ============= Profile =============

export function getMyInstructorProfile() {
  return api<InstructorProfileRead>("/instructor/me/profile");
}

export function updateMyInstructorProfile(body: InstructorProfileUpdate) {
  return api<InstructorProfileRead>("/instructor/me/profile", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function uploadMyInstructorAvatar(file: File) {
  return uploadFile<UploadResponse>("/instructor/me/profile/avatar", file);
}

// ============= Courses =============

export function listMyCourses(params: {
  page?: number;
  size?: number;
  status?: PublishStatus | string;
  search?: string;
} = {}) {
  return api<Page<InstructorCourseRead>>(`/instructor/courses${qs(params)}`);
}

export function getMyCourse(courseId: string) {
  return api<InstructorCourseRead>(`/instructor/courses/${courseId}`);
}

export function createMyCourse(body: InstructorCourseCreate) {
  return api<InstructorCourseRead>("/instructor/courses", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateMyCourse(courseId: string, body: InstructorCourseUpdate) {
  return api<InstructorCourseRead>(`/instructor/courses/${courseId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteMyCourse(courseId: string) {
  return api<void>(`/instructor/courses/${courseId}`, { method: "DELETE" });
}

export function publishMyCourse(courseId: string) {
  return api<InstructorCourseRead>(`/instructor/courses/${courseId}/publish`, { method: "POST" });
}

export function unpublishMyCourse(courseId: string) {
  return api<InstructorCourseRead>(`/instructor/courses/${courseId}/unpublish`, { method: "POST" });
}

export function archiveMyCourse(courseId: string) {
  return api<InstructorCourseRead>(`/instructor/courses/${courseId}/archive`, { method: "POST" });
}

export function uploadCourseThumbnail(courseId: string, file: File) {
  return uploadFile<UploadResponse>(`/instructor/courses/${courseId}/thumbnail`, file);
}

export function uploadCoursePreviewVideo(courseId: string, file: File) {
  return uploadFile<UploadResponse>(`/instructor/courses/${courseId}/preview-video`, file);
}

// ============= Sections =============

export function listSections(courseId: string) {
  return api<SectionAdminRead[]>(`/instructor/courses/${courseId}/sections`);
}

export function createSection(courseId: string, body: SectionCreate) {
  return api<SectionAdminRead>(`/instructor/courses/${courseId}/sections`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function reorderSections(courseId: string, payload: ReorderPayload) {
  return api<SectionAdminRead[]>(`/instructor/courses/${courseId}/sections/reorder`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateSection(sectionId: string, body: SectionUpdate) {
  return api<SectionAdminRead>(`/instructor/sections/${sectionId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteSection(sectionId: string) {
  return api<void>(`/instructor/sections/${sectionId}`, { method: "DELETE" });
}

// ============= Lessons =============

export function listLessons(sectionId: string) {
  return api<LessonAdminRead[]>(`/instructor/sections/${sectionId}/lessons`);
}

export function createLesson(sectionId: string, body: LessonCreate) {
  return api<LessonAdminRead>(`/instructor/sections/${sectionId}/lessons`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function reorderLessons(sectionId: string, payload: ReorderPayload) {
  return api<LessonAdminRead[]>(`/instructor/sections/${sectionId}/lessons/reorder`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateLesson(lessonId: string, body: LessonUpdate) {
  return api<LessonAdminRead>(`/instructor/lessons/${lessonId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteLesson(lessonId: string) {
  return api<void>(`/instructor/lessons/${lessonId}`, { method: "DELETE" });
}

export function uploadLessonVideo(lessonId: string, file: File, durationSeconds?: number) {
  return uploadFile<LessonAdminRead>(
    `/instructor/lessons/${lessonId}/video`,
    file,
    durationSeconds ? { duration_seconds: String(durationSeconds) } : undefined
  );
}

/** Same as uploadLessonVideo but reports real upload progress via XHR. */
export function uploadLessonVideoWithProgress(
  lessonId: string,
  file: File,
  onProgress: (pct: number) => void,
  durationSeconds?: number
): Promise<LessonAdminRead> {
  const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append("file", file);
    if (durationSeconds) fd.append("duration_seconds", String(durationSeconds));

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE}/instructor/lessons/${lessonId}/video`);

    const token = getAccessToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try { resolve(JSON.parse(xhr.responseText) as LessonAdminRead); }
        catch { reject(new Error("Invalid response")); }
      } else {
        try {
          const body = JSON.parse(xhr.responseText);
          reject(new Error(body?.error?.message ?? `HTTP ${xhr.status}`));
        } catch {
          reject(new Error(`HTTP ${xhr.status}`));
        }
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(fd);
  });
}

export function uploadLessonResource(lessonId: string, file: File) {
  return uploadFile<LessonAdminRead>(`/instructor/lessons/${lessonId}/resource`, file);
}

// ============= Students of my courses =============

export function listCourseStudents(courseId: string, params: { page?: number; size?: number } = {}) {
  return api<Page<EnrolledStudentRead>>(
    `/instructor/courses/${courseId}/students${qs(params)}`
  );
}

// ============= Analytics =============

export function getCourseAnalytics(courseId: string) {
  return api<CourseAnalytics>(`/instructor/courses/${courseId}/analytics`);
}

// ============= Assessments =============

export function listCourseAssessments(courseId: string, params: { page?: number; size?: number } = {}) {
  return api<Page<AssessmentInstructorRead>>(
    `/instructor/courses/${courseId}/assessments${qs(params)}`
  );
}

export function createAssessment(courseId: string, body: AssessmentCreate) {
  return api<AssessmentInstructorRead>(`/instructor/courses/${courseId}/assessments`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getAssessment(assessmentId: string) {
  return api<AssessmentInstructorRead>(`/instructor/assessments/${assessmentId}`);
}

export function updateAssessment(assessmentId: string, body: AssessmentUpdate) {
  return api<AssessmentInstructorRead>(`/instructor/assessments/${assessmentId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteAssessment(assessmentId: string) {
  return api<void>(`/instructor/assessments/${assessmentId}`, { method: "DELETE" });
}

export function createQuestion(assessmentId: string, body: QuestionCreate) {
  return api<QuestionInstructorRead>(`/instructor/assessments/${assessmentId}/questions`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateQuestion(questionId: string, body: QuestionUpdate) {
  return api<QuestionInstructorRead>(`/instructor/questions/${questionId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteQuestion(questionId: string) {
  return api<void>(`/instructor/questions/${questionId}`, { method: "DELETE" });
}
