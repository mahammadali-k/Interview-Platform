import { useNavigate } from "react-router";
import { useCreateSession } from "./useSessions";

// Creates a live session for a problem and opens it
function useStartInterview() {
  const navigate = useNavigate();
  const createSession = useCreateSession();

  const start = (problem) =>
    createSession.mutate(
      { problem: problem.title, difficulty: problem.difficulty.toLowerCase() },
      { onSuccess: (data) => navigate(`/session/${data.session._id}`) }
    );

  return { start, isStarting: createSession.isPending };
}

export default useStartInterview;
