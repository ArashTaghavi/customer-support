import { keyboardSounds, type KeyboardSoundId } from './KeyboardSounds';

export type TypewriterKey = 'type' | 'erase' | 'space' | 'enter';

// Recorded typewriter and mechanical keyboards; all source recordings are CC0.
// See resources/assets/sounds/typewriter/README.md for source and license details.
export class MechanicalTypingSound {
    private context: AudioContext;
    private output: GainNode;
    private decoded = new Map<string, Promise<AudioBuffer>>();
    private recordings = new Map<string, Promise<AudioBuffer>>();
    private buffers: Partial<Record<TypewriterKey, AudioBuffer[]>> = {};
    private preset: KeyboardSoundId = 'typewriter';
    private lastVariation: Partial<Record<TypewriterKey, number>> = {};
    private voices = new Set<AudioBufferSourceNode>();
    private abort = new AbortController();

    constructor() {
        this.context = new AudioContext();
        this.output = this.context.createGain();
        this.output.gain.value = 0.7;
        const compressor = this.context.createDynamicsCompressor();
        compressor.threshold.value = -14;
        compressor.knee.value = 8;
        compressor.ratio.value = 3;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.1;
        this.output.connect(compressor).connect(this.context.destination);
    }

    private async load(url: string) {
        const [sourceUrl, fragment = ''] = url.split('#');
        let recording = this.recordings.get(sourceUrl);
        if (!recording) {
            recording = fetch(sourceUrl, { signal: this.abort.signal })
                .then(async (response) => {
                    if (!response.ok)
                        throw new Error(
                            'Could not load the typewriter recording',
                        );
                    return this.context.decodeAudioData(
                        await response.arrayBuffer(),
                    );
                })
                .catch((error: unknown) => {
                    this.recordings.delete(sourceUrl);
                    throw error;
                });
            this.recordings.set(sourceUrl, recording);
        }
        const decoded = await recording;
        const clip = new URLSearchParams(fragment);
        if (clip.has('start') && clip.has('duration')) {
            const start = Math.floor(
                Number(clip.get('start')) * decoded.sampleRate,
            );
            const length = Math.min(
                Math.floor(Number(clip.get('duration')) * decoded.sampleRate),
                decoded.length - start,
            );
            const buffer = this.context.createBuffer(
                decoded.numberOfChannels,
                length,
                decoded.sampleRate,
            );
            for (
                let channel = 0;
                channel < decoded.numberOfChannels;
                channel++
            ) {
                const target = buffer.getChannelData(channel);
                target.set(
                    decoded
                        .getChannelData(channel)
                        .subarray(start, start + length),
                );
                const fade = Math.min(
                    Math.floor(decoded.sampleRate * 0.012),
                    length,
                );
                for (let index = 0; index < fade; index++)
                    target[length - 1 - index] *= index / fade;
            }
            return buffer;
        }
        // Remove only leading/trailing silence so each real strike starts on its letter.
        const samples = decoded.getChannelData(0);
        let peak = 0;
        for (let index = 0; index < samples.length; index++)
            peak = Math.max(peak, Math.abs(samples[index]));
        if (peak < 0.0001)
            throw new Error('The typewriter recording is silent');
        const threshold = peak * 0.025;
        let start = 0;
        let end = samples.length - 1;
        while (start < end && Math.abs(samples[start]) < threshold) start++;
        while (end > start && Math.abs(samples[end]) < threshold) end--;
        start = Math.max(0, start - Math.floor(decoded.sampleRate * 0.002));
        end = Math.min(
            samples.length,
            end + Math.floor(decoded.sampleRate * 0.04) + 1,
        );
        const buffer = this.context.createBuffer(
            decoded.numberOfChannels,
            end - start,
            decoded.sampleRate,
        );
        for (let channel = 0; channel < decoded.numberOfChannels; channel++) {
            const target = buffer.getChannelData(channel);
            target.set(decoded.getChannelData(channel).subarray(start, end));
            const fade = Math.min(
                Math.floor(decoded.sampleRate * 0.005),
                target.length,
            );
            for (let index = 0; index < fade; index++)
                target[target.length - 1 - index] *= index / fade;
        }
        return buffer;
    }

    private cachedBuffer(url: string) {
        let pending = this.decoded.get(url);
        if (!pending) {
            pending = this.load(url).catch((error: unknown) => {
                this.decoded.delete(url);
                throw error;
            });
            this.decoded.set(url, pending);
        }
        return pending;
    }

    async enable(
        preset: KeyboardSoundId = this.preset,
        overrides: Partial<Record<TypewriterKey, readonly string[]>> = {},
    ) {
        // Resume within the user's click before waiting for local audio downloads.
        const resumed = this.context.resume();
        const selected = keyboardSounds.find((sound) => sound.id === preset)!;
        const [type, space, erase, enter] = await Promise.all([
            Promise.all(
                (overrides.type ?? selected.type).map((url) =>
                    this.cachedBuffer(url),
                ),
            ),
            Promise.all(
                (overrides.space ?? selected.space).map((url) =>
                    this.cachedBuffer(url),
                ),
            ),
            Promise.all(
                (overrides.erase ?? selected.erase).map((url) =>
                    this.cachedBuffer(url),
                ),
            ),
            Promise.all(
                (overrides.enter ?? []).map((url) => this.cachedBuffer(url)),
            ),
            resumed,
        ]);
        if (this.context.state !== 'running')
            throw new Error('Audio is unavailable');
        this.stop();
        this.buffers = { type, space, erase, enter };
        this.preset = preset;
        this.lastVariation = {};
    }

    stop() {
        this.voices.forEach((source) => source.stop());
        this.voices.clear();
    }

    play(
        key: TypewriterKey,
        touch: {
            variant?: number;
            gain?: number;
            playbackRate?: number;
            pan?: number;
        } = {},
    ) {
        if (this.context.state !== 'running' || document.hidden) return;
        const choices = this.buffers[key];
        if (!choices?.length) return;
        let variation = Math.abs(
            Math.trunc(touch.variant ?? Math.random() * choices.length),
        );
        if (
            touch.variant === undefined &&
            choices.length > 1 &&
            variation === this.lastVariation[key]
        ) {
            variation =
                (variation +
                    1 +
                    Math.floor(Math.random() * (choices.length - 1))) %
                choices.length;
        }
        this.lastVariation[key] = variation;
        const buffer = choices[variation % choices.length];
        // Bound overlaps while preserving the short natural mechanical release.
        if (this.voices.size >= 6) {
            const oldest = this.voices.values().next().value;
            if (oldest) {
                this.voices.delete(oldest);
                oldest.stop();
            }
        }
        const source = this.context.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = Math.min(
            1.06,
            Math.max(0.94, touch.playbackRate ?? 1),
        );
        const level = this.context.createGain();
        const pressure = Math.min(
            1.1,
            Math.max(
                0,
                touch.gain ??
                    (this.preset === 'blue' ? 0.9 + Math.random() * 0.18 : 1),
            ),
        );
        level.gain.value =
            (key === 'space'
                ? this.preset === 'blue'
                    ? 1
                    : 0.65
                : key === 'erase'
                  ? 0.8
                  : 1) * pressure;
        const panner = this.context.createStereoPanner();
        panner.pan.value = Math.min(1, Math.max(-1, touch.pan ?? 0));
        source.connect(level).connect(panner).connect(this.output);
        this.voices.add(source);
        source.onended = () => {
            this.voices.delete(source);
            source.disconnect();
            level.disconnect();
            panner.disconnect();
        };
        source.start();
    }

    resume() {
        return this.context.resume();
    }

    close() {
        this.abort.abort();
        this.stop();
        this.recordings.clear();
        this.decoded.clear();
        return this.context.close();
    }
}
