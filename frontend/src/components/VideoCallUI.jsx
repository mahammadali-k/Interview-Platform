import {
  CallControls,
  CallingState,
  SpeakerLayout,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { MessageSquareIcon, UsersIcon, XIcon } from "lucide-react";
import Spinner from "./Spinner";
import LiveCaptions from "./LiveCaptions";
import CaptionsControl from "./CaptionsControl";
import useLiveCaptions from "../hooks/useLiveCaptions";
import { getLang, t } from "../lib/i18n";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { useTheme } from "../lib/theme";
import { Channel, Chat, MessageInput, MessageList, Thread, Window } from "stream-chat-react";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import "stream-chat-react/dist/css/v2/index.css";

// storage can be blocked (private mode), and the call must keep working without it
const readSetting = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeSetting = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // the choice just won't persist
  }
};

function VideoCallUI({ chatClient, channel }) {
  const navigate = useNavigate();
  const { useCallCallingState, useParticipantCount, useMicrophoneState } = useCallStateHooks();
  const { user } = useUser();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const { isMute: micMuted } = useMicrophoneState();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const theme = useTheme();

  // live translation: remembered per browser; the spoken language defaults to the page language
  const [captionsOn, setCaptionsOn] = useState(() => readSetting("captions") !== "off");
  const [spokenLang, setSpokenLang] = useState(() => readSetting("spokenLang") || getLang());

  const { lines } = useLiveCaptions({
    channel,
    userId: user?.id,
    enabled: captionsOn,
    muted: micMuted,
    spokenLang,
    targetLang: getLang(),
  });

  const toggleCaptions = () => {
    writeSetting("captions", captionsOn ? "off" : "on");
    setCaptionsOn(!captionsOn);
  };

  const changeSpokenLang = (lang) => {
    writeSetting("spokenLang", lang);
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
          <div className="flex items-center gap-2 text-sm font-medium">
            <UsersIcon className="size-4 text-primary" />
            {participantCount === 1
              ? t("video.one", "{n} participant", { n: participantCount })
              : t("video.many", "{n} participants", { n: participantCount })}
          </div>

          <div className="flex items-center gap-2">
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

        <div className="relative flex-1 overflow-hidden rounded-lg border hairline bg-base-300">
          <SpeakerLayout />
          <LiveCaptions lines={lines} />
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

export default VideoCallUI;
