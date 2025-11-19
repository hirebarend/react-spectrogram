import { useSpectrogram } from "./use-spectrogram";

export const Spectrogram = () => {
  const spectrogram = useSpectrogram({
    onCallback: (
      width: number,
      height: number,
      ctx: CanvasRenderingContext2D,
      buffer: Uint8Array
    ) => {
      const imageData = ctx.getImageData(1, 0, width - 1, height);
      ctx.putImageData(imageData, 0, 0);

      const sliceX = width - 1;

      for (let i = 0; i < buffer.length; i++) {
        const value = buffer[i];
        const magnitude = value / 255;

        const y = Math.floor((1 - i / buffer.length) * height);

        const hue = 240 - 240 * magnitude;
        const lightness = 15 + 55 * magnitude;

        ctx.fillStyle = `hsl(${hue}, 100%, ${lightness}%)`;
        ctx.fillRect(sliceX, y, 1, 2);
      }

    //   const avg = buffer.reduce((sum, v) => sum + v, 0) / (buffer.length || 1);
    //   const level = avg / 255;

    //   const meterHeight = height * level;
    //   ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    //   ctx.fillRect(sliceX, height - meterHeight, 1, meterHeight);

      return true;
    },
  });

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
        {spectrogram.isRunning
          ? "Listening… Speak into your microphone to see the spectrogram."
          : "Click Start and allow microphone access."}
      </p>

      <button
        type="button"
        onClick={spectrogram.isRunning ? () => null : () => spectrogram.start()}
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
        {spectrogram.isRunning ? "Stop" : "Start"}
      </button>
      {/* 
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
      )} */}

      <canvas
        ref={spectrogram.canvasRef}
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
