console.log("LofiFlow service worker started");

chrome.runtime.onInstalled.addListener(() => {
  console.log("LofiFlow extension installed");
});

chrome.runtime.onMessage.addListener(
  (message, _sender, sendResponse) => {
    if (message.type === "GET_ACTIVE_TAB") {
      getActiveTab().then(sendResponse);
      return true;
    }

    if (message.type === "START_AUDIO_CAPTURE") {
      startAudioCapture(message.tabId)
        .then(sendResponse)
        .catch((error: unknown) => {
          sendResponse({
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Unable to start audio capture.",
          });
        });

      return true;
    }

    if (message.type === "STOP_AUDIO_CAPTURE") {
      stopAudioCapture()
        .then(sendResponse)
        .catch((error: unknown) => {
          sendResponse({
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Unable to stop audio capture.",
          });
        });

      return true;
    }
  },
);

async function getActiveTab() {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  const tab = tabs[0];

  if (!tab) {
    return {
      success: false,
      error: "No active tab found.",
    };
  }

  return {
    success: true,
    tab: {
      id: tab.id,
      title: tab.title ?? "Unknown Tab",
      url: tab.url ?? "",
    },
  };
}

async function ensureOffscreenDocument(): Promise<void> {
  const offscreenUrl = chrome.runtime.getURL(
    "src/offscreen/offscreen.html",
  );

  const contexts = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
    documentUrls: [offscreenUrl],
  });

  if (contexts.length > 0) {
    return;
  }

  await chrome.offscreen.createDocument({
    url: "src/offscreen/offscreen.html",
    reasons: ["USER_MEDIA", "AUDIO_PLAYBACK"],
    justification:
      "Capture the active tab audio and route it through LofiFlow for real-time audio processing.",
  });
}

async function startAudioCapture(
  tabId: number,
): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!tabId) {
    return {
      success: false,
      error: "Invalid tab ID.",
    };
  }

  await ensureOffscreenDocument();

  const streamId = await chrome.tabCapture.getMediaStreamId({
    targetTabId: tabId,
  });

  const response = await chrome.runtime.sendMessage({
    target: "offscreen",
    type: "START_CAPTURE",
    streamId,
  });

  return response;
}

async function stopAudioCapture(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await chrome.runtime.sendMessage({
      target: "offscreen",
      type: "STOP_CAPTURE",
    });

    return response;
  } finally {
    const offscreenUrl = chrome.runtime.getURL(
      "src/offscreen/offscreen.html",
    );

    const contexts = await chrome.runtime.getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"],
      documentUrls: [offscreenUrl],
    });

    if (contexts.length > 0) {
      await chrome.offscreen.closeDocument();
    }
  }
}