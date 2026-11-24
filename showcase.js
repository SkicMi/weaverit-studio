(() => {
  const COLS = 14;

  const imgCache = new Map();
  function loadImg(src) {
    if (imgCache.has(src)) return imgCache.get(src);
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
    imgCache.set(src, img);
    return img;
  }

  function frameForMode(mode, t) {
    if (mode === 'idle') return 0;
    if (mode === 'walk') return 1 + (Math.floor(t * 8.5) % 6);
    if (mode === 'run') return 7 + (Math.floor(t * 11.5) % 6);
    if (mode === 'attack') {
      const p = (t * 1.45) % 1;
      if (p < 0.22) return 7;
      if (p < 0.7) return 13;
      return 10;
    }
    return 0;
  }

  function drawStripFrame(ctx, img, frameIdx, dx, dy, dh) {
    if (!img || !img.complete || img.naturalWidth === 0) return;
    const cellW = img.naturalWidth / COLS;
    const cellH = img.naturalHeight;
    const dw = (cellW / cellH) * dh;
    ctx.drawImage(img, frameIdx * cellW, 0, cellW, cellH, dx - dw / 2, dy - dh, dw, dh);
  }

  // =========================================================
  // 1. GEAR SETS DATA
  // =========================================================
  const GEAR_SETS = {
    verdant: {
      name: 'Verdant Warden Set',
      element: 'Nature',
      elClass: 'el-nature',
      glow: 'rgba(52, 211, 153, 0.24)',
      bonus: 'Set Bonus: +18% Stamina Regen & Nature Thorn Shield',
      slots: [
        { type: 'Helmet', name: 'Verdant Helm', icon: '/assets/icons/eq_verdant_helm.webp' },
        { type: 'Visor / Eyes', name: 'Verdant Optics', icon: '/assets/icons/eq_verdant_optics.webp' },
        { type: 'Armor', name: 'Verdant Carapace', icon: '/assets/icons/eq_verdant_carapace.webp' },
        { type: 'Gloves', name: 'Verdant Bracers', icon: '/assets/icons/eq_verdant_bracers.webp' },
        { type: 'Legs', name: 'Verdant Leggings', icon: '/assets/icons/eq_verdant_leggings.webp' },
        { type: 'Footwear', name: 'Verdant Striders', icon: '/assets/icons/eq_verdant_striders.webp' },
        { type: 'Weapon (T2)', name: 'Mantis Glaive', icon: '/assets/icons/w_t2_mantis_glaive.webp' },
      ],
    },
    cinder: {
      name: 'Cinder Pyre Set',
      element: 'Fire',
      elClass: 'el-fire',
      glow: 'rgba(249, 115, 22, 0.26)',
      bonus: 'Set Bonus: +22% Burn Damage & Blazing Dash Trail',
      slots: [
        { type: 'Helmet', name: 'Cinder Helm', icon: '/assets/icons/eq_cinder_helm.webp' },
        { type: 'Visor / Eyes', name: 'Cinder Goggles', icon: '/assets/icons/eq_cinder_goggles.webp' },
        { type: 'Armor', name: 'Cinder Cuirass', icon: '/assets/icons/eq_cinder_cuirass.webp' },
        { type: 'Gloves', name: 'Cinder Fists', icon: '/assets/icons/eq_cinder_fists.webp' },
        { type: 'Legs', name: 'Cinder Leggings', icon: '/assets/icons/eq_cinder_leggings.webp' },
        { type: 'Footwear', name: 'Cinder Boots', icon: '/assets/icons/eq_cinder_boots.webp' },
        { type: 'Weapon (T4)', name: 'Eclipse Blade', icon: '/assets/icons/w_t4_eclipse_blade.webp' },
      ],
    },
    frostveil: {
      name: 'Frostveil Aegis Set',
      element: 'Water',
      elClass: 'el-water',
      glow: 'rgba(56, 189, 248, 0.25)',
      bonus: 'Set Bonus: +25% Max Shield & Cryo Slow on Hit',
      slots: [
        { type: 'Helmet', name: 'Frostveil Helm', icon: '/assets/icons/eq_frostveil_helm.webp' },
        { type: 'Visor / Eyes', name: 'Frostveil Visor', icon: '/assets/icons/eq_frostveil_visor.webp' },
        { type: 'Armor', name: 'Frostveil Plate', icon: '/assets/icons/eq_frostveil_plate.webp' },
        { type: 'Gloves', name: 'Frostveil Gauntlets', icon: '/assets/icons/eq_frostveil_gauntlets.webp' },
        { type: 'Legs', name: 'Frostveil Leggings', icon: '/assets/icons/eq_frostveil_leggings.webp' },
        { type: 'Footwear', name: 'Frostveil Greaves', icon: '/assets/icons/eq_frostveil_greaves.webp' },
        { type: 'Weapon (T3)', name: 'Frost Katana', icon: '/assets/icons/w_t3_frost_katana.webp' },
      ],
    },
    seraphim: {
      name: 'Seraphim Light Set',
      element: 'Light',
      elClass: 'el-light',
      glow: 'rgba(253, 224, 71, 0.24)',
      bonus: 'Set Bonus: +20% Second Wind Healing & Radiant Burst',
      slots: [
        { type: 'Helmet', name: 'Seraphim Halohelm', icon: '/assets/icons/eq_seraphim_halohelm.webp' },
        { type: 'Visor / Eyes', name: 'Seraphim Eyes', icon: '/assets/icons/eq_seraphim_eyes.webp' },
        { type: 'Armor', name: 'Seraphim Raiment', icon: '/assets/icons/eq_seraphim_raiment.webp' },
        { type: 'Gloves', name: 'Seraphim Vambraces', icon: '/assets/icons/eq_seraphim_vambraces.webp' },
        { type: 'Legs', name: 'Seraphim Leggings', icon: '/assets/icons/eq_seraphim_leggings.webp' },
        { type: 'Footwear', name: 'Seraphim Wingshoes', icon: '/assets/icons/eq_seraphim_wingshoes.webp' },
        { type: 'Weapon (T5)', name: 'Solaris Excalibur', icon: '/assets/icons/w_t5_solaris_excalibur.webp' },
      ],
    },
    ironclad: {
      name: 'Ironclad Titan Set',
      element: 'Steel',
      elClass: 'el-steel',
      glow: 'rgba(148, 163, 184, 0.26)',
      bonus: 'Set Bonus: +30% Physical Armor & Knockback Immunity',
      slots: [
        { type: 'Helmet', name: 'Ironclad Greathelm', icon: '/assets/icons/eq_ironclad_greathelm.webp' },
        { type: 'Visor / Eyes', name: 'Ironclad Monocle', icon: '/assets/icons/eq_ironclad_monocle.webp' },
        { type: 'Armor', name: 'Ironclad Aegis', icon: '/assets/icons/eq_ironclad_aegis.webp' },
        { type: 'Gloves', name: 'Ironclad Crushers', icon: '/assets/icons/eq_ironclad_crushers.webp' },
        { type: 'Legs', name: 'Ironclad Leggings', icon: '/assets/icons/eq_ironclad_leggings.webp' },
        { type: 'Footwear', name: 'Ironclad Stompers', icon: '/assets/icons/eq_ironclad_stompers.webp' },
        { type: 'Weapon (T5)', name: 'Titan Worldbreaker', icon: '/assets/icons/w_t5_titan_worldbreaker.webp' },
      ],
    },
  };

  // Preload hero strips
  Object.keys(GEAR_SETS).forEach((key) => {
    loadImg(`/assets/heroes/${key}_east.webp`);
    loadImg(`/assets/heroes/${key}_se.webp`);
  });

  // =========================================================
  // 2. LIVE NATURE PATH DIORAMA
  // =========================================================
  const natureCanvas = document.getElementById('nature-stage');
  let activeNatureSet = 'verdant';
  let activeNatureMode = 'walk';

  const foliageImgs = {
    palm: loadImg('/assets/foliage/jungle_palm.webp'),
    fern: loadImg('/assets/foliage/fern.webp'),
    bush: loadImg('/assets/foliage/bush.webp'),
    flowers: loadImg('/assets/foliage/wildflowers.webp'),
    mushrooms: loadImg('/assets/foliage/mushrooms.webp'),
    grass: loadImg('/assets/foliage/grass_tuft.webp'),
    lotus: loadImg('/assets/foliage/giant_lotus.webp'),
    sprout: loadImg('/assets/foliage/tall_sprout.webp'),
  };
  const sporeWalkerWest = loadImg('/assets/creatures/spore_walker_west.webp');

  const backProps = [
    { key: 'palm', x: 0.08, s: 1.15 },
    { key: 'bush', x: 0.24, s: 0.72 },
    { key: 'palm', x: 0.42, s: 1.22 },
    { key: 'sprout', x: 0.62, s: 0.78 },
    { key: 'palm', x: 0.78, s: 1.1 },
    { key: 'bush', x: 0.93, s: 0.75 },
  ];
  const midProps = [
    { key: 'fern', x: 0.06, s: 0.56 },
    { key: 'mushrooms', x: 0.2, s: 0.46 },
    { key: 'lotus', x: 0.37, s: 0.52 },
    { key: 'flowers', x: 0.54, s: 0.5 },
    { key: 'fern', x: 0.72, s: 0.58 },
    { key: 'grass', x: 0.88, s: 0.46 },
  ];
  const frontProps = [
    { key: 'grass', x: 0.14, s: 0.45 },
    { key: 'flowers', x: 0.48, s: 0.48 },
    { key: 'fern', x: 0.82, s: 0.52 },
  ];
  const fireflies = Array.from({ length: 24 }, (_, i) => ({
    x: (i * 0.173) % 1,
    y: 0.12 + ((i * 0.291) % 0.55),
    r: 1.4 + (i % 3) * 0.8,
    phase: i * 1.1,
    speed: 0.018 + (i % 4) * 0.006,
  }));

  function drawParallaxLayer(ctx, props, w, h, scrollPx, baseY, baseSize) {
    const span = w + 260;
    for (const p of props) {
      const img = foliageImgs[p.key];
      if (!img || !img.complete || img.naturalWidth === 0) continue;
      let px = ((p.x * span - scrollPx) % span + span) % span - 130;
      const dh = baseSize * p.s;
      const dw = (img.naturalWidth / img.naturalHeight) * dh;
      ctx.drawImage(img, px - dw / 2, baseY - dh, dw, dh);
    }
  }

  let scrollDist = 0;
  let creatureX = 0.86;
  let lastTs = performance.now();

  function renderNatureStage(now, dt) {
    if (!natureCanvas) return;
    const rect = natureCanvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(320, Math.round(rect.width));
    const h = Math.max(220, Math.round(rect.height));
    if (natureCanvas.width !== w * dpr || natureCanvas.height !== h * dpr) {
      natureCanvas.width = w * dpr;
      natureCanvas.height = h * dpr;
    }
    const ctx = natureCanvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const speed = activeNatureMode === 'run' ? 145 : activeNatureMode === 'walk' ? 84 : 18;
    scrollDist += speed * dt;
    const t = now * 0.001;

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.72);
    sky.addColorStop(0, '#071b24');
    sky.addColorStop(0.55, '#0d2e2b');
    sky.addColorStop(1, '#143c2c');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Distant sunlit mist glow
    const sun = ctx.createRadialGradient(w * 0.72, h * 0.28, 10, w * 0.72, h * 0.28, w * 0.42);
    sun.addColorStop(0, 'rgba(110, 231, 183, 0.24)');
    sun.addColorStop(0.5, 'rgba(52, 211, 153, 0.08)');
    sun.addColorStop(1, 'rgba(16, 185, 129, 0)');
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, w, h);

    // Distant rolling hills
    ctx.fillStyle = '#0e2d25';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.72);
    for (let x = 0; x <= w; x += 24) {
      const y = h * 0.56 + Math.sin((x + scrollDist * 0.12) * 0.009) * 14 + Math.cos((x + scrollDist * 0.08) * 0.017) * 8;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    const pathTop = h * 0.67;
    const pathBottom = h * 0.88;

    // Back canopy trees
    drawParallaxLayer(ctx, backProps, w, h, scrollDist * 0.35, pathTop + 14, h * 0.52);

    // Lush meadow strip
    const grassGrad = ctx.createLinearGradient(0, pathTop - 16, 0, h);
    grassGrad.addColorStop(0, '#164b2e');
    grassGrad.addColorStop(0.45, '#123d26');
    grassGrad.addColorStop(1, '#092217');
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, pathTop - 12, w, h - pathTop + 12);

    // Mid foliage behind the path
    drawParallaxLayer(ctx, midProps, w, h, scrollDist * 0.65, pathTop + 10, h * 0.36);

    // Nature dirt/stone road
    const roadGrad = ctx.createLinearGradient(0, pathTop, 0, pathBottom);
    roadGrad.addColorStop(0, '#4f4331');
    roadGrad.addColorStop(0.5, '#68573f');
    roadGrad.addColorStop(1, '#3f3526');
    ctx.fillStyle = roadGrad;
    ctx.fillRect(0, pathTop + 8, w, pathBottom - pathTop - 6);

    // Soft grassy road edges + scrolling stepping stones
    ctx.fillStyle = 'rgba(214, 194, 152, 0.22)';
    const stoneSpacing = 74;
    const stoneOffset = -(scrollDist % stoneSpacing);
    for (let x = stoneOffset - stoneSpacing; x < w + stoneSpacing; x += stoneSpacing) {
      ctx.beginPath();
      ctx.ellipse(x + 22, pathTop + (pathBottom - pathTop) * 0.48, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + 56, pathTop + (pathBottom - pathTop) * 0.68, 11, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Wild Nature Spore Walker patrolling ahead on the trail
    creatureX -= (speed * 0.32 + 22) * dt / w;
    if (creatureX < -0.14) creatureX = 1.14;
    const cx = creatureX * w;
    const cy = pathTop + (pathBottom - pathTop) * 0.56;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 4, 34, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    drawStripFrame(ctx, sporeWalkerWest, frameForMode('walk', t * 0.85), cx, cy + 6, Math.min(138, h * 0.44));

    // Hero walking along the Nature path
    const hx = w * 0.33;
    const hy = pathTop + (pathBottom - pathTop) * 0.72;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.beginPath();
    ctx.ellipse(hx, hy - 3, 28, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    const heroStrip = loadImg(`/assets/heroes/${activeNatureSet}_east.webp`);
    const heroFrame = frameForMode(activeNatureMode, t);
    const heroH = Math.min(168, h * 0.54);
    drawStripFrame(ctx, heroStrip, heroFrame, hx, hy + 8, heroH);

    // Floating fireflies / forest spores
    for (const f of fireflies) {
      const fx = (((f.x - t * f.speed) % 1) + 1) % 1 * w;
      const fy = f.y * h + Math.sin(t * 2.2 + f.phase) * 8;
      const alpha = 0.35 + 0.55 * Math.abs(Math.sin(t * 1.9 + f.phase));
      ctx.fillStyle = `rgba(167, 243, 208, ${alpha.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(fx, fy, f.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Foreground parallax foliage
    drawParallaxLayer(ctx, frontProps, w, h, scrollDist * 1.25, h + 14, h * 0.34);
  }

  // Bind Nature Stage controls
  document.querySelectorAll('[data-nature-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeNatureMode = btn.dataset.natureMode;
      document.querySelectorAll('[data-nature-mode]').forEach((b) => b.classList.toggle('active', b === btn));
    });
  });
  document.querySelectorAll('[data-nature-set]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeNatureSet = btn.dataset.natureSet;
      document.querySelectorAll('[data-nature-set]').forEach((b) => b.classList.toggle('active', b === btn));
    });
  });

  // =========================================================
  // 3. INTERACTIVE GEAR SYSTEM PREVIEW
  // =========================================================
  const gearCanvas = document.getElementById('gear-preview');
  const gearTitleEl = document.getElementById('gear-set-name');
  const gearBonusEl = document.getElementById('gear-set-bonus');
  const gearElBadge = document.getElementById('gear-set-el');
  const gearSlotsEl = document.getElementById('gear-slots-grid');
  const gearPanelEl = document.querySelector('.gear-preview-panel');

  let activeGearSet = 'seraphim';
  let activeGearMode = 'walk';

  function renderGearSlots() {
    const set = GEAR_SETS[activeGearSet];
    if (!set || !gearSlotsEl) return;
    gearTitleEl.textContent = set.name;
    gearBonusEl.textContent = set.bonus;
    gearElBadge.textContent = set.element;
    gearElBadge.className = `el-badge ${set.elClass}`;
    if (gearPanelEl) {
      gearPanelEl.style.background = `radial-gradient(circle at 50% 38%, ${set.glow}, rgba(15, 23, 42, 0.94) 70%)`;
    }
    gearSlotsEl.innerHTML = set.slots
      .map(
        (s) => `
      <div class="slot-card">
        <img class="slot-icon" src="${s.icon}" alt="${s.name}" loading="lazy" />
        <div class="slot-meta">
          <div class="slot-type">${s.type}</div>
          <div class="slot-name" title="${s.name}">${s.name}</div>
        </div>
      </div>`
      )
      .join('');
  }

  document.querySelectorAll('[data-gear-set]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeGearSet = btn.dataset.gearSet;
      document.querySelectorAll('[data-gear-set]').forEach((b) => b.classList.toggle('active', b === btn));
      renderGearSlots();
    });
  });
  document.querySelectorAll('[data-gear-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeGearMode = btn.dataset.gearMode;
      document.querySelectorAll('[data-gear-mode]').forEach((b) => b.classList.toggle('active', b === btn));
    });
  });
  renderGearSlots();

  function renderGearPreview(now) {
    if (!gearCanvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = 240;
    if (gearCanvas.width !== size * dpr || gearCanvas.height !== size * dpr) {
      gearCanvas.width = size * dpr;
      gearCanvas.height = size * dpr;
    }
    const ctx = gearCanvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    // Pedestal shadow ring
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(size / 2, size - 24, 52, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const strip = loadImg(`/assets/heroes/${activeGearSet}_se.webp`);
    const frame = frameForMode(activeGearMode, now * 0.001);
    drawStripFrame(ctx, strip, frame, size / 2, size - 16, 206);
  }

  // =========================================================
  // 4. ANIMATED CREATURE BESTIARY CARDS
  // =========================================================
  const creatureCanvases = Array.from(document.querySelectorAll('.creature-canvas')).map((canvas) => {
    const slug = canvas.dataset.creature;
    const img = loadImg(`/assets/creatures/${slug}_se.webp`);
    const state = { canvas, img, mode: 'walk' };
    const card = canvas.closest('.creature-card');
    if (card) {
      card.querySelectorAll('[data-c-mode]').forEach((btn) => {
        btn.addEventListener('click', () => {
          state.mode = btn.dataset.cMode;
          card.querySelectorAll('[data-c-mode]').forEach((b) => b.classList.toggle('active', b === btn));
        });
      });
    }
    return state;
  });

  function renderCreatures(now) {
    const t = now * 0.001;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    for (let i = 0; i < creatureCanvases.length; i++) {
      const item = creatureCanvases[i];
      const c = item.canvas;
      const size = 186;
      if (c.width !== size * dpr || c.height !== size * dpr) {
        c.width = size * dpr;
        c.height = size * dpr;
      }
      const ctx = c.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
      ctx.beginPath();
      ctx.ellipse(size / 2, size - 16, 44, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      const frame = frameForMode(item.mode, t + i * 0.37);
      drawStripFrame(ctx, item.img, frame, size / 2, size - 10, 166);
    }
  }

  // =========================================================
  // 5. LIGHTBOX FOR SCREENSHOTS & CREATURE CARDS
  // =========================================================
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCap = document.getElementById('lightbox-cap');
  const lightboxClose = document.getElementById('lightbox-close');

  function openLightbox(src, caption) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxCap.textContent = caption || '';
    lightbox.classList.add('open');
  }
  function closeLightbox() {
    if (lightbox) lightbox.classList.remove('open');
  }

  document.querySelectorAll('[data-lightbox-src]').forEach((el) => {
    el.addEventListener('click', () => {
      openLightbox(el.dataset.lightboxSrc, el.dataset.lightboxCap);
    });
  });
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  // Main animation loop
  function tick(now) {
    const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) * 0.001));
    lastTs = now;
    renderNatureStage(now, dt);
    renderGearPreview(now);
    renderCreatures(now);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
