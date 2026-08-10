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
import ReviewHistory from "../pages/Reviews/ReviewHistory";
import ReviewerAllocationStudio from "../pages/Reviews/ReviewerAllocationStudio";
import UserManagementStudio from "../pages/Users/UserManagementStudio";
import BusinessAnalysis from "../pages/BusinessAnalysis/BusinessAnalysis";
import SubmittedAnalysisReports from "../pages/BusinessAnalysis/SubmittedAnalysisReports";
import BrdFrdStudio from "../pages/BusinessAnalysis/BrdFrdStudio";
import UserStoriesStudio from "../pages/BusinessAnalysis/UserStoriesStudio";
import DocumentsStudio from "../pages/BusinessAnalysis/DocumentsStudio";
import Estimation from "../pages/Estimation/Estimation";
import ProjectList from "../pages/Projects/ProjectList";
import SprintPlanningStudio from "../pages/Projects/SprintPlanningStudio";
import TaskManagementStudio from "../pages/Projects/TaskManagementStudio";
import ReleaseManagementStudio from "../pages/Projects/ReleaseManagementStudio";
import Execution from "../pages/Execution/Execution";
import ProgressTracking from "../pages/Progress/ProgressTracking";
import QualityAssurance from "../pages/QualityAssurance/QualityAssurance";
import BenefitsTracking from "../pages/Benefits/BenefitsTracking";
import KnowledgeBase from "../pages/KnowledgeBase/KnowledgeBase";
import Settings from "../pages/Settings/Settings";
import NotificationsPage from "../pages/Notifications/NotificationsPage";
import ReportsPage from "../pages/Reports/ReportsPage";

import LandingPage from "../pages/Landing/LandingPage";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public SaaS Showcase & Authentication Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
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
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/review-history" element={<ReviewHistory />} />
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* Stage 2: Initial Screening & Evaluation Page */}
          <Route
            path="/initial-screening"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Reviewer", "Project Coordinator"]}>
                <InitialScreening />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviewer-allocation"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Project Coordinator"]}>
                <ReviewerAllocationStudio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-management"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Project Coordinator"]}>
                <UserManagementStudio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/screening-evaluation/:id"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Reviewer", "Project Coordinator"]}>
                <ScreeningEvaluation />
              </ProtectedRoute>
            }
          />

          {/* Stage 3 & 4: Feasibility Review & Business Analysis */}
          <Route
            path="/feasibility-review"
            element={
              <ProtectedRoute allowedRoles={["Reviewer"]}>
                <FeasibilityReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/business-analysis"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Reviewer", "Business Analyst", "Project Manager", "Project Coordinator"]}>
                <BusinessAnalysis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis-reports"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Business Analyst", "Project Coordinator"]}>
                <SubmittedAnalysisReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/brd-frd"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Business Analyst", "Project Coordinator"]}>
                <BrdFrdStudio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-stories"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Business Analyst", "Project Coordinator"]}>
                <UserStoriesStudio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Business Analyst", "Project Coordinator"]}>
                <DocumentsStudio />
              </ProtectedRoute>
            }
          />

          {/* Stage 6 to 10: Estimation, Projects, Execution, Tracking */}
          <Route
            path="/estimation"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Project Manager", "Business Analyst", "Project Coordinator"]}>
                <Estimation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Project Manager", "Business Analyst", "Project Coordinator"]}>
                <ProjectList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sprint-planning"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Project Manager", "Project Coordinator"]}>
                <SprintPlanningStudio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/task-management"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Project Manager", "Project Coordinator"]}>
                <TaskManagementStudio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/release-management"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Project Manager", "Project Coordinator"]}>
                <ReleaseManagementStudio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/execution"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Project Manager", "Project Coordinator"]}>
                <Execution />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress-tracking"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Project Manager", "Business Analyst", "Project Coordinator"]}>
                <ProgressTracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quality-assurance"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Project Manager", "Business Analyst", "Project Coordinator"]}>
                <QualityAssurance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/benefits-tracking"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Project Manager", "Business Analyst", "Project Coordinator"]}>
                <BenefitsTracking />
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