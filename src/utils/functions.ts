import { User } from "firebase/auth";

export const capitalize = (str: string): string => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const convertFirebaseTimestampToDate = (
    timestamp: {
        seconds: number;
        nanoseconds: number;
    } | null
): Date => {
    if (!timestamp) return new Date();
    return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6);
};

export const formatShortDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
        // weekday: "short", // Abbreviated day name (e.g., "Mon")
        year: "2-digit", // Two-digit year (e.g., "24")
        month: "numeric", // Numeric month (e.g., "10")
        day: "numeric", // Numeric day (e.g., "30")
        hour: "numeric", // Hour in 12-hour format
        minute: "2-digit", // Two-digit minute (e.g., "45")
        hour12: true, // 12-hour format with AM/PM
    };

    return new Intl.DateTimeFormat("en-US", options).format(date);
};

export const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month + 1, 0).getDate();
};

export const getDateFromDay = (
    day: number,
    currentMonth: number,
    currentYear: number
): string => {
    // Handle cases where days belong to the previous month
    if (day > new Date(currentYear, currentMonth + 1, 0).getDate()) {
        // Day is in the previous month
        const date = new Date(currentYear, currentMonth - 1, day);
        return date.toISOString().split("T")[0];
    } else {
        // Day is in the current month
        const date = new Date(currentYear, currentMonth, day);
        return date.toISOString().split("T")[0];
    }
};

export const getDateFromDayOffset = (
    offset: number,
    currentDate: Date
): string => {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() - offset);
    return date.toISOString().split("T")[0];
};

export const getLastNDates = (n: number, currentDate: Date): string[] => {
    const dates = [];
    for (let i = 0; i <= n + 1; i++) {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() - (n - i));
        dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
};

export const getColorForSection = (id: number): string => {
    const colorPalette = [
        "#FF5733",
        "#33FF57",
        "#3357FF",
        "#FF33A1",
        "#33FFA1",
    ];
    return colorPalette[id % colorPalette.length] || "#000000"; // Default color
};

export const getUserInitials = (
    user: string | User | undefined | { email: string } | null
) => {
    if (!user) return ""; // If user is undefined, return an empty string

    // Check for displayName and generate initials
    if (user && (user as User).displayName) {
        const nameParts = (user as User)?.displayName?.trim().split(" ");

        // If the name has multiple parts (e.g., "John Smith"), return the initials "JS"
        if (nameParts && nameParts.length > 1) {
            return (
                nameParts[0][0]?.toUpperCase() + // First letter of the first part
                nameParts[nameParts.length - 1][0]?.toUpperCase() // First letter of the last part
            );
        }

        // If the name has only one part (e.g., "John"), return "J"
        return !!(user as User).displayName &&
            ((user as User).displayName as string)[0]
            ? ((user as User).displayName as string)[0]
            : "";
    }

    // Fallback to the first letter of the email if displayName is not present
    if (user && (user as { email: string }).email) {
        return (user as { email: string }).email[0]?.toUpperCase();
    }

    // Return an empty string if none of the conditions match
    return "";
};
