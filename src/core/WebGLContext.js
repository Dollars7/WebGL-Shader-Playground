/**
 * WebGL context management and state
 */
export class WebGLContext {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas element with id "${canvasId}" not found`);
    }

    this.gl = this.setupWebGL();
    if (!this.gl) {
      throw new Error('WebGL context not available');
    }

    this.setupDefaultState();
    this.resizeToDisplaySize();
    window.addEventListener('resize', () => this.resizeToDisplaySize());
  }

  setupWebGL() {
    const gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');

    if (!gl) {
      console.error('WebGL not supported');
      return null;
    }

    gl.clearColor(0.95, 0.95, 0.95, 1.0);
    gl.enable(gl.DEPTH_TEST);

    console.log(`[WebGL] Context initialized (${this.isWebGL2(gl) ? 'WebGL 2.0' : 'WebGL 1.0'})`);
    return gl;
  }

  setupDefaultState() {
    const gl = this.gl;
    gl.depthFunc(gl.LESS);
    // Back-face culling stays off: the generated meshes don't guarantee a
    // consistent triangle winding, so culling would punch holes in them.
    gl.disable(gl.CULL_FACE);
  }

  /**
   * Match the drawing buffer to the CSS box. Without this the buffer keeps the
   * default 300x150 and the canvas renders as a stretched, blurry thumbnail.
   */
  resizeToDisplaySize() {
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.floor(this.canvas.clientWidth * dpr));
    const height = Math.max(1, Math.floor(this.canvas.clientHeight * dpr));

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.setViewport(width, height);
    }
  }

  setViewport(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);
  }

  getAspect() {
    return this.canvas.clientWidth / Math.max(1, this.canvas.clientHeight);
  }

  clear() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  getError() {
    const gl = this.gl;
    const err = gl.getError();
    if (err !== gl.NO_ERROR) {
      console.error(`[WebGL Error] ${this.getErrorName(err)}`);
      return err;
    }
    return null;
  }

  getErrorName(code) {
    const errors = {
      0: 'NO_ERROR',
      1280: 'INVALID_ENUM',
      1281: 'INVALID_VALUE',
      1282: 'INVALID_OPERATION',
      1285: 'OUT_OF_MEMORY',
      1286: 'INVALID_FRAMEBUFFER_OPERATION',
    };
    return errors[code] || `UNKNOWN (${code})`;
  }

  isWebGL2(gl = this.gl) {
    return typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
  }
}
