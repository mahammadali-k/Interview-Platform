import { useNavigate } from "react-router";
import EndSessionModal from "./EndSessionModal";
import { PASS_PERCENT } from "../lib/constants";
import { useEndSession, useSessionById, useSessionQuiz } from "../hooks/useSessions";

/**
 * Everything the host needs to end an interview, whether they're on the session page or the live
 * list: it loads the quiz progress, shows the decision dialog, then jumps to the feedback page.
 */
function EndSessionDialog({ session, onClose, initialNotes = "" }) {
  const navigate = useNavigate();
  const endSession = useEndSession();
  const { data: quiz } = useSessionQuiz(session._id);
  // Rows in the live list don't carry code runs or notes, so grab the full session (it's already cached on the session page)
  const { data: fullSession } = useSessionById(session._id);

  const questions = quiz?.questions || [];
  const quizSubmitted = Boolean(quiz?.submitted);
  const quizCorrect = questions.filter((q) => q.selected !== null && q.selected === q.answer).length;
  const quizPercent = questions.length ? Math.round((quizCorrect / questions.length) * 100) : 0;
  const testsPassed = fullSession?.session?.codeRuns?.some((run) => run.passed) ?? false;
  const quizPassed = quizSubmitted && quizPercent >= PASS_PERCENT;

  const summary = {
    testsPassed,
    quizSubmitted,
    quizCorrect,
    quizTotal: questions.length,
    quizPassed,
    suggested: testsPassed && quizPassed ? "accepted" : "rejected",
  };

  const handleConfirm = ({ decision, notes, rating }) =>
    endSession.mutate(
      { id: session._id, decision, notes, rating },
      {
        onSuccess: () => {
          onClose();
          navigate(`/session/${session._id}/result`, { replace: true });
        },
      }
    );

  // hold on until the full session is here, otherwise the suggestion and the prefilled notes would be off
  if (!fullSession) return null;

  return (
    <EndSessionModal
      onClose={onClose}
      onConfirm={handleConfirm}
      isEnding={endSession.isPending}
      summary={summary}
      initialNotes={fullSession.session.hostNotes ?? initialNotes}
    />
  );
}

export default EndSessionDialog;
