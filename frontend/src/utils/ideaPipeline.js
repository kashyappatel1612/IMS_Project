/**
 * End-to-End Idea Lifecycle & Pipeline Stage Engine for Idea360
 * Maps idea status to an 8-stage enterprise innovation pipeline.
 */

export const LIFECYCLE_STAGES = [
  {
    id: 1,
    name: "Submission",
    label: "Stage 1: Proposal Submission",
    description: "Innovator submitted idea & awaiting PC allocation",
    assignedRole: "Innovator / Project Coordinator"
  },
  {
    id: 2,
    name: "Expert Allocation",
    label: "Stage 2: Experts Allocation",
    description: "PC assigned Reviewer, BA, and PM to proposal",
    assignedRole: "Project Coordinator"
  },
  {
    id: 3,
    name: "Feasibility Review",
    label: "Stage 3: Initial Screening & Feasibility",
    description: "Reviewer validating technical & domain feasibility",
    assignedRole: "Reviewer"
  },
  {
    id: 4,
    name: "Business Analysis",
    label: "Stage 4: Business Analysis & BRD/FRD",
    description: "BA drafting functional requirements & ROI report",
    assignedRole: "Business Analyst"
  },
  {
    id: 5,
    name: "Estimation",
    label: "Stage 5: Tech & Budget Estimation",
    description: "Estimating story points, timeline, and resource budget",
    assignedRole: "BA / Project Manager"
  },
  {
    id: 6,
    name: "PM Approval & Project",
    label: "Stage 6: PM Signoff & Project Setup",
    description: "PM accepting proposal & converting to official project",
    assignedRole: "Project Manager"
  },
  {
    id: 7,
    name: "Execution & QA",
    label: "Stage 7: Sprint Execution & QA",
    description: "Development team executing sprints & QA testing",
    assignedRole: "Engineering & QA Team"
  },
  {
    id: 8,
    name: "Completed & Live",
    label: "Stage 8: Live Rollout & Benefits",
    description: "Deployed to production with live business impact tracking",
    assignedRole: "Operations & PMO"
  }
];

export function getIdeaPipelineStatus(idea) {
  if (!idea) {
    return {
      currentStageIndex: 1,
      currentStageName: LIFECYCLE_STAGES[0].name,
      currentStageLabel: LIFECYCLE_STAGES[0].label,
      percent: 12.5,
      isRejected: false,
      stages: LIFECYCLE_STAGES.map((s, idx) => ({ ...s, status: idx === 0 ? "current" : "pending" }))
    };
  }

  const status = (idea.status || "").trim();
  const statusLower = status.toLowerCase();

  // Check Rejection
  const isRejected = statusLower.includes("reject") || statusLower.includes("not approved") || statusLower.includes("declined");

  let currentStageIndex = 1;

  if (isRejected) {
    // Determine at which stage it got rejected
    if (statusLower.includes("pm")) currentStageIndex = 6;
    else if (statusLower.includes("ba")) currentStageIndex = 4;
    else if (statusLower.includes("feasibility") || statusLower.includes("screening")) currentStageIndex = 3;
    else currentStageIndex = 1;
  } else if (
    statusLower.includes("completed") ||
    statusLower.includes("live") ||
    statusLower.includes("benefits")
  ) {
    currentStageIndex = 8;
  } else if (
    statusLower.includes("in execution") ||
    statusLower.includes("execution") ||
    statusLower.includes("qa") ||
    statusLower.includes("sprint")
  ) {
    currentStageIndex = 7;
  } else if (
    statusLower.includes("accepted by pm") ||
    statusLower.includes("pending pm approval") ||
    statusLower.includes("project created") ||
    statusLower.includes("pm approval")
  ) {
    currentStageIndex = 6;
  } else if (
    statusLower.includes("estimation completed") ||
    statusLower.includes("estimation")
  ) {
    currentStageIndex = 5;
  } else if (
    statusLower.includes("approved by ba") ||
    statusLower.includes("business analysis") ||
    statusLower.includes("ba analysis") ||
    statusLower.includes("brd")
  ) {
    currentStageIndex = 4;
  } else if (
    statusLower.includes("feasibility approved") ||
    statusLower.includes("pass screening") ||
    statusLower.includes("screening evaluation") ||
    statusLower.includes("passed") ||
    statusLower.includes("under review") ||
    statusLower.includes("feasibility review")
  ) {
    currentStageIndex = 3;
  } else if (
    idea.assignedReviewer ||
    statusLower.includes("assigned") ||
    statusLower.includes("evaluators")
  ) {
    currentStageIndex = 2;
  } else {
    currentStageIndex = 1;
  }

  const percent = Math.min(100, Math.round((currentStageIndex / LIFECYCLE_STAGES.length) * 100));

  const stages = LIFECYCLE_STAGES.map((s) => {
    let stageState = "pending";
    if (s.id < currentStageIndex) {
      stageState = "completed";
    } else if (s.id === currentStageIndex) {
      stageState = isRejected ? "rejected" : "current";
    }
    return {
      ...s,
      status: stageState
    };
  });

  const currentStageObj = LIFECYCLE_STAGES[currentStageIndex - 1] || LIFECYCLE_STAGES[0];

  return {
    currentStageIndex,
    currentStageName: currentStageObj.name,
    currentStageLabel: currentStageObj.label,
    stageDescription: currentStageObj.description,
    assignedRole: currentStageObj.assignedRole,
    percent,
    isRejected,
    stages
  };
}
