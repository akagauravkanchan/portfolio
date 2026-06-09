
// ── 3D PARTICLE NETWORK ──
(function() {
  const canvas = document.getElementById('canvas3d');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 80);

  // Particles
  const PARTICLE_COUNT = 280;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const particles = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const x = (Math.random() - 0.5) * 200;
    const y = (Math.random() - 0.5) * 160;
    const z = (Math.random() - 0.5) * 100;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    particles.push({
      x, y, z,
      vx: (Math.random() - 0.5) * 0.06,
      vy: (Math.random() - 0.5) * 0.06,
      vz: (Math.random() - 0.5) * 0.03,
    });
  }

  const geo = new THREE.BufferGeometry();
  const posAttr = new THREE.BufferAttribute(positions, 3);
  geo.setAttribute('position', posAttr);

  const mat = new THREE.PointsMaterial({
    color: 0x3b82f6,
    size: 0.8,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // Lines connecting nearby particles
  const linePositions = new Float32Array(PARTICLE_COUNT * PARTICLE_COUNT * 6);
  const lineGeo = new THREE.BufferGeometry();
  const linePosAttr = new THREE.BufferAttribute(linePositions, 3);
  lineGeo.setAttribute('position', linePosAttr);

  const lineMat = new THREE.LineBasicMaterial({
    color: 0x06b6d4,
    transparent: true,
    opacity: 0.0,
  });
  const lineSegs = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lineSegs);

  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 0.3;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.3;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const CONNECT_DIST = 28;

  function animate() {
    requestAnimationFrame(animate);

    // Update particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy; p.z += p.vz;
      if (Math.abs(p.x) > 100) p.vx *= -1;
      if (Math.abs(p.y) > 80) p.vy *= -1;
      if (Math.abs(p.z) > 50) p.vz *= -1;
      posAttr.array[i*3] = p.x;
      posAttr.array[i*3+1] = p.y;
      posAttr.array[i*3+2] = p.z;
    }
    posAttr.needsUpdate = true;

    // Build lines
    let lIdx = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      for (let j = i+1; j < PARTICLE_COUNT; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dz = particles[i].z - particles[j].z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist < CONNECT_DIST && lIdx < linePositions.length - 5) {
          linePositions[lIdx++] = particles[i].x;
          linePositions[lIdx++] = particles[i].y;
          linePositions[lIdx++] = particles[i].z;
          linePositions[lIdx++] = particles[j].x;
          linePositions[lIdx++] = particles[j].y;
          linePositions[lIdx++] = particles[j].z;
        }
      }
    }
    linePosAttr.needsUpdate = true;
    lineGeo.setDrawRange(0, lIdx / 3);
    lineMat.opacity = 0.12;

    // Camera drift
    camera.position.x += (mouseX * 20 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 15 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();
})();

// ── INTERSECTION OBSERVER ──
const reveals = document.querySelectorAll('.reveal');
const timelineItems = document.querySelectorAll('.timeline-item');
const skillFills = document.querySelectorAll('.skill-bar-fill');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      // Animate skill bars
      if (e.target.classList.contains('skill-group')) {
        e.target.querySelectorAll('.skill-bar-fill').forEach(bar => {
          const w = bar.dataset.w;
          setTimeout(() => { bar.style.width = w + '%'; }, 200);
        });
      }
    }
  });
}, { threshold: 0.15 });

reveals.forEach(el => observer.observe(el));

const tlObserver = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 120);
    }
  });
}, { threshold: 0.1 });

timelineItems.forEach(el => tlObserver.observe(el));
