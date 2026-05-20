import { api } from "./client";
import type { CoursePreviewPlayback, LessonPlaybackResponse } from "./types";

export function mintLessonPlayback(lessonId: string) {
  return api<LessonPlaybackResponse>(`/lessons/${lessonId}/playback`);
}

export function mintCoursePreviewPlayback(slug: string) {
  return api<CoursePreviewPlayback>(`/courses/${slug}/preview-playback`);
}
