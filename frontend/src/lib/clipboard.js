import toast from "react-hot-toast";
import { t } from "./i18n";

/** Copies text and tells the user how it went */
export async function copyText(text, successMessage = "Copied") {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
    return true;
  } catch {
    toast.error(t("copy.fail", "Could not copy"));
    return false;
  }
}
