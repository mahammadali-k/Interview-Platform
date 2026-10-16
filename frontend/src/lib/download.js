import { sessionApi } from "../api/sessions";
import { saveBlob, slugify } from "./files";

// Downloads the feedback PDF the server generates
export async function downloadReportPdf(sessionId, problem = "interview") {
  const blob = await sessionApi.downloadReport(sessionId);

  saveBlob(blob, `interview-feedback-${slugify(problem)}.pdf`);
}
