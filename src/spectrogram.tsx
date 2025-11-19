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
    <div className="flex items-center justify-center w-full py-10 bg-slate-950">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/80 shadow-[0_18px_45px_rgba(15,23,42,0.85)] backdrop-blur-md">
        {/* App header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 ring-1 ring-slate-700">
              <span className="text-[10px] font-semibold tracking-[0.18em] text-cyan-300 uppercase">
                Mic
              </span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-50">
                Microphone Spectrogram
              </h2>
              <p className="text-[11px] text-slate-400">
                Live frequency view in your browser
              </p>
            </div>
          </div>
          <div
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] ${
              spectrogram.isRunning
                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-400/40"
                : "bg-slate-800 text-slate-400 border border-slate-700"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                spectrogram.isRunning ? "bg-emerald-400" : "bg-slate-500"
              }`}
            />
            {spectrogram.isRunning ? "Listening" : "Idle"}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4 pt-3 space-y-4">
          {/* Description + controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-100">
                {spectrogram.isRunning
                  ? "Say something 🎙️"
                  : "Ready when you are"}
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs">
                {spectrogram.isRunning
                  ? "Watch your voice paint the spectrogram in real time."
                  : "Click Start, allow microphone access, then speak or play a sound nearby."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={
                  spectrogram.isRunning
                    ? () => spectrogram.stop?.()
                    : () => spectrogram.start()
                }
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium shadow-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 ${
                  spectrogram.isRunning
                    ? "bg-rose-500 hover:bg-rose-600 text-slate-50 focus:ring-rose-400/70"
                    : "bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500 hover:brightness-110 text-slate-950 focus:ring-cyan-400/80"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    spectrogram.isRunning
                      ? "bg-rose-200 shadow-[0_0_0_3px_rgba(248,113,113,0.45)]"
                      : "bg-emerald-200 shadow-[0_0_0_3px_rgba(52,211,153,0.45)]"
                  }`}
                />
                {spectrogram.isRunning ? "Stop" : "Start"}
              </button>

              <span className="hidden text-[11px] text-slate-500 sm:inline">
                HTTPS or localhost required
              </span>
            </div>
          </div>

          {/* Canvas container */}
          <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950/90">
            <canvas
              ref={spectrogram.canvasRef}
              width={800}
              height={300}
              className="block h-60 w-full bg-black/95"
            />

            {/* Axes hint / legend */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-3 pb-2 text-[10px] text-slate-400/80">
              <span className="inline-flex items-center gap-1">
                <span className="h-1 w-6 bg-gradient-to-t from-slate-700 via-indigo-400 to-cyan-300 rounded-full" />
                Frequency ↑
              </span>
              <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-slate-500">
                Time →
              </span>
            </div>
          </div>

          {/* Small help text */}
          <p className="text-[11px] text-slate-500">
            Tip: Try clapping, whistling, or playing music to see different
            patterns in the spectrogram.
          </p>
        </div>
      </div>
    </div>
  );
};
