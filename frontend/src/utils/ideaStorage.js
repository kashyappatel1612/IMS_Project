/**
 * Shared LocalStorage Data Store for Ideas Flowing between Users and Admin
 * Clean empty initial state - No hardcoded dummy data.
 */

export function getSubmittedIdeas() {
  try {
    const existing = localStorage.getItem("idea360SubmittedIdeas");
    if (!existing) {
      localStorage.setItem("idea360SubmittedIdeas", JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(existing);
    // Automatically purge old legacy test/dummy ideas (IDs <= 1000) from browser localStorage cache
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

export function saveNewIdea(newIdea) {
  try {
    const currentList = getSubmittedIdeas();
    const ideaObject = {
      id: Date.now(),
      title: newIdea.title,
      category: newIdea.category,
      author: newIdea.author || "User",
      authorEmail: newIdea.authorEmail || "",
      problemStatement: newIdea.problemStatement || "",
      description: newIdea.description || "",
      expectedOutcome: newIdea.expectedOutcome || "",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: "Pending Review"
    };

    const updatedList = [ideaObject, ...currentList];
    localStorage.setItem("idea360SubmittedIdeas", JSON.stringify(updatedList));
    return updatedList;
  } catch (err) {
    console.error("Error saving new idea", err);
    return [];
  }
}

export function updateIdeaStatus(id, newStatus) {
  try {
    const currentList = getSubmittedIdeas();
    const updatedList = currentList.map((idea) =>
      idea.id === id ? { ...idea, status: newStatus } : idea
    );
    localStorage.setItem("idea360SubmittedIdeas", JSON.stringify(updatedList));
    return updatedList;
  } catch (err) {
    console.error("Error updating idea status", err);
    return [];
  }
}
