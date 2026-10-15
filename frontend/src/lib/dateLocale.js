import { az } from "date-fns/locale/az";
import { enUS } from "date-fns/locale/en-US";
import { ru } from "date-fns/locale/ru";
import { getLang } from "./i18n";

const LOCALES = { en: enUS, az, ru };

/** date-fns locale of the selected language (call it at render time) */
export const dateLocale = () => LOCALES[getLang()] || enUS;
