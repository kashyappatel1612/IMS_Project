/**
 * Shared Data Store Syncing with Express + PostgreSQL Backend
 * Includes localStorage fallback.
 */
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

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
    const res = await axios.get(`${API_BASE_URL}/ideas`);
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
    const res = await axios.post(`${API_BASE_URL}/ideas`, payload);
    if (res.data && res.data.idea) {
      const savedIdea = res.data.idea;
      const updatedList = [savedIdea, ...currentList.filter((item) => String(item.id) !== String(savedIdea.id))];
      localStorage.setItem("idea360SubmittedIdeas", JSON.stringify(updatedList));
      return updatedList;
    }
  } catch (err) {
    console.error("PostgreSQL Save Error:", err);
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

  // Sync Status Update to PostgreSQL Backend Async
  axios.patch(`${API_BASE_URL}/ideas/${id}/status`, { status: newStatus, evaluatorNotes }).catch((err) => {
    console.warn("PostgreSQL status sync notice:", err.message);
  });

  return updatedList;
}
