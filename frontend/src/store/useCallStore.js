import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

export const useCallStore = create((set, get) => ({
  // The active Stream call object (set after joining)
  activeCall: null,
  // The Stream video client
  streamClient: null,
  // "idle" | "pre-call" | "calling" | "incoming" | "in-call"
  callState: "idle",
  // Details of incoming call (populated when receiving callInvite)
  incomingCall: null,
  // User preferences before joining
  isCameraOn: true,
  isMicOn: true,

  // ── Preferences ────────────────────────────────────────────────────────────
  togglePreCamera: () => set((s) => ({ isCameraOn: !s.isCameraOn })),
  togglePreMic: () => set((s) => ({ isMicOn: !s.isMicOn })),

  // ── Init Stream client ──────────────────────────────────────────────────────
  initStreamClient: async () => {
    // Avoid re-initialising if already done
    if (get().streamClient) return get().streamClient;

    try {
      const { StreamVideoClient } = await import("@stream-io/video-react-sdk");
      const { data } = await axiosInstance.get("/stream/token");
      const { authUser } = useAuthStore.getState();

      const client = new StreamVideoClient({
        apiKey: data.apiKey,
        user: {
          id: authUser._id.toString(),
          name: authUser.fullName,
          image: authUser.profilePic || "/avatar.png",
        },
        token: data.token,
      });

      set({ streamClient: client });
      return client;
    } catch (error) {
      console.error("Failed to init Stream client:", error);
      toast.error("Could not connect to call service");
      return null;
    }
  },

  // ── Outgoing call ───────────────────────────────────────────────────────────
  startCall: async (selectedUser) => {
    set({ callState: "pre-call" });

    // Init stream client in background so it's ready when user confirms
    get().initStreamClient();
  },

  confirmCall: async (selectedUser) => {
    const { streamClient, isCameraOn, isMicOn } = get();
    const { authUser, socket } = useAuthStore.getState();

    const client = streamClient || (await get().initStreamClient());
    if (!client) return;

    try {
      set({ callState: "calling" });

      // Stream enforces a 64-char max on call IDs.
      // Use only the last 8 chars of each MongoDB ObjectId + a short timestamp.
      const shortCaller = authUser._id.toString().slice(-8);
      const shortReceiver = selectedUser._id.toString().slice(-8);
      const ts = Date.now().toString(36); // e.g. "lf2abc1" — compact base-36
      const callId = `call-${shortCaller}-${shortReceiver}-${ts}`; // ~28 chars

      // Register the call on the backend (Stream server-side)
      await axiosInstance.post("/stream/call", {
        callId,
        receiverId: selectedUser._id.toString(),
      });

      // Join the call
      const call = client.call("default", callId);
      await call.join({ create: false });

      // Apply user's pre-call preferences
      if (!isCameraOn) await call.camera.disable();
      if (!isMicOn) await call.microphone.disable();

      set({ activeCall: call, callState: "in-call" });

      // Notify receiver via existing socket
      socket.emit("callInvite", {
        callId,
        callType: "default",
        receiverId: selectedUser._id.toString(),
        callerName: authUser.fullName,
        callerPic: authUser.profilePic || "/avatar.png",
      });
    } catch (error) {
      console.error("Error starting call:", error);
      toast.error("Failed to start call");
      set({ callState: "idle", activeCall: null });
    }
  },

  // ── Incoming call ───────────────────────────────────────────────────────────
  receiveCall: (callData) => {
    set({ incomingCall: callData, callState: "incoming" });
  },

  acceptCall: async () => {
    const { incomingCall, isCameraOn, isMicOn } = get();
    const { socket } = useAuthStore.getState();

    const client = get().streamClient || (await get().initStreamClient());
    if (!client || !incomingCall) return;

    try {
      const call = client.call(incomingCall.callType || "default", incomingCall.callId);
      await call.join({ create: false });

      if (!isCameraOn) await call.camera.disable();
      if (!isMicOn) await call.microphone.disable();

      set({ activeCall: call, callState: "in-call", incomingCall: null });

      // Tell the caller we accepted
      socket.emit("callAccepted", {
        callId: incomingCall.callId,
        callerId: incomingCall.callerId,
      });
    } catch (error) {
      console.error("Error accepting call:", error);
      toast.error("Failed to join call");
      set({ callState: "idle", incomingCall: null });
    }
  },

  declineCall: () => {
    const { incomingCall } = get();
    const { socket } = useAuthStore.getState();

    if (incomingCall) {
      socket.emit("callDeclined", {
        callId: incomingCall.callId,
        callerId: incomingCall.callerId,
      });
    }
    set({ callState: "idle", incomingCall: null });
  },

  // ── End call ────────────────────────────────────────────────────────────────
  endCall: async (selectedUser) => {
    const { activeCall } = get();
    const { socket } = useAuthStore.getState();

    try {
      if (activeCall) {
        await activeCall.leave();
      }
    } catch (e) {
      console.error("Error leaving call:", e);
    }

    if (selectedUser) {
      socket.emit("callEnded", {
        callId: activeCall?.id,
        receiverId: selectedUser._id.toString(),
      });
    }

    set({ activeCall: null, callState: "idle", incomingCall: null });
  },

  // ── Socket listeners (called once on app mount) ─────────────────────────────
  subscribeToCallEvents: () => {
    const { socket } = useAuthStore.getState();
    if (!socket) return;

    socket.on("incomingCall", (callData) => {
      // Don't interrupt an ongoing call
      if (get().callState === "in-call") return;
      get().receiveCall(callData);
    });

    socket.on("callAccepted", ({ callId }) => {
      if (get().callState === "calling") {
        set({ callState: "in-call" });
      }
    });

    socket.on("callDeclined", () => {
      if (get().callState === "calling") {
        toast("Call was declined", { icon: "📵" });
        set({ callState: "idle", activeCall: null });
      }
    });

    socket.on("callEnded", () => {
      const { activeCall } = get();
      if (activeCall) activeCall.leave().catch(console.error);
      set({ callState: "idle", activeCall: null, incomingCall: null });
      toast("Call ended", { icon: "📞" });
    });
  },

  unsubscribeFromCallEvents: () => {
    const { socket } = useAuthStore.getState();
    if (!socket) return;
    socket.off("incomingCall");
    socket.off("callAccepted");
    socket.off("callDeclined");
    socket.off("callEnded");
  },
}));