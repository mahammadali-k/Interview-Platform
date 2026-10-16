import { TRANSLATE_LANGUAGES, translate } from "../lib/translator.js";
import { serverError } from "../lib/http.js";

const MAX_TEXT_LENGTH = 500;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 90;
const hits = new Map();

function isRateLimited(userId) {
  const now = Date.now();
  const recent = (hits.get(userId) || []).filter((time) => now - time < WINDOW_MS);

  recent.push(now);
  hits.set(userId, recent);

  return recent.length > MAX_PER_WINDOW;
}

// POST /translate   body: { text, from, to }
export async function translateText(req, res) {
  try {
    const { text, from, to } = req.body || {};

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ message: "Text is required" });
    }
    if (text.length > MAX_TEXT_LENGTH) {
      return res.status(413).json({ message: "Text is too long" });
    }
    if (!TRANSLATE_LANGUAGES.includes(from) || !TRANSLATE_LANGUAGES.includes(to)) {
      return res.status(400).json({ message: "Unsupported language" });
    }
    if (isRateLimited(req.user._id.toString())) {
      return res.status(429).json({ message: "Too many translations. Try again in a moment." });
    }

    res.status(200).json({ text: await translate(text.trim(), from, to) });
  } catch (error) {
    // the call works fine without captions, so this is a soft failure
    console.log("Translation failed:", error.message);
    serverError(res, "translateText", error);
  }
}
