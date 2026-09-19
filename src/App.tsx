function App() {
  return (
    <main className="w-[360px] min-h-[420px] bg-[#0f0f12] p-5">
      <header className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">
          LofiFlow
        </h1>

        <p className="mt-1 text-sm text-gray-400">
          Smooth audio transformation
        </p>
      </header>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wider text-gray-500">
            Current Tab
          </p>

          <p className="mt-1 text-base font-medium">
            No tab connected
          </p>
        </div>

        <div className="rounded-xl bg-black/20 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/15">
              🎵
            </div>

            <div>
              <p className="text-sm font-medium">
                Currently Playing
              </p>

              <p className="text-xs text-gray-500">
                Audio not connected
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">
            Audio
          </span>

          <span className="text-sm text-gray-500">
            Not Connected
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            Mode
          </span>

          <span className="text-sm font-medium">
            Normal
          </span>
        </div>
      </section>

      <button
        type="button"
        disabled
        className="mt-5 w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white opacity-50"
      >
        Start Processing
      </button>

      <p className="mt-4 text-center text-xs text-gray-600">
        Audio processing will be added in the next phase.
      </p>
    </main>
  );
}

export default App;