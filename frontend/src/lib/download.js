import { sessionApi } from "../api/sessions";
import { saveBlob, slugify } from "./files";

// downloads the feedback PDF that the server generates
export async function downloadReportPdf(sessionId, problem = "interview") {
  const blob = await sessionApi.downloadReport(sessionId);

  saveBlob(blob, `interview-feedback-${slugify(problem)}.pdf`);
}
