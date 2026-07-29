/**
 * Shader compilation and management
 */
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

  async loadAllShaders() {
    console.log('[ShaderManager] Loading all shaders...');

    // Every preset shares one vertex shader; only the fragment stage differs.
    this.vertexSource = await this.fetchSource('shaders/common.vert');

    for (const shader of this.shaders) {
      try {
        await this.loadShader(shader.name);
      } catch (err) {
        console.error(`[ShaderError] Failed to load ${shader.name}:`, err.message);
        throw err;
      }
    }

    // The skybox is the one program with its own vertex stage.
    await this.loadProgram('skybox', 'shaders/skybox.vert', 'shaders/skybox.frag');

    // Set default shader
    this.useShader('phong');
    console.log('[ShaderManager] All shaders loaded');
  }

  /** Compile a program from an explicit vertex/fragment pair. */
  async loadProgram(name, vertPath, fragPath) {
    const [vertSrc, fragSrc] = await Promise.all([
      this.fetchSource(vertPath),
      this.fetchSource(fragPath),
    ]);

    const program = this.compileProgram(vertSrc, fragSrc, name);
    if (!program) {
      throw new Error(`Failed to compile shader: ${name}`);
    }

    this.programs[name] = program;
    console.log(`[Shader] Loaded: ${name}`);
    return program;
  }

  /**
   * Fetch a GLSL source file. The dev server answers unknown paths with the
   * SPA fallback HTML, so a missing shader would otherwise reach the compiler
   * as markup and produce a baffling syntax error.
   */
  async fetchSource(path, seen = new Set()) {
    const res = await fetch(path);
    if (!res.ok) {
      throw new Error(`${path} → HTTP ${res.status}`);
    }

    const src = await res.text();
    if (src.trimStart().startsWith('<')) {
      throw new Error(`${path} returned HTML, not GLSL (file missing?)`);
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
  async resolveIncludes(src, fromPath, seen) {
    const dir = fromPath.slice(0, fromPath.lastIndexOf('/') + 1);
    const pattern = /^[ \t]*#include[ \t]+"([^"]+)"[ \t]*$/gm;

    const directives = [...src.matchAll(pattern)];
    if (directives.length === 0) return src;

    const resolved = await Promise.all(
      directives.map(async (match) => {
        const path = dir + match[1];
        if (seen.has(path)) return '';
        seen.add(path);
        return this.fetchSource(path, seen);
      })
    );

    let i = 0;
    return src.replace(pattern, () => resolved[i++]);
  }

  async loadShader(name) {
    const fragSrc = await this.fetchSource(`shaders/${name}.frag`);

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
