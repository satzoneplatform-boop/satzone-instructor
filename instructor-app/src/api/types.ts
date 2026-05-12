// Hand-rolled minimal types matching the subset of /api/v1 we consume.
// Regenerate with `npx openapi-typescript ../satzone/postman/openapi.json -o src/api/types.gen.ts` when needed.

export type UserRole = "user" | "instructor" | "admin";

export type UserMe = {
  id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  is_phone_verified: boolean;
  email_verified_at: string | null;
  phone_verified_at: string | null;
  onboarding_completed_at: string | null;
  last_login_at: string | null;
  created_at: string;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
};

export type PublishStatus = "draft" | "published" | "archived";
export type CourseLevel = "beginner" | "intermediate" | "advanced" | "all_levels";

export type InstructorCourseRead = {
  id: string;
  slug: string;
  title: string;
  thumbnail_url: string | null;
  category_id: string;
  instructor_id: string;
  level: CourseLevel;
  language: string;
  duration_minutes: number;
  lectures_count: number;
  price_cents: number;
  discount_price_cents: number | null;
  currency: string;
  status: PublishStatus;
};

export type CourseAnalytics = {
  course_id: string;
  enrollments_count: number;
  completions_count: number;
  average_progress_percent: number;
  average_rating: number;
  ratings_count: number;
  revenue_cents: number;
};

export type OrderStatus = "pending" | "paid" | "cancelled" | "refunded" | "failed";
export type OrderItemKind = "course" | "program";
export type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "other";
export type PaymentProvider = "stripe" | "payme" | "paypal";

export type OrderRead = {
  id: string;
  item_kind: OrderItemKind;
  course_id: string | null;
  program_id: string | null;
  amount_cents: number;
  currency: string;
  status: OrderStatus;
  provider: PaymentProvider | null;
  paid_at: string | null;
  cancelled_at: string | null;
  created_at: string;
};

// Admin: instructors
export type AdminInstructorRead = {
  id: string;
  user_id: string | null;
  slug: string;
  name: string;
  title: string | null;
  bio: string | null;
  avatar_url: string | null;
  expertise: string[] | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  rating_avg: number | string;
  students_count: number;
  courses_count: number;
  created_at: string;
};

export type AdminInstructorCreate = {
  name: string;
  title?: string;
  bio?: string;
  expertise?: string[];
  avatar_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  website_url?: string;
  user_id?: string;
};

export type AdminInstructorUpdate = Partial<AdminInstructorCreate>;

// Notification preferences
export type NotificationPreference = {
  email_marketing: boolean;
  email_announcements: boolean;
  email_course_updates: boolean;
  push_enabled: boolean;
};

export type NotificationPreferenceUpdate = Partial<NotificationPreference>;

// Onboarding
export type OnboardingRead = {
  profile: {
    headline?: string | null;
    bio?: string | null;
    skill_level?: string | null;
    weekly_goal_minutes?: number;
    learning_goal?: string | null;
    locale?: string;
    timezone?: string | null;
  } | null;
  interests: CategoryRead[];
  onboarding_completed: boolean;
};

export type OnboardingUpdate = {
  headline?: string;
  bio?: string;
  skill_level?: "beginner" | "intermediate" | "advanced";
  weekly_goal_minutes?: number;
  learning_goal?: string;
  locale?: string;
  timezone?: string;
  interest_category_ids?: string[];
  mark_completed?: boolean;
};

// Admin: users
export type AdminUserRead = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  email_verified_at: string | null;
  last_login_at: string | null;
  onboarding_completed_at: string | null;
  google_sub: string | null;
  created_at: string;
};

export type AdminUserUpdate = {
  full_name?: string;
  avatar_url?: string;
  role?: UserRole;
  is_active?: boolean;
  is_verified?: boolean;
};

export type CategoryRead = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  parent_id: string | null;
  sort_order: number;
};

export type InstructorSummary = {
  id: string;
  slug: string;
  name: string;
  title: string | null;
  avatar_url: string | null;
  rating_avg: number | string;
  students_count: number;
  courses_count: number;
};

export type AdminCourseRead = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  thumbnail_url: string | null;
  level: CourseLevel;
  language: string;
  duration_minutes: number;
  lectures_count: number;
  price_cents: number;
  discount_price_cents: number | null;
  currency: string;
  rating_avg: number | string;
  ratings_count: number;
  enrollments_count: number;
  is_featured: boolean;
  instructor: InstructorSummary | null;
  category: CategoryRead | null;
  description: string | null;
  status: PublishStatus;
  published_at: string | null;
  created_at: string;
  is_free?: boolean;
};

export type AdminCourseUpdate = {
  title?: string;
  subtitle?: string;
  description?: string;
  category_id?: string;
  instructor_id?: string;
  level?: CourseLevel;
  language?: string;
  price_cents?: number;
  discount_price_cents?: number;
  currency?: string;
  is_featured?: boolean;
};

export type LessonType = "video" | "article" | "quiz" | "resource";

export type LessonSummary = {
  id: string;
  title: string;
  type: LessonType;
  duration_seconds: number;
  order: number;
  is_free_preview: boolean;
};

export type SectionRead = {
  id: string;
  title: string;
  order: number;
  lessons: LessonSummary[];
};

export type CurriculumRead = {
  sections: SectionRead[];
  total_duration_seconds: number;
  total_lessons: number;
};

export type AdminEnrollmentRead = {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at: string | null;
  progress_percent: number;
  last_accessed_at: string | null;
  course: {
    id: string;
    slug: string;
    title: string;
    thumbnail_url: string | null;
    level: CourseLevel;
    price_cents: number;
    discount_price_cents: number | null;
    currency: string;
    status: PublishStatus;
  } | null;
};
