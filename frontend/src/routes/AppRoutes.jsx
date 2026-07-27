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
import BenefitsTracking from "../pages/Benefits/BenefitsTracking";
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
          {/* Stage 1: Dashboard (User / Admin) & Submit Idea Page */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/submit-idea" element={<SubmitIdea />} />
          {/* Stage 2: Initial Screening & Evaluation Page */}
          <Route path="/initial-screening" element={<InitialScreening />} />
          <Route path="/screening-evaluation/:id" element={<ScreeningEvaluation />} />
          {/* Stage 3: Feasibility Review (Technical, Functional, Business) */}
          <Route path="/feasibility-review" element={<FeasibilityReview />} />
          {/* Stage 4: Business Analysis */}
          <Route path="/business-analysis" element={<BusinessAnalysis />} />
          {/* Stage 6: Estimation & Budgeting */}
          <Route path="/estimation" element={<Estimation />} />
          {/* Stage 7: Projects Portfolio */}
          <Route path="/projects" element={<ProjectList />} />
          {/* Stage 8: Execution & Milestones */}
          <Route path="/execution" element={<Execution />} />
          {/* Stage 9: Progress Tracking */}
          <Route path="/progress-tracking" element={<ProgressTracking />} />
          {/* Stage 10: Benefits Tracking & ROI */}
          <Route path="/benefits-tracking" element={<BenefitsTracking />} />
          {/* Stage 11: Knowledge Base */}
          <Route path="/knowledge-base" element={<KnowledgeBase />} />
          {/* Stage 12: Reports & Analytics */}
          <Route path="/reports" element={<Dashboard />} />
          {/* Stage 13: Settings */}
          <Route path="/settings" element={<Settings />} />
        </Route>
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRoutes;