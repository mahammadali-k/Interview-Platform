import { format } from "date-fns";
import { dateLocale } from "./dateLocale";

// dates and times in the language of the page
export const formatDateTime = (value) => new Date(value).toLocaleString(dateLocale().code);
export const formatTime = (value) => new Date(value).toLocaleTimeString(dateLocale().code);
export const formatDate = (value) => new Date(value).toLocaleDateString(dateLocale().code);

/** date-fns pattern with the page language, e.g. formatPattern(date, "d MMM yyyy") */
export const formatPattern = (value, pattern) => format(new Date(value), pattern, { locale: dateLocale() });
