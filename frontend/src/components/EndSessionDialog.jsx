import { useNavigate } from "react-router";
import EndSessionModal from "./EndSessionModal";
import { PASS_PERCENT } from "../lib/constants";
import { useEndSession, useSessionById, useSessionQuiz } from "../hooks/useSessions";

/**
 * Host-side "end interview" flow, usable from the session page and from the live list: loads the
 * quiz progress, shows the decision dialog and opens the feedback page once the session ended.
 */
function EndSessionDialog({ session, onClose, initialNotes = "" }) {
  const navigate = useNavigate();
  const endSession = useEndSession();
  const { data: quiz } = useSessionQuiz(session._id);
  // list rows come without the code runs and notes, so read the full session (cached on the session page)
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

  // wait for the full session so the suggestion and the prefilled notes are correct
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
