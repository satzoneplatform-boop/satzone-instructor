import { api } from "./client";
import type {
  PracticeItemInstructorRead,
  PracticeItemWrite,
  PracticePackInstructorRead,
  PracticePackUpdate,
  PracticeQuizCreate,
  PracticeQuizInstructorRead,
  PracticeQuizUpdate,
} from "./types";

export function getPracticePack(courseId: string) {
  return api<PracticePackInstructorRead>(`/instructor/courses/${courseId}/practice`);
}

export function updatePracticePack(courseId: string, body: PracticePackUpdate) {
  return api<PracticePackInstructorRead>(`/instructor/courses/${courseId}/practice`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function createPracticeQuiz(courseId: string, body: PracticeQuizCreate) {
  return api<PracticeQuizInstructorRead>(`/instructor/courses/${courseId}/practice/quizzes`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getPracticeQuiz(quizId: string) {
  return api<PracticeQuizInstructorRead>(`/instructor/practice/quizzes/${quizId}`);
}

export function updatePracticeQuiz(quizId: string, body: PracticeQuizUpdate) {
  return api<PracticeQuizInstructorRead>(`/instructor/practice/quizzes/${quizId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deletePracticeQuiz(quizId: string) {
  return api<void>(`/instructor/practice/quizzes/${quizId}`, { method: "DELETE" });
}

export function createPracticeItem(quizId: string, body: PracticeItemWrite) {
  return api<PracticeItemInstructorRead>(`/instructor/practice/quizzes/${quizId}/items`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updatePracticeItem(itemId: string, body: PracticeItemWrite) {
  return api<PracticeItemInstructorRead>(`/instructor/practice/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function deletePracticeItem(itemId: string) {
  return api<void>(`/instructor/practice/items/${itemId}`, { method: "DELETE" });
}
