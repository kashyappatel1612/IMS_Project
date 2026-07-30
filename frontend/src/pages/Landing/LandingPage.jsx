import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  FolderKanban,
  TrendingUp,
  Award,
  Users,
  Layers,
  Zap,
  Lock,
  Cpu,
  Workflow,
  Briefcase,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Rocket,
  Filter,
  CheckSquare,
  Clock,
  Sparkles,
  HelpCircle,
  Building2
} from "lucide-react";
import "./LandingPage.css";
import imsLogo from "../../assets/ims-logo.jpg";

// 14-Stage Lifecycle Workflow Definition
const STAGES_14 = [
  { step: "01", name: "Idea Submission", desc: "Innovators submit proposal title, domain category, pain points & ROI.", icon: Lightbulb, role: "Innovator User", input: "Raw Proposal Data & Attachments", output: "Logged Proposal Entry (IDEA-ID)" },
  { step: "02", name: "Initial Screening", desc: "Criteria checklist verification & duplicity detection check.", icon: Filter, role: "Reviewer / PC", input: "5-Criteria Checklist", output: "Screening Qualified Badge" },
  { step: "03", name: "Business Review", desc: "Strategic alignment, market potential & business ROI evaluation.", icon: Briefcase, role: "Business Reviewer", input: "Strategic Fit & Financial Projections", output: "Business Feasibility Approved" },
  { step: "04", name: "Functional Review", desc: "User workflow, requirements clarity & operational fit check.", icon: Workflow, role: "Functional Reviewer (BA)", input: "Process Flows & Target Personas", output: "Functional Feasibility Approved" },
  { step: "05", name: "Technical Review", desc: "Architecture fit, cloud readiness, API & security assessment.", icon: Cpu, role: "Technical Architect", input: "Security & Tech Stack Fit", output: "Technical Feasibility Approved" },
  { step: "06", name: "Decision Committee", desc: "Three parallel gate recommendations consolidated for approval.", icon: ShieldCheck, role: "Project Coordinator", input: "3-Review Consensus Data", output: "Overall Feasibility Gate Sign-off" },
  { step: "07", name: "Business Analysis", desc: "Detailed BRD / FRD spec generation & User Story mapping.", icon: FileText, role: "Business Analyst", input: "Approved Feasibility Specs", output: "Formal BRD / FRD Specification" },
  { step: "08", name: "Effort Estimation", desc: "Story points, sprint timeline & budget utilization planning.", icon: BarChart3, role: "Lead Architect / PM", input: "Functional User Stories", output: "Cost & Effort Estimate Baseline" },
  { step: "09", name: "Project Creation", desc: "Formal project onboarding, team allocation & PM assignment.", icon: FolderKanban, role: "Project Coordinator", input: "Approved BRD & Estimate", output: "Active Enterprise Project (PRJ-ID)" },
  { step: "10", name: "Development & Sprints", desc: "Agile execution, backlog task tracking & developer velocity.", icon: CheckSquare, role: "Project Manager & Dev Team", input: "Sprint Backlog Items", output: "Completed Code Modules" },
  { step: "11", name: "Quality Assurance", desc: "Automated test suites, bug tracking & QA sign-off.", icon: ShieldCheck, role: "QA Engineer Lead", input: "Build Candidate & Test Cases", output: "QA Test Clearance Certificate" },
  { step: "12", name: "UAT Testing", desc: "User acceptance validation & stakeholder approval sign-off.", icon: Users, role: "Business Stakeholders", input: "Staging Deployment Build", output: "Formal UAT Approval Sign-off" },
  { step: "13", name: "Production Release", desc: "Automated deployment pipeline & release management.", icon: Rocket, role: "Release Manager & DevOps", input: "UAT Clearance Package", output: "Live Production Deployment" },
  { step: "14", name: "Benefits Tracking", desc: "Post-launch financial ROI realization & impact monitoring.", icon: Award, role: "Enterprise Steering Committee", input: "6-Month Post-Launch Metrics", output: "Realized Financial ROI & Audit Log" }
];

// Key Enterprise Features
const FEATURES_LIST = [
  {
    icon: Users,
    title: "Multi-Role Governance Studio",
    desc: "Dedicated workspaces tailored for Innovators, Reviewers, Project Coordinators, Business Analysts, PMs, and Admins."
  },
  {
    icon: Sparkles,
    title: "Automated Screening Engine",
    desc: "Validates proposal criteria, checks strategic alignment, and streamlines Stage 1 screening decisions."
  },
  {
    icon: ShieldCheck,
    title: "Three Parallel Feasibility Gate",
    desc: "Enforces strict consensus across Business, Functional, and Technical dimensions before project commitment."
  },
  {
    icon: FileText,
    title: "BRD / FRD Spec Generator",
    desc: "Transform approved ideas into detailed business requirements documents, functional specifications, and user stories."
  },
  {
    icon: FolderKanban,
    title: "Agile Delivery & Sprint PMO",
    desc: "Seamless transition from idea approval to project creation, sprint backlog planning, and developer velocity tracking."
  },
  {
    icon: TrendingUp,
    title: "Financial ROI & Benefits Tracking",
    desc: "Track projected versus realized cost savings, operational time reductions, and enterprise revenue growth."
  }
];

// FAQ Accordion Items
const FAQ_ITEMS = [
  {
    q: "What is Idea360?",
    a: "Idea360 is an enterprise-grade Innovation & Project Lifecycle Management platform that governs the complete flow of ideas—from initial submission and 3 parallel feasibility reviews to BRD analysis, estimation, project creation, and post-launch benefits tracking."
  },
  {
    q: "How does the Three Parallel Feasibility Review work?",
    a: "Every proposal undergoes 3 independent reviews simultaneously: Business Review (ROI & Strategy), Functional Review (User Workflows & Scope), and Technical Review (Architecture & Security). A proposal is approved ONLY when all 3 dimensions are approved."
  },
  {
    q: "Which roles are supported out-of-the-box?",
    a: "Idea360 provides 6 dedicated role interfaces: Innovator User, Domain Reviewer, Project Coordinator (PC), Business Analyst (BA), Project Manager (PM), and Administrator."
  },
  {
    q: "Can Idea360 integrate with existing enterprise toolchains?",
    a: "Yes! Idea360 provides RESTful API endpoints and PostgreSQL backend persistence designed to sync with JIRA, SAP ERP, Azure DevOps, and custom enterprise SSO platforms."
  }
];

function LandingPage() {
  const navigate = useNavigate();
  const [activeModuleTab, setActiveModuleTab] = useState("pc");
  const [openFaqIdx, setOpenFaqIdx] = useState(0);
  const [selectedStageIdx, setSelectedStageIdx] = useState(0);
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    if (!isRotating) return;
    const interval = setInterval(() => {
      setSelectedStageIdx((prev) => (prev + 1) % 14);
    }, 3000);
    return () => clearInterval(interval);
  }, [isRotating]);

  const handleGetStarted = () => {
    navigate("/register");
  };

  const handleSignIn = () => {
    navigate("/login");
  };

  return (
    <div className="landing-page-container">
      {/* Background Glow Orbs */}
      <div className="landing-glow-top"></div>
      <div className="landing-glow-bottom"></div>

      {/* TOP NAVIGATION BAR (CLEAN & COMPACT) */}
      <nav className="landing-navbar">
        <div className="landing-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <img src={imsLogo} alt="Idea360 Logo" className="landing-logo-img" />
          <span className="landing-brand-title">Idea360</span>
        </div>

        <div className="landing-nav-actions">
          <button className="landing-btn-login" onClick={handleSignIn}>
            Sign In
          </button>
          <button className="landing-btn-signup" onClick={handleGetStarted}>
            Get Started <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* HERO LIGHT SECTION */}
      <header className="landing-hero">
        <div className="hero-pill-tag">
          <Sparkles size={14} /> Enterprise SaaS 360° Innovation Governance Platform
        </div>

        <h1 className="hero-headline">
          Transform Enterprise Innovation Ideas <br />
          into <span>High-Impact Project Execution</span>
        </h1>

        <p className="hero-subheadline">
          Idea360 governs the complete innovation pipeline—from proposal submission and 3 parallel feasibility gates to BRD specifications, effort estimation, sprint execution, and benefits tracking.
        </p>

        <div className="hero-cta-group">
          <button className="hero-btn-primary" onClick={handleGetStarted}>
            Get Started <ArrowRight size={18} />
          </button>
          <button className="hero-btn-secondary" onClick={() => {
            const el = document.getElementById("workflow");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}>
            Explore 14-Stage Workflow
          </button>
        </div>

        {/* HERO INTERACTIVE LIGHT PREVIEW MOCKUP WITH GLASSMORPHISM CARDS */}
        <div className="hero-preview-wrapper">
          <div className="hero-preview-inner">
            <div className="preview-top-bar">
              <div className="preview-dot" style={{ background: "#ef4444" }}></div>
              <div className="preview-dot" style={{ background: "#f59e0b" }}></div>
              <div className="preview-dot" style={{ background: "#10b981" }}></div>
              <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "12px", fontFamily: "monospace" }}>
                idea360.enterprise.internal/dashboard
              </span>
            </div>

            <div style={{ padding: "24px", background: "#ffffff", textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <div style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>Project Coordinator Command Center</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>Enterprise Governance & Stage Gate Control</div>
                </div>
                <span style={{ background: "#e0e7ff", color: "#4338ca", fontSize: "11px", fontWeight: "800", padding: "4px 12px", borderRadius: "12px" }}>
                  ● Active Pipeline (14 Ideas)
                </span>
              </div>

              {/* Sample Table Preview */}
              <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1.2fr 1fr", gap: "10px", fontSize: "12px", fontWeight: "800", color: "#475569", paddingBottom: "8px", borderBottom: "1px solid #e2e8f0" }}>
                  <span>PROPOSAL TITLE</span>
                  <span>DOMAIN</span>
                  <span>PARALLEL REVIEW</span>
                  <span>STATUS</span>
                </div>

                {[
                  { title: "AI-Driven Automated Invoice Reconciliation", cat: "Finance", reviews: "Biz ✓ | Func ✓ | Tech ✓", status: "Feasibility Approved", bg: "#dcfce7", color: "#15803d" },
                  { title: "Smart Retail Inventory & Shelf Monitoring", cat: "Retail", reviews: "Biz ✓ | Func ✓ | Tech ✓", status: "BRD Spec Completed", bg: "#e0e7ff", color: "#4338ca" },
                  { title: "Automated Logistics Delivery Routing", cat: "Logistics", reviews: "Under Evaluation", status: "Parallel Review Active", bg: "#fef3c7", color: "#b45309" }
                ].map((row, idx) => (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1.2fr 1fr", gap: "10px", fontSize: "12px", padding: "10px 0", borderBottom: idx < 2 ? "1px solid #e2e8f0" : "none", alignItems: "center" }}>
                    <span style={{ fontWeight: "700", color: "#1e293b" }}>{row.title}</span>
                    <span style={{ color: "#4f46e5", fontWeight: "600" }}>{row.cat}</span>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>{row.reviews}</span>
                    <span>
                      <span style={{ background: row.bg, color: row.color, padding: "2px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "800" }}>
                        {row.status}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating Glassmorphism Widget 1 */}
          <div className="floating-glass-card" style={{ top: "-20px", left: "-30px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ background: "#22c55e", padding: "6px", borderRadius: "50%", color: "#fff" }}>
                <CheckCircle2 size={16} />
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: "800", color: "#1e293b" }}>Parallel Review Approved</div>
                <div style={{ fontSize: "10px", color: "#64748b" }}>All 3 Dimensions Passed</div>
              </div>
            </div>
          </div>

          {/* Floating Glassmorphism Widget 2 */}
          <div className="floating-glass-card" style={{ bottom: "-25px", right: "-30px", animationDelay: "2s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ background: "#4f46e5", padding: "6px", borderRadius: "50%", color: "#fff" }}>
                <TrendingUp size={16} />
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: "800", color: "#1e293b" }}>+$14.2M Projected ROI</div>
                <div style={{ fontSize: "10px", color: "#64748b" }}>Financial Value Realized</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 14-STAGE COMPLETE LIFECYCLE WORKFLOW SECTION - DYNAMIC RECTANGULAR STEP LOOP */}
      <section id="workflow" className="landing-section">
        <div className="section-header">
          <span className="section-tag">Sequential Pipeline Process</span>
          <h2 className="section-title">The 14-Stage Innovation Lifecycle Flow</h2>
          <p className="section-subtitle">
            Click any rectangular stage card below to inspect governance roles, inputs, milestone outputs, and progression.
          </p>
        </div>

        {/* 14 RECTANGULAR STEP CARDS GRID */}
        <div className="rect-steps-grid">
          {STAGES_14.map((stg, idx) => {
            const IconComp = stg.icon;
            const isActive = selectedStageIdx === idx;

            return (
              <div
                key={stg.step}
                onClick={() => {
                  setSelectedStageIdx(idx);
                  setIsRotating(false);
                }}
                className={`rect-step-card ${isActive ? "active" : ""}`}
              >
                <span className="rect-step-num">{stg.step}</span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                    <IconComp size={15} color={isActive ? "#4f46e5" : "#64748b"} />
                    <span className="rect-step-title">{stg.name}</span>
                  </div>
                  <p className="rect-step-desc">{stg.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ACTIVE STAGE DETAILS INSPECTOR CARD */}
        {(() => {
          const activeStg = STAGES_14[selectedStageIdx];
          const progressPercent = Math.round(((selectedStageIdx + 1) / 14) * 100);

          return (
            <div className="stage-inspector-card" style={{ maxWidth: "1200px", width: "100%" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <div className="stage-inspector-badge">
                    Stage {activeStg.step} of 14 ({progressPercent}% Lifecycle Progression)
                  </div>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={() => setIsRotating(!isRotating)}
                      style={{
                        background: isRotating ? "#eeeffe" : "#4f46e5",
                        border: "none",
                        color: isRotating ? "#4338ca" : "#ffffff",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "700",
                        cursor: "pointer"
                      }}
                    >
                      {isRotating ? "Pause Auto-Loop ⏸" : "Auto Loop ▶"}
                    </button>
                    <button
                      onClick={() => setSelectedStageIdx((prev) => (prev > 0 ? prev - 1 : 13))}
                      style={{
                        background: "#f1f5f9",
                        border: "none",
                        color: "#334155",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "700",
                        cursor: "pointer"
                      }}
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={() => setSelectedStageIdx((prev) => (prev < 13 ? prev + 1 : 0))}
                      style={{
                        background: "#f1f5f9",
                        border: "none",
                        color: "#334155",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "700",
                        cursor: "pointer"
                      }}
                    >
                      Next →
                    </button>
                  </div>
                </div>

                <h3 className="stage-inspector-title">{activeStg.name}</h3>
                <p className="stage-inspector-desc">{activeStg.desc}</p>
              </div>

              <div className="stage-meta-box">
                <div className="meta-item-row">
                  <span className="meta-label">Primary Responsible Role</span>
                  <span className="meta-val" style={{ color: "#4f46e5" }}>{activeStg.role}</span>
                </div>
                <div className="meta-item-row">
                  <span className="meta-label">Key Input</span>
                  <span className="meta-val">{activeStg.input}</span>
                </div>
                <div className="meta-item-row">
                  <span className="meta-label">Milestone Output</span>
                  <span className="meta-val" style={{ color: "#16a34a" }}>{activeStg.output}</span>
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* ANIMATED IMPACT STATISTICS */}
      <section id="stats" className="landing-section" style={{ paddingTop: 0 }}>
        <div className="stats-grid">
          <div>
            <div className="stat-num">500+</div>
            <div className="stat-label">Enterprise Ideas Governed</div>
          </div>
          <div>
            <div className="stat-num">99.4%</div>
            <div className="stat-label">Review SLA Compliance</div>
          </div>
          <div>
            <div className="stat-num">45%</div>
            <div className="stat-label">Faster Project Delivery</div>
          </div>
          <div>
            <div className="stat-num">$14.2M+</div>
            <div className="stat-label">Cumulative Cost Savings</div>
          </div>
        </div>
      </section>

      {/* ENTERPRISE FEATURES GRID */}
      <section id="features" className="landing-section">
        <div className="section-header">
          <span className="section-tag">Powerful Capabilities</span>
          <h2 className="section-title">Engineered for Enterprise Innovation Teams</h2>
          <p className="section-subtitle">
            Eliminate silos, manual spreadsheets, and review bottlenecks with built-in role governance and AI.
          </p>
        </div>

        <div className="features-grid">
          {FEATURES_LIST.map((feat, idx) => {
            const IconComp = feat.icon;
            return (
              <div key={idx} className="feature-card">
                <div className="feature-icon-box">
                  <IconComp size={24} />
                </div>
                <h3 className="feature-title">{feat.title}</h3>
                <p className="feature-desc">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* MODULE SHOWCASE TABS */}
      <section id="modules" className="landing-section">
        <div className="section-header">
          <span className="section-tag">Role-Based Workspaces</span>
          <h2 className="section-title">Tailored Command Centers for Every Role</h2>
          <p className="section-subtitle">
            Each role gets a customized studio with specific actions, status indicators, and governance tools.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "30px" }}>
          {[
            { id: "pc", label: "Project Coordinator Studio" },
            { id: "reviewer", label: "Feasibility Review Gate" },
            { id: "ba", label: "BA Requirements Studio" },
            { id: "pm", label: "Agile PM Control Center" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveModuleTab(tab.id)}
              style={{
                background: activeModuleTab === tab.id ? "#4f46e5" : "#ffffff",
                color: activeModuleTab === tab.id ? "#ffffff" : "#475569",
                border: activeModuleTab === tab.id ? "1.5px solid #4f46e5" : "1.5px solid #cbd5e1",
                padding: "10px 20px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: activeModuleTab === tab.id ? "0 4px 14px rgba(79,70,229,0.3)" : "none"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Display - Light Card */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "32px", boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}>
          {activeModuleTab === "pc" && (
            <div>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#1e293b", marginBottom: "8px" }}>Project Coordinator (PC) Studio</h3>
              <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>
                Governs the complete lifecycle queue, allocates domain experts (Reviewers, BAs, PMs), monitors SLA deadlines, and approves project creation.
              </p>
              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#334155", lineHeight: "1.8" }}>
                ✓ Single-click Reviewer & BA Allocation Modal <br />
                ✓ SLA Countdown Timers & Alert Triggers <br />
                ✓ Direct Project Onboarding & PM Transfer
              </div>
            </div>
          )}

          {activeModuleTab === "reviewer" && (
            <div>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#1e293b", marginBottom: "8px" }}>Three Parallel Feasibility Review Gate</h3>
              <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>
                Enables assigned domain experts to independently review proposals across Business, Functional, and Technical evaluation rubrics.
              </p>
              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#334155", lineHeight: "1.8" }}>
                ✓ Business Review (ROI, Market Demand, Strategic Alignment) <br />
                ✓ Functional Review (Requirements Clarity, User Persona, Operational Fit) <br />
                ✓ Technical Review (Architecture Fit, Security, Cloud Readiness, APIs)
              </div>
            </div>
          )}

          {activeModuleTab === "ba" && (
            <div>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#1e293b", marginBottom: "8px" }}>Business Analyst (BA) Requirements Studio</h3>
              <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>
                Transforms approved feasibility ideas into formal BRD & FRD specifications, user story maps, and technical handoff documents.
              </p>
              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#334155", lineHeight: "1.8" }}>
                ✓ Automated Spec Template Generator <br />
                ✓ User Story Backlog Mapper <br />
                ✓ PDF / Document Spec Upload & Handoff
              </div>
            </div>
          )}

          {activeModuleTab === "pm" && (
            <div>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#1e293b", marginBottom: "8px" }}>Agile Delivery & Project Manager (PM) Control Center</h3>
              <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>
                Manages active project onboarding, sprint planning, task backlog, developer velocity, QA sign-offs, and release deployment.
              </p>
              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#334155", lineHeight: "1.8" }}>
                ✓ Interactive 6-KPI Control Cards <br />
                ✓ Sprint Planning & Backlog Management <br />
                ✓ QA & Release Readiness Tracking
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="landing-section">
        <div className="section-header">
          <span className="section-tag">Questions & Answers</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">Everything you need to know about Idea360 governance platform.</p>
        </div>

        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "12px" }}>
          {FAQ_ITEMS.map((faq, idx) => {
            const isOpen = openFaqIdx === idx;
            return (
              <div
                key={idx}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
                }}
              >
                <div
                  onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                  style={{
                    padding: "18px 24px",
                    display: "flex",
                    justify: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    fontWeight: "800",
                    fontSize: "16px",
                    color: "#1e293b"
                  }}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={20} color="#4f46e5" /> : <ChevronDown size={20} color="#94a3b8" />}
                </div>

                {isOpen && (
                  <div style={{ padding: "0 24px 20px 24px", color: "#64748b", fontSize: "14px", lineHeight: "1.6" }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* BOTTOM CTA BANNER */}
      <section className="landing-section">
        <div className="cta-banner">
          <h2 className="cta-title">Ready to Streamline Enterprise Innovation?</h2>
          <p className="cta-desc">
            Join enterprise innovation teams accelerating project handover with Idea360.
          </p>
          <button className="hero-btn-primary" onClick={handleGetStarted} style={{ background: "#ffffff", color: "#4338ca" }}>
            Get Started <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-top">
          <div>
            <div className="landing-brand" style={{ marginBottom: "12px" }}>
              <img src={imsLogo} alt="Idea360 Logo" className="landing-logo-img" />
              <span className="landing-brand-title">Idea360</span>
            </div>
            <p style={{ maxWidth: "300px", fontSize: "13px", color: "#64748b" }}>
              Enterprise Innovation & Project Lifecycle Management Platform.
            </p>
          </div>

          <div style={{ display: "flex", gap: "60px" }}>
            <div>
              <div style={{ fontWeight: "700", color: "#1e293b", marginBottom: "12px" }}>Product</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                <a href="#workflow" style={{ color: "#64748b", textDecoration: "none" }}>Workflow</a>
                <a href="#features" style={{ color: "#64748b", textDecoration: "none" }}>Features</a>
                <a href="#modules" style={{ color: "#64748b", textDecoration: "none" }}>Modules</a>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: "700", color: "#1e293b", marginBottom: "12px" }}>Governance</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                <a href="#stats" style={{ color: "#64748b", textDecoration: "none" }}>Impact Metrics</a>
                <a href="#faq" style={{ color: "#64748b", textDecoration: "none" }}>FAQ</a>
                <span onClick={handleGetStarted} style={{ color: "#4f46e5", cursor: "pointer", fontWeight: "700" }}>Sign In</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Idea360 Inc. All rights reserved.</span>
          <span>Enterprise Innovation & Lifecycle PMO Platform</span>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
