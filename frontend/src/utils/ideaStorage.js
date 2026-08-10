/**
 * Shared Data Store Syncing with FastAPI + PostgreSQL Backend
 * Includes localStorage fallback.
 */
import { apiClient } from "../services/api";
import { createNotification } from "./notificationStorage";

export const SAMPLE_INITIAL_IDEAS = [
  {
    id: 101,
    title: "AI-Driven Automated Customer Support Bot",
    category: "E-Commerce",
    functionalArea: "Customer Operations",
    targetUser: "Support Agents & Online Shoppers",
    author: "Rohan Verma",
    authorEmail: "rohan.verma@imsgroup.com",
    problemStatement: "Customer support teams spend 60% of their day answering repetitive order tracking and return query calls.",
    description: "Implement a conversational AI chatbot integrated with ERP for instant order lookup and automated return processing.",
    proposedSolution: "NLP chatbot using LLM embeddings to handle 70% of tier-1 customer inquiries automatically.",
    expectedBenefits: "Reduces response time from 15 mins to 5 secs. Projected cost savings of $45,000 annually.",
    status: "Pending PM Approval",
    assignedReviewer: "Expert Reviewer (reviewer@imsgroup.com)",
    assignedBA: "Business Analyst Lead (ba@imsgroup.com)",
    assignedPM: "Project Manager Lead (pm@imsgroup.com)",
    date: "Aug 05, 2026"
  },
  {
    id: 102,
    title: "Smart Inventory & Demand Forecasting Engine",
    category: "Retail",
    functionalArea: "Supply Chain",
    targetUser: "Store Managers & Inventory Planners",
    author: "Sneha Reddy",
    authorEmail: "sneha.reddy@imsgroup.com",
    problemStatement: "Retail stores experience 12% stockouts during seasonal sales due to manual inventory re-ordering.",
    description: "Machine learning prediction model that forecasts SKU demand per store location.",
    proposedSolution: "Automated replenishment system integrated with POS.",
    expectedBenefits: "Minimizes stockouts by 40% and improves inventory turnover.",
    status: "Pending Review",
    assignedReviewer: "Expert Reviewer (reviewer@imsgroup.com)",
    assignedBA: "Business Analyst Lead (ba@imsgroup.com)",
    assignedPM: "Project Manager Lead (pm@imsgroup.com)",
    date: "Aug 06, 2026"
  }
];

export function getSubmittedIdeas() {
  try {
    const existing = localStorage.getItem("idea360SubmittedIdeas");
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((item) => item && item.id !== undefined && item.id !== null);
        }
      } catch (e) {
        // Fallback to sample
      }
    }
    localStorage.setItem("idea360SubmittedIdeas", JSON.stringify(SAMPLE_INITIAL_IDEAS));
    return SAMPLE_INITIAL_IDEAS;
  } catch (err) {
    console.error("Error reading submitted ideas", err);
    return SAMPLE_INITIAL_IDEAS;
  }
}

export async function fetchIdeasFromApi() {
  const localIdeas = getSubmittedIdeas();
  try {
    const res = await apiClient.get("/ideas");
    if (res.data && Array.isArray(res.data)) {
      const dbIds = new Set(res.data.map((i) => String(i.id)));
      const merged = res.data.map((bIdea) => {
        const localMatch = localIdeas.find((l) => String(l.id) === String(bIdea.id));
        if (localMatch) {
          const isLocalStatusNewer = localMatch.status && localMatch.status !== "Pending PC Allocation" && (bIdea.status === "Pending PC Allocation" || bIdea.status === "Pending Review");
          return {
            ...bIdea,
            status: isLocalStatusNewer ? localMatch.status : (bIdea.status || localMatch.status),
            evaluatorNotes: bIdea.evaluatorNotes || localMatch.evaluatorNotes || "",
            assignedReviewer: localMatch.assignedReviewer || bIdea.assignedReviewer || "",
            assignedBA: localMatch.assignedBA || bIdea.assignedBA || "",
            assignedPM: localMatch.assignedPM || bIdea.assignedPM || "",
            reviewerDeadline: localMatch.reviewerDeadline || bIdea.reviewerDeadline || "",
            baDeadline: localMatch.baDeadline || bIdea.baDeadline || "",
            pmDeadline: localMatch.pmDeadline || bIdea.pmDeadline || "",
            coordinatorNotes: localMatch.coordinatorNotes || bIdea.coordinatorNotes || ""
          };
        }
        return bIdea;
      });

      const extraLocal = localIdeas.filter((l) => !dbIds.has(String(l.id)));
      const finalMerged = [...merged, ...extraLocal];
      localStorage.setItem("idea360SubmittedIdeas", JSON.stringify(finalMerged));
      return finalMerged;
    }
  } catch (err) {
    console.warn("Backend API notice, fallback to local cache:", err.message);
  }
  return localIdeas;
}

export async function saveNewIdea(newIdea) {
  const currentList = getSubmittedIdeas();
  const tempId = Date.now();

  const payload = {
    id: tempId,
    title: newIdea.title,
    category: newIdea.category,
    functionalArea: newIdea.functionalArea || "",
    targetUser: newIdea.targetUser || "",
    author: newIdea.author || "User",
    authorEmail: newIdea.authorEmail || "",
    problemStatement: newIdea.problemStatement || "",
    description: newIdea.description || "",
    proposedSolution: newIdea.proposedSolution || "",
    expectedBenefits: newIdea.expectedBenefits || "",
    expectedOutcome: newIdea.expectedBenefits || newIdea.expectedOutcome || "",
    attachment: newIdea.attachment || null,
    status: "Pending PC Allocation",
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  };

  let finalSavedIdea = payload;

  try {
    const res = await apiClient.post("/ideas", payload);
    if (res.data && res.data.idea) {
      finalSavedIdea = res.data.idea;
    }
  } catch (err) {
    console.error("Database Save Error, fallback to local storage:", err);
  }

  const updatedList = [finalSavedIdea, ...currentList.filter((item) => String(item.id) !== String(finalSavedIdea.id))];
  localStorage.setItem("idea360SubmittedIdeas", JSON.stringify(updatedList));

  return finalSavedIdea;
}

export function getIdeaById(id) {
  const ideas = getSubmittedIdeas();
  return ideas.find((i) => String(i.id) === String(id)) || null;
}

export function updateIdeaStatus(id, newStatus, evaluatorNotes = "", fullIdeaObj = null) {
  let currentList = getSubmittedIdeas();
  let targetIdea = currentList.find((i) => String(i.id) === String(id));

  if (!targetIdea && fullIdeaObj) {
    targetIdea = { ...fullIdeaObj, status: newStatus, evaluatorNotes: evaluatorNotes || fullIdeaObj.evaluatorNotes };
    currentList = [targetIdea, ...currentList];
  } else if (!targetIdea) {
    targetIdea = { id: id, title: `IDEA-${id}`, status: newStatus, evaluatorNotes };
    currentList = [targetIdea, ...currentList];
  }

  const updatedList = currentList.map((idea) =>
    String(idea.id) === String(id)
      ? { ...idea, status: newStatus, evaluatorNotes: evaluatorNotes || idea.evaluatorNotes }
      : idea
  );

  localStorage.setItem("idea360SubmittedIdeas", JSON.stringify(updatedList));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("ideaStatusChanged", { detail: { id, newStatus } }));
  }

  // Sync Status Update to FastAPI Backend Async
  apiClient.patch(`/ideas/${id}/status`, { status: newStatus, evaluatorNotes }).catch((err) => {
    console.warn("Backend status sync notice:", err.message);
  });

  const ideaTitle = targetIdea ? targetIdea.title : `IDEA-${id}`;

  // Broadcast Stage Progression Notification to Project Coordinator & Administrator
  createNotification({
    recipientRole: "Project Coordinator",
    title: `✅ Stage Update: ${ideaTitle}`,
    message: `Proposal "${ideaTitle}" passed to stage status: "${newStatus}". Notes: ${evaluatorNotes || "N/A"}.`,
    ideaId: id,
    type: "stage_pass"
  });

  createNotification({
    recipientRole: "Administrator",
    title: `✅ Stage Update: ${ideaTitle}`,
    message: `Proposal "${ideaTitle}" passed to stage status: "${newStatus}". Notes: ${evaluatorNotes || "N/A"}.`,
    ideaId: id,
    type: "stage_pass"
  });

  const assignedPMEmail = targetIdea?.assignedPM && targetIdea.assignedPM.includes("(")
    ? targetIdea.assignedPM.split("(")[1].replace(")", "").trim()
    : null;

  createNotification({
    recipientRole: "Project Manager",
    recipientEmail: assignedPMEmail,
    title: `🎯 PM Action Required: ${ideaTitle}`,
    message: `Proposal "${ideaTitle}" passed to stage status: "${newStatus}". Please review and take action.`,
    ideaId: id,
    type: "stage_pass"
  });

  return updatedList;
}

export const DEFAULT_MASTER_EVALUATORS = [
  { id: 1, name: "Dr. Ananya Sharma", email: "ananya.hr@imsgroup.com", role: "Reviewer", domain: "HR", department: "Human Resources & Talent" },
  { id: 2, name: "Vikram Sethi", email: "vikram.hrba@imsgroup.com", role: "Business Analyst", domain: "HR", department: "HR Business Operations" },
  { id: 3, name: "Priya Nair", email: "priya.hrpm@imsgroup.com", role: "Project Manager", domain: "HR", department: "People Systems PMO" },

  { id: 4, name: "Rohan Gupta", email: "rohan.ecom@imsgroup.com", role: "Reviewer", domain: "E-Commerce", department: "Digital Platforms" },
  { id: 5, name: "Neha Verma", email: "neha.ecomba@imsgroup.com", role: "Business Analyst", domain: "E-Commerce", department: "E-Commerce Analytics" },
  { id: 6, name: "Amitav Roy", email: "amitav.ecompm@imsgroup.com", role: "Project Manager", domain: "E-Commerce", department: "E-Commerce PMO" },

  { id: 7, name: "Siddharth Malhotra", email: "siddharth.retail@imsgroup.com", role: "Reviewer", domain: "Retail", department: "Retail Operations" },
  { id: 8, name: "Kavita Reddy", email: "kavita.retailba@imsgroup.com", role: "Business Analyst", domain: "Retail", department: "Retail Systems" },
  { id: 9, name: "Rajesh Kapoor", email: "rajesh.retailpm@imsgroup.com", role: "Project Manager", domain: "Retail", department: "Store Innovation PMO" },

  { id: 10, name: "Meera Joshi", email: "meera.fin@imsgroup.com", role: "Reviewer", domain: "Finance", department: "Corporate Finance" },
  { id: 11, name: "Sanjay Mehta", email: "sanjay.finba@imsgroup.com", role: "Business Analyst", domain: "Finance", department: "FinTech & Payments" },
  { id: 12, name: "Tarun Khanna", email: "tarun.finpm@imsgroup.com", role: "Project Manager", domain: "Finance", department: "Financial Systems PMO" },

  { id: 13, name: "Dr. Sunita Patel", email: "sunita.health@imsgroup.com", role: "Reviewer", domain: "Healthcare", department: "Health & Safety" },
  { id: 14, name: "Arjun Menon", email: "arjun.healthba@imsgroup.com", role: "Business Analyst", domain: "Healthcare", department: "Clinical Ops BA" },
  { id: 15, name: "Deepak Rao", email: "deepak.healthpm@imsgroup.com", role: "Project Manager", domain: "Healthcare", department: "Health Tech PMO" },

  { id: 16, name: "Expert Reviewer", email: "reviewer@imsgroup.com", role: "Reviewer", domain: "IT", department: "Enterprise IT Architecture" },
  { id: 17, name: "Business Analyst Lead", email: "ba@imsgroup.com", role: "Business Analyst", domain: "IT", department: "IT Strategy & BA" },
  { id: 18, name: "Project Manager Lead", email: "pm@imsgroup.com", role: "Project Manager", domain: "IT", department: "Enterprise PMO" }
];

export function updateIdeaAllocation(id, allocationData) {
  const currentList = getSubmittedIdeas();
  const updatedList = currentList.map((idea) => {
    if (String(idea.id) === String(id)) {
      const isInitialStage = !idea.status || idea.status === "Pending PC Allocation" || idea.status === "Submitted";
      const finalStatus = isInitialStage
        ? (allocationData.status || "Assigned by Project Coordinator")
        : (allocationData.status && allocationData.status !== "Assigned by Project Coordinator" && allocationData.status !== "Assigned to Evaluators" ? allocationData.status : idea.status);

      return {
        ...idea,
        assignedReviewer: allocationData.assignedReviewer,
        reviewerDeadline: allocationData.reviewerDeadline,
        assignedBA: allocationData.assignedBA || "",
        baDeadline: allocationData.baDeadline || "",
        assignedPM: allocationData.assignedPM,
        pmDeadline: allocationData.pmDeadline,
        coordinatorNotes: allocationData.coordinatorNotes || "",
        status: finalStatus,
        allocatedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      };
    }
    return idea;
  });
  localStorage.setItem("idea360SubmittedIdeas", JSON.stringify(updatedList));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("ideaStatusChanged", { detail: { id, allocationData } }));
    window.dispatchEvent(new CustomEvent("ideaAllocationChanged", { detail: { id, allocationData } }));
  }

  apiClient.patch(`/ideas/${id}/allocation`, allocationData).catch((err) => {
    console.warn("Backend allocation sync notice:", err.message);
  });

  return updatedList;
}

// ==========================================
// ANALYSIS REPORT STORAGE HELPERS
// ==========================================

export function getSubmittedAnalysisReports() {
  try {
    const existing = localStorage.getItem("idea360AnalysisReports");
    if (!existing) {
      localStorage.setItem("idea360AnalysisReports", JSON.stringify([]));
      return [];
    }
    return JSON.parse(existing);
  } catch (err) {
    console.error("Error reading submitted analysis reports", err);
    return [];
  }
}

export async function saveAnalysisReport(reportData) {
  const currentList = getSubmittedAnalysisReports();
  const tempId = Date.now();
  const baName = reportData.baName || "Business Analyst";
  const statusStr = `Approved by BA: ${baName}`;

  const payload = {
    id: tempId,
    ideaId: reportData.ideaId || null,
    ideaTitle: reportData.ideaTitle || "Untitled Proposal",
    baName: baName,
    baEmail: reportData.baEmail || "",
    reportTitle: reportData.reportTitle || "BA Feasibility & ROI Analysis",
    summary: reportData.summary || "",
    estimatedCost: reportData.estimatedCost || "",
    projectedRoi: reportData.projectedRoi || "",
    attachment: reportData.attachment || null,
    status: statusStr,
    pmNotes: "",
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  };

  // If linked to an idea, update idea's status in local ideas list
  if (reportData.ideaId) {
    updateIdeaStatus(reportData.ideaId, statusStr, `Analysis report prepared and forwarded to Project Manager by BA: ${baName}`);
  }

  try {
    const res = await apiClient.post("/analysis-reports", payload);
    if (res.data && res.data.report) {
      const savedReport = res.data.report;
      const updatedList = [savedReport, ...currentList.filter((item) => String(item.id) !== String(savedReport.id))];
      localStorage.setItem("idea360AnalysisReports", JSON.stringify(updatedList));
      return updatedList;
    }
  } catch (err) {
    console.error("Database Analysis Report Save Error:", err);
  }

  const updatedList = [payload, ...currentList];
  localStorage.setItem("idea360AnalysisReports", JSON.stringify(updatedList));
  return updatedList;
}

export function updateAnalysisReportStatus(id, newStatus, pmNotes = "") {
  const currentList = getSubmittedAnalysisReports();
  let targetIdeaId = null;

  const updatedList = currentList.map((report) => {
    if (String(report.id) === String(id)) {
      targetIdeaId = report.ideaId;
      return { ...report, status: newStatus, pmNotes: pmNotes || report.pmNotes };
    }
    return report;
  });

  localStorage.setItem("idea360AnalysisReports", JSON.stringify(updatedList));

  if (targetIdeaId) {
    updateIdeaStatus(targetIdeaId, newStatus, `PM Action: ${pmNotes || newStatus}`);
  }

  apiClient.patch(`/analysis-reports/${id}/status`, { status: newStatus, pmNotes }).catch((err) => {
    console.warn("Backend report status sync notice:", err.message);
  });

  return updatedList;
}

