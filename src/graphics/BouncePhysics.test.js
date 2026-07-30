import { describe, it, expect } from 'vitest';
import { BouncePhysics } from './BouncePhysics.js';

/** Matches how WebGLApp configures a torus resting on the platform. */
function makePhysics() {
  const p = new BouncePhysics();
  p.groundY = -0.725 + 0.15 / 2;
  p.objectHalfHeight = 0.7;
  return p;
}

const restHeight = (p) => p.groundY + p.objectHalfHeight;

/** Run to settle, recording rebound apexes and the deepest point reached. */
function simulate(p, frameRate, maxFrames = 20000) {
  const dt = 1 / frameRate;
  const apexes = [];
  let previousVelocity = 0;
  let lowest = Infinity;
  let frames = 0;

  while (p.running && frames < maxFrames) {
    p.update(dt);
    frames++;

    lowest = Math.min(lowest, p.position[1]);
    if (previousVelocity > 0 && p.velocity[1] <= 0) apexes.push(p.position[1]);
    previousVelocity = p.velocity[1];
  }

  return { apexes, lowest, frames, settled: !p.running };
}

describe('BouncePhysics', () => {
  it('does not move until started', () => {
    const p = makePhysics();
    const before = [...p.position];

    p.update(1 / 60);

    expect(p.position).toEqual(before);
  });

  it('falls, settles, and comes to rest exactly on the platform', () => {
    const p = makePhysics();
    p.start();

    const { settled } = simulate(p, 60);

    expect(settled).toBe(true);
    expect(p.position[1]).toBeCloseTo(restHeight(p), 6);
    expect(p.velocity[1]).toBe(0);
  });

  it('never penetrates the platform', () => {
    // Reflecting velocity without first correcting the overlap leaves the
    // object below the surface, where it flips again and jitters.
    const p = makePhysics();
    p.start();

    const { lowest } = simulate(p, 60);

    expect(lowest).toBeGreaterThanOrEqual(restHeight(p) - 1e-9);
  });

  it('loses energy at the square of the restitution coefficient', () => {
    const p = makePhysics();
    p.start();

    const { apexes } = simulate(p, 60);
    const heights = apexes.map((y) => y - restHeight(p)).filter((h) => h > 0.01);

    expect(heights.length).toBeGreaterThan(3);

    // Drop height scales by e² per bounce, since apex height ∝ v².
    const expected = p.restitution ** 2;
    for (let i = 1; i < Math.min(heights.length, 5); i++) {
      expect(heights[i] / heights[i - 1]).toBeCloseTo(expected, 1);
    }
  });

  it('settles identically at 60Hz and 144Hz', () => {
    // The whole reason for the fixed timestep: a per-frame delta would make
    // restitution frame-rate dependent.
    const slow = makePhysics();
    const fast = makePhysics();
    slow.start();
    fast.start();

    simulate(slow, 60);
    simulate(fast, 144);

    expect(fast.position[1]).toBeCloseTo(slow.position[1], 9);
  });

  it('produces essentially the same bounce count across frame rates', () => {
    const slow = makePhysics();
    const fast = makePhysics();
    slow.start();
    fast.start();

    const a = simulate(slow, 60);
    const b = simulate(fast, 144);

    // The trajectory is identical, but the accumulator's leftover remainder
    // differs, so the last near-zero rebound can land either side of the
    // settle threshold. Anything beyond one bounce would mean the integration
    // itself diverged.
    expect(Math.abs(b.apexes.length - a.apexes.length)).toBeLessThanOrEqual(1);
    expect(a.apexes.length).toBeGreaterThan(8);
  });

  it('discards the backlog after a long stall instead of fast-forwarding', () => {
    // A backgrounded tab can hand back a multi-second delta; simulating all of
    // it at once would teleport the object and spike the frame.
    const stalled = makePhysics();
    const steady = makePhysics();
    stalled.start();
    steady.start();

    stalled.update(10);
    steady.update(0.25);

    expect(stalled.position[1]).toBeCloseTo(steady.position[1], 9);
  });

  it('returns to the drop height on reset', () => {
    const p = makePhysics();
    p.start();
    for (let i = 0; i < 30; i++) p.update(1 / 60);

    p.reset();

    expect(p.running).toBe(false);
    expect(p.position[1]).toBe(p.dropHeight);
    expect(p.velocity).toEqual([0, 0, 0]);
  });

  it('fires onSettled exactly once', () => {
    // WebGLApp uses this to stop the audio and flip the button label.
    const p = makePhysics();
    let calls = 0;
    p.onSettled = () => calls++;

    p.start();
    simulate(p, 60);
    for (let i = 0; i < 120; i++) p.update(1 / 60);

    expect(calls).toBe(1);
  });

  it('rests a taller object higher above the platform', () => {
    // Each model reports its own half-height; using the wrong one buries it.
    const small = makePhysics();
    const large = makePhysics();
    large.objectHalfHeight = 1.0;

    small.start();
    large.start();
    simulate(small, 60);
    simulate(large, 60);

    expect(large.position[1] - small.position[1]).toBeCloseTo(0.3, 6);
  });
});
