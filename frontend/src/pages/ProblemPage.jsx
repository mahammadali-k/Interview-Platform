import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Panel, PanelGroup } from "react-resizable-panels";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

import { PROBLEMS } from "../data/problems";
import useCodeRunner from "../hooks/useCodeRunner";
import useStarterCode from "../hooks/useStarterCode";
import Navbar from "../components/Navbar";
import ProblemDescription from "../components/ProblemDescription";
import OutputPanel from "../components/OutputPanel";
import CodeEditorPanel from "../components/CodeEditorPanel";
import ResizeHandle from "../components/ResizeHandle";
import { t } from "../lib/i18n";

const DEFAULT_PROBLEM_ID = "two-sum";
const ALL_PROBLEMS = Object.values(PROBLEMS);

const triggerConfetti = () => {
  [0.2, 0.8].forEach((x) =>
    confetti({ particleCount: 80, spread: 250, origin: { x, y: 0.6 } })
  );
};

function ProblemPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const problemId = PROBLEMS[id] ? id : DEFAULT_PROBLEM_ID;
  const currentProblem = PROBLEMS[problemId];

  const { language: selectedLanguage, code, setCode, changeLanguage, reset: resetCode } =
    useStarterCode(currentProblem);
  const { output, isRunning, run, reset } = useCodeRunner();

  // a different problem should start with a clean output
  useEffect(() => reset(), [problemId, reset]);

  const handleRunCode = async () => {
    // the server runs the code in a sandbox and judges the output
    const result = await run(selectedLanguage, code, { problem: currentProblem.title });

    if (!result.success) {
      toast.error(t("run.failed", "Code execution failed!"));
      return;
    }

    if (result.passed) {
      triggerConfetti();
      toast.success(t("run.passedGreat", "All tests passed! Great job!"));
    } else {
      toast.error(t("run.testsFailedCheck", "Tests failed. Check your output!"));
    }
  };

  return (
    <div className="flex h-screen animate-fade flex-col bg-base-100">
      <Navbar />

      <div className="flex-1">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={40} minSize={30}>
            <ProblemDescription
              problem={currentProblem}
              currentProblemId={problemId}
              onProblemChange={(newId) => navigate(`/problem/${newId}`)}
              allProblems={ALL_PROBLEMS}
            />
          </Panel>

          <ResizeHandle direction="horizontal" />

          <Panel defaultSize={60} minSize={30}>
            <PanelGroup direction="vertical">
              <Panel defaultSize={70} minSize={30}>
                <CodeEditorPanel
                  selectedLanguage={selectedLanguage}
                  code={code}
                  isRunning={isRunning}
                  onLanguageChange={(e) => {
                    changeLanguage(e.target.value);
                    reset();
                  }}
                  onCodeChange={setCode}
                  onRunCode={handleRunCode}
                  onReset={() => {
                    resetCode();
                    reset();
                  }}
                />
              </Panel>

              <ResizeHandle direction="vertical" />

              <Panel defaultSize={30} minSize={30}>
                <OutputPanel output={output} onClear={reset} />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default ProblemPage;
