import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/Toast";
// Auth flow
import { SignInPage } from "./pages/SignInPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { VerifyCodePage } from "./pages/VerifyCodePage";
import { GoogleCallback } from "./pages/GoogleCallback";

// App
import { DashboardPage } from "./pages/DashboardPage";
import { TeachersListPage } from "./pages/TeachersListPage";
import { TeacherFormPage } from "./pages/TeacherFormPage";
import { TeacherDetailPage } from "./pages/TeacherDetailPage";
import { StudentsListPage } from "./pages/StudentsListPage";
import { StudentFormPage } from "./pages/StudentFormPage";
import { StudentDetailPage } from "./pages/StudentDetailPage";
import { CoursesListPage } from "./pages/CoursesListPage";
import { CourseFormPage } from "./pages/CourseFormPage";
import { CourseDetailPage } from "./pages/CourseDetailPage";
import { TransactionsListPage } from "./pages/TransactionsListPage";
import { TransactionFormPage } from "./pages/TransactionFormPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { SettingsPage } from "./pages/SettingsPage";

// Status pages
import { GenericErrorPage, MaintenancePage, NotFoundPage } from "./pages/ErrorPages";
import { ContactsPage } from "./pages/ContactsPage";

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth (anonymous) */}
      <Route path="/sign-in" element={<AuthGate mode="anon"><SignInPage /></AuthGate>} />
      <Route path="/login" element={<Navigate to="/sign-in" replace />} />
      <Route path="/forgot-password" element={<AuthGate mode="anon"><ForgotPasswordPage /></AuthGate>} />
      <Route path="/reset-password" element={<AuthGate mode="anon"><ResetPasswordPage /></AuthGate>} />
      <Route path="/verify-code" element={<VerifyCodePage />} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />

      {/* Protected */}
      <Route path="/" element={<AuthGate mode="authed"><DashboardPage /></AuthGate>} />

      <Route path="/teachers" element={<AuthGate mode="authed"><TeachersListPage /></AuthGate>} />
      <Route path="/teachers/new" element={<AuthGate mode="authed"><TeacherFormPage mode="create" /></AuthGate>} />
      <Route path="/teachers/:id" element={<AuthGate mode="authed"><TeacherDetailPage /></AuthGate>} />
      <Route path="/teachers/:id/edit" element={<AuthGate mode="authed"><TeacherFormPage mode="edit" /></AuthGate>} />

      <Route path="/students" element={<AuthGate mode="authed"><StudentsListPage /></AuthGate>} />
      <Route path="/students/new" element={<AuthGate mode="authed"><StudentFormPage mode="create" /></AuthGate>} />
      <Route path="/students/:id" element={<AuthGate mode="authed"><StudentDetailPage /></AuthGate>} />
      <Route path="/students/:id/edit" element={<AuthGate mode="authed"><StudentFormPage mode="edit" /></AuthGate>} />

      <Route path="/courses" element={<AuthGate mode="authed"><CoursesListPage /></AuthGate>} />
      <Route path="/courses/new" element={<AuthGate mode="authed"><CourseFormPage mode="create" /></AuthGate>} />
      <Route path="/courses/:id" element={<AuthGate mode="authed"><CourseDetailPage /></AuthGate>} />
      <Route path="/courses/:id/edit" element={<AuthGate mode="authed"><CourseFormPage mode="edit" /></AuthGate>} />

      <Route path="/transactions" element={<AuthGate mode="authed"><TransactionsListPage /></AuthGate>} />
      <Route path="/transactions/new" element={<AuthGate mode="authed"><TransactionFormPage /></AuthGate>} />
      <Route path="/transactions/:id" element={<AuthGate mode="authed"><OrderDetailPage /></AuthGate>} />
      <Route path="/transactions/:id/edit" element={<AuthGate mode="authed"><TransactionFormPage prefill /></AuthGate>} />

      <Route path="/settings" element={<AuthGate mode="authed"><SettingsPage /></AuthGate>} />

      {/* Stubs for sidebar items that don't have detailed designs yet */}
      <Route path="/contacts" element={<AuthGate mode="authed"><ContactsPage /></AuthGate>} />

      {/* Status pages */}
      <Route path="/error" element={<AuthGate mode="authed"><GenericErrorPage /></AuthGate>} />
      <Route path="/maintenance" element={<MaintenancePage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<AuthGate mode="authed"><NotFoundPage /></AuthGate>} />
    </Routes>
  );
}

function AuthGate({ mode, children }: { mode: "anon" | "authed"; children: React.ReactNode }) {
  const { status, needsPhoneVerify } = useAuth();
  if (status === "loading") {
    return <div className="grid min-h-screen place-items-center text-slate-600">Loading…</div>;
  }
  if (mode === "authed" && status !== "authed") return <Navigate to="/sign-in" replace />;
  if (mode === "anon" && status === "authed") return <Navigate to="/" replace />;
  // Phone-verify gate: any authed route blocks on this; the verify page itself
  // is reachable via its own route (mounted outside this gate) so the user can
  // complete the flow.
  if (mode === "authed" && needsPhoneVerify) return <Navigate to="/verify-code" replace />;
  return <>{children}</>;
}
