export const capitalize = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const convertFirebaseTimestampToDate = (
  timestamp: {
    seconds: number;
    nanoseconds: number;
  } | null,
): Date => {
  if (!timestamp) return new Date();
  return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6);
};

export const formatShortDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short", // Abbreviated day name (e.g., "Mon")
    year: "2-digit", // Two-digit year (e.g., "24")
    month: "numeric", // Numeric month (e.g., "10")
    day: "numeric", // Numeric day (e.g., "30")
    hour: "numeric", // Hour in 12-hour format
    minute: "2-digit", // Two-digit minute (e.g., "45")
    hour12: true, // 12-hour format with AM/PM
  };

  return new Intl.DateTimeFormat("en-US", options).format(date);
};
