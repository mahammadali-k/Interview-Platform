import { jsPDF } from "jspdf";

// Builds the feedback PDF on the server, so the download on the page and the email attachment
// are exactly the same document.

const PAGE = { width: 210, height: 297, margin: 18 };
const CONTENT_WIDTH = PAGE.width - PAGE.margin * 2;

const COLORS = {
  ink: [24, 31, 42],
  muted: [100, 112, 128],
  line: [210, 216, 224],
  brand: [79, 127, 181],
  success: [46, 125, 91],
  danger: [176, 72, 58],
};

const LETTERS = ["A", "B", "C", "D", "E", "F"];

// jsPDF's built-in fonts only cover Latin-1, so anything outside it gets transliterated
const safe = (value) =>
  String(value ?? "")
    .replace(/ə/g, "e")
    .replace(/Ə/g, "E")
    .replace(/ı/g, "i")
    .replace(/İ/g, "I")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/./gs, (char) => {
      const code = char.charCodeAt(0);
      return code === 10 || (code >= 32 && code <= 126) ? char : "?";
    });

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })
    : "-";

export function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export const reportFileName = (report) =>
  `interview-feedback-${report.session.problem.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`;

/** @returns {Buffer} */
export function buildReportPdf(report) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = PAGE.margin;

  const ensureSpace = (height) => {
    if (y + height > PAGE.height - PAGE.margin) {
      doc.addPage();
      y = PAGE.margin;
    }
  };

  const write = (
    text,
    { size = 10, style = "normal", tone = COLORS.ink, indent = 0, gap = 1.5, font = "helvetica" } = {}
  ) => {
    doc.setFont(font, style);
    doc.setFontSize(size);
    doc.setTextColor(...tone);

    const lineHeight = size * 0.45;

    doc.splitTextToSize(safe(text), CONTENT_WIDTH - indent).forEach((line) => {
      ensureSpace(lineHeight);
      doc.text(line, PAGE.margin + indent, y + lineHeight * 0.8);
      y += lineHeight;
    });

    y += gap;
  };

  const heading = (text) => {
    ensureSpace(14);
    y += 4;
    write(text.toUpperCase(), { size: 9, style: "bold", tone: COLORS.muted, gap: 1 });
    doc.setDrawColor(...COLORS.line);
    doc.line(PAGE.margin, y, PAGE.width - PAGE.margin, y);
    y += 3;
  };

  const { session, result, quiz, code } = report;
  const accepted = result.verdict === "accepted";

  // header band
  doc.setFillColor(...COLORS.brand);
  doc.rect(0, 0, PAGE.width, 30, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("IP", PAGE.margin, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Interview Platform - feedback report", PAGE.margin, 22);
  y = 40;

  // who / what / when
  [
    ["Candidate", session.candidate ? `${session.candidate.name} (${session.candidate.email})` : "-"],
    ["Interviewer", session.host ? `${session.host.name} (${session.host.email})` : "-"],
    ["Problem", `${session.problem} (${session.difficulty})`],
    ["Interview date", formatDate(session.joinedAt || session.startedAt)],
    ["Time spent", formatDuration(session.durationSeconds)],
  ].forEach(([label, value]) => {
    ensureSpace(6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.muted);
    doc.text(label, PAGE.margin, y + 4);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.ink);
    doc.text(safe(value), PAGE.margin + 36, y + 4);
    y += 6;
  });

  // verdict
  y += 6;
  doc.setFillColor(...(accepted ? COLORS.success : COLORS.danger));
  doc.roundedRect(PAGE.margin, y, CONTENT_WIDTH, 20, 1.5, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(accepted ? "RESULT: ACCEPTED" : "RESULT: NOT ACCEPTED", PAGE.margin + 6, y + 9);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    accepted
      ? "The candidate met the requirements of this interview."
      : "The candidate did not meet the requirements of this interview.",
    PAGE.margin + 6,
    y + 15.5
  );
  y += 26;

  heading("Summary");
  write(`Coding task: ${result.testsPassed ? "Tests passed" : "Tests not passed"}`, { style: "bold" });
  write(`${code.runs} code run${code.runs === 1 ? "" : "s"}, ${code.passedRuns} passed the expected output.`, {
    tone: COLORS.muted,
  });
  write(`Quiz: ${quiz.correct} of ${quiz.total} correct (${quiz.percent}%)`, { style: "bold" });
  write(`${quiz.incorrect} incorrect, ${quiz.unanswered} unanswered.`, { tone: COLORS.muted });
  if (result.rating) write(`Interviewer rating: ${result.rating} / 5`, { style: "bold" });

  if (result.notes) {
    heading("Interviewer notes");
    write(result.notes);
  }

  heading("Quiz review: your answers and corrections");

  quiz.items.forEach((item, idx) => {
    ensureSpace(24);
    write(`${idx + 1}. ${item.question}`, { style: "bold", gap: 1 });

    const selectedText =
      item.selected === null ? "No answer" : `${LETTERS[item.selected]}. ${item.options[item.selected]}`;

    write(`Your answer: ${selectedText}  [${item.isCorrect ? "CORRECT" : "INCORRECT"}]`, {
      indent: 4,
      tone: item.isCorrect ? COLORS.success : COLORS.danger,
      style: "bold",
      gap: 1,
    });

    if (!item.isCorrect) {
      write(`Correct answer: ${LETTERS[item.answer]}. ${item.options[item.answer]}`, {
        indent: 4,
        tone: COLORS.success,
        gap: 1,
      });
    }

    if (item.explanation) {
      write(`Why: ${item.explanation}`, { indent: 4, size: 9, tone: COLORS.muted, gap: 4 });
    } else {
      y += 3;
    }
  });

  if (code.lastRun) {
    heading(`Last code submission (${code.lastRun.language})`);

    const lines = code.lastRun.code.split("\n");

    write(lines.slice(0, 60).join("\n"), { size: 8, font: "courier", gap: 2 });
    if (lines.length > 60) {
      write(`... ${lines.length - 60} more lines not shown`, { size: 8, tone: COLORS.muted });
    }
  }

  const pages = doc.getNumberOfPages();

  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text(`IP Interview Platform - feedback - page ${page} of ${pages}`, PAGE.margin, PAGE.height - 8);
  }

  return Buffer.from(doc.output("arraybuffer"));
}
