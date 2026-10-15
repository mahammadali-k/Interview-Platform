import toast from "react-hot-toast";

/** copies text and tells the user how it went */
export async function copyText(text, successMessage = "Copied") {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
    return true;
  } catch {
    toast.error("Could not copy");
    return false;
  }
}
