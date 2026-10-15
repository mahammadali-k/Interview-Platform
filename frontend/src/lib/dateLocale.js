import { az, enUS, ru } from "date-fns/locale";
import { getLang } from "./i18n";

const LOCALES = { en: enUS, az, ru };

/** date-fns locale of the selected language (call it at render time) */
export const dateLocale = () => LOCALES[getLang()] || enUS;
