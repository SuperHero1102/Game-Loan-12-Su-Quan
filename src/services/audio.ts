/**
 * Loạn 12 Sứ Quân — Synthesized Web Audio API Engine
 * Dynamic sound synthesis for every action: Sword slash, Heart heal, Chung cake armor,
 * Yin-Yang chi gathering, Gold clink, Extra turn thunder, Hurt thud, and Gong fanfare.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public masterVolume: number = 0.75;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  // 1. ĂN KIẾM: Tiếng vung kiếm kim loại bén ngọt & đòn chém xé gió
  public playSwordHit(isCrit: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Blade whoosh (tiếng xé gió)
    const whoosh = this.ctx.createOscillator();
    const whooshGain = this.ctx.createGain();
    const whooshFilter = this.ctx.createBiquadFilter();

    whoosh.type = 'sawtooth';
    whoosh.frequency.setValueAtTime(600, now);
    whoosh.frequency.exponentialRampToValueAtTime(120, now + 0.15);

    whooshFilter.type = 'bandpass';
    whooshFilter.frequency.setValueAtTime(1200, now);

    whooshGain.gain.setValueAtTime(0.4 * this.masterVolume, now);
    whooshGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    whoosh.connect(whooshFilter);
    whooshFilter.connect(whooshGain);
    whooshGain.connect(this.ctx.destination);

    whoosh.start(now);
    whoosh.stop(now + 0.18);

    // Steel clash (tiếng va chạm kim loại leng keng)
    const metal = this.ctx.createOscillator();
    const metalGain = this.ctx.createGain();
    metal.type = isCrit ? 'square' : 'triangle';
    metal.frequency.setValueAtTime(isCrit ? 1400 : 950, now + 0.04);
    metal.frequency.exponentialRampToValueAtTime(320, now + 0.22);

    metalGain.gain.setValueAtTime(0.5 * this.masterVolume, now + 0.04);
    metalGain.gain.exponentialRampToValueAtTime(0.005, now + 0.25);

    metal.connect(metalGain);
    metalGain.connect(this.ctx.destination);

    metal.start(now + 0.04);
    metal.stop(now + 0.25);
  }

  // 1B. HUYẾT KIẾM BẠO KÍCH: Tiếng chém lửa nổ bùng xé toạc giáp
  public playBloodSwordSlash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Tiếng nổ lửa
    const boom = this.ctx.createOscillator();
    const boomGain = this.ctx.createGain();
    boom.type = 'sawtooth';
    boom.frequency.setValueAtTime(280, now);
    boom.frequency.exponentialRampToValueAtTime(50, now + 0.25);

    boomGain.gain.setValueAtTime(0.7 * this.masterVolume, now);
    boomGain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

    boom.connect(boomGain);
    boomGain.connect(this.ctx.destination);
    boom.start(now);
    boom.stop(now + 0.28);

    // Tiếng kiếm rít bạo kích
    const blade = this.ctx.createOscillator();
    const bladeGain = this.ctx.createGain();
    blade.type = 'square';
    blade.frequency.setValueAtTime(1600, now + 0.03);
    blade.frequency.exponentialRampToValueAtTime(400, now + 0.3);

    bladeGain.gain.setValueAtTime(0.5 * this.masterVolume, now + 0.03);
    bladeGain.gain.exponentialRampToValueAtTime(0.005, now + 0.32);

    blade.connect(bladeGain);
    bladeGain.connect(this.ctx.destination);
    blade.start(now + 0.03);
    blade.stop(now + 0.32);
  }

  // 2. ĂN TRÁI TIM: Tiếng chuông harp tiên ngân vang phục hồi sinh lực
  public playHeal() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Chuỗi hợp âm ngọt ngào C - E - G - B - C (Harp arpeggio)
    const frequencies = [523.25, 659.25, 783.99, 987.77, 1046.5];
    
    frequencies.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.035);

      gain.gain.setValueAtTime(0.25 * this.masterVolume, now + idx * 0.035);
      gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.035 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.035);
      osc.stop(now + idx * 0.035 + 0.32);
    });
  }

  // 3. ĂN BÁNH CHƯNG: Tiếng va đập khiên đồng trầm chắc gia cố Giáp/Thể Lực
  public playShield() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.28);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);

    gain.gain.setValueAtTime(0.6 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  // 4. ĂN THÁI CỰC ÂM DƯƠNG: Tiếng xoáy nội lực rền vang tích tụ Mana
  public playChiGathering() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Xoáy tần số tăng dần
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.2);

    gain.gain.setValueAtTime(0.35 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  // 5. ĂN THỎI VÀNG: Tiếng nén vàng đĩnh va nhau lanh lảnh
  public playGold() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [1046.5, 1318.51, 1567.98].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(0.3 * this.masterVolume, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.04 + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.22);
    });
  }

  // 6. THÊM LƯỢT (ĂN 4-5 VIÊN): Sấm sét bùng nổ + cồng chiêng ngân vang
  public playThunderExtraTurn() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Tiếng sấm chớp nổ bùng
    const thunder = this.ctx.createOscillator();
    const thunderGain = this.ctx.createGain();
    thunder.type = 'sawtooth';
    thunder.frequency.setValueAtTime(180, now);
    thunder.frequency.exponentialRampToValueAtTime(40, now + 0.35);

    thunderGain.gain.setValueAtTime(0.7 * this.masterVolume, now);
    thunderGain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);

    thunder.connect(thunderGain);
    thunderGain.connect(this.ctx.destination);

    thunder.start(now);
    thunder.stop(now + 0.4);

    // Tiếng chuông khải hoàn thêm lượt
    [587.33, 739.99, 880, 1174.66].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + 0.08 + idx * 0.04);
      gain.gain.setValueAtTime(0.4 * this.masterVolume, now + 0.08 + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.08 + idx * 0.04 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + 0.08 + idx * 0.04);
      osc.stop(now + 0.08 + idx * 0.04 + 0.38);
    });
  }

  // 7. BỊ TRÚNG ĐÒN: Tiếng va đập máu bắn + tiếng kêu "Ựa!" trầm đục của võ tướng
  public playHurt() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Tiếng thịt giáp trúng đòn
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.22);

    gain.gain.setValueAtTime(0.5 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.24);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);

    // Tiếng rên "Ựa!" (Formant-filtered sawtooth grunt)
    const grunt = this.ctx.createOscillator();
    const gruntFilter = this.ctx.createBiquadFilter();
    const gruntGain = this.ctx.createGain();

    grunt.type = 'sawtooth';
    grunt.frequency.setValueAtTime(135, now + 0.03);
    grunt.frequency.linearRampToValueAtTime(165, now + 0.09);
    grunt.frequency.exponentialRampToValueAtTime(88, now + 0.28);

    gruntFilter.type = 'bandpass';
    gruntFilter.frequency.setValueAtTime(620, now + 0.03);
    gruntFilter.Q.setValueAtTime(4.5, now + 0.03);

    gruntGain.gain.setValueAtTime(0.38 * this.masterVolume, now + 0.03);
    gruntGain.gain.exponentialRampToValueAtTime(0.008, now + 0.3);

    grunt.connect(gruntFilter);
    gruntFilter.connect(gruntGain);
    gruntGain.connect(this.ctx.destination);

    grunt.start(now + 0.03);
    grunt.stop(now + 0.31);
  }

  // 8. TUYỆT KỸ VÕ CÔNG: Âm thanh đại chiêu bùng nổ
  public playSkillCast() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.25);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.55);

    gain.gain.setValueAtTime(0.6 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.62);
  }

  // 9. CỒNG CHIÊNG KHAI TRẬN ĐÔNG SƠN
  public playBronzeGong() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [120, 240, 360, 480].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.95, now + 0.9);

      const amp = (0.45 / (idx + 1)) * this.masterVolume;
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 1.35);
    });
  }

  // 10. CHIẾN THẮNG KHẢI HOÀN
  public playVictory() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.45 * this.masterVolume, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.12 + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.5);
    });
  }
}

export const soundEngine = new SoundEngine();
