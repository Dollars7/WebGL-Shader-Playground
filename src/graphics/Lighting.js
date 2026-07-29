/**
 * Lighting properties management
 */
export class Lighting {
  constructor() {
    this.ambient = [0.4, 0.4, 0.4, 1.0];
    this.diffuse = [1.0, 1.0, 1.0, 1.0];
    this.specular = [1.0, 1.0, 1.0, 1.0];

    this.position = [3.0, 4.0, 4.0, 1.0];
    this.intensity = 1.0;
    // Kept low by default: a strong ambient term flattens the shading and makes
    // the Intensity slider look like it isn't doing anything.
    this.ambientLevel = 0.25;

    this.isEyeTracking = false;
  }

  setPosition(x, y, z) {
    this.position = [x, y, z, 1.0];
  }

  setIntensity(value) {
    this.intensity = Math.max(0, Math.min(2, value));
  }

  setAmbientLevel(value) {
    this.ambientLevel = Math.max(0, Math.min(1, value));
  }

  updateEyePosition(eye) {
    if (this.isEyeTracking) {
      this.position = [eye[0], eye[1], eye[2], 1.0];
    }
  }

  getAmbientProduct(materialAmbient) {
    const a = this.ambientLevel;
    return [
      this.ambient[0] * a * materialAmbient[0],
      this.ambient[1] * a * materialAmbient[1],
      this.ambient[2] * a * materialAmbient[2],
      1.0,
    ];
  }

  getDiffuseProduct(materialDiffuse) {
    const i = this.intensity;
    return [
      this.diffuse[0] * i * materialDiffuse[0],
      this.diffuse[1] * i * materialDiffuse[1],
      this.diffuse[2] * i * materialDiffuse[2],
      1.0,
    ];
  }

  getSpecularProduct(materialSpecular) {
    const i = this.intensity;
    return [
      this.specular[0] * i * materialSpecular[0],
      this.specular[1] * i * materialSpecular[1],
      this.specular[2] * i * materialSpecular[2],
      1.0,
    ];
  }
}
