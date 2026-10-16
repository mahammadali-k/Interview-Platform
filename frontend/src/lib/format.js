import { format } from "date-fns";
import { dateLocale } from "./dateLocale";

// dates and times in the page's language
export const formatDateTime = (value) => new Date(value).toLocaleString(dateLocale().code);
export const formatTime = (value) => new Date(value).toLocaleTimeString(dateLocale().code);
export const formatDate = (value) => new Date(value).toLocaleDateString(dateLocale().code);

/** A date-fns pattern in the page's language, e.g. formatPattern(date, "d MMM yyyy") */
export const formatPattern = (value, pattern) => format(new Date(value), pattern, { locale: dateLocale() });
