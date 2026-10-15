import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { useActiveSessions, useCreateSession, useMyRecentSessions } from "../hooks/useSessions";

import Navbar from "../components/Navbar";
import WelcomeSection from "../components/WelcomeSection";
import StatsCards from "../components/StatsCards";
import ActiveSessions from "../components/ActiveSessions";
import RecentSessions from "../components/RecentSessions";
import CreateSessionModal from "../components/CreateSessionModal";
import EditSessionModal from "../components/EditSessionModal";

const EMPTY_ROOM = { problem: "", difficulty: "", timeLimitMinutes: 0 };

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [params, setParams] = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [roomConfig, setRoomConfig] = useState(EMPTY_ROOM);

  const createSessionMutation = useCreateSession();

  const { data: activeSessionsData, isLoading: loadingActiveSessions } = useActiveSessions();
  const { data: recentSessionsData, isLoading: loadingRecentSessions } = useMyRecentSessions();

  // the command palette links to /dashboard?new=1
  useEffect(() => {
    if (params.get("new") === "1") {
      setShowCreateModal(true);
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  const handleCreateRoom = () => {
    if (!roomConfig.problem || !roomConfig.difficulty) return;

    createSessionMutation.mutate(
      {
        problem: roomConfig.problem,
        difficulty: roomConfig.difficulty.toLowerCase(),
        timeLimitMinutes: roomConfig.timeLimitMinutes,
      },
      {
        onSuccess: (data) => {
          setShowCreateModal(false);
          setRoomConfig(EMPTY_ROOM);
          navigate(`/session/${data.session._id}`);
        },
      }
    );
  };

  const activeSessions = activeSessionsData?.sessions || [];
  const recentSessions = recentSessionsData?.sessions || [];
  const acceptedCount = recentSessions.filter((s) => s.result?.verdict === "accepted").length;

  const isHostOf = (session) => session.host?.clerkId === user?.id;
  const isUserInSession = (session) =>
    Boolean(user?.id) && (isHostOf(session) || session.participant?.clerkId === user.id);

  return (
    <>
      <div className="min-h-screen animate-fade bg-base-200">
        <Navbar />
        <WelcomeSection onCreateSession={() => setShowCreateModal(true)} />

        <div className="mx-auto max-w-7xl px-6 pb-16">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <StatsCards
              activeSessionsCount={activeSessions.length}
              recentSessionsCount={recentSessions.length}
              acceptedCount={acceptedCount}
            />
            <ActiveSessions
              sessions={activeSessions}
              isLoading={loadingActiveSessions}
              isUserInSession={isUserInSession}
              isHostOf={isHostOf}
              onEdit={setEditingSession}
            />
          </div>

          <RecentSessions sessions={recentSessions} isLoading={loadingRecentSessions} />
        </div>
      </div>

      {editingSession && (
        <EditSessionModal
          // the list keeps refreshing, so show the latest copy of the session being edited
          session={activeSessions.find((s) => s._id === editingSession._id) || editingSession}
          onClose={() => setEditingSession(null)}
        />
      )}

      {showCreateModal && (
        <CreateSessionModal
          onClose={() => setShowCreateModal(false)}
          roomConfig={roomConfig}
          setRoomConfig={setRoomConfig}
          onCreateRoom={handleCreateRoom}
          isCreating={createSessionMutation.isPending}
        />
      )}
    </>
  );
}

export default DashboardPage;
