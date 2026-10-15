import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { questionApi, sessionApi } from "../api/sessions";

const errorMessage = (error, fallback) => error.response?.data?.message || fallback;

export const useCreateSession = () =>
  useMutation({
    mutationKey: ["createSession"],
    mutationFn: sessionApi.createSession,
    onSuccess: () => toast.success("Session created successfully!"),
    onError: (error) => toast.error(errorMessage(error, "Failed to create room")),
  });

export const useActiveSessions = () =>
  useQuery({
    queryKey: ["activeSessions"],
    queryFn: sessionApi.getActiveSessions,
    refetchInterval: 10000, // keep live sessions fresh on the dashboard
  });

export const useMyRecentSessions = () =>
  useQuery({ queryKey: ["myRecentSessions"], queryFn: sessionApi.getMyRecentSessions });

export const useHistory = () => useQuery({ queryKey: ["history"], queryFn: sessionApi.getHistory });

export const useSessionById = (id) =>
  useQuery({
    queryKey: ["session", id],
    queryFn: () => sessionApi.getSessionById(id),
    enabled: !!id,
    refetchInterval: 5000, // refetch every 5 seconds to detect session status changes
  });

export const useJoinSession = () =>
  useMutation({
    mutationKey: ["joinSession"],
    mutationFn: sessionApi.joinSession,
    onSuccess: () => toast.success("Joined session successfully!"),
    onError: (error) => toast.error(errorMessage(error, "Failed to join session")),
  });

export const useEndSession = () =>
  useMutation({
    mutationKey: ["endSession"],
    mutationFn: sessionApi.endSession,
    onSuccess: () => toast.success("Session ended successfully!"),
    onError: (error) => toast.error(errorMessage(error, "Failed to end session")),
  });

// host actions on a running session (edit problem, remove candidate)
export const useManageSession = () => {
  const queryClient = useQueryClient();

  const refresh = (_, variables) => {
    const id = typeof variables === "string" ? variables : variables.id;

    queryClient.invalidateQueries({ queryKey: ["session", id] });
    queryClient.invalidateQueries({ queryKey: ["quiz", id] });
    queryClient.invalidateQueries({ queryKey: ["activeSessions"] });
  };

  const update = useMutation({
    mutationFn: sessionApi.updateSession,
    onSuccess: (data, variables) => {
      toast.success("Session updated");
      refresh(data, variables);
    },
    onError: (error) => toast.error(errorMessage(error, "Failed to update the session")),
  });

  const removeCandidate = useMutation({
    mutationFn: sessionApi.removeParticipant,
    onSuccess: (data, variables) => {
      toast.success("Candidate removed");
      refresh(data, variables);
    },
    onError: (error) => toast.error(errorMessage(error, "Failed to remove the candidate")),
  });

  return { update, removeCandidate };
};

// ---- quiz ----

// polled so the host sees the candidate's progress and the candidate sees edited questions
export const useSessionQuiz = (id, { enabled = true } = {}) =>
  useQuery({
    queryKey: ["quiz", id],
    queryFn: () => sessionApi.getQuiz(id),
    enabled: !!id && enabled,
    refetchInterval: 5000,
  });

export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["submitQuiz"],
    mutationFn: sessionApi.submitQuiz,
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ["quiz", id] }),
    onError: (error) => toast.error(errorMessage(error, "Failed to submit answers")),
  });
};

// add / edit / delete a question of the running interview (host)
export const useSessionQuestions = () => {
  const queryClient = useQueryClient();
  const refresh = (_, { id }) => queryClient.invalidateQueries({ queryKey: ["quiz", id] });
  const onError = (error) => toast.error(errorMessage(error, "Failed to change the question"));

  return {
    add: useMutation({ mutationFn: sessionApi.addQuestion, onSuccess: refresh, onError }),
    update: useMutation({ mutationFn: sessionApi.updateQuestion, onSuccess: refresh, onError }),
    remove: useMutation({ mutationFn: sessionApi.deleteQuestion, onSuccess: refresh, onError }),
  };
};

// ---- report ----

export const useSessionReport = (id) =>
  useQuery({
    queryKey: ["report", id],
    queryFn: () => sessionApi.getReport(id),
    enabled: !!id,
    retry: false,
  });

export const useUpdateResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sessionApi.updateResult,
    onSuccess: (_, { id }) => {
      toast.success("Result updated");
      queryClient.invalidateQueries({ queryKey: ["report", id] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
    onError: (error) => toast.error(errorMessage(error, "Failed to update the result")),
  });
};

export const useEmailReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sessionApi.emailReport,
    onSuccess: (data, id) => {
      toast.success(`Feedback sent to ${data.to}`);
      queryClient.invalidateQueries({ queryKey: ["report", id] });
    },
    onError: (error) => toast.error(errorMessage(error, "Could not send the email")),
  });
};

// ---- question bank ----

export const useQuestionBank = () => {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["questions"], queryFn: questionApi.list });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["questions"] });
  const onError = (error) => toast.error(errorMessage(error, "Failed to save the question"));

  return {
    ...query,
    create: useMutation({
      mutationFn: questionApi.create,
      onSuccess: () => {
        toast.success("Question added");
        refresh();
      },
      onError,
    }),
    update: useMutation({
      mutationFn: questionApi.update,
      onSuccess: () => {
        toast.success("Question updated");
        refresh();
      },
      onError,
    }),
    remove: useMutation({
      mutationFn: questionApi.remove,
      onSuccess: () => {
        toast.success("Question deleted");
        refresh();
      },
      onError,
    }),
  };
};
