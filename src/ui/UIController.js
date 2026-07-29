/**
 * UI event handlers and state management
 */
export class UIController {
  constructor(app) {
    this.app = app;
    this.setupEventListeners();
    this.fpsCounter = { frame: 0, lastTime: Date.now(), fps: 0 };
  }

  setupEventListeners() {
    // Projection buttons
    document.getElementById('orthBtn').addEventListener('click', () => this.app.setProjection(0));
    document.getElementById('perspBtn').addEventListener('click', () => this.app.setProjection(1));

    // Camera reset
    document.getElementById('resetCameraBtn').addEventListener('click', () => this.app.camera.reset());

    // Light position
    document.getElementById('lightPosFixedBtn').addEventListener('click', () => {
      this.app.lighting.isEyeTracking = false;
      this.app.lighting.setPosition(3, 4, 4);
      document.getElementById('lightPosFixedBtn').classList.add('active');
      document.getElementById('lightPosEyeBtn').classList.remove('active');
    });

    document.getElementById('lightPosEyeBtn').addEventListener('click', () => {
      this.app.lighting.isEyeTracking = true;
      document.getElementById('lightPosFixedBtn').classList.remove('active');
      document.getElementById('lightPosEyeBtn').classList.add('active');
    });

    // Lighting sliders
    document.getElementById('intensitySlider').addEventListener('input', (e) => {
      const val = parseInt(e.target.value) / 100;
      this.app.lighting.setIntensity(val);
      document.getElementById('intensityValue').textContent = val.toFixed(2);
    });

    document.getElementById('ambientSlider').addEventListener('input', (e) => {
      const val = parseInt(e.target.value) / 100;
      this.app.lighting.setAmbientLevel(val);
      document.getElementById('ambientValue').textContent = val.toFixed(2);
    });

    // Shader buttons
    document.querySelectorAll('.shader-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const shaderId = parseInt(e.target.dataset.shader);
        this.app.setShader(shaderId);

        document.querySelectorAll('.shader-btn').forEach((b) => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });

    // Color presets
    document.getElementById('colorGoldBtn').addEventListener('click', () => {
      this.app.material.setGold();
    });
    document.getElementById('colorRedBtn').addEventListener('click', () => {
      this.app.material.setRed();
    });
    document.getElementById('colorSteelBtn').addEventListener('click', () => {
      this.app.material.setSteel();
    });
    document.getElementById('colorCopperBtn').addEventListener('click', () => {
      this.app.material.setCopper();
    });

    // Shininess slider
    document.getElementById('shininessSlider').addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      this.app.material.setShininess(val);
      document.getElementById('shininessValue').textContent = val;
    });

    // Geometry buttons
    document.getElementById('geomTorusBtn').addEventListener('click', () => {
      this.app.loadGeometry('torus');
      this.updateGeometryButtons('torus');
    });
    document.getElementById('geomVaseBtn').addEventListener('click', () => {
      this.app.loadGeometry('vase');
      this.updateGeometryButtons('vase');
    });
    document.getElementById('geomSphereBtn').addEventListener('click', () => {
      this.app.loadGeometry('sphere');
      this.updateGeometryButtons('sphere');
    });

    // Animation
    document.getElementById('animPlayBtn').addEventListener('click', () => {
      this.app.toggleAnimation();
    });

    // Auto rotate slider
    document.getElementById('rotationSlider').addEventListener('input', (e) => {
      const val = parseInt(e.target.value) / 100;
      this.app.autoRotationSpeed = val;
      document.getElementById('rotationValue').textContent = val.toFixed(2);
    });

    // Mouse controls on canvas
    this.setupMouseControls();
  }

  setupMouseControls() {
    const canvas = document.getElementById('gl-canvas');
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - prevX;
      const deltaY = e.clientY - prevY;

      this.app.camera.rotate(-deltaX * 0.01, -deltaY * 0.01);

      prevX = e.clientX;
      prevY = e.clientY;
    });

    canvas.addEventListener('mouseup', () => {
      isDragging = false;
    });

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.3 : -0.3;
      this.app.camera.zoom(delta);
    });
  }

  updateGeometryButtons(active) {
    document.getElementById('geomTorusBtn').classList.toggle('active', active === 'torus');
    document.getElementById('geomVaseBtn').classList.toggle('active', active === 'vase');
    document.getElementById('geomSphereBtn').classList.toggle('active', active === 'sphere');
  }

  /** Call once per rendered frame — counting on a timer measures the timer. */
  tickFrame() {
    this.fpsCounter.frame++;
  }

  updateFPS() {
    const now = Date.now();
    if (now - this.fpsCounter.lastTime >= 1000) {
      this.fpsCounter.fps = this.fpsCounter.frame;
      this.fpsCounter.frame = 0;
      this.fpsCounter.lastTime = now;
      document.getElementById('fpsDisplay').textContent = `FPS: ${this.fpsCounter.fps}`;
    }
  }

  updateStats() {
    const stats = this.app.geometry.getStats();
    document.getElementById('statsDisplay').textContent = `Vertices: ${stats.vertices}`;
  }

  updateShaderDisplay() {
    const shaderNames = {
      '-1': 'Phong',
      '0': 'Normal',
      '1': 'Clay',
      '2': 'Ceramic',
      '3': 'Pearl',
      '4': 'Chrome',
      '5': 'Fresnel',
      '6': 'Toon',
      '7': 'Hologram',
    };

    document.getElementById('shaderDisplay').textContent = `Shader: ${shaderNames[this.app.currentShaderIndex.toString()] || 'Unknown'}`;
  }
}
