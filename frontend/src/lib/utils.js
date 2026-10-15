// 3725 -> "1h 2m", 125 -> "2m 5s", 40 -> "40s"
export const formatDuration = (totalSeconds = 0) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

export const capitalize = (value = "") => value.charAt(0).toUpperCase() + value.slice(1);
