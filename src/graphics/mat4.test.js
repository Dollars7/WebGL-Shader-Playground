import { describe, it, expect } from 'vitest';
import * as mat4 from './mat4.js';

/** Column-major index: column `c`, row `r`. */
const at = (m, c, r) => m[c * 4 + r];

const transform = (m, v) => {
  const [x, y, z] = v;
  const w = at(m, 0, 3) * x + at(m, 1, 3) * y + at(m, 2, 3) * z + at(m, 3, 3);
  return [0, 1, 2].map(
    (r) => (at(m, 0, r) * x + at(m, 1, r) * y + at(m, 2, r) * z + at(m, 3, r)) / (w || 1)
  );
};

const expectClose = (actual, expected, precision = 5) => {
  expect(actual.length).toBe(expected.length);
  actual.forEach((v, i) => expect(v).toBeCloseTo(expected[i], precision));
};

describe('multiply', () => {
  it('leaves a matrix unchanged when multiplied by the identity', () => {
    const m = mat4.perspective(60, 1.5, 0.1, 100);
    expectClose(mat4.multiply(m, mat4.identity()), m);
    expectClose(mat4.multiply(mat4.identity(), m), m);
  });

  it('composes transforms right-to-left, matching GLSL convention', () => {
    // A projection applied after a view must equal proj * view.
    const view = mat4.lookAt([0, 0, 5], [0, 0, 0], [0, 1, 0]);
    const proj = mat4.perspective(45, 1, 0.1, 100);
    const combined = mat4.multiply(proj, view);

    const point = [1, 2, 0];
    expectClose(transform(combined, point), transform(proj, transform(view, point)));
  });
});

describe('inverse', () => {
  it('round-trips a view-projection matrix back to the identity', () => {
    const vp = mat4.multiply(
      mat4.perspective(50, 1.777, 0.1, 100),
      mat4.lookAt([3, 4, 5], [0, 0, 0], [0, 1, 0])
    );

    expectClose(mat4.multiply(vp, mat4.inverse(vp)), mat4.identity(), 4);
  });

  it('returns the identity for a singular matrix instead of NaNs', () => {
    // The skybox pass inverts a matrix built from live camera state; a
    // degenerate frame must not poison every subsequent pixel with NaN.
    const singular = new Array(16).fill(0);
    expect(mat4.inverse(singular).every(Number.isFinite)).toBe(true);
  });
});

describe('lookAt', () => {
  it('maps the eye position to the origin', () => {
    const eye = [3, 4, 5];
    expectClose(transform(mat4.lookAt(eye, [0, 0, 0], [0, 1, 0]), eye), [0, 0, 0]);
  });

  it('places the target down the negative Z axis', () => {
    // OpenGL convention: the camera looks along -Z in eye space.
    const view = mat4.lookAt([0, 0, 8], [0, 0, 0], [0, 1, 0]);
    const [x, y, z] = transform(view, [0, 0, 0]);

    expect(x).toBeCloseTo(0, 5);
    expect(y).toBeCloseTo(0, 5);
    expect(z).toBeCloseTo(-8, 5);
  });

  it('keeps world up pointing up in eye space', () => {
    const view = mat4.lookAt([5, 0, 0], [0, 0, 0], [0, 1, 0]);
    const origin = transform(view, [0, 0, 0]);
    const above = transform(view, [0, 1, 0]);

    expect(above[1] - origin[1]).toBeCloseTo(1, 5);
  });
});

describe('perspective', () => {
  it('maps the near and far planes to the depth range', () => {
    const near = 0.1;
    const far = 100;
    const proj = mat4.perspective(45, 1, near, far);

    expect(transform(proj, [0, 0, -near])[2]).toBeCloseTo(-1, 5);
    expect(transform(proj, [0, 0, -far])[2]).toBeCloseTo(1, 5);
  });

  it('compresses X relative to Y as the aspect ratio widens', () => {
    // A wider viewport must not stretch the image horizontally.
    const wide = mat4.perspective(45, 2, 0.1, 100);
    const [x, y] = transform(wide, [1, 1, -5]);

    expect(Math.abs(x)).toBeCloseTo(Math.abs(y) / 2, 5);
  });
});

describe('ortho', () => {
  it('maps the box corners to the canonical view volume', () => {
    const proj = mat4.ortho(-2, 2, -1, 1, 0.1, 100);

    expectClose(transform(proj, [-2, -1, -0.1]), [-1, -1, -1], 5);
    expectClose(transform(proj, [2, 1, -100]), [1, 1, 1], 5);
  });

  it('preserves relative sizes regardless of depth', () => {
    // The defining property of a parallel projection: no foreshortening.
    const proj = mat4.ortho(-2, 2, -2, 2, 0.1, 100);

    expect(transform(proj, [1, 0, -5])[0]).toBeCloseTo(transform(proj, [1, 0, -50])[0], 5);
  });
});
