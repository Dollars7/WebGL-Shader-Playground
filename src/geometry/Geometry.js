/**
 * Geometry generation utilities
 */

export class Geometry {
  static generateTorus(R, r, usteps, vsteps) {
    const positions = [];
    const normals = [];
    const texCoords = [];
    const indices = [];

    // Generate vertices
    for (let v = 0; v < vsteps; v++) {
      for (let u = 0; u < usteps; u++) {
        const a = (2 * Math.PI * u) / usteps;
        const b = (2 * Math.PI * v) / vsteps;

        const x = (R + r * Math.cos(b)) * Math.cos(a);
        const y = (R + r * Math.cos(b)) * Math.sin(a);
        const z = r * Math.sin(b);

        const nx = Math.cos(a) * Math.cos(b);
        const ny = Math.sin(a) * Math.cos(b);
        const nz = Math.sin(b);

        positions.push(x, y, z);
        normals.push(nx, ny, nz);
        texCoords.push(0.5, 0.5, 0.0);
      }
    }

    // Generate indices. Both rings wrap, so the neighbour of the last step is
    // step 0 again — computing that per-axis keeps each quad on its own ring.
    for (let v = 0; v < vsteps; v++) {
      for (let u = 0; u < usteps; u++) {
        const u1 = (u + 1) % usteps;
        const v1 = (v + 1) % vsteps;

        const a = v * usteps + u;
        const b = v * usteps + u1;
        const c = v1 * usteps + u;
        const d = v1 * usteps + u1;

        indices.push(a, b, c);
        indices.push(c, b, d);
      }
    }

    return { positions, normals, texCoords, indices };
  }

  /**
   * Catmull-Rom interpolation through a list of scalars, so a handful of
   * control values describe a smooth curve instead of a faceted polyline.
   */
  static sampleSpline(points, t) {
    const last = points.length - 1;
    const scaled = t * last;
    const i = Math.min(Math.floor(scaled), last - 1);
    const s = scaled - i;

    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(last, i + 2)];

    return 0.5 * (
      2 * p1 +
      (-p0 + p2) * s +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * s * s +
      (-p0 + 3 * p1 - 3 * p2 + p3) * s * s * s
    );
  }

  static generateVase(height, radius, segments) {
    const positions = [];
    const normals = [];
    const texCoords = [];
    const indices = [];

    // Radius as a fraction of `radius`, sampled from base (first) to rim
    // (last): a narrow foot, a wide belly, a neck, then a slight flare.
    const PROFILE = [0.30, 0.34, 0.95, 1.0, 0.72, 0.42, 0.38, 0.52, 0.56];

    // The surface is a body of revolution: sweep this profile around Y.
    const profileAt = (t) => {
      const u = Math.min(1, Math.max(0, t));
      return {
        r: radius * Geometry.sampleSpline(PROFILE, u),
        y: (u - 0.5) * height,
      };
    };

    // Central difference for the profile tangent. Doing it numerically means
    // any profile works without hand-deriving its analytic derivative.
    const EPS = 1e-4;
    const tangentAt = (t) => {
      const before = profileAt(t - EPS);
      const after = profileAt(t + EPS);
      return { dr: after.r - before.r, dy: after.y - before.y };
    };

    // Generate vertices
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * 2 * Math.PI;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      for (let j = 0; j <= segments; j++) {
        const t = j / segments;
        const { r, y } = profileAt(t);

        positions.push(r * cosT, y, r * sinT);

        // Normal = (tangent around Y) x (tangent along the profile), which
        // reduces to this once the shared radius factor cancels out.
        const { dr, dy } = tangentAt(t);
        const nx = dy * cosT;
        const ny = -dr;
        const nz = dy * sinT;
        const nlen = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;

        normals.push(nx / nlen, ny / nlen, nz / nlen);
        texCoords.push(i / segments, t, 0.0);
      }
    }

    // Generate indices
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < segments; j++) {
        const a = i * (segments + 1) + j;
        const b = a + 1;
        const c = (i + 1) * (segments + 1) + j;
        const d = c + 1;

        indices.push(a, c, b);
        indices.push(b, c, d);
      }
    }

    return { positions, normals, texCoords, indices };
  }

  /**
   * Axis-aligned box centred on the origin. Corners are duplicated per face so
   * each one gets a flat normal instead of an averaged, rounded-looking one.
   */
  static generateBox(width, height, depth) {
    const w = width / 2;
    const h = height / 2;
    const d = depth / 2;

    const faces = [
      { n: [1, 0, 0], v: [[w, -h, d], [w, -h, -d], [w, h, -d], [w, h, d]] },
      { n: [-1, 0, 0], v: [[-w, -h, -d], [-w, -h, d], [-w, h, d], [-w, h, -d]] },
      { n: [0, 1, 0], v: [[-w, h, d], [w, h, d], [w, h, -d], [-w, h, -d]] },
      { n: [0, -1, 0], v: [[-w, -h, -d], [w, -h, -d], [w, -h, d], [-w, -h, d]] },
      { n: [0, 0, 1], v: [[-w, -h, d], [w, -h, d], [w, h, d], [-w, h, d]] },
      { n: [0, 0, -1], v: [[w, -h, -d], [-w, -h, -d], [-w, h, -d], [w, h, -d]] },
    ];

    const positions = [];
    const normals = [];
    const texCoords = [];
    const indices = [];

    const corners = [[0, 0], [1, 0], [1, 1], [0, 1]];

    faces.forEach((face, f) => {
      face.v.forEach((vertex, i) => {
        positions.push(...vertex);
        normals.push(...face.n);
        texCoords.push(corners[i][0], corners[i][1], 0.0);
      });

      const base = f * 4;
      indices.push(base, base + 1, base + 2);
      indices.push(base, base + 2, base + 3);
    });

    return { positions, normals, texCoords, indices };
  }

  static generateSphere(radius, segments, rings) {
    const positions = [];
    const normals = [];
    const texCoords = [];
    const indices = [];

    // Generate vertices
    for (let i = 0; i <= rings; i++) {
      const phi = (Math.PI * i) / rings;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      for (let j = 0; j <= segments; j++) {
        const theta = (2 * Math.PI * j) / segments;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        const x = radius * sinPhi * cosTheta;
        const y = radius * cosPhi;
        const z = radius * sinPhi * sinTheta;

        positions.push(x, y, z);
        normals.push(x / radius, y / radius, z / radius);
        texCoords.push(j / segments, i / rings, 0.0);
      }
    }

    // Generate indices
    for (let i = 0; i < rings; i++) {
      for (let j = 0; j < segments; j++) {
        const a = i * (segments + 1) + j;
        const b = a + 1;
        const c = (i + 1) * (segments + 1) + j;
        const d = c + 1;

        indices.push(a, c, b);
        indices.push(b, c, d);
      }
    }

    return { positions, normals, texCoords, indices };
  }
}
