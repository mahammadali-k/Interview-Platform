import { lazy, Suspense, useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Link, useNavigate, useParams } from "react-router";
import { Panel, PanelGroup } from "react-resizable-panels";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import { LogOutIcon, PhoneOffIcon, SettingsIcon, UserXIcon } from "lucide-react";
import toast from "react-hot-toast";

import { PROBLEM_LIST } from "../data/problems";
import {
  useEndSession,
  useJoinSession,
  useSessionById,
  useSessionQuestions,
  useSessionQuiz,
  useSubmitQuiz,
} from "../hooks/useSessions";
import useStreamClient from "../hooks/useStreamClient";
import useCodeRunner from "../hooks/useCodeRunner";
import useSharedCode from "../hooks/useSharedCode";
import useStarterCode from "../hooks/useStarterCode";
import useHostNotes from "../hooks/useHostNotes";
import { PASS_PERCENT } from "../lib/constants";
import Navbar from "../components/Navbar";
import DifficultyBadge from "../components/DifficultyBadge";
import ProblemDetails from "../components/ProblemDetails";
import CodeEditorPanel from "../components/CodeEditorPanel";
import OutputPanel from "../components/OutputPanel";
import ResizeHandle from "../components/ResizeHandle";
import QuizPanel from "../components/QuizPanel";
import EndSessionModal from "../components/EndSessionModal";
import EditSessionModal from "../components/EditSessionModal";
import FinishInterviewModal from "../components/FinishInterviewModal";
import QuestionEditorModal from "../components/QuestionEditorModal";
import NotesPanel from "../components/NotesPanel";
import SessionStatusBar from "../components/SessionStatusBar";
import Spinner from "../components/Spinner";
import IconTile from "../components/IconTile";
import ElapsedTimer from "../components/ElapsedTimer";
import CopyInviteButton from "../components/CopyInviteButton";

// the video SDK and chat are the heaviest part of the page: load them after the first paint
const VideoCallUI = lazy(() => import("../components/VideoCallUI"));

function CenteredMessage({ children }) {
  return <div className="flex h-full items-center justify-center">{children}</div>;
}

function SessionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();

  const { data: sessionData, isLoading: loadingSession, refetch } = useSessionById(id);

  const { mutate: joinSession, isPending: isJoining, isError: joinFailed, error: joinError } = useJoinSession();
  const endSessionMutation = useEndSession();
  const submitQuizMutation = useSubmitQuiz();
  const questionMutations = useSessionQuestions();

  const [tab, setTab] = useState("problem");
  const [modal, setModal] = useState(null); // "end" | "finish" | "edit" | null
  const [editingQuestion, setEditingQuestion] = useState(undefined); // undefined: closed, null: new
  const [draft, setDraft] = useState({}); // candidate's quiz answers before submitting
  const session = sessionData?.session;
  const isHost = session?.host?.clerkId === user?.id;
  const isParticipant = session?.participant?.clerkId === user?.id;
  const isMember = isHost || isParticipant;
  const isActive = session?.status === "active";
  const hostNotes = useHostNotes(id, isHost ? session?.hostNotes : undefined);

  const { data: quiz, isLoading: loadingQuiz } = useSessionQuiz(id, {
    enabled: isMember && isActive,
  });

  const { call, channel, chatClient, isInitializingCall, streamClient } = useStreamClient(
    session,
    loadingSession,
    isHost,
    isParticipant
  );

  // find the problem data based on session problem title
  const problemData = session?.problem ? PROBLEM_LIST.find((p) => p.title === session.problem) : null;

  const {
    language: selectedLanguage,
    code,
    setCode,
    setLanguage: setSelectedLanguage,
    changeLanguage,
    reset: resetCode,
  } = useStarterCode(problemData);
  const { output, isRunning, run, reset } = useCodeRunner();

  // auto-join session if user is not already a participant and not the host
  useEffect(() => {
    if (!session || !user || loadingSession) return;
    if (isHost || isParticipant) return;
    if (isJoining || joinFailed) return;

    joinSession(id, { onSuccess: refetch });
  }, [session, user, loadingSession, isHost, isParticipant, id, isJoining, joinFailed, joinSession, refetch]);

  // everybody lands on the feedback page when the interview ends
  useEffect(() => {
    if (!session || loadingSession) return;

    if (session.status === "completed" && isMember) {
      navigate(`/session/${id}/result`, { replace: true });
    }
  }, [session, loadingSession, isMember, navigate, id]);

  // interviewer and candidate edit the same code; language switches are shared too
  const { broadcast } = useSharedCode({
    channel,
    userId: user?.id,
    code,
    language: selectedLanguage,
    onRemoteChange: ({ code: remoteCode, language }) => {
      if (language) setSelectedLanguage(language);
      if (typeof remoteCode === "string") setCode(remoteCode);
      reset();
    },
  });

  const handleLanguageChange = (e) => {
    const language = e.target.value;

    broadcast(changeLanguage(language), language);
    reset();
  };

  const handleResetCode = () => {
    broadcast(resetCode(), selectedLanguage);
    reset();
  };

  // the server runs the code, judges it and (for the candidate) records the run
  const handleRunCode = async () => {
    const result = await run(selectedLanguage, code, { sessionId: id });

    if (!result.success) toast.error(result.error ? "Code execution failed!" : "Code did not run");
    else toast[result.passed ? "success" : "error"](result.passed ? "All tests passed!" : "Tests failed.");
  };

  // ---- quiz ----

  const questions = quiz?.questions || [];
  const quizSubmitted = Boolean(quiz?.submitted);
  const answeredCount = quizSubmitted
    ? questions.filter((q) => q.selected !== null).length
    : questions.filter((q) => draft[q.id] !== undefined).length;

  const handleSubmitQuiz = () =>
    submitQuizMutation.mutate(
      { id, answers: draft },
      { onSuccess: () => toast.success("Answers submitted!") }
    );

  // candidate: send whatever is answered, then end the interview
  const handleFinish = async () => {
    try {
      if (!quizSubmitted) await submitQuizMutation.mutateAsync({ id, answers: draft });
    } catch (error) {
      // already submitted elsewhere is fine; anything else stops here
      if (error.response?.status !== 409) return;
    }

    endSessionMutation.mutate(
      { id },
      {
        onSuccess: () => navigate(`/session/${id}/result`, { replace: true }),
      }
    );
  };

  // host: what they see before making the final call
  const quizCorrect = questions.filter((q) => q.selected !== null && q.selected === q.answer).length;
  const quizPercent = questions.length ? Math.round((quizCorrect / questions.length) * 100) : 0;
  const testsPassed = session?.codeRuns?.some((r) => r.passed) ?? false;
  const quizPassed = quizSubmitted && quizPercent >= PASS_PERCENT;

  const endSummary = {
    testsPassed,
    quizSubmitted,
    quizCorrect,
    quizTotal: questions.length,
    quizPassed,
    suggested: testsPassed && quizPassed ? "accepted" : "rejected",
  };

  const handleEndSession = ({ decision, notes, rating }) => {
    endSessionMutation.mutate(
      { id, decision, notes, rating },
      {
        onSuccess: () => {
          setModal(null);
          navigate(`/session/${id}/result`, { replace: true });
        },
      }
    );
  };

  // ---- host edits the interview's questions ----

  const handleSaveQuestion = (values) => {
    const done = { onSuccess: () => setEditingQuestion(undefined) };

    if (editingQuestion) {
      questionMutations.update.mutate({ id, questionId: editingQuestion.id, ...values }, done);
    } else {
      questionMutations.add.mutate({ id, ...values }, done);
    }
  };

  const handleDeleteQuestion = (question) => {
    if (confirm("Remove this question from the interview?")) {
      questionMutations.remove.mutate({ id, questionId: question.id });
    }
  };

  // removed by the host (or the session is not joinable)
  if (joinFailed && !isMember) {
    return (
      <div className="flex h-screen flex-col bg-base-200">
        <Navbar />
        <CenteredMessage>
          <div className="panel max-w-md p-8 text-center">
            <IconTile icon={UserXIcon} tone="error" size="lg" className="mx-auto mb-4" />
            <h2 className="text-xl font-semibold">You can&apos;t join this session</h2>
            <p className="mt-1 text-base-content/70">
              {joinError?.response?.data?.message || "The session is not available."}
            </p>
            <Link to="/dashboard" className="btn btn-primary mt-6">
              Back to dashboard
            </Link>
          </div>
        </CenteredMessage>
      </div>
    );
  }

  return (
    <div className="flex h-screen animate-fade flex-col bg-base-100">
      <Navbar />

      <div className="flex-1">
        <PanelGroup direction="horizontal">
          {/* LEFT PANEL - PROBLEM DETAILS, CODE EDITOR & OUTPUT */}
          <Panel defaultSize={50} minSize={30}>
            <PanelGroup direction="vertical">
              <Panel defaultSize={50} minSize={20}>
                <div className="h-full overflow-y-auto bg-base-200">
                  <header className="space-y-4 border-b hairline bg-base-100 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        {problemData?.category && <p className="eyebrow mb-2">{problemData.category}</p>}
                        <h1 className="text-2xl font-semibold">{session?.problem || "Loading..."}</h1>
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">
                        {isActive && (
                          <ElapsedTimer
                            since={session.joinedAt || session.createdAt}
                            limitMinutes={session.timeLimitMinutes}
                          />
                        )}
                        <DifficultyBadge difficulty={session?.difficulty} />
                      </div>
                    </div>

                    {session && <SessionStatusBar session={session} userId={user?.id} />}

                    {isActive && (
                      <div className="flex flex-wrap items-center gap-2">
                        {isHost && (
                          <>
                            {!session.participant && (
                              <CopyInviteButton sessionId={id} className="btn btn-outline btn-sm gap-2" />
                            )}
                            <button className="btn btn-outline btn-sm gap-2" onClick={() => setModal("edit")}>
                              <SettingsIcon className="size-4" />
                              Edit session
                            </button>
                            <button className="btn btn-error btn-sm gap-2" onClick={() => setModal("end")}>
                              <LogOutIcon className="size-4" />
                              End Interview
                            </button>
                          </>
                        )}

                        {isParticipant && (
                          <button className="btn btn-primary btn-sm gap-2" onClick={() => setModal("finish")}>
                            <LogOutIcon className="size-4" />
                            Submit &amp; finish
                          </button>
                        )}
                      </div>
                    )}
                  </header>

                  <div role="tablist" className="flex border-b hairline bg-base-100 px-5">
                    {[
                      { key: "problem", label: "Problem" },
                      { key: "quiz", label: "Quiz" },
                      ...(isHost ? [{ key: "notes", label: "My notes" }] : []),
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        role="tab"
                        aria-selected={tab === key}
                        onClick={() => setTab(key)}
                        className={`-mb-px border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                          tab === key
                            ? "border-primary text-base-content"
                            : "border-transparent text-base-content/60 hover:text-base-content"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {tab === "problem" ? (
                    <ProblemDetails problem={problemData} />
                  ) : tab === "notes" && isHost ? (
                    <NotesPanel value={hostNotes.notes} status={hostNotes.status} onChange={hostNotes.update} />
                  ) : isMember ? (
                    <QuizPanel
                      quiz={quiz}
                      isLoading={loadingQuiz}
                      isHost={isHost}
                      draft={draft}
                      onSelect={(questionId, optionIdx) =>
                        setDraft((prev) => ({ ...prev, [questionId]: optionIdx }))
                      }
                      isSubmitting={submitQuizMutation.isPending}
                      onSubmit={handleSubmitQuiz}
                      onAddQuestion={() => setEditingQuestion(null)}
                      onEditQuestion={setEditingQuestion}
                      onDeleteQuestion={handleDeleteQuestion}
                    />
                  ) : null}
                </div>
              </Panel>

              <ResizeHandle direction="vertical" />

              <Panel defaultSize={50} minSize={20}>
                <PanelGroup direction="vertical">
                  <Panel defaultSize={70} minSize={30}>
                    <CodeEditorPanel
                      selectedLanguage={selectedLanguage}
                      code={code}
                      isRunning={isRunning}
                      onLanguageChange={handleLanguageChange}
                      onCodeChange={(value) => {
                        setCode(value);
                        broadcast(value, selectedLanguage);
                      }}
                      onRunCode={handleRunCode}
                      onReset={handleResetCode}
                    />
                  </Panel>

                  <ResizeHandle direction="vertical" />

                  <Panel defaultSize={30} minSize={15}>
                    <OutputPanel output={output} onClear={reset} />
                  </Panel>
                </PanelGroup>
              </Panel>
            </PanelGroup>
          </Panel>

          <ResizeHandle direction="horizontal" />

          {/* RIGHT PANEL - VIDEO CALLS & CHAT */}
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full overflow-auto bg-base-200 p-4">
              {isInitializingCall ? (
                <CenteredMessage>
                  <Spinner size="size-10" label="Connecting to video call..." />
                </CenteredMessage>
              ) : !streamClient || !call ? (
                <CenteredMessage>
                  <div className="panel max-w-md p-8 text-center">
                    <IconTile icon={PhoneOffIcon} tone="error" size="lg" className="mx-auto mb-4" />
                    <h2 className="text-xl font-semibold">Connection Failed</h2>
                    <p className="mt-1 text-base-content/70">Unable to connect to the video call</p>
                  </div>
                </CenteredMessage>
              ) : (
                <div className="h-full">
                  <StreamVideo client={streamClient}>
                    <StreamCall call={call}>
                      <Suspense
                        fallback={
                          <CenteredMessage>
                            <Spinner size="size-10" />
                          </CenteredMessage>
                        }
                      >
                        <VideoCallUI chatClient={chatClient} channel={channel} />
                      </Suspense>
                    </StreamCall>
                  </StreamVideo>
                </div>
              )}
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {modal === "end" && (
        <EndSessionModal
          onClose={() => setModal(null)}
          onConfirm={handleEndSession}
          isEnding={endSessionMutation.isPending}
          summary={endSummary}
          initialNotes={hostNotes.notes}
        />
      )}

      {modal === "finish" && (
        <FinishInterviewModal
          answered={answeredCount}
          total={questions.length}
          alreadySubmitted={quizSubmitted}
          isFinishing={submitQuizMutation.isPending || endSessionMutation.isPending}
          onConfirm={handleFinish}
          onClose={() => setModal(null)}
        />
      )}

      {modal === "edit" && session && <EditSessionModal session={session} onClose={() => setModal(null)} />}

      {editingQuestion !== undefined && (
        <QuestionEditorModal
          // remount per question so the form starts from that question's values
          key={editingQuestion?.id ?? "new"}
          title={editingQuestion ? "Edit question" : "Add question"}
          initial={editingQuestion}
          offerSaveToBank={!editingQuestion}
          isSaving={questionMutations.add.isPending || questionMutations.update.isPending}
          onSave={handleSaveQuestion}
          onClose={() => setEditingQuestion(undefined)}
        />
      )}
    </div>
  );
}

export default SessionPage;
