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
  // 1. INTERACTIVE 5-TAB "INSIDE THE GAME" TOUR
  // =========================================================
  const TOUR_SLIDES = {
    world: {
      src: '/assets/screens/elemental_world.webp',
      title: 'Elemental Worlds & Dynamic Weather',
      desc: 'Explore 3D Verdantwarden biomes with live Woodland Rain & Hard Wind weather modifiers, Synthesis Radar, roaming wild creatures, and full-loot extraction runs.',
    },
    gear: {
      src: '/assets/screens/gear_system_ingame.webp',
      title: 'Field Pack & Synthesis Gear System ([I])',
      desc: 'Manage a spatial 6x5 Main Backpack, expandable 4x3 Tactical Pouch, 7 equipment slots, Explore Tactical Belt [1-4], and live Runner Appearance customization.',
    },
    deck: {
      src: '/assets/screens/creature_deck_ingame.webp',
      title: 'Cyber Deck & 1v1 ELO Arena ([K])',
      desc: 'Scan wild creatures into permanent cards, slot an Active Creature Resonance like Malakor, and assemble a 6-card elemental Battle Deck for PvE and ranked 1v1 duels.',
    },
    dome: {
      src: '/assets/screens/dome_hub.webp',
      title: 'Sinteza Mega-Dome Hub',
      desc: 'Your safe social lobby with global ELO leaderboards, supply vendors, and portals connecting Elemental Worlds, dungeons, and your private Sanctuary.',
    },
    sanctuary: {
      src: '/assets/screens/sanctuary_house.webp',
      title: 'Personal Sanctuary Housing',
      desc: 'Step through the red Sanctuary portal in the Dome to access your multi-floor house with tiered storage wardrobes, kitchen fridge, furniture sitting, and bed HP/Stamina recovery.',
    },
  };

  const tourImg = document.getElementById('tour-img');
  const tourTitle = document.getElementById('tour-title');
  const tourDesc = document.getElementById('tour-desc');
  const tourWrap = document.getElementById('tour-img-wrap');

  function selectTour(key) {
    const slide = TOUR_SLIDES[key];
    if (!slide || !tourImg) return;
    tourImg.src = slide.src;
    tourImg.alt = slide.title;
    tourTitle.textContent = slide.title;
    tourDesc.textContent = slide.desc;
    if (tourWrap) {
      tourWrap.dataset.lightboxSrc = slide.src;
      tourWrap.dataset.lightboxCap = `${slide.title} — ${slide.desc}`;
    }
    document.querySelectorAll('[data-tour]').forEach((b) => {
      b.classList.toggle('active', b.dataset.tour === key);
    });
  }

  document.querySelectorAll('[data-tour]').forEach((btn) => {
    btn.addEventListener('click', () => selectTour(btn.dataset.tour));
  });
  Object.values(TOUR_SLIDES).forEach((s) => loadImg(s.src));

  // =========================================================
  // 2. INTERACTIVE 6-SLOT LAYERED GEAR PREVIEW (60 FPS)
  // =========================================================
  const GEAR_SETS = {
    seraphim: {
      name: 'Seraphim Light Set',
      element: 'Light',
      elClass: 'el-light',
      glow: 'rgba(253, 224, 71, 0.22)',
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
    cinder: {
      name: 'Cinder Pyre Set',
      element: 'Fire',
      elClass: 'el-fire',
      glow: 'rgba(249, 115, 22, 0.24)',
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
      glow: 'rgba(56, 189, 248, 0.24)',
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
    verdant: {
      name: 'Verdant Warden Set',
      element: 'Nature',
      elClass: 'el-nature',
      glow: 'rgba(52, 211, 153, 0.22)',
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
    ironclad: {
      name: 'Ironclad Titan Set',
      element: 'Steel',
      elClass: 'el-steel',
      glow: 'rgba(148, 163, 184, 0.24)',
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

  Object.keys(GEAR_SETS).forEach((k) => loadImg(`/assets/heroes/${k}_se.webp`));

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
      gearPanelEl.style.background = `radial-gradient(circle at 50% 38%, ${set.glow}, rgba(12, 19, 36, 0.96) 70%)`;
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
    const size = 230;
    if (gearCanvas.width !== size * dpr || gearCanvas.height !== size * dpr) {
      gearCanvas.width = size * dpr;
      gearCanvas.height = size * dpr;
    }
    const ctx = gearCanvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(size / 2, size - 22, 50, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const strip = loadImg(`/assets/heroes/${activeGearSet}_se.webp`);
    drawStripFrame(ctx, strip, frameForMode(activeGearMode, now * 0.001), size / 2, size - 14, 198);
  }

  // =========================================================
  // 3. ANIMATED CREATURE BESTIARY (60 FPS)
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
      const size = 180;
      if (c.width !== size * dpr || c.height !== size * dpr) {
        c.width = size * dpr;
        c.height = size * dpr;
      }
      const ctx = c.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
      ctx.beginPath();
      ctx.ellipse(size / 2, size - 16, 42, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      drawStripFrame(ctx, item.img, frameForMode(item.mode, t + i * 0.37), size / 2, size - 10, 160);
    }
  }

  // =========================================================
  // 4. LIGHTBOX
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
    el.addEventListener('click', () => openLightbox(el.dataset.lightboxSrc, el.dataset.lightboxCap));
  });
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  }
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  function tick(now) {
    renderGearPreview(now);
    renderCreatures(now);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
