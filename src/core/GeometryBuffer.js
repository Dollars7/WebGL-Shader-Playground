/**
 * Vertex buffer and index buffer management
 */
export class GeometryBuffer {
  constructor(glContext) {
    this.glContext = glContext;
    this.gl = glContext.gl;

    this.positionBuffer = null;
    this.normalBuffer = null;
    this.texCoordBuffer = null;
    this.indexBuffer = null;

    this.vertexCount = 0;
    this.indexCount = 0;
  }

  setData(positions, normals, texCoords, indices) {
    this.positions = positions;
    this.normals = normals;
    this.texCoords = texCoords;
    this.indices = indices;

    this.indexCount = indices.length;
    this.vertexCount = positions.length / 3;

    this.dispose();
    this.createBuffers();
  }

  /** Release the previous mesh's buffers so switching geometry doesn't leak. */
  dispose() {
    const gl = this.gl;
    for (const buffer of [
      this.positionBuffer,
      this.normalBuffer,
      this.texCoordBuffer,
      this.indexBuffer,
    ]) {
      if (buffer) gl.deleteBuffer(buffer);
    }
    this.positionBuffer = null;
    this.normalBuffer = null;
    this.texCoordBuffer = null;
    this.indexBuffer = null;
  }

  createBuffers() {
    const gl = this.gl;

    // Position buffer
    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.STATIC_DRAW);

    // Normal buffer
    this.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);

    // TexCoord buffer
    this.texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texCoords), gl.STATIC_DRAW);

    // Index buffer
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
  }

  /**
   * Attribute locations are per-program, and the active program changes every
   * time the user picks another preset, so the pointers are re-bound per draw
   * rather than baked into a VAO.
   */
  bindBuffers(program) {
    const gl = this.gl;

    // Bind positions
    const posLoc = gl.getAttribLocation(program, 'vPosition');
    if (posLoc >= 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(posLoc);
    }

    // Bind normals
    const normLoc = gl.getAttribLocation(program, 'vNormal');
    if (normLoc >= 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
      gl.vertexAttribPointer(normLoc, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(normLoc);
    }

    // Bind texCoords
    const texLoc = gl.getAttribLocation(program, 'a_TexCoord');
    if (texLoc >= 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
      gl.vertexAttribPointer(texLoc, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(texLoc);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  }

  draw() {
    this.gl.drawElements(this.gl.TRIANGLES, this.indexCount, this.gl.UNSIGNED_SHORT, 0);
  }

  getStats() {
    return {
      vertices: this.vertexCount,
      indices: this.indexCount,
      triangles: this.indexCount / 3,
    };
  }
}
