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

        const hue = 20 + 40 * magnitude;
        const saturation = 100;
        const lightness = 10 + 70 * magnitude;

        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
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
    <div className="flex items-center justify-center w-full py-10 bg-neutral-950 px-4">
      <div className="w-full max-w-xl rounded-2xl border border-neutral-800 bg-neutral-900/80 shadow-[0_18px_45px_rgba(0,0,0,0.65)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <div>
              <h2 className="text-sm font-semibold text-neutral-50">
                Microphone Spectrogram
              </h2>
              <p className="text-[11px] text-neutral-400">
                Visualize sound frequencies in real time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* <div
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] ${
                spectrogram.isRunning
                  ? "bg-emerald-500/10 text-emerald-300 border border-emerald-400/40"
                  : "bg-neutral-800 text-neutral-400 border border-neutral-700"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  spectrogram.isRunning ? "bg-emerald-400" : "bg-neutral-500"
                }`}
              />
              {spectrogram.isRunning ? "Listening" : "Idle"}
            </div> */}

            <a
              href="https://github.com/hirebarend/react-spectrogram"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-800/70 px-3 py-1.5 text-[11px] font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.787 8.205 11.387.6.113.82-.262.82-.582 0-.288-.012-1.244-.017-2.255-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.76-1.604-2.665-.304-5.466-1.334-5.466-5.932 0-1.31.47-2.382 1.236-3.222-.124-.303-.535-1.527.117-3.176 0 0 1.008-.322 3.3 1.23a11.52 11.52 0 0 1 3.003-.404 11.48 11.48 0 0 1 3.003.404c2.29-1.552 3.297-1.23 3.297-1.23.653 1.649.242 2.873.118 3.176.77.84 1.235 1.912 1.235 3.222 0 4.61-2.806 5.624-5.479 5.92.43.37.815 1.102.815 2.222 0 1.604-.015 2.897-.015 3.293 0 .322.217.699.825.58C20.565 21.784 24 17.298 24 12c0-6.63-5.373-12-12-12Z"
                />
              </svg>
              GitHub
            </a>
          </div>
        </div>

        <div className="px-4 pb-4 pt-3 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-neutral-100">
                {spectrogram.isRunning ? "You're live 🎙️" : "Start listening"}
              </p>
              <p className="text-[11px] text-neutral-400 max-w-xs">
                {spectrogram.isRunning
                  ? "Your microphone input is being transformed into a scrolling spectrogram."
                  : "Press Start and grant microphone permission to begin the visualization."}
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
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium shadow-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-950 ${
                  spectrogram.isRunning
                    ? "bg-rose-500 hover:bg-rose-600 text-slate-50 focus:ring-rose-400/70"
                    : "bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500 hover:brightness-110 text-slate-950 focus:ring-cyan-400/80"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    spectrogram.isRunning
                      ? "bg-rose-200 shadow-[0_0_0_3px_rgba(248,113,113,0.45)]"
                      : "bg-yellow-200 shadow-[0_0_0_3px_rgba(250,204,21,0.45)]"
                  }`}
                />
                {spectrogram.isRunning ? "Stop" : "Start"}
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-neutral-800 bg-black/95">
            <canvas
              ref={spectrogram.canvasRef}
              width={800}
              height={300}
              className="block h-60 w-full bg-black"
            />

            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-3 pb-2 text-[10px] text-neutral-500">
              <span className="inline-flex items-center gap-1">
                <span className="h-1 w-6 bg-gradient-to-t from-neutral-700 via-orange-400 to-yellow-300 rounded-full" />
                Frequency ↑
              </span>
              <span className="rounded-full bg-neutral-900/80 px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-neutral-500">
                Time →
              </span>
            </div>
          </div>

          <p className="text-[11px] text-neutral-500">
            Pro tip: Play music, whistle, or tap objects around you to explore
            how different sounds appear in the spectrogram.
          </p>
        </div>
      </div>
    </div>
  );
};
