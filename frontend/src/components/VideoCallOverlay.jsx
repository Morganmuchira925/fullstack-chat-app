import { useEffect } from "react";
import {
  StreamVideo,
  StreamCall,
  StreamTheme,
  CallControls,
  useCallStateHooks,
  ParticipantView,
  ParticipantsAudio,
  CallingState,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useCallStore } from "../store/useCallStore";
import { useChatStore } from "../store/useChatStore";

const CallUI = () => {
  const {
    useCallCallingState,
    useLocalParticipant,
    useRemoteParticipants,
  } = useCallStateHooks();

  const callingState = useCallCallingState();
  const localParticipant = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();

  const { endCall } = useCallStore();
  const { selectedUser } = useChatStore();

  useEffect(() => {
    if (callingState === CallingState.LEFT || callingState === CallingState.IDLE) {
      endCall(selectedUser);
    }
  }, [callingState]);

  // Not yet joined — show loading
  if (callingState !== CallingState.JOINED) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "#111827" }}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>Connecting…</p>
      </div>
    );
  }

  const remoteParticipant = remoteParticipants[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#111827" }}>

      {/* ParticipantsAudio handles all remote audio — renders hidden <audio> elements */}
      <ParticipantsAudio participants={remoteParticipants} />

      {/* Video area — explicit pixel height so ParticipantView can paint */}
      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>

        {/* Remote video — fills the area */}
        {remoteParticipant ? (
          <div style={{ position: "absolute", inset: 0 }}>
            <ParticipantView
              participant={remoteParticipant}
              muteAudio={true}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        ) : (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "16px"
          }}>
            <div className="avatar">
              <div className="size-20 rounded-full ring ring-primary ring-offset-2 ring-offset-gray-900" style={{ animation: "pulse 2s infinite" }}>
                <img src={selectedUser?.profilePic || "/avatar.png"} alt={selectedUser?.fullName} />
              </div>
            </div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
              Waiting for {selectedUser?.fullName} to join…
            </p>
          </div>
        )}

        {/* Local PiP — bottom-right corner with explicit pixel dimensions */}
        {localParticipant && (
          <div style={{
            position: "absolute", bottom: "16px", right: "16px",
            width: "140px", height: "100px",
            borderRadius: "12px", overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            border: "2px solid rgba(255,255,255,0.2)",
            zIndex: 10,
          }}>
            <ParticipantView
              participant={localParticipant}
              muteAudio={true}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px", background: "rgba(31,41,55,0.9)",
        backdropFilter: "blur(8px)", flexShrink: 0,
      }}>
        <CallControls onLeave={() => endCall(selectedUser)} />
      </div>
    </div>
  );
};

const VideoCallOverlay = () => {
  const { activeCall, callState, streamClient } = useCallStore();

  if (callState !== "in-call" || !activeCall || !streamClient) return null;

  return (
    // Explicit pixel height via vh so children can use height:100%
    <div style={{ position: "fixed", inset: 0, zIndex: 40, display: "flex", flexDirection: "column", height: "100vh" }}>
      <StreamVideo client={streamClient}>
        <StreamCall call={activeCall}>
          <StreamTheme style={{ height: "100%" }}>
            <CallUI />
          </StreamTheme>
        </StreamCall>
      </StreamVideo>
    </div>
  );
};

export default VideoCallOverlay;