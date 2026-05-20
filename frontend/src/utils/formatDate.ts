export const formatDate = (dateString: string | null): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch (err) {
    return "Invalid Date";
  }
};
