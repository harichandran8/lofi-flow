import { useEffect, useState } from "react";

interface ActiveTab {
  id?: number;
  title: string;
  url: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getActiveTab = () => {
    setLoading(true);
    setError(null);

    chrome.runtime.sendMessage(
      {
        type: "GET_ACTIVE_TAB",
      },
      (response) => {
        if (chrome.runtime.lastError) {
          setError(
            chrome.runtime.lastError.message ??
              "Unable to communicate with extension.",
          );

          setLoading(false);
          return;
        }

        if (!response?.success) {
          setError(
            response?.error ?? "Unable to detect active tab.",
          );

          setLoading(false);
          return;
        }

        setActiveTab(response.tab);
        setLoading(false);
      },
    );
  };

  useEffect(() => {
    getActiveTab();
  }, []);

  const startProcessing = () => {
    if (!activeTab?.id) {
      setError("No active tab available.");
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
            chrome.runtime.lastError.message ??
              "Unable to start audio capture.",
          );

          setLoading(false);
          return;
        }

        if (!response?.success) {
          setError(
            response?.error ?? "Unable to start audio capture.",
          );

          setLoading(false);
          return;
        }

        setProcessing(true);
        setLoading(false);
      },
    );
  };

  const stopProcessing = () => {
    setLoading(true);
    setError(null);

    chrome.runtime.sendMessage(
      {
        type: "STOP_AUDIO_CAPTURE",
      },
      (response) => {
        if (chrome.runtime.lastError) {
          setError(
            chrome.runtime.lastError.message ??
              "Unable to stop audio capture.",
          );

          setLoading(false);
          return;
        }

        if (!response?.success) {
          setError(
            response?.error ?? "Unable to stop audio capture.",
          );

          setLoading(false);
          return;
        }

        setProcessing(false);
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
    <main className="w-[360px] min-h-[420px] bg-[#0f0f12] p-5 text-white">
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

          {loading && !activeTab ? (
            <p className="mt-1 text-sm text-gray-400">
              Detecting tab...
            </p>
          ) : error ? (
            <p className="mt-1 text-sm text-red-400">
              {error}
            </p>
          ) : (
            <>
              <p className="mt-1 text-base font-medium">
                {activeTab?.title}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {activeTab?.url
                  ? getHostname(activeTab.url)
                  : "Unknown website"}
              </p>
            </>
          )}
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
                {processing
                  ? "Audio connected"
                  : "Audio not connected"}
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

          <span
            className={`text-sm ${
              processing
                ? "text-green-400"
                : "text-gray-500"
            }`}
          >
            {processing ? "Connected" : "Not Connected"}
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

      {processing ? (
        <button
          type="button"
          onClick={stopProcessing}
          disabled={loading}
          className="mt-5 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Stopping..." : "Stop Processing"}
        </button>
      ) : (
        <button
          type="button"
          onClick={startProcessing}
          disabled={loading || !activeTab?.id}
          className="mt-5 w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Processing..." : "Start Processing"}
        </button>
      )}

      <p className="mt-4 text-center text-xs text-gray-600">
        Phase 3: tab audio capture
      </p>
    </main>
  );
}

export default App;