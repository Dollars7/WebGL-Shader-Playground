/**
 * Shader compilation and management
 */

// Shader sources are inlined at build time rather than fetched at runtime.
// Fetching would 404 in production — Vite only emits files that something
// imports — and this additionally turns a missing shader into a build error
// instead of a runtime one, and costs the deployed page zero extra requests.
const SHADER_SOURCES = import.meta.glob('../shaders/**/*.{vert,frag,glsl}', {
  query: '?raw',
  import: 'default',
  eager: true,
});

export class ShaderManager {
  constructor(glContext) {
    this.glContext = glContext;
    this.gl = glContext.gl;
    this.programs = {};
    this.currentProgram = null;
    this.shaders = [
      { name: 'phong', id: -1 },
      { name: 'normal', id: 0 },
      { name: 'clay', id: 1 },
      { name: 'ceramic', id: 2 },
      { name: 'pearl', id: 3 },
      { name: 'chrome', id: 4 },
      { name: 'fresnel', id: 5 },
      { name: 'toon', id: 6 },
      { name: 'hologram', id: 7 },
    ];
  }

  loadAllShaders() {
    console.log('[ShaderManager] Loading all shaders...');

    // Every preset shares one vertex shader; only the fragment stage differs.
    this.vertexSource = this.fetchSource('common.vert');

    for (const shader of this.shaders) {
      try {
        this.loadShader(shader.name);
      } catch (err) {
        console.error(`[ShaderError] Failed to load ${shader.name}:`, err.message);
        throw err;
      }
    }

    // The skybox is the one program with its own vertex stage.
    this.loadProgram('skybox', 'skybox.vert', 'skybox.frag');

    // Set default shader
    this.useShader('phong');
    console.log('[ShaderManager] All shaders loaded');
  }

  /** Compile a program from an explicit vertex/fragment pair. */
  loadProgram(name, vertPath, fragPath) {
    const vertSrc = this.fetchSource(vertPath);
    const fragSrc = this.fetchSource(fragPath);

    const program = this.compileProgram(vertSrc, fragSrc, name);
    if (!program) {
      throw new Error(`Failed to compile shader: ${name}`);
    }

    this.programs[name] = program;
    console.log(`[Shader] Loaded: ${name}`);
    return program;
  }

  /**
   * Look up a GLSL source by its path relative to `src/shaders/`,
   * e.g. 'phong.frag' or 'lib/tonemap.glsl'.
   */
  fetchSource(path, seen = new Set()) {
    const key = `../shaders/${path}`;
    const src = SHADER_SOURCES[key];

    if (src === undefined) {
      const available = Object.keys(SHADER_SOURCES)
        .map((k) => k.replace('../shaders/', ''))
        .join(', ');
      throw new Error(`Shader not found: ${path} (have: ${available})`);
    }

    return this.resolveIncludes(src, path, seen);
  }

  /**
   * GLSL ES 1.0 has no preprocessor include, so shared helpers get inlined here:
   *
   *   #include "lib/tonemap.glsl"
   *
   * Paths resolve relative to the including file. Each file is inlined at most
   * once per program, which both prevents redefinition errors and terminates
   * any accidental include cycle.
   */
  resolveIncludes(src, fromPath, seen) {
    const dir = fromPath.slice(0, fromPath.lastIndexOf('/') + 1);
    const pattern = /^[ \t]*#include[ \t]+"([^"]+)"[ \t]*$/gm;

    return src.replace(pattern, (_line, includePath) => {
      const path = dir + includePath;
      if (seen.has(path)) return '';
      seen.add(path);
      return this.fetchSource(path, seen);
    });
  }

  loadShader(name) {
    const fragSrc = this.fetchSource(`${name}.frag`);

    const program = this.compileProgram(this.vertexSource, fragSrc, name);
    if (!program) {
      throw new Error(`Failed to compile shader: ${name}`);
    }

    this.programs[name] = program;
    console.log(`[Shader] Loaded: ${name}`);
    return program;
  }

  compileProgram(vertSrc, fragSrc, name) {
    const vert = this.compileShader(vertSrc, this.gl.VERTEX_SHADER, `${name}.vert`);
    const frag = this.compileShader(fragSrc, this.gl.FRAGMENT_SHADER, `${name}.frag`);

    if (!vert || !frag) return null;

    const program = this.gl.createProgram();
    this.gl.attachShader(program, vert);
    this.gl.attachShader(program, frag);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const error = this.gl.getProgramInfoLog(program);
      console.error(`[Link Error] ${name}:`, error);
      this.showErrorUI(error);
      return null;
    }

    return program;
  }

  compileShader(src, type, name) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, src);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const error = this.gl.getShaderInfoLog(shader);
      console.error(`[Compile Error] ${name}:`, error);
      this.showErrorUI(error);
      return null;
    }

    return shader;
  }

  useShader(name) {
    if (!this.programs[name]) {
      console.error(`[ShaderManager] Shader not found: ${name}`);
      return;
    }

    this.gl.useProgram(this.programs[name]);
    this.currentProgram = this.programs[name];
  }

  getUniformLocation(name, uniformName) {
    const program = this.programs[name];
    if (!program) {
      console.error(`[ShaderManager] Shader not found: ${name}`);
      return null;
    }
    return this.gl.getUniformLocation(program, uniformName);
  }

  setUniform1f(uniformName, value) {
    const loc = this.gl.getUniformLocation(this.currentProgram, uniformName);
    if (loc !== null) {
      this.gl.uniform1f(loc, value);
    }
  }

  setUniform1i(uniformName, value) {
    const loc = this.gl.getUniformLocation(this.currentProgram, uniformName);
    if (loc !== null) {
      this.gl.uniform1i(loc, value);
    }
  }

  setUniform3fv(uniformName, value) {
    const loc = this.gl.getUniformLocation(this.currentProgram, uniformName);
    if (loc !== null) {
      this.gl.uniform3fv(loc, value);
    }
  }

  setUniform4fv(uniformName, value) {
    const loc = this.gl.getUniformLocation(this.currentProgram, uniformName);
    if (loc !== null) {
      this.gl.uniform4fv(loc, value);
    }
  }

  setUniformMatrix4fv(uniformName, value) {
    const loc = this.gl.getUniformLocation(this.currentProgram, uniformName);
    if (loc !== null) {
      this.gl.uniformMatrix4fv(loc, false, value);
    }
  }

  showErrorUI(errorMessage) {
    const overlay = document.getElementById('error-overlay');
    const msgEl = document.getElementById('error-message');
    if (overlay && msgEl) {
      msgEl.textContent = errorMessage;
      overlay.style.display = 'flex';
    }
  }
}
