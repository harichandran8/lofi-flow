import { AudioEngine } from "../audio/AudioEngine";

const audioEngine = new AudioEngine();

chrome.runtime.onMessage.addListener(
  (message, _sender, sendResponse) => {
    if (message.target !== "offscreen") {
      return;
    }

    if (message.type === "START_CAPTURE") {
      startCapture(message.streamId)
        .then(() => {
          sendResponse({ success: true });
        })
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

    if (message.type === "STOP_CAPTURE") {
      audioEngine.stop();

      sendResponse({
        success: true,
      });

      return true;
    }

    if (message.type === "SET_LOFI_MODE") {
      audioEngine.setLofiMode(
        message.enabled,
      );

      sendResponse({
        success: true,
      });

      return true;
    }

    if (message.type === "GET_AUDIO_STATE") {
  sendResponse({
    success: true,
    state: audioEngine.getState(),
  });

  return true;
}
  },
);

async function startCapture(
  streamId: string,
): Promise<void> {
  const mediaStream =
    await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: "tab",
          chromeMediaSourceId: streamId,
        },
      } as MediaTrackConstraints,
    });

  await audioEngine.start(mediaStream);
}