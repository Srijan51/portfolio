/* ===================================================
   PORTFOLIO - Particles, Cursor Trail & Page Transitions
   =================================================== */

// ---- Interactive Particle Background ----
class ParticleNetwork {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 150 };
    this.particleCount = window.innerWidth < 768 ? 40 : 80;
    this.maxDistance = 120;
    this.running = true;

    this.resize();
    this.init();
    this.animate();

    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    window.addEventListener('mouseout', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.5 ? 'rgba(108, 99, 255,' : 'rgba(0, 212, 255,'
      });
    }
  }

  animate() {
    if (!this.running) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach((p, i) => {
      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off walls
      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

      // Mouse interaction — push particles away
      if (this.mouse.x !== null) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.mouse.radius) {
          const force = (this.mouse.radius - dist) / this.mouse.radius;
          p.x += dx * force * 0.03;
          p.y += dy * force * 0.03;
        }
      }

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color + '0.6)';
      this.ctx.fill();

      // Connect nearby particles with lines
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.maxDistance) {
          const opacity = (1 - dist / this.maxDistance) * 0.15;
          this.ctx.strokeStyle = `rgba(108, 99, 255, ${opacity})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }

      // Connect to mouse
      if (this.mouse.x !== null) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.mouse.radius) {
          const opacity = (1 - dist / this.mouse.radius) * 0.3;
          this.ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
          this.ctx.lineWidth = 0.8;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(this.mouse.x, this.mouse.y);
          this.ctx.stroke();
        }
      }
    });

    requestAnimationFrame(() => this.animate());
  }
}

// ---- Cursor Glow Trail ----
class CursorTrail {
  constructor() {
    this.trail = document.createElement('div');
    this.trail.className = 'cursor-trail';
    document.body.appendChild(this.trail);

    this.glow = document.createElement('div');
    this.glow.className = 'cursor-glow';
    document.body.appendChild(this.glow);

    this.pos = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };

    // Only on desktop
    if (window.innerWidth > 768) {
      document.addEventListener('mousemove', (e) => {
        this.target.x = e.clientX;
        this.target.y = e.clientY;
        this.trail.style.opacity = '1';
        this.glow.style.opacity = '1';
      });

      document.addEventListener('mouseout', () => {
        this.trail.style.opacity = '0';
        this.glow.style.opacity = '0';
      });

      this.animate();
    }
  }

  animate() {
    this.pos.x += (this.target.x - this.pos.x) * 0.15;
    this.pos.y += (this.target.y - this.pos.y) * 0.15;

    this.trail.style.left = this.pos.x + 'px';
    this.trail.style.top = this.pos.y + 'px';

    this.glow.style.left = this.target.x + 'px';
    this.glow.style.top = this.target.y + 'px';

    requestAnimationFrame(() => this.animate());
  }
}

// ---- Typing Animation ----
class TypeWriter {
  constructor(element, words, speed = 100, pause = 2000) {
    this.element = element;
    this.words = words;
    this.speed = speed;
    this.pause = pause;
    this.wordIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;

    if (this.element) this.type();
  }

  type() {
    const current = this.words[this.wordIndex];

    if (this.isDeleting) {
      this.charIndex--;
    } else {
      this.charIndex++;
    }

    this.element.textContent = current.substring(0, this.charIndex);

    let delay = this.isDeleting ? this.speed / 2 : this.speed;

    if (!this.isDeleting && this.charIndex === current.length) {
      delay = this.pause;
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.wordIndex = (this.wordIndex + 1) % this.words.length;
      delay = 400;
    }

    setTimeout(() => this.type(), delay);
  }
}

// ---- Page Transition ----
class PageTransition {
  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'page-transition-overlay';
    // Start visible so page fades IN
    this.overlay.style.opacity = '1';
    this.overlay.style.pointerEvents = 'all';
    document.body.appendChild(this.overlay);

    // Fade in (hide overlay) after a short delay
    requestAnimationFrame(() => {
      setTimeout(() => {
        this.overlay.style.opacity = '0';
        this.overlay.style.pointerEvents = 'none';
      }, 100);
    });

    // Intercept link clicks
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      // Only intercept internal links (not external, not anchors, not mailto)
      if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto') &&
          href.endsWith('.html') && !link.getAttribute('target')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.navigateTo(href);
        });
      }
    });
  }

  navigateTo(url) {
    this.overlay.style.opacity = '1';
    this.overlay.style.pointerEvents = 'all';
    setTimeout(() => {
      window.location.href = url;
    }, 400);
  }
}

// ---- Initialize Everything ----
document.addEventListener('DOMContentLoaded', () => {
  // Particles
  const canvas = document.getElementById('particleCanvas');
  if (canvas) {
    new ParticleNetwork(canvas);
  }

  // Cursor Trail (desktop only)
  if (window.innerWidth > 768) {
    new CursorTrail();
  }

  // Typing Animation
  const typingEl = document.getElementById('typing-role');
  if (typingEl) {
    new TypeWriter(typingEl, [
      'Developer',
      'Student',
      'Problem Solver',
      'Tech Enthusiast',
      'Code Learner'
    ], 80, 2000);
  }

  // Page Transitions
  new PageTransition();
});
