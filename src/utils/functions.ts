import { Timestamp } from "firebase-admin/firestore";
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

export const getProgressBarColor = (occupancyPercentage: number) => {
    if (occupancyPercentage > 98) return "bg-red-600";
    if (occupancyPercentage > 75) return "bg-yellow-600";
    if (occupancyPercentage > 50) return "bg-green-600";
    return "bg-blue-600";
};

export const getSquareLayout = (seatCount: number) => {
    const sideLength = Math.ceil(Math.sqrt(seatCount));
    return {
        rows: sideLength,
        columns: sideLength,
    };
};

export const createLayout = (T: number): number[][] => {
    const R = Math.ceil(Math.sqrt(T));
    const C = R;
    const layout: number[][] = [];
    let seatCount = 0;

    for (let i = 0; i < R; i++) {
        const row: number[] = [];
        for (let j = 0; j < C; j++) {
            if (seatCount < T) {
                row.push(0);
                seatCount++;
            }
        }
        if (row.length > 0) {
            layout.push(row);
        }
    }

    return layout;
};

export const calculateCapacity = (layout: number[][]): number => {
    let capacity = 0;

    for (let i = 0; i < layout.length; i++) {
        capacity += layout[i].length;
    }

    return capacity;
};

export const calculateLayoutStats = (
    layout: number[][]
): { capacity: number; seatsTaken: number } => {
    let capacity = 0;
    let seatsTaken = 0;

    for (let i = 0; i < layout.length; i++) {
        capacity += layout[i].length; // Count the number of seats in each row
        seatsTaken += layout[i].filter((seat) => seat === 1).length; // Count the number of taken seats (1s) in each row
    }

    return {
        capacity,
        seatsTaken,
    };
};

export const removeUndefined = (obj: Record<string, unknown>) => {
    return Object.keys(obj).reduce((acc, key) => {
        if (obj[key] !== undefined) {
            acc[key] = obj[key];
        }
        return acc;
    }, Object.create(null));
};

export const getSelectedSeatIndices = (layout: number[][]): number[] => {
    const selectedIndices: number[] = [];
    let flatIndex = 0;

    for (let i = 0; i < layout.length; i++) {
        for (let j = 0; j < layout[i].length; j++) {
            if (layout[i][j] === 1) {
                selectedIndices.push(flatIndex);
            }
            flatIndex++;
        }
    }

    return selectedIndices;
};

export const flattenLayoutWithNulls = (
    layout: number[][]
): (number | null)[] => {
    // Find the maximum number of columns in any row
    const maxSeats = Math.max(...layout.map((row) => row.length));

    // Flatten the layout, ensuring each row is padded with `null` where necessary
    const flatArray: (number | null)[] = [];

    layout.forEach((row) => {
        for (let i = 0; i < maxSeats; i++) {
            // Push the seat value if within the row's length, otherwise push `null`
            flatArray.push(i < row.length ? row[i] : null);
        }
    });

    return flatArray;
};

export const updateLayout = (
    layout: number[][],
    seatCount: number
): number[][] => {
    let remainingSeats = seatCount;

    // Traverse each row and column to fill available seats
    for (let i = 0; i < layout.length; i++) {
        for (let j = 0; j < layout[i].length; j++) {
            // If the seat is empty (0) and there are remaining seats to be filled
            if (layout[i][j] === 0 && remainingSeats > 0) {
                layout[i][j] = 1; // Mark seat as filled
                remainingSeats--; // Decrease remaining seat count
            }
            // Stop if no more seats are left to fill
            if (remainingSeats === 0) {
                return layout;
            }
        }
    }
    return layout;
};

export const overwriteLayout = (
    layout: number[][],
    count: number
): number[][] => {
    // Clone layout to avoid mutating the original if it's read-only or ensure it's not a string.
    const inputLayout = [...layout];
    let remainingSeats = count;

    try {
        for (let i = 0; i < inputLayout.length; i++) {
            for (let j = 0; j < inputLayout[i].length; j++) {
                // Fill or overwrite the seat only if there's a need to fill more seats
                if (remainingSeats > 0) {
                    inputLayout[i][j] = 1;
                    remainingSeats--;
                } else {
                    // Clear seats when `remainingSeats` is exhausted
                    inputLayout[i][j] = 0;
                }
            }
        }
    } catch (error) {
        console.log("Error:", error);
    }
    return inputLayout;
};

export const convertSelectedSeatsToLayout = (
    selectedSeats: number[],
    layout: number[][]
): number[][] => {
    // Create a deep copy of the layout to avoid mutating the original input
    const outputLayout = layout.map((row) => [...row]);
    const inputSelectedSeats = [...selectedSeats.map((s) => s + 1)];

    // Flatten the layout to map seat positions to their corresponding indices
    let flatIndex = 0;
    for (let i = 0; i < layout.length; i++) {
        for (let j = 0; j < layout[i].length; j++) {
            // Check if the current index is in the selectedSeats array
            if (inputSelectedSeats.includes(flatIndex + 1)) {
                outputLayout[i][j] = 1;
            } else {
                outputLayout[i][j] = 0;
            }
            flatIndex++;
        }
    }

    return outputLayout;
};

export const adjustLayoutToSeatCount = (
    layout: number[][],
    seatCount: number
): number[][] => {
    let currentSeatCount = 0;

    // Calculate the current seat count
    for (let i = 0; i < layout.length; i++) {
        for (let j = 0; j < layout[i].length; j++) {
            if (layout[i][j] === 1) {
                currentSeatCount++;
            }
        }
    }

    if (seatCount > currentSeatCount) {
        // Add 1s until the total matches the target seat count
        for (let i = 0; i < layout.length; i++) {
            for (let j = 0; j < layout[i].length; j++) {
                if (layout[i][j] === 0 && currentSeatCount < seatCount) {
                    layout[i][j] = 1;
                    currentSeatCount++;
                }
            }
        }
    }

    // Adjust layout to match the target seat count
    if (seatCount < currentSeatCount) {
        // Remove `1`s starting from the last row and last column
        for (
            let i = layout.length - 1;
            i >= 0 && currentSeatCount > seatCount;
            i--
        ) {
            for (
                let j = layout[i].length - 1;
                j >= 0 && currentSeatCount > seatCount;
                j--
            ) {
                if (layout[i][j] === 1) {
                    layout[i][j] = 0;
                    currentSeatCount--;
                }
            }
        }
    }

    return layout;
};
