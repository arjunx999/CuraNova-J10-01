import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Mic, MicOff, PhoneOff } from "lucide-react";
import useVideoCall from "../hooks/useVideoCall";

const VideoCall = ({ appointmentId, role, participantName, onClose, onCallEnded, onComplete }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const onCallEndedRef = useRef(onCallEnded);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionError, setCompletionError] = useState("");
  const {
    localStream,
    remoteStream,
    status,
    error,
    microphoneEnabled,
    cameraEnabled,
    start,
    hangUp,
    toggleMicrophone,
    toggleCamera,
  } = useVideoCall({ appointmentId, role });

  onCallEndedRef.current = onCallEnded;

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  useEffect(() => {
    start();
  }, [start]);

  useEffect(() => {
    if (status === "The other participant left") onCallEndedRef.current?.();
  }, [status]);

  const closeCall = () => {
    hangUp();
    onClose?.();
  };

  const completeCall = async () => {
    if (!onComplete || isCompleting) return;
    setIsCompleting(true);
    setCompletionError("");
    try {
      await onComplete(appointmentId);
      closeCall();
    } catch (completeError) {
      setCompletionError(completeError.response?.data?.message || completeError.message || "Unable to complete this appointment.");
      setIsCompleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Video consultation"
        className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-zinc-950 text-white shadow-2xl"
      >
        <header className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold">Consultation with {participantName || "participant"}</h2>
            <p className={`mt-1 text-xs ${error || completionError ? "text-red-300" : "text-zinc-400"}`} aria-live="polite">
              {completionError || error || status}
            </p>
          </div>
          <button onClick={closeCall} className="rounded-full px-3 py-2 text-sm text-zinc-300 hover:bg-white/10" aria-label="Close consultation">
            Close
          </button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-auto p-3 md:grid-cols-[1fr_240px]">
          <div className="relative flex min-h-[260px] items-center justify-center overflow-hidden rounded-2xl bg-zinc-900 md:min-h-[420px]">
            {remoteStream ? (
              <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
            ) : (
              <div className="text-center text-zinc-400">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-xl font-semibold">
                  {participantName?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <p className="text-sm">Waiting for {participantName || "the other participant"}…</p>
              </div>
            )}
          </div>

          <div className="relative min-h-[160px] overflow-hidden rounded-2xl bg-zinc-900 md:min-h-0">
            {localStream ? (
              <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full min-h-[160px] items-center justify-center text-sm text-zinc-400">Camera preview unavailable</div>
            )}
            <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-xs">You</span>
          </div>
        </div>

        <footer className="flex items-center justify-center gap-3 border-t border-white/10 px-5 py-4">
          {role === "doctor" && onComplete && (
            <button
              onClick={completeCall}
              disabled={isCompleting || status !== "Connected"}
              className="rounded-full bg-emerald-700 px-4 py-3 text-xs font-semibold hover:bg-emerald-600 disabled:cursor-wait disabled:opacity-50"
              title={status !== "Connected" ? "Complete the call connection before ending the appointment" : "Complete appointment"}
            >
              {isCompleting ? "Completing…" : "Complete appointment"}
            </button>
          )}
          <button
            onClick={toggleMicrophone}
            disabled={!localStream}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40"
            aria-label={microphoneEnabled ? "Mute microphone" : "Unmute microphone"}
            title={microphoneEnabled ? "Mute microphone" : "Unmute microphone"}
          >
            {microphoneEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          </button>
          <button
            onClick={toggleCamera}
            disabled={!localStream}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40"
            aria-label={cameraEnabled ? "Turn camera off" : "Turn camera on"}
            title={cameraEnabled ? "Turn camera off" : "Turn camera on"}
          >
            {cameraEnabled ? <Camera size={20} /> : <CameraOff size={20} />}
          </button>
          <button
            onClick={closeCall}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 hover:bg-red-700"
            aria-label="Hang up"
            title="Hang up"
          >
            <PhoneOff size={20} />
          </button>
        </footer>
      </section>
    </div>
  );
};

export default VideoCall;
