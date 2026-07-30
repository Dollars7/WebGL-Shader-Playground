import { describe, it, expect } from 'vitest';
import { Geometry } from './Geometry.js';

const vertexCount = (mesh) => mesh.positions.length / 3;
const vertexAt = (mesh, i) => mesh.positions.slice(i * 3, i * 3 + 3);
const normalAt = (mesh, i) => mesh.normals.slice(i * 3, i * 3 + 3);

const length = ([x, y, z]) => Math.sqrt(x * x + y * y + z * z);

/**
 * Every mesh feeds the same vertex layout and a Uint16 index buffer, so these
 * invariants have to hold no matter which generator produced it.
 */
function expectWellFormed(mesh) {
  const count = vertexCount(mesh);

  expect(mesh.positions.length % 3).toBe(0);
  expect(mesh.normals.length).toBe(mesh.positions.length);
  expect(mesh.texCoords.length).toBe(mesh.positions.length);
  expect(mesh.indices.length % 3).toBe(0);

  expect(mesh.positions.every(Number.isFinite)).toBe(true);
  expect(mesh.normals.every(Number.isFinite)).toBe(true);

  // Out-of-range indices read garbage; above 65535 they silently wrap, since
  // the index buffer is uploaded as UNSIGNED_SHORT.
  expect(Math.min(...mesh.indices)).toBeGreaterThanOrEqual(0);
  expect(Math.max(...mesh.indices)).toBeLessThan(count);
  expect(Math.max(...mesh.indices)).toBeLessThanOrEqual(65535);

  for (let i = 0; i < count; i++) {
    expect(length(normalAt(mesh, i))).toBeCloseTo(1, 5);
  }
}

/** No triangle may reference the same vertex twice — that draws nothing. */
function expectNoDegenerateTriangles(mesh) {
  for (let i = 0; i < mesh.indices.length; i += 3) {
    const [a, b, c] = [mesh.indices[i], mesh.indices[i + 1], mesh.indices[i + 2]];
    expect(a === b || b === c || a === c).toBe(false);
  }
}

describe('torus', () => {
  const R = 0.4;
  const r = 0.3;
  const mesh = Geometry.generateTorus(R, r, 32, 24);

  it('produces a well-formed mesh', () => expectWellFormed(mesh));

  it('has no degenerate triangles', () => {
    // Regression: the original index math wrapped u with `% usteps` against a
    // flat vertex index, which connected each quad to vertices on other rings.
    expectNoDegenerateTriangles(mesh);
  });

  it('keeps every vertex on the tube surface', () => {
    // Distance from the tube's centre circle must equal the tube radius.
    for (let i = 0; i < vertexCount(mesh); i++) {
      const [x, y, z] = vertexAt(mesh, i);
      const distanceToRing = Math.sqrt((Math.sqrt(x * x + y * y) - R) ** 2 + z * z);
      expect(distanceToRing).toBeCloseTo(r, 5);
    }
  });

  it('spans the extent WebGLApp assumes when resting it on the platform', () => {
    const ys = Array.from({ length: vertexCount(mesh) }, (_, i) => vertexAt(mesh, i)[1]);
    expect(Math.max(...ys)).toBeCloseTo(R + r, 5);
    expect(Math.min(...ys)).toBeCloseTo(-(R + r), 5);
  });
});

describe('vase', () => {
  const height = 0.5;
  const mesh = Geometry.generateVase(height, 0.5, 24);

  it('produces a well-formed mesh', () => expectWellFormed(mesh));

  it('points every normal away from the axis of revolution', () => {
    // Regression: normals were built as `radius - yRatio * height`, mixing two
    // different units, which lit the surface as if it were a different shape.
    for (let i = 0; i < vertexCount(mesh); i++) {
      const [x, , z] = vertexAt(mesh, i);
      const [nx, , nz] = normalAt(mesh, i);
      const radial = Math.sqrt(x * x + z * z);
      if (radial < 1e-6) continue;

      expect((nx * x + nz * z) / radial).toBeGreaterThan(-1e-6);
    }
  });

  it('agrees with a finite-difference normal of the surface', () => {
    // Independent check: the reported normal must be perpendicular to the
    // surface tangent measured from neighbouring vertices. Sampled on a dense
    // mesh with a central difference, so the chord closely tracks the true
    // tangent rather than cutting across the profile's curvature.
    const rings = 240;
    const dense = Geometry.generateVase(height, 0.5, rings);
    const perRing = rings + 1;

    for (let ring = 0; ring < 4; ring++) {
      for (let j = 1; j < rings; j += 7) {
        const i = ring * perRing + j;
        const before = vertexAt(dense, i - 1);
        const after = vertexAt(dense, i + 1);
        const tangent = after.map((v, k) => v - before[k]);

        const n = normalAt(dense, i);
        const dot = n[0] * tangent[0] + n[1] * tangent[1] + n[2] * tangent[2];
        expect(Math.abs(dot / length(tangent))).toBeLessThan(0.02);
      }
    }
  });

  it('is centred on the origin so it rests correctly on the platform', () => {
    const ys = Array.from({ length: vertexCount(mesh) }, (_, i) => vertexAt(mesh, i)[1]);
    expect(Math.max(...ys)).toBeCloseTo(height / 2, 5);
    expect(Math.min(...ys)).toBeCloseTo(-height / 2, 5);
  });

  it('varies its radius along the profile', () => {
    // A straight profile would make this a cone, which is what it used to be.
    const radii = Array.from({ length: vertexCount(mesh) }, (_, i) => {
      const [x, , z] = vertexAt(mesh, i);
      return Math.sqrt(x * x + z * z);
    });

    expect(Math.max(...radii) - Math.min(...radii)).toBeGreaterThan(0.1);
  });
});

describe('sphere', () => {
  const radius = 1.0;
  const mesh = Geometry.generateSphere(radius, 24, 16);

  it('produces a well-formed mesh', () => expectWellFormed(mesh));

  it('keeps every vertex at the given radius', () => {
    for (let i = 0; i < vertexCount(mesh); i++) {
      expect(length(vertexAt(mesh, i))).toBeCloseTo(radius, 5);
    }
  });

  it('aligns each normal with its position vector', () => {
    for (let i = 0; i < vertexCount(mesh); i++) {
      const p = vertexAt(mesh, i);
      const n = normalAt(mesh, i);
      p.forEach((v, k) => expect(n[k]).toBeCloseTo(v / radius, 5));
    }
  });
});

describe('box', () => {
  const mesh = Geometry.generateBox(4, 0.15, 4);

  it('produces a well-formed mesh', () => expectWellFormed(mesh));
  it('has no degenerate triangles', () => expectNoDegenerateTriangles(mesh));

  it('duplicates corners per face so edges stay sharp', () => {
    // Sharing the 8 corners would average their normals and round the cube.
    expect(vertexCount(mesh)).toBe(24);
    expect(mesh.indices.length).toBe(36);
  });

  it('gives each face a single axis-aligned normal', () => {
    for (let face = 0; face < 6; face++) {
      const first = normalAt(mesh, face * 4);

      // Exactly one component is ±1 and the rest are zero.
      expect(first.filter((c) => Math.abs(Math.abs(c) - 1) < 1e-6)).toHaveLength(1);

      for (let i = 1; i < 4; i++) {
        expect(normalAt(mesh, face * 4 + i)).toEqual(first);
      }
    }
  });

  it('is centred on the origin', () => {
    const axisExtent = (axis) => {
      const values = Array.from({ length: vertexCount(mesh) }, (_, i) => vertexAt(mesh, i)[axis]);
      return [Math.min(...values), Math.max(...values)];
    };

    expect(axisExtent(0)).toEqual([-2, 2]);
    expect(axisExtent(1)).toEqual([-0.075, 0.075]);
    expect(axisExtent(2)).toEqual([-2, 2]);
  });
});
