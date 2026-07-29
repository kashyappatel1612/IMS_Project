import { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  FileText,
  Download,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  BarChart,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  FileCheck,
  Mail,
  Clock,
  Sparkles,
  ArrowRight,
  UserCheck,
  Plus
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";

// Standard Knowledge Base Data Sets
const CATEGORIES = [
  "All Articles",
  "Submission Guidelines",
  "Evaluation & Stage Gates",
  "ROI & Financial Templates",
  "Policies & IP Rules",
  "FAQs"
];

const ROLE_FILTERS = [
  "All Roles",
  "Business Analyst",
  "Reviewer",
  "Project Manager",
  "User",
  "Administrator"
];

const DEFAULT_ARTICLES = [
  {
    id: 1,
    title: "How to Quantify Expected Business Benefits & ROI",
    category: "ROI & Financial Templates",
    targetRoles: ["Business Analyst", "Project Manager", "User"],
    readTime: "5 min read",
    author: "Enterprise Innovation Office",
    updatedDate: "Jul 25, 2026",
    icon: TrendingUp,
    badgeColor: "#6366f1",
    summary: "Learn how to estimate cost reductions, time savings, and productivity gains for your innovation proposal.",
    content: `
### Overview
Quantifying business benefits is crucial for moving your idea through the Business Analysis and Estimation stages.

### Key Steps to Calculate ROI:
1. **Identify Baseline Metrics**: Determine current manual hours or annual operating costs.
2. **Estimate Improvement Percentage**: Predict efficiency gain (e.g., 30% reduction in processing time).
3. **Calculate Financial Return**:
   - *Time Saved = Hours Saved × Hourly Labor Rate × Employee Count*
   - *Annual ROI = (Total Annual Savings - Implementation Cost) / Implementation Cost × 100%*
4. **Non-Financial Benefits**: Include qualitative metrics such as User Experience, Employee Satisfaction, and Safety.

> **Tip**: Always consult your department's Business Analyst if you need help modeling complex ROI projections.
    `
  },
  {
    id: 2,
    title: "Writing a Winning Innovation Problem Statement",
    category: "Submission Guidelines",
    targetRoles: ["User", "Business Analyst"],
    readTime: "4 min read",
    author: "Program Management Office",
    updatedDate: "Jul 20, 2026",
    icon: FileText,
    badgeColor: "#059669",
    summary: "A step-by-step guide to framing a compelling problem statement and solution narrative.",
    content: `
### Crafting a Strong Problem Statement

A great proposal clearly answers three fundamental questions:
1. **What is the current pain point or bottleneck?**
2. **Who is impacted by this problem?**
3. **What is the proposed solution and how does it solve the problem?**

#### Example Structure:
- **Current State**: "Currently, manual attendance tracking takes 15 minutes per employee daily..."
- **Impact**: "...resulting in 500 hours of lost productivity per month across 10 departments."
- **Proposed Solution**: "Automating attendance via AI facial recognition will eliminate manual logging and integrate directly with HR payroll."
    `
  },
  {
    id: 3,
    title: "Understanding the 6-Stage Gate Evaluation Process",
    category: "Evaluation & Stage Gates",
    targetRoles: ["Reviewer", "Project Manager", "Business Analyst", "Administrator"],
    readTime: "6 min read",
    author: "Governance Committee",
    updatedDate: "Jul 18, 2026",
    icon: CheckCircle2,
    badgeColor: "#2563eb",
    summary: "Walkthrough of how ideas progress from initial submission to screening, feasibility, estimation, and execution.",
    content: `
### The Innovation Lifecycle Stages

1. **Stage 1: Idea Submission & Screening**: Submitted proposals are reviewed against organizational alignment and clarity.
2. **Stage 2: Feasibility & Technical Review**: Subject matter experts verify technical feasibility and resource requirements.
3. **Stage 3: Business Analysis & ROI**: Business Analysts calculate projected ROI and prepare detailed feasibility reports.
4. **Stage 4: Estimation & Budget Approval**: Finance and Engineering estimate project cost and schedule sprints.
5. **Stage 5: Project Execution & Sprints**: Approved projects transition to active development with milestones.
6. **Stage 6: Benefits Realization & Tracking**: Post-launch tracking measures actual vs projected ROI and user adoption.
    `
  },
  {
    id: 4,
    title: "Intellectual Property (IP) & Innovation Rewards Policy",
    category: "Policies & IP Rules",
    targetRoles: ["User", "Administrator", "Reviewer"],
    readTime: "7 min read",
    author: "Legal & People Operations",
    updatedDate: "Jul 10, 2026",
    icon: ShieldCheck,
    badgeColor: "#dc2626",
    summary: "Information on company IP ownership, employee recognition awards, and financial incentives for top ideas.",
    content: `
### Employee Innovation Recognition & IP

- **IP Rights**: Innovations developed using company resources or during employment remain the property of the organization.
- **Incentive Program**: Authors of implemented ideas receive:
  - **Level 1 (Implemented Project)**: Certificate of Innovation & Spot Bonus ($500).
  - **Level 2 (High-Impact ROI > $50K)**: Annual Innovation Award & 5% Shared Savings Incentive.
  - **Recognition**: Feature in the Quarterly Innovation Spotlight newsletter.
    `
  },
  {
    id: 5,
    title: "Business Feasibility & Market Validation Guidelines",
    category: "Evaluation & Stage Gates",
    targetRoles: ["Business Analyst", "Reviewer"],
    readTime: "5 min read",
    author: "Business Analysis Team",
    updatedDate: "Jul 05, 2026",
    icon: BarChart,
    badgeColor: "#d97706",
    summary: "Criteria used by Business Analysts when evaluating market readiness, user demand, and risk factors.",
    content: `
### Analyst Evaluation Framework

Business Analysts assess proposals using four core dimensions:
- **Technical Feasibility**: Is the technology stack compatible with existing enterprise architecture?
- **Operational Readiness**: Does the organization have the capability and change management capacity?
- **Risk Assessment**: Are there compliance, security, or data privacy risks?
- **Cost-Benefit Ratio**: Does the benefit justify the required capital investment?
    `
  },
  {
    id: 6,
    title: "Sprint Handoff & Agile Project Execution",
    category: "Submission Guidelines",
    targetRoles: ["Project Manager", "Business Analyst"],
    readTime: "4 min read",
    author: "Agile PMO",
    updatedDate: "Jun 28, 2026",
    icon: PlayCircle,
    badgeColor: "#7c3aed",
    summary: "How approved innovation proposals transition to engineering teams for agile sprint development.",
    content: `
### Transitioning to Execution

Once an idea receives Stage 4 Budget Approval:
1. A **Project Charter** is created automatically in the Projects module.
2. The author joins the kickoff sprint planning meeting as Product Champion.
3. Deliverables are broken into 2-week agile sprints with bi-weekly progress updates.
    `
  },
  {
    id: 7,
    title: "Reviewer Stage-1 Initial Screening Rubric",
    category: "Evaluation & Stage Gates",
    targetRoles: ["Reviewer", "Administrator"],
    readTime: "5 min read",
    author: "Review Board",
    updatedDate: "Jul 28, 2026",
    icon: ShieldCheck,
    badgeColor: "#0284c7",
    summary: "Official evaluation criteria for Reviewers to score novelty, strategic fit, and technical viability.",
    content: `
### Reviewer Screening Rubric

When evaluating new submissions, Reviewers score ideas on a 1-5 scale:
1. **Strategic Alignment**: Does it align with current quarterly business objectives?
2. **Impact & Scalability**: Can this solution be expanded across multiple departments?
3. **Clarity of Problem Statement**: Is the pain point defined with quantifiable evidence?
4. **Feasibility**: Can this be prototyped within 90 days?
    `
  }
];

const DOWNLOADABLE_TEMPLATES = [
  {
    id: 1,
    title: "Innovation Proposal Presentation Deck",
    targetRole: "User / Submitter",
    format: "PPTX",
    size: "1.4 MB",
    description: "Standard 5-slide pitch template for executive review meetings.",
    icon: FileText
  },
  {
    id: 2,
    title: "Financial Feasibility & ROI Calculator Spreadsheet",
    targetRole: "Business Analyst",
    format: "XLSX",
    size: "820 KB",
    description: "Excel model with pre-built formulas for NPV, IRR, and labor cost savings.",
    icon: FileSpreadsheet
  },
  {
    id: 3,
    title: "Initial Screening Checklist Rubric",
    targetRole: "Reviewer",
    format: "PDF",
    size: "450 KB",
    description: "Official evaluation checklist used by Stage 1 evaluators.",
    icon: FileCheck
  },
  {
    id: 4,
    title: "Agile Project Execution & WBS Template",
    targetRole: "Project Manager",
    format: "XLSX",
    size: "610 KB",
    description: "Work Breakdown Structure and sprint plan template for active projects.",
    icon: PlayCircle
  }
];

const FAQS = [
  {
    id: 1,
    question: "Who reviews my idea after I click Submit?",
    answer: "Your proposal is assigned to the Stage 1 Initial Screening Committee, consisting of Department Reviewers and Administrators. You can track evaluation status live on your Dashboard."
  },
  {
    id: 2,
    question: "How long does the Initial Screening stage take?",
    answer: "Initial screening reviews are completed within 3 to 5 business days. You will receive an automated notification once screening is finalized."
  },
  {
    id: 3,
    question: "Can I edit my idea after it has been submitted?",
    answer: "If evaluators request 'Information Requested', you can edit and resubmit your details. Once an idea moves to Stage 3 Business Analysis, updates must be submitted via your assigned Business Analyst."
  },
  {
    id: 4,
    question: "What rewards or recognition do I get if my idea is implemented?",
    answer: "Authors of implemented ideas receive official Innovation Certification, spot bonuses, performance review credits, and eligibility for the Annual Innovation Excellence Award."
  },
  {
    id: 5,
    question: "How are project costs and timelines estimated?",
    answer: "During Stage 4 (Estimation), Engineering Leads and Project Managers evaluate resource requirements, software licensing, and development hours to establish the project budget and timeline."
  }
];
function KnowledgeBase() {
  const [userRole, setUserRole] = useState("User");
  const [articles, setArticles] = useState(DEFAULT_ARTICLES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Articles");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("All Roles");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Admin Article Creation Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Submission Guidelines");
  const [newReadTime, setNewReadTime] = useState("5 min read");
  const [newSummary, setNewSummary] = useState("");
  const [newContent, setNewContent] = useState("");

  useEffect(() => {
    // Check logged in user role
    const savedUserStr = localStorage.getItem("currentUser");
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        if (u.role) setUserRole(u.role);
      } catch (e) {
        console.error(e);
      }
    }

    // Load any custom admin-published articles from localStorage
    try {
      const savedCustomStr = localStorage.getItem("idea360CustomArticles");
      if (savedCustomStr) {
        const customArticles = JSON.parse(savedCustomStr);
        if (Array.isArray(customArticles) && customArticles.length > 0) {
          setArticles([...customArticles, ...DEFAULT_ARTICLES]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Filtered Articles based on Search, Category & Role
  const filteredArticles = articles.filter((article) => {
    const matchesCategory =
      selectedCategory === "All Articles" || article.category === selectedCategory;
    const matchesRole =
      selectedRoleFilter === "All Roles" ||
      (article.targetRoles && article.targetRoles.includes(selectedRoleFilter));
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesRole && matchesSearch;
  });

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleDownloadTemplate = (templateName) => {
    alert(`Downloading template: "${templateName}"\nFile download will start automatically.`);
  };

  // Admin Handler: Publish New Knowledge Base Article
  const handlePublishArticle = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSummary.trim() || !newContent.trim()) {
      alert("Please fill in Title, Summary, and Article Body.");
      return;
    }

    const createdArticle = {
      id: Date.now(),
      title: newTitle,
      category: newCategory,
      readTime: newReadTime || "5 min read",
      author: "Administrator",
      updatedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      icon: BookOpen,
      badgeColor: "#6366f1",
      summary: newSummary,
      content: newContent
    };

    const existingCustom = JSON.parse(localStorage.getItem("idea360CustomArticles") || "[]");
    const updatedCustom = [createdArticle, ...existingCustom];
    localStorage.setItem("idea360CustomArticles", JSON.stringify(updatedCustom));

    setArticles([createdArticle, ...articles]);
    setIsAddModalOpen(false);

    // Reset Form
    setNewTitle("");
    setNewSummary("");
    setNewContent("");
    alert("New Knowledge Article published successfully!");
  };

  return (
    <div className="dashboard-wrapper">
      {/* Header Banner */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1>Innovation Knowledge Base & Policy Hub</h1>
            <span
              style={{
                background: "var(--primary-light)",
                color: "var(--primary)",
                padding: "4px 12px",
                borderRadius: "14px",
                fontSize: "12px",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              <BookOpen size={14} /> Resource Library
            </span>
          </div>
          <p>
            Access proposal templates, evaluation criteria, ROI calculation guides, and enterprise innovation guidelines.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {userRole === "Administrator" && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setIsAddModalOpen(true)}
            >
              Publish New Article
            </Button>
          )}

          <Button variant="outline" icon={Mail} onClick={() => alert("Innovation Helpdesk: innovation-support@enterprise.com")}>
            Contact Support
          </Button>
        </div>
      </div>

      {/* Live Search & Category Filter Pills */}
      <Card style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ position: "relative", width: "100%" }}>
            <Search
              size={18}
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
            />
            <input
              type="text"
              className="custom-input-elem"
              placeholder="Search knowledge articles, templates, ROI guides, or FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: "42px", height: "46px", fontSize: "14px" }}
            />
          </div>

          {/* Category Filter Pills */}
          <div>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "8px" }}>
              Filter By Topic:
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: "600",
                    border: selectedCategory === cat ? "1px solid var(--primary)" : "1px solid #e2e8f0",
                    background: selectedCategory === cat ? "var(--primary)" : "#ffffff",
                    color: selectedCategory === cat ? "#ffffff" : "#475569",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Role Target Filter Pills */}
          <div style={{ borderTop: "1px dashed #e2e8f0", paddingTop: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <UserCheck size={14} color="#6366f1" />
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Target Role Filter:
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {ROLE_FILTERS.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRoleFilter(role)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "16px",
                    fontSize: "12px",
                    fontWeight: "600",
                    border: selectedRoleFilter === role ? "1px solid #6366f1" : "1px solid #e2e8f0",
                    background: selectedRoleFilter === role ? "#eef2ff" : "#ffffff",
                    color: selectedRoleFilter === role ? "#4f46e5" : "#64748b",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  {role === userRole ? `🎯 ${role} (You)` : role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Featured Hero Guide */}
      {selectedCategory === "All Articles" && selectedRoleFilter === "All Roles" && !searchQuery && (
        <div
          style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
            color: "#ffffff",
            borderRadius: "16px",
            padding: "28px",
            marginBottom: "28px",
            boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.3)",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "700" }}>
              ⭐ Featured Guide
            </span>
            <span style={{ fontSize: "12px", opacity: 0.9 }}>5 min read • Updated July 2026</span>
          </div>

          <h2 style={{ fontSize: "22px", fontWeight: "800", margin: 0, color: "#ffffff" }}>
            Mastering the Perfect Proposal: How to Get Your Idea Approved in 5 Steps
          </h2>

          <p style={{ fontSize: "14px", opacity: 0.95, margin: 0, maxWidth: "800px", lineHeight: "1.5" }}>
            Learn the exact structure and financial ROI formatting that top innovation authors use to pass Initial Screening and secure engineering budget.
          </p>

          <div style={{ marginTop: "8px" }}>
            <Button
              type="button"
              variant="secondary"
              icon={ArrowRight}
              onClick={() => setSelectedArticle(articles[0])}
              style={{ background: "#ffffff", color: "#4f46e5", fontWeight: "700" }}
            >
              Read Full Featured Guide
            </Button>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>
            {selectedCategory} {selectedRoleFilter !== "All Roles" && `• For ${selectedRoleFilter}`} ({filteredArticles.length})
          </h3>
        </div>

        {filteredArticles.length === 0 ? (
          <Card style={{ textAlign: "center", padding: "40px 20px" }}>
            <BookOpen size={36} color="#94a3b8" style={{ marginBottom: "12px" }} />
            <h4 style={{ margin: "0 0 6px 0", color: "#334155" }}>No matching articles found</h4>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
              Try adjusting your search terms or filter selection.
            </p>
          </Card>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
            {filteredArticles.map((art) => {
              const IconComp = art.icon || BookOpen;
              const isRecommendedForUser = art.targetRoles && art.targetRoles.includes(userRole);

              return (
                <div
                  key={art.id}
                  onClick={() => setSelectedArticle(art)}
                  style={{
                    background: "#ffffff",
                    borderRadius: "12px",
                    border: isRecommendedForUser ? "1.5px solid #6366f1" : "1px solid #e2e8f0",
                    padding: "20px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    justify: "space-between",
                    boxShadow: isRecommendedForUser ? "0 4px 12px rgba(99, 102, 241, 0.08)" : "0 2px 4px rgba(0,0,0,0.02)"
                  }}
                  className="knowledge-card-hover"
                >
                  <div>
                    {isRecommendedForUser && (
                      <div style={{ marginBottom: "8px" }}>
                        <span style={{ background: "#e0e7ff", color: "#4338ca", fontSize: "10px", fontWeight: "800", padding: "2px 8px", borderRadius: "6px" }}>
                          ⭐ Recommended for {userRole}
                        </span>
                      </div>
                    )}

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                      <span
                        style={{
                          background: `${art.badgeColor || '#6366f1'}15`,
                          color: art.badgeColor || '#6366f1',
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "3px 10px",
                          borderRadius: "10px"
                        }}
                      >
                        {art.category}
                      </span>
                      <div style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}>
                        <Clock size={13} /> {art.readTime}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "12px", marginBottom: "10px" }}>
                      <div
                        style={{
                          background: `${art.badgeColor || '#6366f1'}10`,
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justify: "center",
                          color: art.badgeColor || '#6366f1',
                          flexShrink: 0
                        }}
                      >
                        <IconComp size={20} />
                      </div>
                      <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#1e293b", lineHeight: "1.4" }}>
                        {art.title}
                      </h4>
                    </div>

                    <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0", lineHeight: "1.5" }}>
                      {art.summary}
                    </p>
                  </div>

                  <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", color: "#64748b" }}>
                    <span>By {art.author}</span>
                    <span style={{ color: "var(--primary)", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      Read Article <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Downloadable Proposal & Financial Templates */}
      <Card style={{ marginBottom: "32px" }} title="Downloadable Templates & Tools" subtitle="Official forms, Excel models, and presentation decks">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px", marginTop: "12px" }}>
          {DOWNLOADABLE_TEMPLATES.map((tmpl) => {
            const IconComp = tmpl.icon;
            return (
              <div
                key={tmpl.id}
                style={{
                  background: "#f8fafc",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justify: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <div style={{ background: "var(--primary-light)", color: "var(--primary)", padding: "6px", borderRadius: "6px" }}>
                      <IconComp size={20} />
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: "800", background: "#e2e8f0", color: "#334155", padding: "2px 8px", borderRadius: "6px" }}>
                      {tmpl.format} • {tmpl.size}
                    </span>
                  </div>

                  <h5 style={{ margin: "0 0 6px 0", fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>
                    {tmpl.title}
                  </h5>

                  <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 14px 0", lineHeight: "1.4" }}>
                    {tmpl.description}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={Download}
                  onClick={() => handleDownloadTemplate(tmpl.title)}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Download File
                </Button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Frequently Asked Questions (FAQ Accordion) */}
      <Card style={{ marginBottom: "32px" }} title="Frequently Asked Questions (FAQs)" subtitle="Common inquiries about proposal screening and review procedures">
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
          {FAQS.map((faq) => {
            const isExpanded = expandedFaq === faq.id;
            return (
              <div
                key={faq.id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  overflow: "hidden",
                  background: "#ffffff"
                }}
              >
                <div
                  onClick={() => toggleFaq(faq.id)}
                  style={{
                    padding: "16px 20px",
                    background: isExpanded ? "#f8fafc" : "#ffffff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justify: "space-between",
                    userSelect: "none"
                  }}
                >
                  <span style={{ fontWeight: "700", fontSize: "14px", color: "#1e293b", display: "flex", alignItems: "center", gap: "10px" }}>
                    <HelpCircle size={16} color="var(--primary)" /> {faq.question}
                  </span>
                  {isExpanded ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
                </div>

                {isExpanded && (
                  <div style={{ padding: "16px 20px 20px 46px", borderTop: "1px solid #f1f5f9", background: "#f8fafc", fontSize: "13px", color: "#475569", lineHeight: "1.6" }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Article Reader Modal */}
      {selectedArticle && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedArticle(null)}
          title={selectedArticle.title}
        >
          <div style={{ padding: "10px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <span
                style={{
                  background: `${selectedArticle.badgeColor || '#6366f1'}15`,
                  color: selectedArticle.badgeColor || '#6366f1',
                  fontSize: "12px",
                  fontWeight: "700",
                  padding: "4px 12px",
                  borderRadius: "12px"
                }}
              >
                {selectedArticle.category}
              </span>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Published by {selectedArticle.author} • {selectedArticle.readTime}
              </span>
            </div>

            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", borderLeft: "4px solid var(--primary)", marginBottom: "20px" }}>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#334155" }}>
                {selectedArticle.summary}
              </p>
            </div>

            <div style={{ fontSize: "14px", color: "#334155", lineHeight: "1.7", whiteSpace: "pre-line" }}>
              {selectedArticle.content}
            </div>

            <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <Button variant="outline" onClick={() => setSelectedArticle(null)}>
                Close Article
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Admin Publish Article Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
          title="Publish New Knowledge Article (Admin)"
        >
          <form onSubmit={handlePublishArticle} style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "10px 0" }}>
            <div className="input-field-group">
              <label className="input-label">Article Title <span style={{ color: "var(--danger)" }}>*</span></label>
              <input
                type="text"
                className="custom-input-elem"
                placeholder="e.g. Employee Innovation Bounty Program 2026"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="input-field-group">
                <label className="input-label">Category</label>
                <select
                  className="custom-input-elem"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  <option value="Submission Guidelines">Submission Guidelines</option>
                  <option value="Evaluation & Stage Gates">Evaluation & Stage Gates</option>
                  <option value="ROI & Financial Templates">ROI & Financial Templates</option>
                  <option value="Policies & IP Rules">Policies & IP Rules</option>
                  <option value="FAQs">FAQs</option>
                </select>
              </div>

              <div className="input-field-group">
                <label className="input-label">Estimated Read Time</label>
                <input
                  type="text"
                  className="custom-input-elem"
                  placeholder="e.g. 4 min read"
                  value={newReadTime}
                  onChange={(e) => setNewReadTime(e.target.value)}
                />
              </div>
            </div>

            <div className="input-field-group">
              <label className="input-label">Summary / Overview <span style={{ color: "var(--danger)" }}>*</span></label>
              <textarea
                className="custom-input-elem"
                rows={2}
                placeholder="Brief 1-2 sentence overview shown on the card preview..."
                value={newSummary}
                onChange={(e) => setNewSummary(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="input-field-group">
              <label className="input-label">Article Body / Full Content <span style={{ color: "var(--danger)" }}>*</span></label>
              <textarea
                className="custom-input-elem"
                rows={6}
                placeholder="Full article content, guidelines, and step-by-step instructions..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                required
              ></textarea>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={Plus}>
                Publish Article
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default KnowledgeBase;
