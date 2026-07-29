/**
 * Cubemap environment background.
 *
 * Drawn as a fullscreen quad after the scene: each pixel reconstructs its view
 * direction from clip space, so no actual cube geometry is needed and the
 * background never clips against the model.
 */
import * as mat4 from './mat4.js';

const FACES = [
  { file: 'posx.png', target: 'TEXTURE_CUBE_MAP_POSITIVE_X' },
  { file: 'negx.png', target: 'TEXTURE_CUBE_MAP_NEGATIVE_X' },
  { file: 'posy.png', target: 'TEXTURE_CUBE_MAP_POSITIVE_Y' },
  { file: 'negy.png', target: 'TEXTURE_CUBE_MAP_NEGATIVE_Y' },
  { file: 'posz.png', target: 'TEXTURE_CUBE_MAP_POSITIVE_Z' },
  { file: 'negz.png', target: 'TEXTURE_CUBE_MAP_NEGATIVE_Z' },
];

export class Skybox {
  constructor(glContext, shaderManager) {
    this.glContext = glContext;
    this.gl = glContext.gl;
    this.shaderManager = shaderManager;

    this.texture = null;
    this.quadBuffer = null;
    this.ready = false;
    this.enabled = true;
  }

  async init(basePath = 'skybox') {
    const gl = this.gl;

    this.createQuad();

    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);

    // Fill every face with a placeholder so the cubemap is renderable before
    // the images arrive — sampling an incomplete cubemap is undefined.
    for (const face of FACES) {
      gl.texImage2D(
        gl[face.target], 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([200, 200, 200, 255])
      );
    }
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const images = await Promise.all(
      FACES.map((face) => this.loadImage(`${basePath}/${face.file}`))
    );

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
    FACES.forEach((face, i) => {
      gl.texImage2D(gl[face.target], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[i]);
    });
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    this.ready = true;
    console.log('[Skybox] Cubemap ready');
  }

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Failed to load ${src}`));
      image.src = src;
    });
  }

  createQuad() {
    const gl = this.gl;
    this.quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
  }

  /**
   * @param {number[]} viewMatrix  camera view matrix (translation is stripped
   *                               here so the background sits at infinity)
   * @param {number[]} projMatrix  active projection matrix
   */
  render(viewMatrix, projMatrix) {
    if (!this.ready || !this.enabled) return;

    const gl = this.gl;
    const program = this.shaderManager.programs.skybox;
    if (!program) return;

    const rotationOnly = viewMatrix.slice();
    rotationOnly[12] = 0;
    rotationOnly[13] = 0;
    rotationOnly[14] = 0;

    const inverseVP = mat4.inverse(mat4.multiply(projMatrix, rotationOnly));

    gl.useProgram(program);

    const posLoc = gl.getAttribLocation(program, 'aClipPosition');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(posLoc);

    gl.uniformMatrix4fv(
      gl.getUniformLocation(program, 'uViewDirectionProjectionInverse'),
      false,
      inverseVP
    );

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
    gl.uniform1i(gl.getUniformLocation(program, 'uSkybox'), 0);

    // Depth is 1.0 for every skybox pixel, so LEQUAL lets it fill only the
    // untouched background while the model (already drawn) wins everywhere else.
    gl.depthFunc(gl.LEQUAL);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.depthFunc(gl.LESS);
  }
}
