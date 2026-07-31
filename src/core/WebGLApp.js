/**
 * Main WebGL application class
 */
import { WebGLContext } from './WebGLContext.js';
import { ShaderManager } from './ShaderManager.js';
import { GeometryBuffer } from './GeometryBuffer.js';
import { Camera } from '../graphics/Camera.js';
import { Material } from '../graphics/Material.js';
import { Lighting } from '../graphics/Lighting.js';
import { Skybox } from '../graphics/Skybox.js';
import { BouncePhysics } from '../graphics/BouncePhysics.js';
import * as mat4 from '../graphics/mat4.js';
import { Geometry } from '../geometry/Geometry.js';
import dropSoundUrl from '../assets/bass-drop.mp3';

// Distance from each model's centre down to its lowest point, used to rest it
// on the platform instead of burying it.
const MODEL_HALF_HEIGHTS = {
  torus: 0.7, // outer radius R + tube radius r
  vase: 0.25, // profile height / 2
  sphere: 1.0,
};

const PLATFORM = { width: 4.0, height: 0.15, depth: 4.0, centreY: -0.725 };

export class WebGLApp {
  constructor(canvasId) {
    console.log('[App] Initializing WebGL Shader Playground...');

    this.glContext = new WebGLContext(canvasId);
    this.shaderManager = new ShaderManager(this.glContext);
    this.geometry = new GeometryBuffer(this.glContext);
    this.platform = new GeometryBuffer(this.glContext);

    this.camera = new Camera();
    this.material = new Material();
    this.lighting = new Lighting();
    this.skybox = new Skybox(this.glContext, this.shaderManager);

    this.physics = new BouncePhysics();
    this.physics.groundY = PLATFORM.centreY + PLATFORM.height / 2;
    this.physics.onSettled = () => this.stopAnimation();

    this.currentShaderIndex = -1;
    this.currentGeometry = 'torus';
    this.autoRotationSpeed = 0;

    this.projectionMode = 0; // 0: ortho, 1: perspective
    this.startTime = performance.now();
    this.lastFrameTime = this.startTime;

    const audio = document.getElementById('dropSound');
    if (audio) audio.src = dropSoundUrl;

    console.log('[App] Initialization complete');
  }

  async init() {
    console.log('[App] Loading resources...');

    try {
      this.shaderManager.loadAllShaders();

      const box = Geometry.generateBox(PLATFORM.width, PLATFORM.height, PLATFORM.depth);
      this.platform.setData(box.positions, box.normals, box.texCoords, box.indices);

      this.loadGeometry('torus');

      // Non-blocking: the scene renders immediately and the background fills
      // in once the six cubemap faces have downloaded.
      this.skybox.init().catch((err) => {
        console.warn('[App] Skybox unavailable:', err.message);
      });

      console.log('[App] Ready');
      return true;
    } catch (err) {
      console.error('[App] Initialization failed:', err);
      this.shaderManager.showErrorUI(`Startup failed: ${err.message}`);
      return false;
    }
  }

  loadGeometry(type) {
    let geo;

    switch (type) {
      case 'torus':
        geo = Geometry.generateTorus(0.4, 0.3, 180, 180);
        break;
      case 'vase':
        geo = Geometry.generateVase(0.5, 0.5, 120);
        break;
      case 'sphere':
        geo = Geometry.generateSphere(1.0, 180, 180);
        break;
      default:
        geo = Geometry.generateTorus(0.4, 0.3, 180, 180);
    }

    this.geometry.setData(geo.positions, geo.normals, geo.texCoords, geo.indices);
    this.currentGeometry = type;

    // A new model has a different footprint, so the in-flight drop is no
    // longer valid — park it back at the start height.
    this.physics.objectHalfHeight = MODEL_HALF_HEIGHTS[type] ?? 0.7;
    this.physics.reset();
    this.syncAnimationButton();

    console.log(`[App] Loaded geometry: ${type}`);
  }

  setShader(index) {
    const shaderMap = {
      '-1': 'phong',
      '0': 'normal',
      '1': 'clay',
      '2': 'ceramic',
      '3': 'pearl',
      '4': 'chrome',
      '5': 'fresnel',
      '6': 'toon',
      '7': 'hologram',
    };

    const shaderName = shaderMap[index.toString()];
    if (shaderName) {
      this.shaderManager.useShader(shaderName);
      this.currentShaderIndex = index;
    }
  }

  setProjection(mode) {
    this.projectionMode = mode;
    document.getElementById('orthBtn').classList.toggle('active', mode === 0);
    document.getElementById('perspBtn').classList.toggle('active', mode === 1);
  }

  toggleAnimation() {
    if (this.physics.running) {
      this.stopAnimation();
    } else {
      this.startAnimation();
    }
  }

  startAnimation() {
    this.physics.start();
    this.syncAnimationButton();

    const audio = document.getElementById('dropSound');
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch((e) => console.log('Audio play failed:', e));
    }
  }

  stopAnimation() {
    this.physics.stop();
    this.syncAnimationButton();

    const audio = document.getElementById('dropSound');
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  syncAnimationButton() {
    const btn = document.getElementById('animPlayBtn');
    if (!btn) return;

    btn.classList.toggle('active', this.physics.running);
    btn.textContent = this.physics.running ? 'Stop Animation' : 'Play Animation';
  }

  render = () => {
    const now = performance.now();
    const frameTime = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;

    this.glContext.resizeToDisplaySize();
    this.glContext.clear();

    this.physics.update(frameTime);

    // Update camera rotation
    if (this.autoRotationSpeed > 0) {
      this.camera.theta += this.autoRotationSpeed * 0.01;
    }

    // Get matrices
    const eye = this.camera.getEye();
    const aspect = this.glContext.getAspect();

    const mvMatrix = this.camera.getViewMatrix();
    const orthoHeight = 2.0;
    const projMatrix = this.projectionMode === 0
      ? mat4.ortho(-orthoHeight * aspect, orthoHeight * aspect, -orthoHeight, orthoHeight, 0.1, 100)
      : this.camera.getProjMatrix(aspect);

    // Update lighting
    if (this.lighting.isEyeTracking) {
      this.lighting.updateEyePosition(eye);
    }

    // Get material products
    const ambientProduct = this.lighting.getAmbientProduct(this.material.ambient);
    const diffuseProduct = this.lighting.getDiffuseProduct(this.material.diffuse);
    const specularProduct = this.lighting.getSpecularProduct(this.material.specular);

    // The skybox pass leaves its own program bound, so re-select the preset's.
    this.glContext.gl.useProgram(this.shaderManager.currentProgram);

    // Set uniforms
    this.shaderManager.setUniformMatrix4fv('modelViewMatrix', mvMatrix);
    this.shaderManager.setUniformMatrix4fv('projectionMatrix', projMatrix);
    this.shaderManager.setUniform4fv('ambientProduct', ambientProduct);
    this.shaderManager.setUniform4fv('diffuseProduct', diffuseProduct);
    this.shaderManager.setUniform4fv('specularProduct', specularProduct);
    this.shaderManager.setUniform4fv('lightPosition', this.lighting.position);
    this.shaderManager.setUniform1f('shininess', this.material.shininess);
    this.shaderManager.setUniform1f('uTime', (now - this.startTime) / 1000);

    // Platform: neutral grey so it reads as a separate surface, and its
    // vertices already carry world position so the drop offset stays at zero.
    this.shaderManager.setUniform4fv('ambientProduct', this.lighting.getAmbientProduct([0.35, 0.35, 0.38, 1]));
    this.shaderManager.setUniform4fv('diffuseProduct', this.lighting.getDiffuseProduct([0.45, 0.45, 0.48, 1]));
    this.shaderManager.setUniform4fv('specularProduct', this.lighting.getSpecularProduct([0.2, 0.2, 0.2, 1]));
    this.setModelOffset(0, PLATFORM.centreY, 0);

    this.platform.bindBuffers(this.shaderManager.currentProgram);
    this.platform.draw();

    // Model: restore its own material and apply the current drop height.
    this.shaderManager.setUniform4fv('ambientProduct', ambientProduct);
    this.shaderManager.setUniform4fv('diffuseProduct', diffuseProduct);
    this.shaderManager.setUniform4fv('specularProduct', specularProduct);
    this.setModelOffset(...this.physics.position);

    this.geometry.bindBuffers(this.shaderManager.currentProgram);
    this.geometry.draw();

    // Background last: it only fills pixels the model didn't claim, which
    // avoids shading the whole screen and then painting over it.
    this.skybox.render(mvMatrix, projMatrix);

    if (this.onFrame) this.onFrame();

    requestAnimationFrame(this.render);
  };

  /** World-space translation applied to the next draw by the vertex shader. */
  setModelOffset(x, y, z) {
    this.shaderManager.setUniform1f('transX', x);
    this.shaderManager.setUniform1f('transY', y);
    this.shaderManager.setUniform1f('transZ', z);
  }

  start() {
    console.log('[App] Starting render loop...');
    this.render();
  }
}
