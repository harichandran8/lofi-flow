let audioContext: AudioContext | null = null;
let mediaStream: MediaStream | null = null;
let sourceNode: MediaStreamAudioSourceNode | null = null;

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
      stopCapture();
      sendResponse({ success: true });
      return true;
    }
  },
);

async function startCapture(streamId: string): Promise<void> {
  if (mediaStream) {
    stopCapture();
  }

  mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: "tab",
        chromeMediaSourceId: streamId,
      },
    } as MediaTrackConstraints,
  });

  audioContext = new AudioContext();

  sourceNode = audioContext.createMediaStreamSource(mediaStream);

  sourceNode.connect(audioContext.destination);

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }
}

function stopCapture(): void {
  sourceNode?.disconnect();
  sourceNode = null;

  mediaStream?.getTracks().forEach((track) => {
    track.stop();
  });

  mediaStream = null;

  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}