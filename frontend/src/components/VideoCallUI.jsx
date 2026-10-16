import {
  CallControls,
  CallingState,
  SpeakerLayout,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { FlagIcon, MessageSquareIcon, ScanEyeIcon, ShieldCheckIcon, UsersIcon, XIcon } from "lucide-react";
import Spinner from "./Spinner";
import LiveCaptions from "./LiveCaptions";
import CaptionsControl from "./CaptionsControl";
import ProctoringOverlay from "./ProctoringOverlay";
import ProctorAlert from "./ProctorAlert";
import useProctoring from "../hooks/useProctoring";
import { getLang, t } from "../lib/i18n";
import { getStored, setStored } from "../lib/storage";
import { REPORTABLE_DEVICES, deviceLabel } from "../lib/devices";
import { memo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { useTheme } from "../lib/theme";
import { Channel, Chat, MessageInput, MessageList, Thread, Window } from "stream-chat-react";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import "stream-chat-react/dist/css/v2/index.css";

function VideoCallUI({ chatClient, channel, sessionId, isHost = false, proctoring = false }) {
  const navigate = useNavigate();
  const { useCallCallingState, useParticipantCount, useMicrophoneState, useRemoteParticipants } =
    useCallStateHooks();
  const { user } = useUser();
  const call = useCall();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const { isMute: micMuted } = useMicrophoneState();
  const remoteParticipants = useRemoteParticipants();
  const videoAreaRef = useRef(null);

  // Device detection: the host's browser keeps an eye on the candidate's camera
  const candidateStream = isHost ? remoteParticipants.find((p) => p.videoStream)?.videoStream : undefined;
  const proctor = useProctoring({ channel, userId: user?.id, isHost, sessionId });
  const [detectionStatus, setDetectionStatus] = useState("idle");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const theme = useTheme();

  // Live translation: remembered per browser, and the language you speak defaults to the page language
  const [captionsOn, setCaptionsOn] = useState(() => getStored("captions") !== "off");
  const [spokenLang, setSpokenLang] = useState(() => getStored("spokenLang") || getLang());

  const toggleCaptions = () => {
    setStored("captions", captionsOn ? "off" : "on");
    setCaptionsOn(!captionsOn);
  };

  const changeSpokenLang = (lang) => {
    setStored("spokenLang", lang);
    setSpokenLang(lang);
  };

  if (callingState === CallingState.JOINING) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="size-10" label={t("video.joining", "Joining call...")} />
      </div>
    );
  }

  const hasChat = chatClient && channel;

  return (
    <div className="str-video relative flex h-full gap-3">
      <div className="flex flex-1 flex-col gap-3">
        <div className="panel flex items-center justify-between gap-2 px-4 py-2.5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium">
            <span className="flex items-center gap-2">
              <UsersIcon className="size-4 text-primary" />
            {participantCount === 1
              ? t("video.one", "{n} participant", { n: participantCount })
              : t("video.many", "{n} participants", { n: participantCount })}
            </span>

            {proctoring && (
              <span
                className={`flex items-center gap-1.5 text-xs font-normal ${
                  detectionStatus === "error" ? "text-warning" : "text-base-content/60"
                }`}
                title={t("proctor.notice", "Prohibited devices (phones, laptops) are detected on the candidate's camera. Video is analysed in the browser and is not recorded.")}
              >
                {isHost ? <ScanEyeIcon className="size-3.5" /> : <ShieldCheckIcon className="size-3.5" />}
                {isHost
                  ? {
                      idle: t("proctor.idle", "Device detection: waiting for the candidate"),
                      loading: t("proctor.loading", "Device detection: loading..."),
                      active: t("proctor.active", "Device detection: active"),
                      error: t("proctor.error", "Device detection unavailable"),
                    }[candidateStream ? detectionStatus : "idle"]
                  : t("proctor.candNotice", "Device detection is on for this interview")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isHost && proctoring && (
              <div className="dropdown dropdown-end">
                <button
                  tabIndex={0}
                  className="btn btn-ghost btn-sm gap-2"
                  title={t("proctor.reportTitle", "Report a prohibited device you can see")}
                >
                  <FlagIcon className="size-4" />
                  <span className="hidden xl:inline">{t("proctor.report", "Report device")}</span>
                </button>
                <ul tabIndex={0} className="dropdown-content panel z-[60] mt-2 w-48 p-1 shadow-xl">
                  {REPORTABLE_DEVICES.map((device) => (
                    <li key={device}>
                      <button
                        className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-base-200"
                        onClick={() => {
                          proctor.report(device);
                          document.activeElement?.blur();
                        }}
                      >
                        {deviceLabel(device)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hasChat && (
              <CaptionsControl
                enabled={captionsOn}
                onToggle={toggleCaptions}
                spokenLang={spokenLang}
                onSpokenLangChange={changeSpokenLang}
              />
            )}

            {hasChat && (
              <button
                onClick={() => setIsChatOpen((open) => !open)}
                className={`btn btn-sm gap-2 ${isChatOpen ? "btn-primary" : "btn-ghost"}`}
                title={isChatOpen ? t("video.hideChat", "Hide chat") : t("video.showChat", "Show chat")}
              >
                <MessageSquareIcon className="size-4" />
                {t("video.chat", "Chat")}
              </button>
            )}
          </div>
        </div>

        <div ref={videoAreaRef} className="relative flex-1 overflow-hidden rounded-lg border hairline bg-base-300">
          <SpeakerLayout />

          {/* Stays mounted during the countdown so the red box keeps following the device */}
          {isHost && proctoring && candidateStream && (
            <ProctoringOverlay
              stream={candidateStream}
              containerRef={videoAreaRef}
              onStatus={setDetectionStatus}
              onViolation={proctor.handleViolation}
            />
          )}

          <LiveCaptions
            channel={channel}
            call={call}
            userId={user?.id}
            enabled={captionsOn}
            muted={micMuted}
            spokenLang={spokenLang}
            targetLang={getLang()}
          />

          {proctor.alert && (
            <ProctorAlert
              device={proctor.alert.device}
              deadline={proctor.alert.deadline}
              isHost={isHost}
              onCancel={proctor.cancel}
              onRemoveNow={proctor.removeNow}
            />
          )}
        </div>

        <div className="panel flex justify-center p-3">
          <CallControls onLeave={() => navigate("/dashboard")} />
        </div>
      </div>

      {hasChat && (
        <div
          className={`flex flex-col overflow-hidden rounded-lg border hairline bg-base-200 transition-all duration-300 ease-in-out ${
            isChatOpen ? "w-80 opacity-100" : "w-0 border-0 opacity-0"
          }`}
        >
          {isChatOpen && (
            <>
              <div className="flex items-center justify-between border-b hairline bg-base-300 p-3">
                <h3 className="eyebrow">{t("video.sessionChat", "Session Chat")}</h3>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-base-content/60 transition-colors hover:text-base-content"
                  title={t("video.closeChat", "Close chat")}
                >
                  <XIcon className="size-5" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <Chat client={chatClient} theme={`str-chat__theme-${theme}`}>
                  <Channel channel={channel}>
                    <Window>
                      <MessageList />
                      <MessageInput />
                    </Window>
                    <Thread />
                  </Channel>
                </Chat>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Memoised on purpose: typing in the editor or the notes re-renders the session page, but the call UI shouldn't care
export default memo(VideoCallUI);
