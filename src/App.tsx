import { useEffect, useState } from "react";

interface ActiveTab {
  id?: number;
  title: string;
  url: string;
}

interface AudioState {
  processing: boolean;
  lofiMode: boolean;
}

function App() {
  const [activeTab, setActiveTab] =
    useState<ActiveTab | null>(null);

  const [loading, setLoading] = useState(false);

  const [processing, setProcessing] =
    useState(false);

  const [lofiMode, setLofiMode] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const getActiveTab = () => {
    chrome.runtime.sendMessage(
      {
        type: "GET_ACTIVE_TAB",
      },
      (response) => {
        if (chrome.runtime.lastError) {
          setError(
            "Unable to detect the current tab.",
          );
          return;
        }

        if (!response?.success) {
          setError(
            response?.error ??
              "Unable to detect the current tab.",
          );
          return;
        }

        setActiveTab(response.tab);
      },
    );
  };

  const getAudioState = () => {
    chrome.runtime.sendMessage(
      {
        type: "GET_AUDIO_STATE",
      },
      (response) => {
        if (chrome.runtime.lastError) {
          return;
        }

        if (!response?.success) {
          return;
        }

        const state: AudioState =
          response.state;

        setProcessing(state.processing);
        setLofiMode(state.lofiMode);
      },
    );
  };

  useEffect(() => {
    getActiveTab();
    getAudioState();
  }, []);

  const startLofi = () => {
    if (!activeTab?.id) {
      setError(
        "LofiFlow cannot access this tab.",
      );
      return;
    }

    setLoading(true);
    setError(null);

    chrome.runtime.sendMessage(
      {
        type: "START_AUDIO_CAPTURE",
        tabId: activeTab.id,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          setError(
            "LofiFlow couldn't start on this tab.",
          );
          setLoading(false);
          return;
        }

        if (!response?.success) {
          setError(
            response?.error ??
              "LofiFlow couldn't start.",
          );
          setLoading(false);
          return;
        }

        chrome.runtime.sendMessage(
          {
            type: "SET_LOFI_MODE",
            enabled: true,
          },
          (lofiResponse) => {
            if (
              chrome.runtime.lastError ||
              !lofiResponse?.success
            ) {
              setError(
                "Audio started, but Lofi Mode couldn't be enabled.",
              );

              setProcessing(true);
              setLofiMode(false);
              setLoading(false);

              return;
            }

            setProcessing(true);
            setLofiMode(true);
            setLoading(false);
          },
        );
      },
    );
  };

  const toggleLofi = () => {
    if (!processing || loading) {
      return;
    }

    const nextMode = !lofiMode;

    setLoading(true);
    setError(null);

    chrome.runtime.sendMessage(
      {
        type: "SET_LOFI_MODE",
        enabled: nextMode,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          setError(
            "Unable to change Lofi Mode.",
          );
          setLoading(false);
          return;
        }

        if (!response?.success) {
          setError(
            "Unable to change Lofi Mode.",
          );
          setLoading(false);
          return;
        }

        setLofiMode(nextMode);
        setLoading(false);
      },
    );
  };

  const stopLofi = () => {
    setLoading(true);
    setError(null);

    chrome.runtime.sendMessage(
      {
        type: "STOP_AUDIO_CAPTURE",
      },
      (response) => {
        if (chrome.runtime.lastError) {
          setError(
            "Unable to stop LofiFlow.",
          );
          setLoading(false);
          return;
        }

        if (!response?.success) {
          setError(
            "Unable to stop LofiFlow.",
          );
          setLoading(false);
          return;
        }

        setProcessing(false);
        setLofiMode(false);
        setLoading(false);
      },
    );
  };

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return "Unknown website";
    }
  };

  return (
    <main className="relative w-[360px] overflow-hidden bg-[#09090d] px-5 py-5 text-white">
      <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-violet-600/10 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-violet-700/5 blur-3xl" />

      <div className="relative">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-violet-400/20 bg-violet-500/[0.08] shadow-[0_0_20px_rgba(139,92,246,0.10)]">
              <img
                src="/icons/icon128.png"
                alt="LofiFlow"
                className="h-9 w-9 object-cover"
              />
            </div>

            <div>
              <h1 className="text-[18px] font-semibold tracking-tight text-white">
                LofiFlow
              </h1>

              <p className="mt-0.5 text-xs text-gray-500">
                Smooth audio
              </p>
            </div>
          </div>
        </header>

        <section className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
          

          {activeTab ? (
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
                <span className="text-sm text-gray-400">
                  ♪
                </span>
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-200">
                  {activeTab.title ||
                    "Untitled page"}
                </p>

                <p className="mt-1 truncate text-xs text-gray-600">
                  {activeTab.url
                    ? getHostname(activeTab.url)
                    : "Unknown website"}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-500">
              No active tab
            </p>
          )}
        </section>

        <section className="mt-7 flex flex-col items-center text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gray-500">
            Lofi Mode
          </p>

          <button
            type="button"
            onClick={
              processing
                ? toggleLofi
                : startLofi
            }
            disabled={
              loading || !activeTab?.id
            }
            aria-label={
              lofiMode
                ? "Turn Lofi Mode off"
                : "Turn Lofi Mode on"
            }
            className={`group relative mt-4 flex h-[132px] w-[132px] flex-col items-center justify-center rounded-full border transition-all duration-500 ${
              lofiMode
                ? "border-violet-400/80 bg-violet-500/[0.06] shadow-[0_0_12px_rgba(139,92,246,0.18),0_0_35px_rgba(139,92,246,0.10)]"
                : "border-white/[0.12] bg-white/[0.02] hover:border-violet-400/40 hover:bg-violet-500/[0.03]"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <span
              className={`absolute inset-2 rounded-full border transition-all duration-500 ${
                lofiMode
                  ? "border-violet-300/20"
                  : "border-white/[0.04]"
              }`}
            />

            <span
              className={`relative z-10 text-[30px] leading-none transition-all duration-500 ${
                lofiMode
                  ? "drop-shadow-[0_0_9px_rgba(255,232,170,0.65)]"
                  : "grayscale opacity-45"
              }`}
            >
              🌙
            </span>

            <span
              className={`relative z-10 mt-2 text-sm font-medium tracking-wide transition-colors duration-300 ${
                lofiMode
                  ? "text-violet-100"
                  : "text-gray-500"
              }`}
            >
              {lofiMode ? "ON" : "OFF"}
            </span>
          </button>

          <p className="mt-4 text-sm text-gray-400">
            {lofiMode
              ? "Lofi Mode"
              : processing
                ? "Lofi Mode is off"
                : "Tap to transform your audio"}
          </p>
        </section>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3 py-2.5">
            <p className="text-xs leading-relaxed text-red-300/80">
              {error}
            </p>
          </div>
        )}

        {processing && (
          <button
            type="button"
            onClick={stopLofi}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm text-gray-400 transition-all duration-300 hover:border-violet-400/20 hover:bg-white/[0.045] hover:text-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="h-2 w-2 rounded-sm bg-gray-500 transition-colors group-hover:bg-violet-400" />

            <span>
              Stop LofiFlow
            </span>
          </button>
        )}

        <footer className="mt-6 text-center">
          <p className="text-[9px] uppercase tracking-[0.25em] text-gray-700">
            Better audio • Calmer you
          </p>
        </footer>
      </div>
    </main>
  );
}

export default App;