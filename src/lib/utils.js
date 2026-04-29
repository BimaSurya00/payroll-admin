import { clsx, } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export function formatTime(timeString) {
	if (!timeString) return "-";
	if (/^\d{1,2}:\d{2}$/.test(timeString)) return timeString;
	if (/^\d{1,2}:\d{2}(:\d{2})/.test(timeString)) return timeString.slice(0, 5);
	const date = new Date(timeString);
	if (isNaN(date.getTime())) return timeString;
	return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any

export function extractValidationErrors(err, defaultMessage = "Validation failed") {
    let errorMessage = err.message || defaultMessage;
    let validationList = "";
    
    let errorsData = err.data?.errors || err.data?.details || err.data?.data;
    
    if (Array.isArray(errorsData)) {
        // Array of objects format: [{ field: 'name', message: 'is required' }] or strings
        const errList = errorsData.map(e => {
            if (typeof e === 'string') return `<li>${e}</li>`;
            if (typeof e === 'object') {
                const field = e.field || e.property || e.path || '';
                const msg = e.message || e.msg || e.constraints || JSON.stringify(e);
                return `<li>${field ? `<b>${field}</b>: ` : ''}${typeof msg === 'object' ? Object.values(msg).join(', ') : msg}</li>`;
            }
            return `<li>${JSON.stringify(e)}</li>`;
        });
        validationList = `<ul style="text-align: left; margin-top: 10px;">${errList.join('')}</ul>`;
    } else if (errorsData && typeof errorsData === 'object') {
        // Object map format: { email: ["taken"], name: ["required"] }
        const errList = Object.keys(errorsData).map(key => {
            const msgs = Array.isArray(errorsData[key]) ? errorsData[key].join(', ') : errorsData[key];
            return `<li><b>${key}</b>: ${msgs}</li>`;
        });
        validationList = `<ul style="text-align: left; margin-top: 10px;">${errList.join('')}</ul>`;
    } else if (err.data?.message && Array.isArray(err.data.message)) {
        // NestJS default format: message: ["error 1", "error 2"]
        const errList = err.data.message.map(msg => `<li>${msg}</li>`);
        validationList = `<ul style="text-align: left; margin-top: 10px;">${errList.join('')}</ul>`;
    } else if (err.data?.message && typeof err.data.message === 'string' && err.data.message !== errorMessage) {
        validationList = `<p style="margin-top: 10px; text-align: left;">${err.data.message}</p>`;
    } else if (err.response?.data?.message) {
        validationList = `<p style="margin-top: 10px; text-align: left;">${err.response.data.message}</p>`;
    }

    return { errorMessage, validationList };
}