/**
 * ═══════════════════════════════════════════════════════
 *  FitPlan Pro — script.js
 *  Three.js 3D hero · Fitness calculator · UI engine
 * ═══════════════════════════════════════════════════════
 */

/* ══════════════════════════════════════
   1. LOADING SCREEN
══════════════════════════════════════ */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.classList.add('hidden');
    // Trigger initial reveal animations after loader hides
    setTimeout(triggerReveal, 100);
    // Restore saved plan if it exists
    loadSavedPlan();
  }, 1900);
});


/* ══════════════════════════════════════
   2. THEME TOGGLE
══════════════════════════════════════ */
const html        = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');

// Persist theme preference
const savedTheme = localStorage.getItem('fitplan-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('fitplan-theme', next);
  showToast(`${next === 'dark' ? '🌙 Dark' : '☀️ Light'} mode activated`, 'info');
});


/* ══════════════════════════════════════
   3. STICKY NAV
══════════════════════════════════════ */
const navbar = document.getElementById('navbar');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  // Sticky style
  navbar.classList.toggle('scrolled', window.scrollY > 40);

  // Active link highlight
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href')?.replace('#', '');
    link.classList.toggle('active', href === current);
  });
});


/* ══════════════════════════════════════
   4. MOBILE MENU
══════════════════════════════════════ */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  mobileMenu.setAttribute('aria-hidden', !isOpen);
});

document.querySelectorAll('[data-close-menu]').forEach(el => {
  el.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
    mobileMenu.setAttribute('aria-hidden', true);
  });
});

// Close on outside click
document.addEventListener('click', e => {
  if (!navbar.contains(e.target)) {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
  }
});


/* ══════════════════════════════════════
   5. SCROLL REVEAL
══════════════════════════════════════ */
function triggerReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
}


/* ══════════════════════════════════════
   6. TOAST NOTIFICATIONS
══════════════════════════════════════ */
const toastContainer = document.getElementById('toast-container');

function showToast(message, type = 'info', duration = 3500) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span>${message}</span>
  `;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('leaving');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duration);
}


/* ══════════════════════════════════════
   7. THREE.JS 3D HERO
══════════════════════════════════════ */
(function initThreeScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  /* ── Renderer ── */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize(window.innerWidth, window.innerHeight);

  /* ── Scene ── */
  const scene = new THREE.Scene();

  /* ── Camera ── */
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0, 14);

  /* ── Lights ── */
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0x60a5fa, 2.5); // blue key
  keyLight.position.set(5, 8, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.2); // cyan fill
  fillLight.position.set(-6, 3, 4);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0x1d4ed8, 0.8); // dark-blue rim
  rimLight.position.set(0, -5, -6);
  scene.add(rimLight);

  const pointLight = new THREE.PointLight(0x38bdf8, 2, 20);
  pointLight.position.set(0, 0, 6);
  scene.add(pointLight);

  /* ── Helper: glowing material ── */
  function glassMat(color, opacity = 0.15) {
    return new THREE.MeshPhysicalMaterial({
      color,
      metalness: 0.1,
      roughness: 0.05,
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
      reflectivity: 1,
      clearcoat: 1,
    });
  }
  function solidMat(color, emissive = 0x000000, emissiveIntensity = 0) {
    return new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity, roughness: 0.25, metalness: 0.7 });
  }

  /* ══ MAIN OBJECT: Stylised dumbbell ══ */
  const dumbbellGroup = new THREE.Group();

  // Bar
  const barGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.6, 24);
  const barMat = solidMat(0x60a5fa, 0x1d4ed8, 0.4);
  const bar    = new THREE.Mesh(barGeo, barMat);
  bar.rotation.z = Math.PI / 2;
  bar.castShadow = true;
  dumbbellGroup.add(bar);

  // Plate factory
  function addPlates(xPos, plateCount) {
    const plateColors = [0x38bdf8, 0x3b82f6, 0x2563eb];
    for (let i = 0; i < plateCount; i++) {
      const outerR = 1.0 - i * 0.15;
      const geoOuter = new THREE.CylinderGeometry(outerR, outerR, 0.18 - i * 0.02, 32);
      const mat = solidMat(plateColors[i % plateColors.length], plateColors[i % plateColors.length], 0.2);
      const plate = new THREE.Mesh(geoOuter, mat);
      plate.rotation.z = Math.PI / 2;
      plate.position.x = xPos + (i * (xPos > 0 ? 0.22 : -0.22));
      plate.castShadow = true;
      dumbbellGroup.add(plate);

      // Inner hole ring
      const ringGeo = new THREE.TorusGeometry(0.18, 0.04, 12, 40);
      const ringMat = solidMat(0x1e3a8a, 0x38bdf8, 0.5);
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.x = xPos + (i * (xPos > 0 ? 0.22 : -0.22));
      dumbbellGroup.add(ring);
    }
  }
  addPlates( 1.5, 3);
  addPlates(-1.5, 3);

  // Collar knurling bands
  [-0.9, 0.9].forEach(x => {
    const collarGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.3, 24);
    const collar    = new THREE.Mesh(collarGeo, solidMat(0x1e40af, 0x38bdf8, 0.6));
    collar.rotation.z = Math.PI / 2;
    collar.position.x = x;
    dumbbellGroup.add(collar);
  });

  scene.add(dumbbellGroup);
  dumbbellGroup.position.set(0, 0.5, 0);

  /* ══ FLOATING PARTICLES ══ */
  const particlesGeometry = new THREE.BufferGeometry();
  const PARTICLE_COUNT = 180;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const particleSizes = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const spread = 18;
    positions[i * 3]     = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.5 - 4;
    particleSizes[i]     = Math.random() * 3 + 1;
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particlesGeometry.setAttribute('size',     new THREE.BufferAttribute(particleSizes, 1));

  const particleMaterial = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.06,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const particles = new THREE.Points(particlesGeometry, particleMaterial);
  scene.add(particles);

  /* ══ BACKGROUND GEOMETRIC SHAPES ══ */
  const floatingShapes = [];

  const shapeConfigs = [
    { geo: new THREE.IcosahedronGeometry(0.8, 0),  pos: [-7,  3, -4], color: 0x1d4ed8, opacity: 0.18 },
    { geo: new THREE.OctahedronGeometry(0.7, 0),   pos: [ 7,  2, -5], color: 0x2563eb, opacity: 0.14 },
    { geo: new THREE.TetrahedronGeometry(0.9, 0),  pos: [-5, -3, -3], color: 0x38bdf8, opacity: 0.12 },
    { geo: new THREE.IcosahedronGeometry(0.5, 1),  pos: [ 5, -4, -4], color: 0x60a5fa, opacity: 0.16 },
    { geo: new THREE.OctahedronGeometry(1.1, 0),   pos: [ 0,  5, -7], color: 0x1e40af, opacity: 0.10 },
    { geo: new THREE.TetrahedronGeometry(0.6, 0),  pos: [ 9, -1, -6], color: 0x38bdf8, opacity: 0.12 },
    { geo: new THREE.IcosahedronGeometry(0.4, 0),  pos: [-9,  0, -5], color: 0x93c5fd, opacity: 0.09 },
  ];

  shapeConfigs.forEach(cfg => {
    const mat  = glassMat(cfg.color, cfg.opacity);
    const mesh = new THREE.Mesh(cfg.geo, mat);
    mesh.position.set(...cfg.pos);
    mesh.castShadow = false;
    scene.add(mesh);

    const wireMat = new THREE.MeshBasicMaterial({ color: cfg.color, wireframe: true, transparent: true, opacity: cfg.opacity * 0.7 });
    const wire    = new THREE.Mesh(cfg.geo, wireMat);
    wire.position.set(...cfg.pos);
    scene.add(wire);

    floatingShapes.push({
      solid: mesh, wire,
      speed:    Math.random() * 0.005 + 0.003,
      rotSpeed: (Math.random() - 0.5) * 0.008,
      ampX:     Math.random() * 0.4,
      ampY:     Math.random() * 0.4,
      phase:    Math.random() * Math.PI * 2,
      originX:  cfg.pos[0],
      originY:  cfg.pos[1],
    });
  });

  /* ══ TORUS RINGS (accent) ══ */
  const ringGroup = new THREE.Group();
  [3.5, 4.2, 5.1].forEach((r, i) => {
    const tGeo = new THREE.TorusGeometry(r, 0.025, 16, 120);
    const tMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.06 - i * 0.015,
    });
    const torus = new THREE.Mesh(tGeo, tMat);
    torus.rotation.x = Math.PI / 2 + (i * 0.2);
    ringGroup.add(torus);
  });
  ringGroup.position.set(0, 0, -1);
  scene.add(ringGroup);

  /* ══ MOUSE PARALLAX ══ */
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Touch support
  document.addEventListener('touchmove', e => {
    const t = e.touches[0];
    mouseX = (t.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (t.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  /* ══ RESIZE HANDLER ══ */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ══ ANIMATION LOOP ══ */
  let clock = 0;
  function animate() {
    requestAnimationFrame(animate);
    clock += 0.012;

    // Smooth mouse follow
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    // Dumbbell: rotate + mouse tilt
    dumbbellGroup.rotation.y = clock * 0.4 + targetX * 0.5;
    dumbbellGroup.rotation.x = Math.sin(clock * 0.3) * 0.15 - targetY * 0.3;
    dumbbellGroup.rotation.z = Math.sin(clock * 0.2) * 0.08;
    dumbbellGroup.position.y = 0.5 + Math.sin(clock * 0.7) * 0.3;

    // Particles drift
    particles.rotation.y = clock * 0.04;
    particles.rotation.x = clock * 0.02;

    // Torus rings
    ringGroup.rotation.z = clock * 0.08 + targetX * 0.1;
    ringGroup.rotation.x = Math.PI / 2 + targetY * 0.05;

    // Floating shapes
    floatingShapes.forEach((s, i) => {
      const t = clock * s.speed * 60 + s.phase;
      s.solid.position.x = s.originX + Math.sin(t * 0.8) * s.ampX;
      s.solid.position.y = s.originY + Math.cos(t * 0.6) * s.ampY;
      s.solid.rotation.x += s.rotSpeed;
      s.solid.rotation.y += s.rotSpeed * 0.7;
      s.wire.position.copy(s.solid.position);
      s.wire.rotation.copy(s.solid.rotation);
    });

    // Point light animation
    pointLight.position.x = Math.sin(clock * 0.5) * 3;
    pointLight.position.y = Math.cos(clock * 0.4) * 2;

    // Camera micro-move
    camera.position.x += (targetX * 0.8 - camera.position.x) * 0.02;
    camera.position.y += (-targetY * 0.5 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();
})();


/* ══════════════════════════════════════
   8. RANGE INPUT LIVE LABEL
══════════════════════════════════════ */
const trainingRange = document.getElementById('training-days');
const daysLabel     = document.getElementById('days-label');

trainingRange.addEventListener('input', () => {
  daysLabel.textContent = trainingRange.value;
  // Update range fill colour via gradient
  const pct = ((trainingRange.value - 1) / 6) * 100;
  trainingRange.style.background = `linear-gradient(to right, #3b82f6 0%, #38bdf8 ${pct}%, rgba(255,255,255,0.1) ${pct}%)`;
});
// Init
trainingRange.dispatchEvent(new Event('input'));


/* ══════════════════════════════════════
   9. FITNESS CALCULATION ENGINE
══════════════════════════════════════ */

/**
 * Calculate BMR using Mifflin–St Jeor equation
 * @param {number} weight  - kg
 * @param {number} height  - cm
 * @param {number} age     - years
 * @param {string} sex     - 'male' | 'female'
 * @returns {number} BMR in kcal
 */
function calcBMR(weight, height, age, sex) {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

/**
 * Calculate TDEE from BMR × activity multiplier
 */
function calcTDEE(bmr, activityMultiplier) {
  return Math.round(bmr * activityMultiplier);
}

/**
 * Adjust calories for goal
 * Muscle: +300–400 surplus · Fat: -500 deficit · Maintain: 0
 */
function adjustForGoal(tdee, goal) {
  const adj = { muscle: 350, fat: -500, maintain: 0 };
  return Math.round(tdee + adj[goal]);
}

/**
 * Calculate macros in grams
 * Protein: 2.2g/kg · Fat: 25% kcal · Carbs: remainder
 */
function calcMacros(calories, weight, goal) {
  const proteinMultiplier = goal === 'fat' ? 2.4 : goal === 'muscle' ? 2.2 : 1.8;
  const protein = Math.round(weight * proteinMultiplier);
  const fat     = Math.round((calories * 0.25) / 9);
  const carbs   = Math.round((calories - protein * 4 - fat * 9) / 4);
  return { protein, fat, carbs: Math.max(carbs, 50) };
}

/**
 * Choose optimal workout split based on training days + goal
 */
function getWorkoutSplit(days, goal) {
  const splits = {
    1: { name: 'Full Body ×1', days: [{ label: 'Day 1', workout: 'Full Body — Compounds Focus' }] },
    2: { name: 'Upper / Lower', days: [
        { label: 'Day 1', workout: 'Upper Body — Push + Pull' },
        { label: 'Day 2', workout: 'Lower Body — Squat + Hinge' },
      ]},
    3: { name: 'Push / Pull / Legs', days: [
        { label: 'Day 1', workout: 'Push — Chest · Shoulders · Triceps' },
        { label: 'Day 2', workout: 'Pull — Back · Biceps · Rear Delts' },
        { label: 'Day 3', workout: 'Legs — Quads · Glutes · Hamstrings' },
      ]},
    4: { name: 'Upper/Lower ×2', days: [
        { label: 'Day 1', workout: 'Upper A — Strength Focus' },
        { label: 'Day 2', workout: 'Lower A — Squat Dominant' },
        { label: 'Day 3', workout: 'Upper B — Hypertrophy Focus' },
        { label: 'Day 4', workout: 'Lower B — Hip Dominant' },
      ]},
    5: { name: 'PPL + Full Body', days: [
        { label: 'Day 1', workout: 'Push — Chest · Shoulders · Triceps' },
        { label: 'Day 2', workout: 'Pull — Back · Biceps · Face Pulls' },
        { label: 'Day 3', workout: 'Legs — Volume Day' },
        { label: 'Day 4', workout: 'Push — Strength Overload' },
        { label: 'Day 5', workout: 'Full Body — Metabolic Finisher' },
      ]},
    6: { name: 'Push / Pull / Legs ×2', days: [
        { label: 'Day 1', workout: 'Push A — Heavy Compounds' },
        { label: 'Day 2', workout: 'Pull A — Deadlift Focus' },
        { label: 'Day 3', workout: 'Legs A — Squat + Accessories' },
        { label: 'Day 4', workout: 'Push B — Incline · Lateral Raises' },
        { label: 'Day 5', workout: 'Pull B — Rows · Biceps Volume' },
        { label: 'Day 6', workout: 'Legs B — Romanian DL · Calves' },
      ]},
    7: { name: 'PPLx2 + Full Body', days: [
        { label: 'Day 1', workout: 'Push A — Bench · OHP' },
        { label: 'Day 2', workout: 'Pull A — Deadlift · Rows' },
        { label: 'Day 3', workout: 'Legs A — Back Squat' },
        { label: 'Day 4', workout: 'Push B — Incline · Flyes' },
        { label: 'Day 5', workout: 'Pull B — Weighted Pull-Ups' },
        { label: 'Day 6', workout: 'Legs B — Front Squat · Lunges' },
        { label: 'Day 7', workout: 'Full Body — Active Recovery + Core' },
      ]},
  };

  // Add cardio note for fat loss
  const split = splits[days];
  if (goal === 'fat') {
    split.days = split.days.map(d => ({
      ...d,
      workout: d.workout + (d.label.includes('1') ? ' + 20 min HIIT' : ''),
    }));
  }
  return split;
}

/**
 * Generate a sample daily diet plan based on goal + calories
 */
function getDietPlan(calories, macros, goal) {
  const plans = {
    muscle: [
      { time: '07:00', name: 'Breakfast', desc: `Oats (100g) + 3 whole eggs + banana — ~${Math.round(calories * 0.22)} kcal` },
      { time: '10:00', name: 'Mid-Morning', desc: `Greek yoghurt (200g) + mixed nuts — ~${Math.round(calories * 0.1)} kcal` },
      { time: '13:00', name: 'Lunch', desc: `Chicken breast (200g) + white rice (200g) + broccoli — ~${Math.round(calories * 0.28)} kcal` },
      { time: '16:00', name: 'Pre-Workout', desc: `Rice cakes + peanut butter + whey protein shake — ~${Math.round(calories * 0.12)} kcal` },
      { time: '19:00', name: 'Dinner', desc: `Salmon (180g) + sweet potato (200g) + green salad — ~${Math.round(calories * 0.22)} kcal` },
      { time: '21:30', name: 'Night Snack', desc: `Cottage cheese (150g) + casein or milk — ~${Math.round(calories * 0.06)} kcal` },
    ],
    fat: [
      { time: '07:30', name: 'Breakfast', desc: `Egg white omelette (4 whites) + spinach + black coffee — ~${Math.round(calories * 0.18)} kcal` },
      { time: '10:00', name: 'Mid-Morning', desc: `Apple + 20g almonds — ~${Math.round(calories * 0.08)} kcal` },
      { time: '13:00', name: 'Lunch', desc: `Grilled chicken (180g) + quinoa (100g) + large salad — ~${Math.round(calories * 0.3)} kcal` },
      { time: '16:00', name: 'Pre-Workout', desc: `Banana + 1 scoop whey — ~${Math.round(calories * 0.1)} kcal` },
      { time: '19:00', name: 'Dinner', desc: `Lean beef (150g) + roasted veg + basmati rice (80g) — ~${Math.round(calories * 0.28)} kcal` },
      { time: '21:00', name: 'Evening', desc: `Casein shake or low-fat cottage cheese — ~${Math.round(calories * 0.06)} kcal` },
    ],
    maintain: [
      { time: '07:30', name: 'Breakfast', desc: `Scrambled eggs (3) + avocado toast + juice — ~${Math.round(calories * 0.22)} kcal` },
      { time: '10:30', name: 'Mid-Morning', desc: `Mixed fruit bowl + protein bar — ~${Math.round(calories * 0.1)} kcal` },
      { time: '13:00', name: 'Lunch', desc: `Tuna sandwich + side salad + water — ~${Math.round(calories * 0.28)} kcal` },
      { time: '16:00', name: 'Afternoon', desc: `Handful of nuts + piece of fruit — ~${Math.round(calories * 0.1)} kcal` },
      { time: '19:00', name: 'Dinner', desc: `Pasta (120g) + turkey mince bolognese + salad — ~${Math.round(calories * 0.25)} kcal` },
      { time: '21:00', name: 'Evening', desc: `Greek yoghurt + honey — ~${Math.round(calories * 0.05)} kcal` },
    ],
  };
  return plans[goal];
}

/**
 * Build weekly schedule — spread training days evenly with rest days
 */
function getWeeklySchedule(trainingDays, split) {
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Distribute training days as evenly as possible
  const schedule = Array(7).fill(null).map((_, i) => ({ day: dayNames[i], type: 'rest', label: 'Rest Day', sub: 'Recovery & sleep' }));

  // Simple even distribution
  const spacing = Math.floor(7 / trainingDays);
  let used = 0;
  for (let i = 0; i < 7 && used < trainingDays; i++) {
    if (i % Math.max(1, spacing) === 0 || (7 - i) === (trainingDays - used)) {
      schedule[i] = { day: dayNames[i], type: 'training', label: split.days[used]?.workout.split(' — ')[0] || 'Train', sub: split.days[used]?.workout.split(' — ')[1] || '' };
      used++;
    }
  }
  return schedule;
}


/* ══════════════════════════════════════
   10. FORM VALIDATION
══════════════════════════════════════ */
function validateForm() {
  let isValid = true;

  // Goal
  const goal = document.querySelector('input[name="goal"]:checked')?.value;
  setFieldError('goal-error', !goal, 'Please select a goal.');
  if (!goal) isValid = false;

  // Weight
  const weight = parseFloat(document.getElementById('weight').value);
  const weightOk = !isNaN(weight) && weight >= 30 && weight <= 300;
  setFieldError('weight-error', !weightOk, 'Enter a valid weight (30–300 kg).');
  document.getElementById('weight').classList.toggle('error', !weightOk);
  if (!weightOk) isValid = false;

  // Height
  const height = parseFloat(document.getElementById('height').value);
  const heightOk = !isNaN(height) && height >= 100 && height <= 250;
  setFieldError('height-error', !heightOk, 'Enter a valid height (100–250 cm).');
  document.getElementById('height').classList.toggle('error', !heightOk);
  if (!heightOk) isValid = false;

  // Age
  const age = parseInt(document.getElementById('age').value, 10);
  const ageOk = !isNaN(age) && age >= 12 && age <= 100;
  setFieldError('age-error', !ageOk, 'Enter a valid age (12–100).');
  document.getElementById('age').classList.toggle('error', !ageOk);
  if (!ageOk) isValid = false;

  // Sex
  const sex = document.querySelector('input[name="sex"]:checked')?.value;
  setFieldError('sex-error', !sex, 'Please select your sex.');
  if (!sex) isValid = false;

  // Activity
  const activity = document.getElementById('activity').value;
  setFieldError('activity-error', !activity, 'Please select your activity level.');
  document.getElementById('activity').classList.toggle('error', !activity);
  if (!activity) isValid = false;

  return isValid;
}

function setFieldError(errorId, show, message) {
  const el = document.getElementById(errorId);
  if (!el) return;
  el.hidden = !show;
  el.textContent = show ? message : '';
}

// Clear errors on input
document.querySelectorAll('.form-input, .form-select').forEach(el => {
  el.addEventListener('input', () => {
    el.classList.remove('error');
    const errorId = el.id + '-error';
    setFieldError(errorId, false);
  });
});


/* ══════════════════════════════════════
   11. FORM SUBMIT & RENDER RESULTS
══════════════════════════════════════ */
const fitnessForm = document.getElementById('fitness-form');
const resultsSection = document.getElementById('results');

fitnessForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!validateForm()) {
    showToast('Please fix the errors above.', 'error');
    // Scroll to first error
    const firstError = fitnessForm.querySelector('.field-error:not([hidden])');
    firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Gather data
  const goal     = document.querySelector('input[name="goal"]:checked').value;
  const weight   = parseFloat(document.getElementById('weight').value);
  const height   = parseFloat(document.getElementById('height').value);
  const age      = parseInt(document.getElementById('age').value, 10);
  const sex      = document.querySelector('input[name="sex"]:checked').value;
  const activity = parseFloat(document.getElementById('activity').value);
  const days     = parseInt(trainingRange.value, 10);

  // Calculations
  const bmr      = Math.round(calcBMR(weight, height, age, sex));
  const tdee     = calcTDEE(bmr, activity);
  const calories = adjustForGoal(tdee, goal);
  const macros   = calcMacros(calories, weight, goal);
  const split    = getWorkoutSplit(days, goal);
  const diet     = getDietPlan(calories, macros, goal);
  const schedule = getWeeklySchedule(days, split);

  // Render
  renderResults({ goal, weight, height, age, sex, activity, days, bmr, tdee, calories, macros, split, diet, schedule });

  // Reveal results section
  resultsSection.hidden = false;
  setTimeout(() => {
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Retrigger reveal animations
    resultsSection.querySelectorAll('.reveal-up').forEach(el => {
      el.classList.remove('visible');
      setTimeout(() => el.classList.add('visible'), 50);
    });
    animateMacroRings(macros, calories);
  }, 100);

  showToast('🎉 Your plan is ready!', 'success');

  // Auto-save to localStorage
  autoSave({ goal, weight, height, age, sex, activity, days, bmr, tdee, calories, macros });
});


/* ══════════════════════════════════════
   12. RENDER RESULTS
══════════════════════════════════════ */
function renderResults({ goal, weight, calories, macros, bmr, tdee, split, diet, schedule }) {

  /* ── Calorie display ── */
  animateCount(document.getElementById('result-calories'), calories);
  document.getElementById('result-bmr').textContent      = `${bmr.toLocaleString()} kcal`;
  document.getElementById('result-tdee').textContent     = `${tdee.toLocaleString()} kcal`;
  const goalLabels = { muscle: 'Gain Muscle (+350 kcal)', fat: 'Lose Fat (−500 kcal)', maintain: 'Maintain (±0 kcal)' };
  document.getElementById('result-goal-label').textContent = goalLabels[goal];
  document.getElementById('result-protein').textContent  = `${macros.protein}g`;
  document.getElementById('result-carbs').textContent    = `${macros.carbs}g`;
  document.getElementById('result-fat').textContent      = `${macros.fat}g`;

  /* ── Workout split ── */
  const splitEl = document.getElementById('workout-split');
  splitEl.innerHTML = `
    <p style="font-size:0.8rem;color:var(--accent);font-family:var(--font-mono);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:var(--space-4)">${split.name}</p>
    <div class="split-list">
      ${split.days.map(d => `
        <div class="split-day">
          <span class="split-day-name">${d.label}</span>
          <span class="split-day-workout">${d.workout}</span>
        </div>
      `).join('')}
    </div>
  `;

  /* ── Diet plan ── */
  const dietEl = document.getElementById('diet-plan');
  dietEl.innerHTML = `
    <div class="meal-list">
      ${diet.map(m => `
        <div class="meal-item">
          <div class="meal-time">${m.time} · ${m.name}</div>
          <div class="meal-name">${m.desc.split('—')[0].trim()}</div>
          ${m.desc.includes('—') ? `<div class="meal-desc">${m.desc.split('—')[1].trim()}</div>` : ''}
        </div>
      `).join('')}
    </div>
    <p style="font-size:0.75rem;color:var(--text-muted);margin-top:var(--space-4)">
      Daily targets: <strong style="color:var(--text-secondary)">${macros.protein}g protein · ${macros.carbs}g carbs · ${macros.fat}g fat</strong>
    </p>
  `;

  /* ── Weekly schedule ── */
  const weekEl = document.getElementById('weekly-schedule');
  weekEl.innerHTML = `
    <div class="week-grid">
      ${schedule.map(d => `
        <div class="week-day ${d.type === 'training' ? 'training' : ''}">
          <div class="week-day-name">${d.day}</div>
          <div class="week-day-label">${d.label}</div>
          ${d.sub ? `<div class="week-day-sub">${d.sub}</div>` : ''}
        </div>
      `).join('')}
    </div>
  `;

  /* ── Progress summary ── */
  const progressEl = document.getElementById('progress-summary');
  const defSurplus = goal === 'fat' ? -500 : goal === 'muscle' ? 350 : 0;
  const weeklyKcalDelta = defSurplus * 7;
  const bodyChange = (weeklyKcalDelta / 7700).toFixed(2); // ~7700 kcal = 1 kg body mass
  const changeLabel = goal === 'fat' ? `${Math.abs(bodyChange)} kg fat loss / week` : goal === 'muscle' ? `${Math.abs(bodyChange)} kg lean gain / week` : 'Weight maintenance';
  const progressItems = [
    { label: 'Protein coverage',   pct: Math.min(100, Math.round((macros.protein * 4 / calories) * 100)), note: `${Math.round((macros.protein * 4 / calories) * 100)}% of total calories` },
    { label: 'Carbohydrate energy', pct: Math.min(100, Math.round((macros.carbs * 4 / calories) * 100)),   note: `${Math.round((macros.carbs * 4 / calories) * 100)}% of total calories` },
    { label: 'Dietary fat intake',  pct: Math.min(100, Math.round((macros.fat * 9 / calories) * 100)),     note: `${Math.round((macros.fat * 9 / calories) * 100)}% of total calories` },
    { label: 'Training intensity',  pct: Math.min(100, Math.round((parseInt(trainingRange.value) / 7) * 100)), note: `${trainingRange.value} days / week` },
  ];

  progressEl.innerHTML = `
    <div style="display:flex;gap:var(--space-6);flex-wrap:wrap;margin-bottom:var(--space-6)">
      <div class="calorie-meta-item">
        <span class="meta-label">Est. body change</span>
        <span class="meta-value" style="color:var(--accent)">${changeLabel}</span>
      </div>
      <div class="calorie-meta-item">
        <span class="meta-label">Weekly caloric delta</span>
        <span class="meta-value">${weeklyKcalDelta > 0 ? '+' : ''}${weeklyKcalDelta.toLocaleString()} kcal</span>
      </div>
      <div class="calorie-meta-item">
        <span class="meta-label">4-week projection</span>
        <span class="meta-value">${goal === 'maintain' ? '~0 kg' : goal === 'fat' ? `−${(parseFloat(Math.abs(bodyChange)) * 4).toFixed(1)} kg` : `+${(parseFloat(bodyChange) * 4).toFixed(1)} kg`}</span>
      </div>
    </div>
    <div class="progress-bars">
      ${progressItems.map(p => `
        <div class="progress-item">
          <div class="progress-header">
            <span>${p.label}</span>
            <strong>${p.note}</strong>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width:${p.pct}%"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}


/* ══════════════════════════════════════
   13. ANIMATED COUNTER
══════════════════════════════════════ */
function animateCount(el, target) {
  const duration = 800;
  const start    = Date.now();
  const startVal = 0;
  function tick() {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(startVal + (target - startVal) * ease).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  }
  tick();
}


/* ══════════════════════════════════════
   14. MACRO RING ANIMATION
══════════════════════════════════════ */
function animateMacroRings(macros, calories) {
  const CIRCUMFERENCE = 201; // 2π × r32

  const rings = [
    { id: 'protein-ring', grams: macros.protein, calsPerG: 4 },
    { id: 'carb-ring',    grams: macros.carbs,   calsPerG: 4 },
    { id: 'fat-ring',     grams: macros.fat,     calsPerG: 9 },
  ];

  rings.forEach(r => {
    const pct    = Math.min((r.grams * r.calsPerG) / calories, 1);
    const offset = CIRCUMFERENCE - pct * CIRCUMFERENCE;
    const el = document.getElementById(r.id);
    if (el) {
      el.style.strokeDashoffset = offset;
    }
  });
}


/* ══════════════════════════════════════
   15. RESET FORM
══════════════════════════════════════ */
document.getElementById('reset-btn').addEventListener('click', () => {
  fitnessForm.reset();
  trainingRange.value = 4;
  trainingRange.dispatchEvent(new Event('input'));
  // Clear goal cards
  document.querySelectorAll('.goal-card input').forEach(r => r.checked = false);
  // Clear errors
  document.querySelectorAll('.field-error').forEach(e => { e.hidden = true; e.textContent = ''; });
  document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));
  // Hide results
  resultsSection.hidden = true;
  showToast('Form cleared — start fresh!', 'info');
  document.getElementById('planner').scrollIntoView({ behavior: 'smooth' });
});


/* ══════════════════════════════════════
   16. SAVE / LOAD PLAN (localStorage)
══════════════════════════════════════ */
function autoSave(data) {
  try {
    localStorage.setItem('fitplan-data', JSON.stringify({ ...data, savedAt: new Date().toISOString() }));
  } catch (e) {
    console.warn('localStorage unavailable:', e);
  }
}

function loadSavedPlan() {
  try {
    const raw = localStorage.getItem('fitplan-data');
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data) return;

    // Restore form values
    if (data.goal) {
      const r = document.querySelector(`input[name="goal"][value="${data.goal}"]`);
      if (r) r.checked = true;
    }
    if (data.weight) document.getElementById('weight').value = data.weight;
    if (data.height) document.getElementById('height').value = data.height;
    if (data.age)    document.getElementById('age').value    = data.age;
    if (data.sex) {
      const s = document.querySelector(`input[name="sex"][value="${data.sex}"]`);
      if (s) s.checked = true;
    }
    if (data.activity) document.getElementById('activity').value = data.activity;
    if (data.days) {
      trainingRange.value = data.days;
      trainingRange.dispatchEvent(new Event('input'));
    }

    const saved = new Date(data.savedAt).toLocaleDateString();
    showToast(`Plan from ${saved} restored from storage.`, 'info', 4000);
  } catch (e) {
    console.warn('Could not restore plan:', e);
  }
}

// Manual save button (in results)
document.getElementById('save-btn')?.addEventListener('click', () => {
  const raw = localStorage.getItem('fitplan-data');
  if (raw) {
    showToast('✅ Plan saved to local storage!', 'success');
  } else {
    showToast('Calculate your plan first.', 'error');
  }
});

// Recalculate button
document.getElementById('recalculate-btn')?.addEventListener('click', () => {
  document.getElementById('planner').scrollIntoView({ behavior: 'smooth' });
});


/* ══════════════════════════════════════
   17. SMOOTH SCROLL FOR ANCHOR LINKS
══════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const targetId = link.getAttribute('href').slice(1);
    const target   = document.getElementById(targetId);
    if (!target) return;
    e.preventDefault();
    const navHeight = navbar.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ══════════════════════════════════════
   18. GOAL CARD MICRO-INTERACTION
══════════════════════════════════════ */
document.querySelectorAll('.goal-card input').forEach(radio => {
  radio.addEventListener('change', () => {
    // Scale-pop on selected card
    const card = radio.closest('.goal-card');
    card.querySelector('.goal-card-inner').style.transform = 'scale(1.04)';
    setTimeout(() => {
      card.querySelector('.goal-card-inner').style.transform = '';
    }, 200);
    // Clear error
    setFieldError('goal-error', false);
  });
});


/* ══════════════════════════════════════
   END OF SCRIPT
══════════════════════════════════════ */
console.log('%c FitPlan Pro 🏋️ Loaded ', 'background:#1d4ed8;color:#fff;padding:4px 10px;border-radius:4px;font-weight:bold;');
