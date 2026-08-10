export function getNotifications(userRole = "", userEmail = "") {
  try {
    const raw = localStorage.getItem("idea360Notifications");
    const list = raw ? JSON.parse(raw) : DEFAULT_SEED_NOTIFICATIONS;

    return list.filter((n) => {
      if (!n.recipientRole && !n.recipientEmail) return true; // universal broadcast
      if (n.recipientEmail && userEmail && n.recipientEmail.toLowerCase() === userEmail.toLowerCase()) return true;
      if (n.recipientRole && userRole && n.recipientRole.toLowerCase() === userRole.toLowerCase()) return true;
      if (userRole === "Administrator") return true; // Admin sees all system notifications
      return false;
    });
  } catch (err) {
    console.error("Error reading notifications:", err);
    return DEFAULT_SEED_NOTIFICATIONS;
  }
}

export function createNotification({ recipientRole, recipientEmail, title, message, ideaId, type = "info" }) {
  try {
    const raw = localStorage.getItem("idea360Notifications");
    const current = raw ? JSON.parse(raw) : DEFAULT_SEED_NOTIFICATIONS;

    // Deduplication check: skip if identical notification exists for same ideaId, recipientRole, and title
    if (ideaId && (recipientRole || recipientEmail)) {
      const isDuplicate = current.some(
        (n) =>
          String(n.ideaId) === String(ideaId) &&
          n.title === title &&
          ((recipientRole && n.recipientRole === recipientRole) || (recipientEmail && n.recipientEmail === recipientEmail))
      );
      if (isDuplicate) {
        return current;
      }
    }

    const newNotif = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      title,
      message,
      ideaId: ideaId || null,
      recipientRole: recipientRole || null,
      recipientEmail: recipientEmail || null,
      type, // 'submission' | 'allocation' | 'stage_pass' | 'rejection' | 'info'
      isRead: false,
      timestamp: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    };

    const updated = [newNotif, ...current];
    localStorage.setItem("idea360Notifications", JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("Error creating notification:", err);
    return [];
  }
}

export function getUnreadCount(userRole = "", userEmail = "") {
  const notifs = getNotifications(userRole, userEmail);
  return notifs.filter((n) => !n.isRead).length;
}

export function markAsRead(id) {
  try {
    const raw = localStorage.getItem("idea360Notifications");
    const current = raw ? JSON.parse(raw) : DEFAULT_SEED_NOTIFICATIONS;
    const updated = current.map((n) => (String(n.id) === String(id) ? { ...n, isRead: true } : n));
    localStorage.setItem("idea360Notifications", JSON.stringify(updated));
    return updated;
  } catch (err) {
    return [];
  }
}

export function markAllAsRead(userRole = "", userEmail = "") {
  try {
    const raw = localStorage.getItem("idea360Notifications");
    const current = raw ? JSON.parse(raw) : DEFAULT_SEED_NOTIFICATIONS;
    const updated = current.map((n) => {
      if (
        (!n.recipientRole && !n.recipientEmail) ||
        (n.recipientRole && userRole && n.recipientRole.toLowerCase() === userRole.toLowerCase()) ||
        (n.recipientEmail && userEmail && n.recipientEmail.toLowerCase() === userEmail.toLowerCase()) ||
        userRole === "Administrator"
      ) {
        return { ...n, isRead: true };
      }
      return n;
    });
    localStorage.setItem("idea360Notifications", JSON.stringify(updated));
    return updated;
  } catch (err) {
    return [];
  }
}

export const DEFAULT_SEED_NOTIFICATIONS = [
  {
    id: 1,
    title: "🚀 New Idea Proposal Submitted: AI-Powered Customer Support Bot",
    message: "Submitted by Innovator User (user@imsgroup.com) in Domain: E-Commerce. Immediate Project Coordinator allocation required.",
    ideaId: 1,
    recipientRole: "Project Coordinator",
    type: "submission",
    isRead: false,
    timestamp: "Jul 30, 2026 09:15 AM"
  },
  {
    id: 2,
    title: "🎯 Assigned as Reviewer: Customer Support Bot",
    message: "Project Coordinator assigned Dr. Ananya Sharma as Reviewer for Proposal #1. Completion Deadline: Aug 05, 2026.",
    ideaId: 1,
    recipientRole: "Reviewer",
    type: "allocation",
    isRead: false,
    timestamp: "Jul 30, 2026 10:30 AM"
  },
  {
    id: 3,
    title: "✅ Stage Update: Proposal #1 Passed Initial Screening",
    message: "Idea #1 'AI Customer Support Bot' passed 100-point Initial Screening. Forwarded to Feasibility Review.",
    ideaId: 1,
    recipientRole: "Project Coordinator",
    type: "stage_pass",
    isRead: false,
    timestamp: "Jul 30, 2026 11:45 AM"
  }
];
