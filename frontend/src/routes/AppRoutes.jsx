import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import MainLayout from "../layouts/MainLayout";

// Core Stage Components (Serial-wise Flow)
import Dashboard from "../pages/Dashboard/Dashboard";
import SubmitIdea from "../pages/Dashboard/SubmitIdea";
import InitialScreening from "../pages/InitialScreening/InitialScreening";
import ScreeningEvaluation from "../pages/InitialScreening/ScreeningEvaluation";
import FeasibilityReview from "../pages/Reviews/FeasibilityReview";
import BusinessAnalysis from "../pages/BusinessAnalysis/BusinessAnalysis";
import Estimation from "../pages/Estimation/Estimation";
import ProjectList from "../pages/Projects/ProjectList";
import Execution from "../pages/Execution/Execution";
import ProgressTracking from "../pages/Progress/ProgressTracking";
import QualityAssurance from "../pages/QualityAssurance/QualityAssurance";
import KnowledgeBase from "../pages/KnowledgeBase/KnowledgeBase";
import Settings from "../pages/Settings/Settings";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Authentication Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* Protected Enterprise SaaS Sequential Pipeline Routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Universal Stage 1 Routes (Accessible to All Authenticated Users) */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/submit-idea" element={<SubmitIdea />} />
          <Route path="/knowledge-base" element={<KnowledgeBase />} />
          <Route path="/reports" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />

          {/* Stage 2: Initial Screening & Evaluation Page (Admin & Reviewer) */}
          <Route
            path="/initial-screening"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Reviewer"]}>
                <InitialScreening />
              </ProtectedRoute>
            }
          />
          <Route
            path="/screening-evaluation/:id"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Reviewer"]}>
                <ScreeningEvaluation />
              </ProtectedRoute>
            }
          />

          {/* Stage 3 & 4: Feasibility Review & Business Analysis (Admin, Reviewer, Business Analyst) */}
          <Route
            path="/feasibility-review"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Reviewer", "Business Analyst"]}>
                <FeasibilityReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/business-analysis"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Reviewer", "Business Analyst"]}>
                <BusinessAnalysis />
              </ProtectedRoute>
            }
          />

          {/* Stage 6 to 10: Estimation, Projects, Execution, Tracking (Admin, Project Manager, Business Analyst) */}
          <Route
            path="/estimation"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Project Manager", "Business Analyst"]}>
                <Estimation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Project Manager", "Business Analyst"]}>
                <ProjectList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/execution"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Project Manager"]}>
                <Execution />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress-tracking"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Project Manager", "Business Analyst"]}>
                <ProgressTracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quality-assurance"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Project Manager", "Business Analyst"]}>
                <QualityAssurance />
              </ProtectedRoute>
            }
          />
        </Route>
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRoutes;