import Session from "../models/Session.js";
import { buildReport } from "./report.js";
import { buildReportPdf, formatDuration, reportFileName } from "../lib/reportPdf.js";
import { isMailConfigured, sendMail } from "../lib/mailer.js";

/**
 * Emails the feedback PDF to the candidate (host in copy) and stores how it went.
 * Never throws: the interview result shouldn't depend on the mail provider.
 * @returns {Promise<{sent: boolean, to?: string, error?: string}>}
 */
export async function sendFeedbackEmail(sessionId) {
  const session = await Session.findById(sessionId)
    .populate("host", "name email")
    .populate("participant", "name email");

  if (!session || session.status !== "completed" || !session.participant) {
    return { sent: false, error: "Nothing to send" };
  }

  const to = session.participant.email;
  let status;

  try {
    if (!isMailConfigured()) throw new Error("Email is not configured on the server");

    const report = buildReport(session, "participant");
    const accepted = session.result.verdict === "accepted";

    await sendMail({
      to,
      cc: session.host.email,
      subject: `Your interview feedback: ${session.problem} (${accepted ? "Accepted" : "Not accepted"})`,
      text: [
        `Hi ${session.participant.name},`,
        "",
        `Thank you for taking part in the "${session.problem}" interview with ${session.host.name}.`,
        `Result: ${accepted ? "ACCEPTED" : "NOT ACCEPTED"}`,
        `Quiz: ${report.quiz.correct} of ${report.quiz.total} correct`,
        `Coding task: ${session.result.testsPassed ? "tests passed" : "tests not passed"}`,
        `Time spent: ${formatDuration(report.session.durationSeconds)}`,
        "",
        "Your mistakes, the correct answers and the interviewer's notes are in the attached PDF.",
        "",
        "IP Interview Platform",
      ].join("\n"),
      attachments: [
        { filename: reportFileName(report), content: buildReportPdf(report), contentType: "application/pdf" },
      ],
    });

    status = { sentAt: new Date(), to };
  } catch (error) {
    console.log("Error sending feedback email:", error.message);
    status = { to, error: error.message };
  }

  session.email = status;
  await session.save();

  return { sent: !status.error, to, error: status.error };
}
