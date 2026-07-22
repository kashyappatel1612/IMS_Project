/**
 * Utility functions to manage Recent Login History
 * Clean empty initial state - No hardcoded dummy accounts.
 */

export function getLoginHistory() {
  try {
    const existingStr = localStorage.getItem("idea360LoginHistory");
    if (!existingStr) {
      localStorage.setItem("idea360LoginHistory", JSON.stringify([]));
      return [];
    }
    return JSON.parse(existingStr);
  } catch (err) {
    console.error("Error loading login history", err);
    return [];
  }
}

export function saveToLoginHistory(account) {
  try {
    let history = getLoginHistory();
    // Remove duplicate entry if email matches
    history = history.filter(
      (item) => item.email.toLowerCase() !== account.email.toLowerCase()
    );

    // Prepend new account
    history.unshift({
      username: account.username,
      email: account.email,
      role: account.role || "User",
      timestamp: new Date().toISOString()
    });

    // Keep top 3 recent accounts
    history = history.slice(0, 3);
    localStorage.setItem("idea360LoginHistory", JSON.stringify(history));
  } catch (err) {
    console.error("Error saving login history", err);
  }
}

export function switchAccount(account, navigate) {
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem(
    "currentUser",
    JSON.stringify({
      username: account.username,
      email: account.email,
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
