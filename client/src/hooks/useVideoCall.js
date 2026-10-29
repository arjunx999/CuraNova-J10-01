import { useCallback, useEffect, useRef, useState } from "react";
import { socket } from "../socket";
import { getAccessToken } from "../api/tokenStore";

const peerConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const useVideoCall = ({ appointmentId, role }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [status, setStatus] = useState("Ready to join");
  const [error, setError] = useState("");
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const handlersRef = useRef(null);
  const joinedRef = useRef(false);
  const joiningRef = useRef(false);
  const offerCreatedRef = useRef(false);
  const pendingCandidatesRef = useRef([]);
  const generationRef = useRef(0);
  const mountedRef = useRef(false);
  const appointmentIdRef = useRef(appointmentId);
  const roleRef = useRef(role);

  appointmentIdRef.current = appointmentId;
  roleRef.current = role;

  const setStatusIfMounted = useCallback((value) => {
    if (mountedRef.current) setStatus(value);
  }, []);

  const setErrorIfMounted = useCallback((value) => {
    if (mountedRef.current) setError(value);
  }, []);

  const removeSocketHandlers = useCallback(() => {
    const handlers = handlersRef.current;
    if (!handlers) return;

    socket.off("connect", handlers.onConnect);
    socket.off("connect_error", handlers.onConnectError);
    socket.off("disconnect", handlers.onDisconnect);
    socket.off("consultation-peer-joined", handlers.onPeerJoined);
    socket.off("consultation-peer-left", handlers.onPeerLeft);
    socket.off("consultation-offer", handlers.onOffer);
    socket.off("consultation-answer", handlers.onAnswer);
    socket.off("consultation-ice-candidate", handlers.onCandidate);
    socket.off("consultation-error", handlers.onConsultationError);
    handlersRef.current = null;
  }, []);

  const cleanup = useCallback(
    ({ notify = false, nextStatus = "Call ended" } = {}) => {
      generationRef.current += 1;
      joiningRef.current = false;

      if (notify && joinedRef.current && socket.connected) {
        socket.emit("leave-consultation", {
          appointmentId: appointmentIdRef.current,
        });
      }
      joinedRef.current = false;
      removeSocketHandlers();

      const peer = peerRef.current;
      peerRef.current = null;
      if (peer) {
        peer.ontrack = null;
        peer.onicecandidate = null;
        peer.onconnectionstatechange = null;
        peer.oniceconnectionstatechange = null;
        peer.close();
      }

      const stream = localStreamRef.current;
      localStreamRef.current = null;
      stream?.getTracks().forEach((track) => track.stop());
      pendingCandidatesRef.current = [];
      offerCreatedRef.current = false;

      if (mountedRef.current) {
        setLocalStream(null);
        setRemoteStream(null);
        setMicrophoneEnabled(true);
        setCameraEnabled(true);
        setError("");
        setStatus(nextStatus);
      }
    },
    [removeSocketHandlers],
  );

  const reportFailure = useCallback(
    (message) => {
      setErrorIfMounted(message);
      setStatusIfMounted("Call failed");
    },
    [setErrorIfMounted, setStatusIfMounted],
  );

  const start = useCallback(async () => {
    if (joiningRef.current || localStreamRef.current) return;
    if (!appointmentIdRef.current || !["patient", "doctor"].includes(roleRef.current)) {
      reportFailure("A valid appointment and signed-in role are required.");
      return;
    }
    if (!getAccessToken()) {
      reportFailure("Your session is not ready. Please sign in again.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      reportFailure("This browser does not support camera and microphone access.");
      return;
    }

    joiningRef.current = true;
    const generation = ++generationRef.current;
    setErrorIfMounted("");
    setStatusIfMounted("Requesting camera and microphone…");

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      if (generation !== generationRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      localStreamRef.current = stream;
      setLocalStream(stream);
      setStatusIfMounted("Connecting to consultation…");

      const peer = new RTCPeerConnection(peerConfiguration);
      peerRef.current = peer;
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      peer.ontrack = (event) => {
        const incoming = event.streams?.[0];
        if (incoming) {
          setRemoteStream(incoming);
        } else {
          setRemoteStream((current) => {
            const next = current || new MediaStream();
            next.addTrack(event.track);
            return next;
          });
        }
      };

      peer.onicecandidate = (event) => {
        if (event.candidate && joinedRef.current && socket.connected) {
          socket.emit("consultation-ice-candidate", {
            appointmentId: appointmentIdRef.current,
            candidate: event.candidate.toJSON(),
          });
        }
      };

      peer.onconnectionstatechange = () => {
        if (peer.connectionState === "connected") setStatusIfMounted("Connected");
        else if (peer.connectionState === "connecting") setStatusIfMounted("Connecting…");
        else if (peer.connectionState === "disconnected") setStatusIfMounted("Connection interrupted…");
        else if (peer.connectionState === "failed") reportFailure("The video connection failed. Check your network and try again.");
      };

      peer.oniceconnectionstatechange = () => {
        if (peer.iceConnectionState === "failed") {
          reportFailure("A peer connection could not be established. Check your network and try again.");
        }
      };

      const addRemoteCandidate = async (candidate) => {
        if (!peerRef.current || peer.signalingState === "closed") return;
        if (!peer.remoteDescription) {
          pendingCandidatesRef.current.push(candidate);
          return;
        }
        await peer.addIceCandidate(candidate);
      };

      const flushRemoteCandidates = async () => {
        const candidates = pendingCandidatesRef.current.splice(0);
        for (const candidate of candidates) {
          await peer.addIceCandidate(candidate);
        }
      };

      const makeOffer = async () => {
        if (
          roleRef.current !== "doctor" ||
          !joinedRef.current ||
          !peerRef.current ||
          offerCreatedRef.current
        ) {
          return;
        }
        offerCreatedRef.current = true;
        try {
          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);
          if (socket.connected && joinedRef.current) {
            socket.emit("consultation-offer", {
              appointmentId: appointmentIdRef.current,
              offer: peer.localDescription,
            });
            setStatusIfMounted("Waiting for patient…");
          }
        } catch (offerError) {
          offerCreatedRef.current = false;
          reportFailure(offerError.message || "Unable to start the video call.");
        }
      };

      const joinRoom = () => {
        if (!socket.connected || generation !== generationRef.current) return;
        socket.emit(
          "join-consultation",
          { appointmentId: appointmentIdRef.current },
          (response) => {
            if (generation !== generationRef.current) {
              if (response?.success && socket.connected) {
                socket.emit("leave-consultation", {
                  appointmentId: appointmentIdRef.current,
                });
              }
              return;
            }
            if (!response?.success) {
              reportFailure(response?.message || "Unable to join this consultation.");
              return;
            }
            joinedRef.current = true;
            setStatusIfMounted("Waiting for the other participant…");
            if (response.peerPresent) makeOffer();
          },
        );
      };

      const onConnect = () => joinRoom();
      const onConnectError = (connectError) => {
        reportFailure(connectError.message || "Unable to connect to the video service.");
      };
      const onDisconnect = (reason) => {
        joinedRef.current = false;
        if (reason === "io client disconnect") {
          cleanup({ nextStatus: "Socket disconnected" });
        } else {
          setStatusIfMounted("Socket disconnected; reconnecting…");
        }
      };
      const onPeerJoined = (payload) => {
        if (
          payload?.appointmentId === appointmentIdRef.current &&
          payload.role !== roleRef.current
        ) {
          makeOffer();
        }
      };
      const onPeerLeft = (payload) => {
        if (
          payload?.appointmentId === appointmentIdRef.current &&
          payload.role !== roleRef.current
        ) {
          cleanup({ notify: true, nextStatus: "The other participant left" });
        }
      };
      const onOffer = async (payload) => {
        if (
          payload?.appointmentId !== appointmentIdRef.current ||
          payload.role !== "doctor" ||
          roleRef.current !== "patient"
        ) {
          return;
        }
        try {
          if (peer.signalingState !== "stable") return;
          await peer.setRemoteDescription(payload.offer);
          await flushRemoteCandidates();
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          socket.emit("consultation-answer", {
            appointmentId: appointmentIdRef.current,
            answer: peer.localDescription,
          });
          setStatusIfMounted("Connecting…");
        } catch (offerError) {
          reportFailure(offerError.message || "Unable to answer the video call.");
        }
      };
      const onAnswer = async (payload) => {
        if (
          payload?.appointmentId !== appointmentIdRef.current ||
          payload.role !== "patient" ||
          roleRef.current !== "doctor"
        ) {
          return;
        }
        try {
          if (peer.signalingState !== "have-local-offer") return;
          await peer.setRemoteDescription(payload.answer);
          await flushRemoteCandidates();
          setStatusIfMounted("Connecting…");
        } catch (answerError) {
          reportFailure(answerError.message || "Unable to complete the video connection.");
        }
      };
      const onCandidate = async (payload) => {
        if (
          payload?.appointmentId !== appointmentIdRef.current ||
          payload.role === roleRef.current ||
          !payload.candidate
        ) {
          return;
        }
        try {
          await addRemoteCandidate(payload.candidate);
        } catch (candidateError) {
          reportFailure(candidateError.message || "Unable to exchange network candidates.");
        }
      };
      const onConsultationError = (serverError) => {
        reportFailure(serverError?.message || "Consultation signaling failed.");
      };

      handlersRef.current = {
        onConnect,
        onConnectError,
        onDisconnect,
        onPeerJoined,
        onPeerLeft,
        onOffer,
        onAnswer,
        onCandidate,
        onConsultationError,
      };
      socket.on("connect", onConnect);
      socket.on("connect_error", onConnectError);
      socket.on("disconnect", onDisconnect);
      socket.on("consultation-peer-joined", onPeerJoined);
      socket.on("consultation-peer-left", onPeerLeft);
      socket.on("consultation-offer", onOffer);
      socket.on("consultation-answer", onAnswer);
      socket.on("consultation-ice-candidate", onCandidate);
      socket.on("consultation-error", onConsultationError);

      if (socket.connected) joinRoom();
      else socket.connect();
    } catch (mediaError) {
      if (generation !== generationRef.current) return;
      const message =
        mediaError.name === "NotAllowedError" || mediaError.name === "PermissionDeniedError"
          ? "Camera or microphone permission was denied. Allow access in your browser and try again."
          : mediaError.name === "NotFoundError" || mediaError.name === "DevicesNotFoundError"
            ? "No camera or microphone was found on this device."
            : mediaError.name === "NotReadableError"
              ? "The camera or microphone is already in use by another application."
              : mediaError.message || "Unable to access the camera and microphone.";
      cleanup({ nextStatus: "Call failed" });
      reportFailure(message);
    }
  }, [cleanup, reportFailure, setErrorIfMounted, setStatusIfMounted]);

  const toggleMicrophone = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMicrophoneEnabled(track.enabled);
  }, []);

  const toggleCamera = useCallback(() => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setCameraEnabled(track.enabled);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cleanup({ notify: true, nextStatus: "Call ended" });
    };
  }, [cleanup]);

  return {
    localStream,
    remoteStream,
    status,
    error,
    microphoneEnabled,
    cameraEnabled,
    start,
    hangUp: () => cleanup({ notify: true, nextStatus: "Call ended" }),
    toggleMicrophone,
    toggleCamera,
  };
};

export default useVideoCall;
