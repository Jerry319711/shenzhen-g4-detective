// Web Audio API 柔和音效合成器（无外部依赖，零刺耳报错声）

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private getCtx(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private tone(freq: number, startOffset: number, duration: number, type: OscillatorType = 'sine', gainVal = 0.14) {
    const ctx = this.getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startOffset);
    gain.gain.setValueAtTime(0.001, ctx.currentTime + startOffset);
    gain.gain.exponentialRampToValueAtTime(gainVal, ctx.currentTime + startOffset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + startOffset);
    osc.stop(ctx.currentTime + startOffset + duration + 0.02);
  }

  // 发现线索：清脆的“叮！”
  playClueFound() {
    this.tone(784, 0, 0.12, 'triangle', 0.16);
    this.tone(1046.5, 0.08, 0.18, 'triangle', 0.16);
  }

  // 选错时：绝不是刺耳蜂鸣，而是温柔可爱的泡泡弹性音“啵咕”
  playGentleOops() {
    this.tone(330, 0, 0.14, 'sine', 0.12);
    this.tone(293.6, 0.1, 0.18, 'sine', 0.1);
  }

  // 单步成功：轻快的上行音阶
  playStepSuccess() {
    this.tone(523.25, 0, 0.12, 'triangle', 0.15);
    this.tone(659.25, 0.08, 0.12, 'triangle', 0.15);
    this.tone(783.99, 0.16, 0.22, 'triangle', 0.16);
  }

  // 破案成功：欢快的探案凯旋号角
  playCaseSolved() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => {
      this.tone(n, i * 0.09, i === notes.length - 1 ? 0.42 : 0.14, 'triangle', 0.18);
    });
  }

  // 锦囊提示弹出：温暖的魔法音
  playHint() {
    this.tone(587.33, 0, 0.14, 'sine', 0.12);
    this.tone(880, 0.1, 0.2, 'sine', 0.12);
  }

  // 盖章 / 解锁装备
  playUnlock() {
    this.tone(440, 0, 0.1, 'triangle', 0.15);
    this.tone(554.37, 0.08, 0.1, 'triangle', 0.15);
    this.tone(659.25, 0.16, 0.12, 'triangle', 0.15);
    this.tone(880, 0.24, 0.35, 'triangle', 0.18);
  }
}

export const sound = new SoundEngine();

export function speakEnglish(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text.replace(/___+/g, 'blank'));
    utter.lang = 'en-US';
    utter.rate = 0.88; // 适合四年级孩子的清晰语速
    utter.pitch = 1.05;
    window.speechSynthesis.speak(utter);
  } catch {
    // ignore if browser blocks TTS
  }
}
