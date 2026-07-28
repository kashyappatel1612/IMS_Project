/**
 * Shared Data Store Syncing with FastAPI + PostgreSQL Backend
 * Includes localStorage fallback.
 */
import { apiClient } from "../services/api";

export function getSubmittedIdeas() {
  try {
    const existing = localStorage.getItem("idea360SubmittedIdeas");
    if (!existing) {
      localStorage.setItem("idea360SubmittedIdeas", JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(existing);
    const cleanList = parsed.filter((item) => item.id > 1000);
    if (cleanList.length !== parsed.length) {
      localStorage.setItem("idea360SubmittedIdeas", JSON.stringify(cleanList));
    }
    return cleanList;
  } catch (err) {
    console.error("Error reading submitted ideas", err);
    return [];
  }
}

export async function fetchIdeasFromApi() {
  try {
    const res = await apiClient.get("/ideas");
    if (res.data && Array.isArray(res.data)) {
      localStorage.setItem("idea360SubmittedIdeas", JSON.stringify(res.data));
      return res.data;
    }
  } catch (err) {
    console.warn("Backend API notice, fallback to local cache:", err.message);
  }
  return getSubmittedIdeas();
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
    attachment: newIdea.attachment || null
  };

  try {
    const res = await apiClient.post("/ideas", payload);
    if (res.data && res.data.idea) {
      const savedIdea = res.data.idea;
      const updatedList = [savedIdea, ...currentList.filter((item) => String(item.id) !== String(savedIdea.id))];
      localStorage.setItem("idea360SubmittedIdeas", JSON.stringify(updatedList));
      return updatedList;
    }
  } catch (err) {
    console.error("Database Save Error:", err);
  }

  // Fallback to local storage if API backend is offline
  const ideaObject = {
    ...payload,
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    status: "Pending Review"
  };
  const updatedList = [ideaObject, ...currentList];
  localStorage.setItem("idea360SubmittedIdeas", JSON.stringify(updatedList));
  return updatedList;
}

export async function checkIdeaDuplicity(ideaData) {
  try {
    const res = await apiClient.post("/ideas/check-duplicity", {
      title: ideaData.title || "",
      category: ideaData.category || "",
      problemStatement: ideaData.problemStatement || "",
      description: ideaData.description || "",
      proposedSolution: ideaData.proposedSolution || ""
    });
    if (res.data && res.data.duplicityResult) {
      return res.data.duplicityResult;
    }
  } catch (err) {
    console.warn("Backend duplicity check notice:", err.message);
  }
  return null;
}

export function getIdeaById(id) {

  const ideas = getSubmittedIdeas();
  return ideas.find((i) => String(i.id) === String(id)) || null;
}

export function updateIdeaStatus(id, newStatus, evaluatorNotes = "") {
  const currentList = getSubmittedIdeas();
  const updatedList = currentList.map((idea) =>
    String(idea.id) === String(id)
      ? { ...idea, status: newStatus, evaluatorNotes: evaluatorNotes || idea.evaluatorNotes }
      : idea
  );
  localStorage.setItem("idea360SubmittedIdeas", JSON.stringify(updatedList));

  // Sync Status Update to FastAPI Backend Async
  apiClient.patch(`/ideas/${id}/status`, { status: newStatus, evaluatorNotes }).catch((err) => {
    console.warn("Backend status sync notice:", err.message);
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

