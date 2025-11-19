import React, { useEffect, useRef, useState } from "react";

const MicrophoneSpectrogram: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRunningRef = useRef(isRunning);
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  const start = async () => {
    if (isRunningRef.current) return;

    setError(null);

    try {
      // 1) Get microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // 2) Create AudioContext (with webkit fallback)
      const AudioContextClass =
        window.AudioContext ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).webkitAudioContext;

      const audioContext: AudioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      // Some browsers start in "suspended" state.
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      // 3) Create source and analyser
      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      analyser.smoothingTimeConstant = 0;
      analyserRef.current = analyser;

      source.connect(analyser);

      setIsRunning(true);
      drawSpectrogram();
    } catch (err) {
      console.error(err);
      setError(
        "Could not access microphone. Make sure you're on HTTPS (or localhost) and have granted permission."
      );
      stop();
    }
  };

  const stop = () => {
    setIsRunning(false);

    if (animationFrameIdRef.current !== null) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }

    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect();
      } catch {
        // ignore
      }
      sourceRef.current = null;
    }

    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect();
      } catch {
        // ignore
      }
      analyserRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {
        // ignore
      });
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const drawSpectrogram = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;

    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Clear initial background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    const drawFrame = () => {
      console.log(dataArray.length);

      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      // Shift current image 1px left
      const imageData = ctx.getImageData(1, 0, width - 1, height);
      ctx.putImageData(imageData, 0, 0);

      // Draw new vertical slice at the right side
      const sliceX = width - 1;
      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i]; // 0–255
        const magnitude = value / 255; // 0–1

        // Frequency bin -> y (0 = top, height = bottom)
        const y = Math.floor((1 - i / bufferLength) * height);

        // Color mapping using HSL
        const hue = 240 - 240 * magnitude; // blue (240) to red (0)
        const lightness = 15 + 55 * magnitude;

        ctx.fillStyle = `hsl(${hue}, 100%, ${lightness}%)`;
        ctx.fillRect(sliceX, y, 1, 2); // a tiny vertical line for each bin
      }

      // Optional: simple level meter bar on the right edge
      const avg =
        dataArray.reduce((sum, v) => sum + v, 0) / (dataArray.length || 1);
      const level = avg / 255; // 0–1 average

      const meterHeight = height * level;
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fillRect(sliceX, height - meterHeight, 1, meterHeight);

      animationFrameIdRef.current = requestAnimationFrame(drawFrame);
    };

    drawFrame();
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "1rem",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <h2 style={{ marginBottom: "0.5rem" }}>Microphone Spectrogram</h2>
      <p style={{ marginBottom: "0.5rem", fontSize: "0.9rem", opacity: 0.8 }}>
        {isRunning
          ? "Listening… Speak into your microphone to see the spectrogram."
          : "Click Start and allow microphone access."}
      </p>

      <button
        type="button"
        onClick={isRunning ? stop : start}
        style={{
          padding: "0.4rem 0.9rem",
          fontSize: "0.9rem",
          borderRadius: "999px",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          marginBottom: "0.75rem",
        }}
      >
        {isRunning ? "Stop" : "Start"}
      </button>

      {error && (
        <div
          style={{
            marginBottom: "0.75rem",
            padding: "0.6rem 0.8rem",
            borderRadius: "0.5rem",
            background: "#ffe4e4",
            color: "#7a0000",
            fontSize: "0.85rem",
          }}
        >
          {error}
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={800}
        height={300}
        style={{
          width: "100%",
          maxWidth: "100%",
          borderRadius: "0.5rem",
          border: "1px solid #ddd",
          background: "black",
          display: "block",
        }}
      />
    </div>
  );
};

export default MicrophoneSpectrogram;
