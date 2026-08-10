/**
 * Helper to compute active workload for any candidate user (Reviewer, BA, PM)
 */
export function getCandidateWorkload(candidateNameOrEmail, ideasList = []) {
  if (!candidateNameOrEmail) {
    return {
      activeCount: 0,
      status: "Available",
      badgeColor: "#16a34a",
      badgeBg: "#dcfce7",
      statusIcon: "🟢",
      displayText: "0 Active Ideas (Available)"
    };
  }

  const query = candidateNameOrEmail.toLowerCase().trim();

  // Extract email if formatted as "Name (email)"
  let searchEmail = query;
  if (query.includes("(") && query.includes(")")) {
    searchEmail = query.split("(")[1].replace(")", "").trim();
  }

  const activeIdeas = ideasList.filter((idea) => {
    const rev = (idea.assignedReviewer || "").toLowerCase();
    const ba = (idea.assignedBA || "").toLowerCase();
    const pm = (idea.assignedPM || "").toLowerCase();

    const isAssigned =
      rev.includes(searchEmail) ||
      ba.includes(searchEmail) ||
      pm.includes(searchEmail) ||
      rev.includes(query) ||
      ba.includes(query) ||
      pm.includes(query);

    if (!isAssigned) return false;

    // Filter out completed / rejected proposals
    const status = (idea.status || "").toLowerCase();
    const isFinished =
      status.includes("rejected") ||
      status.includes("completed") ||
      status.includes("approved by pm") ||
      status.includes("archived");

    return !isFinished;
  });

  const activeCount = activeIdeas.length;

  if (activeCount >= 5) {
    return {
      activeCount,
      status: "Heavy Workload",
      badgeColor: "#dc2626",
      badgeBg: "#fee2e2",
      statusIcon: "🔴",
      displayText: `${activeCount} Active Ideas (Heavy Workload)`
    };
  } else if (activeCount >= 3) {
    return {
      activeCount,
      status: "Moderate Workload",
      badgeColor: "#d97706",
      badgeBg: "#fef3c7",
      statusIcon: "🟡",
      displayText: `${activeCount} Active Ideas (Moderate)`
    };
  } else {
    return {
      activeCount,
      status: "Available",
      badgeColor: "#16a34a",
      badgeBg: "#dcfce7",
      statusIcon: "🟢",
      displayText: `${activeCount} Active Ideas (Available)`
    };
  }
}
