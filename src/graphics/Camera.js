/**
 * Spherical camera controller
 */
import * as mat4 from './mat4.js';

export class Camera {
  constructor() {
    this.radius = 3.0;
    this.theta = 0;
    this.phi = Math.PI / 4;

    this.at = [0, 0, 0];
    this.up = [0, 1, 0];

    // Constraints
    this.minRadius = 1.0;
    this.maxRadius = 10.0;
    // Never reach the poles: there the view direction becomes parallel to `up`
    // and lookAt() degenerates.
    this.minPhi = 0.1;
    this.maxPhi = Math.PI - 0.1;
  }

  getEye() {
    return [
      this.radius * Math.sin(this.phi) * Math.cos(this.theta),
      this.radius * Math.cos(this.phi),
      this.radius * Math.sin(this.phi) * Math.sin(this.theta),
    ];
  }

  rotate(deltaTheta, deltaPhi) {
    this.theta += deltaTheta;
    this.phi = Math.max(this.minPhi, Math.min(this.maxPhi, this.phi + deltaPhi));
  }

  zoom(delta) {
    this.radius = Math.max(this.minRadius, Math.min(this.maxRadius, this.radius + delta));
  }

  reset() {
    this.radius = 3.0;
    this.theta = 0;
    this.phi = Math.PI / 4;
  }

  getViewMatrix() {
    return mat4.lookAt(this.getEye(), this.at, this.up);
  }

  getProjMatrix(aspect, fov = 45) {
    return mat4.perspective(fov, aspect, 0.1, 100);
  }
}
