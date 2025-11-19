import { useEffect, useRef, useState, type RefObject } from "react";

async function start(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  animationFrameIdRef: RefObject<number | null>,
  onCallback: (
    width: number,
    height: number,
    ctx: CanvasRenderingContext2D,
    buffer: Uint8Array
  ) => boolean
) {
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });

  const audioContext: AudioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)();

  // audioContextRef.current = audioContext;

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  const mediaStreamAudioSourceNode =
    audioContext.createMediaStreamSource(mediaStream);

  const analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = 1024;
  analyserNode.minDecibels = -90;
  analyserNode.maxDecibels = -10;
  analyserNode.smoothingTimeConstant = 0;

  mediaStreamAudioSourceNode.connect(analyserNode);

  if (!canvasRef.current) {
    return;
  }

  const ctx = canvasRef.current.getContext("2d");
  if (!ctx) {
    return;
  }

  const width = canvasRef.current.width;
  const height = canvasRef.current.height;

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);

  const buffer = new Uint8Array(analyserNode.frequencyBinCount);

  const requestAnimationFrameFn = () => {
    analyserNode.getByteFrequencyData(buffer); // TODO

    if (onCallback(width, height, ctx, buffer)) {
      animationFrameIdRef.current = requestAnimationFrame(
        requestAnimationFrameFn
      );
    }
  };

  requestAnimationFrameFn();
}

async function stop(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  animationFrameIdRef: RefObject<number | null>
) {
  if (animationFrameIdRef.current !== null) {
    cancelAnimationFrame(animationFrameIdRef.current);

    animationFrameIdRef.current = null;
  }

  //   if (sourceRef.current) {
  //     try {
  //       sourceRef.current.disconnect();
  //     } catch {
  //       // ignore
  //     }
  //     sourceRef.current = null;
  //   }

  //   if (analyserRef.current) {
  //     try {
  //       analyserRef.current.disconnect();
  //     } catch {
  //       // ignore
  //     }
  //     analyserRef.current = null;
  //   }

  //   if (audioContextRef.current) {
  //     audioContextRef.current.close().catch(() => {});
  //     audioContextRef.current = null;
  //   }

  //   if (streamRef.current) {
  //     streamRef.current.getTracks().forEach((t) => t.stop());
  //     streamRef.current = null;
  //   }
}

export function useSpectrogram(options: {
  onCallback: (
    width: number,
    height: number,
    ctx: CanvasRenderingContext2D,
    buffer: Uint8Array
  ) => boolean;
}) {
  const animationFrameIdRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (isRunning) {
      start(canvasRef, animationFrameIdRef, options.onCallback);
    }
  }, [isRunning]);

  return {
    canvasRef,
    isRunning,
    start: () => setIsRunning(true),
    stop: () => setIsRunning(false),
  };
}
