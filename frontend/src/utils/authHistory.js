/**
 * Utility functions to manage Recent Login History (All 5 Roles Quick Switcher)
 */

export const ALL_6_ROLES = [
  { username: "Project Coordinator", email: "pc@imsgroup.com", role: "Project Coordinator" },
  { username: "Administrator", email: "admin@imsgroup.com", role: "Administrator" },
  { username: "Business Analyst Lead", email: "ba@imsgroup.com", role: "Business Analyst" },
  { username: "Expert Reviewer", email: "reviewer@imsgroup.com", role: "Reviewer" },
  { username: "Project Manager Lead", email: "pm@imsgroup.com", role: "Project Manager" },
  { username: "Innovator User", email: "user@imsgroup.com", role: "User" }
];

export function getLoginHistory() {
  try {
    const existingStr = localStorage.getItem("idea360LoginHistory");
    let history = [];
    if (existingStr) {
      history = JSON.parse(existingStr);
    }

    // Ensure all 6 roles are present in history
    ALL_6_ROLES.forEach((defAcc) => {
      if (!history.some((item) => item.role === defAcc.role)) {
        history.push(defAcc);
      }
    });

    localStorage.setItem("idea360LoginHistory", JSON.stringify(history.slice(0, 6)));
    return history.slice(0, 6);
  } catch (err) {
    console.error("Error loading login history", err);
    return ALL_6_ROLES;
  }
}

export function saveToLoginHistory(account) {
  try {
    let history = getLoginHistory();

    // Update existing role entry
    history = history.filter((item) => item.role !== account.role);

    // Prepend new active account
    history.unshift({
      username: account.username || account.role,
      email: account.email || `${account.role.toLowerCase().replace(/\s+/g, '')}@imsgroup.com`,
      role: account.role || "User",
      timestamp: new Date().toISOString()
    });

    // Merge any missing roles from ALL_6_ROLES
    ALL_6_ROLES.forEach((defAcc) => {
      if (!history.some((item) => item.role === defAcc.role)) {
        history.push(defAcc);
      }
    });

    const final6 = history.slice(0, 6);
    localStorage.setItem("idea360LoginHistory", JSON.stringify(final6));
  } catch (err) {
    console.error("Error saving login history", err);
  }
}

export function switchAccount(account, navigate) {
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem(
    "currentUser",
    JSON.stringify({
      username: account.username || account.role,
      email: account.email || `${account.role.toLowerCase().replace(/\s+/g, '')}@imsgroup.com`,
      role: account.role || "User"
    })
  );
  saveToLoginHistory(account);

  if (navigate) {
    navigate("/dashboard");
    window.location.reload();
  } else {
    window.location.href = "/dashboard";
  }
}
