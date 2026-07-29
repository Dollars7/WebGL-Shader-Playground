/**
 * Material properties management
 */
export class Material {
  constructor() {
    this.ambient = [0.3, 0.3, 0.0, 1.0];
    this.diffuse = [1.0, 0.8, 0.0, 1.0];
    this.specular = [1.0, 1.0, 0.8, 1.0];
    this.shininess = 100.0;
  }

  setGold() {
    this.ambient = [0.3, 0.3, 0.0, 1.0];
    this.diffuse = [1.0, 0.8, 0.0, 1.0];
    this.specular = [1.0, 1.0, 0.8, 1.0];
    this.shininess = 100.0;
  }

  setRed() {
    this.ambient = [0.3, 0.0, 0.0, 1.0];
    this.diffuse = [0.8, 0.1, 0.1, 1.0];
    this.specular = [0.8, 0.5, 0.5, 1.0];
    this.shininess = 40.0;
  }

  setSteel() {
    this.ambient = [0.25, 0.25, 0.25, 1.0];
    this.diffuse = [0.4, 0.4, 0.4, 1.0];
    this.specular = [0.9, 0.9, 0.95, 1.0];
    this.shininess = 80.0;
  }

  setCopper() {
    this.ambient = [0.3, 0.1, 0.0, 1.0];
    this.diffuse = [0.8, 0.3, 0.1, 1.0];
    this.specular = [0.9, 0.6, 0.3, 1.0];
    this.shininess = 60.0;
  }

  setShininess(value) {
    this.shininess = Math.max(1, Math.min(200, value));
  }

  clone() {
    const m = new Material();
    m.ambient = [...this.ambient];
    m.diffuse = [...this.diffuse];
    m.specular = [...this.specular];
    m.shininess = this.shininess;
    return m;
  }
}
