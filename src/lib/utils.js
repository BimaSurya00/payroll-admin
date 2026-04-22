import { clsx, } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export function formatTime(timeString) {
	if (!timeString) return "-";
	if (/^\d{1,2}:\d{2}$/.test(timeString)) return timeString;
	const date = new Date(timeString);
	if (isNaN(date.getTime())) return timeString;
	return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any