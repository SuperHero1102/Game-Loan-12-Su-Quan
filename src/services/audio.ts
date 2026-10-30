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

  // 11. CHIẾN THƯ HOÀNG KIM (TIẾNG TRỐNG ĐỒNG BÁO ĐỘNG THÁCH ĐẤU)
  public playChallengeAlarm() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Nhịp trống đồng trầm hùng: Tum - Tum - Tùng
    [0, 0.22, 0.52].forEach((timeOffset, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const baseFreq = idx === 2 ? 85 : 120;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseFreq * 1.5, now + timeOffset);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, now + timeOffset + 0.35);

      gain.gain.setValueAtTime(0.7 * this.masterVolume, now + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + 0.42);
    });

    // Tiếng còi lệnh xuất trận hào khí
    const horn = this.ctx.createOscillator();
    const hornGain = this.ctx.createGain();
    horn.type = 'triangle';
    horn.frequency.setValueAtTime(440, now + 0.65);
    horn.frequency.exponentialRampToValueAtTime(660, now + 0.85);
    hornGain.gain.setValueAtTime(0.5 * this.masterVolume, now + 0.65);
    hornGain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
    horn.connect(hornGain);
    hornGain.connect(this.ctx.destination);
    horn.start(now + 0.65);
    horn.stop(now + 1.25);
  }

  // 12. RADAR SCAN TÍCH TẮC
  public playRadarBeep() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
    gain.gain.setValueAtTime(0.25 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  // 13. VA CHẠM BINH KHÍ NẢY LỬA (WEAPON CLASH & PARRY): Tiếng kim loại va chan chát nảy lửa
  public playWeaponClash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Tiếng va đập kim khí tần số cao
    const metal1 = this.ctx.createOscillator();
    const metal2 = this.ctx.createOscillator();
    const clashGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    metal1.type = 'square';
    metal1.frequency.setValueAtTime(1950, now);
    metal1.frequency.exponentialRampToValueAtTime(650, now + 0.18);

    metal2.type = 'triangle';
    metal2.frequency.setValueAtTime(2850, now);
    metal2.frequency.exponentialRampToValueAtTime(820, now + 0.22);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, now);
    filter.Q.setValueAtTime(3.5, now);

    clashGain.gain.setValueAtTime(0.6 * this.masterVolume, now);
    clashGain.gain.exponentialRampToValueAtTime(0.005, now + 0.25);

    metal1.connect(filter);
    metal2.connect(filter);
    filter.connect(clashGain);
    clashGain.connect(this.ctx.destination);

    metal1.start(now);
    metal2.start(now);
    metal1.stop(now + 0.26);
    metal2.stop(now + 0.26);
  }

  // 14. ÂM THANH XUẤT CHIÊU TỪNG LOẠI BINH KHÍ (Đại đao, Thần cung, Song kích, Thiết chùy, Kiếm lệnh)
  public playWeaponAttack(weaponType: string = 'imperial_sword') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    if (weaponType === 'divine_bow') {
      // Tiếng bật dây cung: Twang + tên xé gió
      const bowTwang = this.ctx.createOscillator();
      const bowGain = this.ctx.createGain();
      bowTwang.type = 'triangle';
      bowTwang.frequency.setValueAtTime(420, now);
      bowTwang.frequency.exponentialRampToValueAtTime(120, now + 0.16);

      bowGain.gain.setValueAtTime(0.55 * this.masterVolume, now);
      bowGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      bowTwang.connect(bowGain);
      bowGain.connect(this.ctx.destination);
      bowTwang.start(now);
      bowTwang.stop(now + 0.2);

      // Tiếng tên rít
      const arrowWhistle = this.ctx.createOscillator();
      const arrowGain = this.ctx.createGain();
      arrowWhistle.type = 'sine';
      arrowWhistle.frequency.setValueAtTime(1800, now + 0.04);
      arrowWhistle.frequency.exponentialRampToValueAtTime(800, now + 0.22);
      arrowGain.gain.setValueAtTime(0.4 * this.masterVolume, now + 0.04);
      arrowGain.gain.exponentialRampToValueAtTime(0.005, now + 0.25);

      arrowWhistle.connect(arrowGain);
      arrowGain.connect(this.ctx.destination);
      arrowWhistle.start(now + 0.04);
      arrowWhistle.stop(now + 0.26);
      return;
    }

    if (weaponType === 'iron_mace') {
      // Tiếng vung chùy nặng + tiếng giáng sấm sét
      const heavyWhoosh = this.ctx.createOscillator();
      const heavyGain = this.ctx.createGain();
      heavyWhoosh.type = 'sawtooth';
      heavyWhoosh.frequency.setValueAtTime(260, now);
      heavyWhoosh.frequency.exponentialRampToValueAtTime(60, now + 0.24);

      heavyGain.gain.setValueAtTime(0.7 * this.masterVolume, now);
      heavyGain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      heavyWhoosh.connect(heavyGain);
      heavyGain.connect(this.ctx.destination);
      heavyWhoosh.start(now);
      heavyWhoosh.stop(now + 0.3);

      // Tiếng búa sắt đập vào đá
      const anvil = this.ctx.createOscillator();
      const anvilGain = this.ctx.createGain();
      anvil.type = 'square';
      anvil.frequency.setValueAtTime(750, now + 0.06);
      anvil.frequency.exponentialRampToValueAtTime(180, now + 0.28);
      anvilGain.gain.setValueAtTime(0.5 * this.masterVolume, now + 0.06);
      anvilGain.gain.exponentialRampToValueAtTime(0.005, now + 0.32);

      anvil.connect(anvilGain);
      anvilGain.connect(this.ctx.destination);
      anvil.start(now + 0.06);
      anvil.stop(now + 0.33);
      return;
    }

    if (weaponType === 'great_halberd') {
      // Tiếng đao đại chém gió rít mạnh
      const halberd = this.ctx.createOscillator();
      const halberdGain = this.ctx.createGain();
      halberd.type = 'sawtooth';
      halberd.frequency.setValueAtTime(450, now);
      halberd.frequency.exponentialRampToValueAtTime(95, now + 0.22);
      halberdGain.gain.setValueAtTime(0.6 * this.masterVolume, now);
      halberdGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      halberd.connect(halberdGain);
      halberdGain.connect(this.ctx.destination);
      halberd.start(now);
      halberd.stop(now + 0.26);
      return;
    }

    if (weaponType === 'double_halberd') {
      // Song kích: Hai nhịp đâm liên hoàn vút-vút
      [0, 0.08].forEach((offset) => {
        const jab = this.ctx!.createOscillator();
        const jabGain = this.ctx!.createGain();
        jab.type = 'triangle';
        jab.frequency.setValueAtTime(800, now + offset);
        jab.frequency.exponentialRampToValueAtTime(220, now + offset + 0.12);
        jabGain.gain.setValueAtTime(0.45 * this.masterVolume, now + offset);
        jabGain.gain.exponentialRampToValueAtTime(0.005, now + offset + 0.14);
        jab.connect(jabGain);
        jabGain.connect(this.ctx!.destination);
        jab.start(now + offset);
        jab.stop(now + offset + 0.15);
      });
      return;
    }

    // Mặc định: Kiếm lệnh / Thái Bình kiếm chém xé gió ngọt lịm
    this.playSwordHit(false);
  }

  // 15. CHẮN GIÁP (ARMOR DEFLECT): Tiếng khiên đồng hoặc giáp trụ chặn đứng đòn chém
  public playArmorDeflect() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const deflect = this.ctx.createOscillator();
    const deflectGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    deflect.type = 'triangle';
    deflect.frequency.setValueAtTime(1600, now);
    deflect.frequency.exponentialRampToValueAtTime(540, now + 0.2);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(700, now);

    deflectGain.gain.setValueAtTime(0.55 * this.masterVolume, now);
    deflectGain.gain.exponentialRampToValueAtTime(0.005, now + 0.22);

    deflect.connect(filter);
    filter.connect(deflectGain);
    deflectGain.connect(this.ctx.destination);

    deflect.start(now);
    deflect.stop(now + 0.24);
  }

  // 16. TIẾNG VÓ LINH THÚ PHI NƯỚC ĐẠI (GALLOP): Hai nhịp vó lộc cộc khi xung trận
  public playHorseGallop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [0, 0.09, 0.18].forEach((offset, idx) => {
      const hoof = this.ctx!.createOscillator();
      const hoofGain = this.ctx!.createGain();
      const baseFreq = idx % 2 === 0 ? 110 : 85;

      hoof.type = 'sine';
      hoof.frequency.setValueAtTime(baseFreq * 1.6, now + offset);
      hoof.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, now + offset + 0.08);

      hoofGain.gain.setValueAtTime(0.4 * this.masterVolume, now + offset);
      hoofGain.gain.exponentialRampToValueAtTime(0.005, now + offset + 0.09);

      hoof.connect(hoofGain);
      hoofGain.connect(this.ctx!.destination);

      hoof.start(now + offset);
      hoof.stop(now + offset + 0.1);
    });
  }

  // 17. CHẠM Ô NGỌC (GEM SELECT): Âm thanh gõ nhẹ vào đá quý lách cách trong trẻo
  public playGemSelect() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(1050, now + 0.06);

    gain.gain.setValueAtTime(0.22 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // 18. TRƯỢT Ô NGỌC (GEM SLIDE / SWAP): Tiếng trượt mượt mà
  public playGemSlide() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.1);

    gain.gain.setValueAtTime(0.28 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  // 19. NƯỚC ĐI KHÔNG HỢP LỆ (INVALID MOVE): Tiếng thịch cảnh báo nhẹ nhàng
  public playInvalidMove() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(75, now + 0.14);

    gain.gain.setValueAtTime(0.35 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  // 20. CHUỖI LIÊN HOÀN COMBO CASCADE (COMBO X2, X3, X4...): Thang âm ngũ cung tăng dần cực kỳ đã tai
  public playComboCascade(comboIndex: number = 1) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Thang âm ngũ cung truyền thống (C - D - E - G - A - C5 - D5 - E5)
    const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51];
    const baseIdx = Math.min(pentatonic.length - 2, Math.max(0, comboIndex - 1));

    const note1 = pentatonic[baseIdx];
    const note2 = pentatonic[baseIdx + 1];

    [note1, note2].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      const volume = Math.min(0.6, (0.28 + comboIndex * 0.05)) * this.masterVolume;
      gain.gain.setValueAtTime(volume, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.05 + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.24);
    });
  }
}

export const soundEngine = new SoundEngine();
