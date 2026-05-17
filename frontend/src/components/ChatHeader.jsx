import { X, Video, VideoOff, Mic, MicOff, Phone, PhoneOff, PhoneIncoming } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useCallStore } from "../store/useCallStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const {
    callState,
    incomingCall,
    isCameraOn,
    isMicOn,
    togglePreCamera,
    togglePreMic,
    startCall,
    confirmCall,
    acceptCall,
    declineCall,
    endCall,
  } = useCallStore();

  const isOnline = onlineUsers.includes(selectedUser._id);
  const isInCall = callState === "in-call" || callState === "calling";

  return (
    <>
      <div className="p-2.5 border-b border-base-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="avatar">
              <div className="size-10 rounded-full relative">
                <img
                  src={selectedUser.profilePic || "/avatar.png"}
                  alt={selectedUser.fullName}
                />
              </div>
            </div>

            {/* User info */}
            <div>
              <h3 className="font-medium">{selectedUser.fullName}</h3>
              <p className="text-sm text-base-content/70">
                {isInCall
                  ? "In call..."
                  : isOnline
                  ? "Online"
                  : "Offline"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Video call button — only show when not already in a call */}
            {callState === "idle" && (
              <button
                onClick={() => startCall(selectedUser)}
                className={`btn btn-sm btn-ghost btn-circle transition-colors ${
                  isOnline
                    ? "text-base-content hover:text-primary hover:bg-primary/10"
                    : "text-base-content/30 cursor-not-allowed"
                }`}
                disabled={!isOnline}
                title={isOnline ? "Start video call" : "User is offline"}
              >
                <Video className="size-5" />
              </button>
            )}

            {/* End call button — show when calling or in-call */}
            {isInCall && (
              <button
                onClick={() => endCall(selectedUser)}
                className="btn btn-sm btn-error btn-circle animate-pulse"
                title="End call"
              >
                <PhoneOff className="size-4" />
              </button>
            )}

            {/* Close chat button */}
            <button
              onClick={() => setSelectedUser(null)}
              className="btn btn-sm btn-ghost btn-circle"
            >
              <X />
            </button>
          </div>
        </div>
      </div>

      {/* ── Pre-call modal (camera / mic preferences) ── */}
      {callState === "pre-call" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-base-300">
              <p className="text-xs text-base-content/50 uppercase tracking-widest mb-1">
                Video call
              </p>
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="size-10 rounded-full">
                    <img
                      src={selectedUser.profilePic || "/avatar.png"}
                      alt={selectedUser.fullName}
                    />
                  </div>
                </div>
                <h3 className="font-semibold text-lg">{selectedUser.fullName}</h3>
              </div>
            </div>

            {/* Camera / mic toggles */}
            <div className="px-6 py-5 flex items-center justify-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={togglePreCamera}
                  className={`btn btn-circle btn-lg transition-all ${
                    isCameraOn
                      ? "btn-primary"
                      : "btn-ghost border border-base-300 text-base-content/40"
                  }`}
                  title={isCameraOn ? "Turn camera off" : "Turn camera on"}
                >
                  {isCameraOn ? (
                    <Video className="size-6" />
                  ) : (
                    <VideoOff className="size-6" />
                  )}
                </button>
                <span className="text-xs text-base-content/60">
                  {isCameraOn ? "Camera on" : "Camera off"}
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={togglePreMic}
                  className={`btn btn-circle btn-lg transition-all ${
                    isMicOn
                      ? "btn-primary"
                      : "btn-ghost border border-base-300 text-base-content/40"
                  }`}
                  title={isMicOn ? "Mute mic" : "Unmute mic"}
                >
                  {isMicOn ? (
                    <Mic className="size-6" />
                  ) : (
                    <MicOff className="size-6" />
                  )}
                </button>
                <span className="text-xs text-base-content/60">
                  {isMicOn ? "Mic on" : "Mic off"}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => useCallStore.getState().endCall(null)}
                className="btn btn-ghost flex-1 border border-base-300"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmCall(selectedUser)}
                className="btn btn-primary flex-1"
              >
                <Phone className="size-4" />
                Start call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Calling… overlay (waiting for receiver to pick up) ── */}
      {callState === "calling" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 flex flex-col items-center gap-5">
            <div className="avatar">
              <div className="size-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img
                  src={selectedUser.profilePic || "/avatar.png"}
                  alt={selectedUser.fullName}
                />
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">{selectedUser.fullName}</h3>
              <p className="text-base-content/60 text-sm mt-1 animate-pulse">
                Calling…
              </p>
            </div>
            <button
              onClick={() => endCall(selectedUser)}
              className="btn btn-error btn-circle btn-lg"
              title="Cancel call"
            >
              <PhoneOff className="size-6" />
            </button>
          </div>
        </div>
      )}

      {/* ── Incoming call overlay ── */}
      {callState === "incoming" && incomingCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 flex flex-col items-center gap-5">
            <div className="avatar">
              <div className="size-20 rounded-full ring ring-success ring-offset-base-100 ring-offset-2 animate-pulse">
                <img
                  src={incomingCall.callerPic || "/avatar.png"}
                  alt={incomingCall.callerName}
                />
              </div>
            </div>
            <div className="text-center">
              <p className="text-base-content/60 text-sm flex items-center justify-center gap-1.5">
                <PhoneIncoming className="size-4 text-success" />
                Incoming video call
              </p>
              <h3 className="font-semibold text-lg mt-1">{incomingCall.callerName}</h3>
            </div>

            {/* Camera / mic prefs before answering */}
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={togglePreCamera}
                  className={`btn btn-circle btn-sm ${
                    isCameraOn ? "btn-primary" : "btn-ghost border border-base-300"
                  }`}
                >
                  {isCameraOn ? <Video className="size-4" /> : <VideoOff className="size-4" />}
                </button>
                <span className="text-xs text-base-content/50">
                  {isCameraOn ? "On" : "Off"}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={togglePreMic}
                  className={`btn btn-circle btn-sm ${
                    isMicOn ? "btn-primary" : "btn-ghost border border-base-300"
                  }`}
                >
                  {isMicOn ? <Mic className="size-4" /> : <MicOff className="size-4" />}
                </button>
                <span className="text-xs text-base-content/50">
                  {isMicOn ? "On" : "Off"}
                </span>
              </div>
            </div>

            <div className="flex gap-4 w-full">
              <button
                onClick={declineCall}
                className="btn btn-error flex-1"
              >
                <PhoneOff className="size-4" />
                Decline
              </button>
              <button
                onClick={acceptCall}
                className="btn btn-success flex-1"
              >
                <Phone className="size-4" />
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatHeader;