export type AudioState = {
  processing: boolean;
  lofiMode: boolean;
};

export class AudioEngine {
  private context: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private filter: BiquadFilterNode | null = null;

  private processing = false;
  private lofiMode = false;

  private readonly normalFrequency = 22050;
  private readonly lofiFrequency = 1000;
  private readonly transitionTime = 0.25;

  async start(stream: MediaStream): Promise<void> {
    this.stop();

    this.context = new AudioContext();

    this.source =
      this.context.createMediaStreamSource(stream);

    this.filter =
      this.context.createBiquadFilter();

    this.filter.type = "lowpass";
    this.filter.frequency.value =
      this.normalFrequency;

    this.source.connect(this.filter);
    this.filter.connect(this.context.destination);

    if (this.context.state === "suspended") {
      await this.context.resume();
    }

    this.processing = true;
    this.lofiMode = false;
  }

  setLofiMode(enabled: boolean): void {
    if (!this.context || !this.filter) {
      return;
    }

    this.filter.frequency.setTargetAtTime(
      enabled
        ? this.lofiFrequency
        : this.normalFrequency,
      this.context.currentTime,
      this.transitionTime,
    );

    this.lofiMode = enabled;
  }

  getState(): AudioState {
    return {
      processing: this.processing,
      lofiMode: this.lofiMode,
    };
  }

  stop(): void {
    this.source?.disconnect();
    this.filter?.disconnect();

    this.source = null;
    this.filter = null;

    if (this.context) {
      void this.context.close();
      this.context = null;
    }

    this.processing = false;
    this.lofiMode = false;
  }
}