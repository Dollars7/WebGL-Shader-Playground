/**
 * Drop-and-bounce simulation for the displayed model.
 *
 * Integrated on a fixed timestep rather than per-frame delta: a variable step
 * makes restitution frame-rate dependent, so the same drop would bounce to
 * different heights at 60Hz and 144Hz.
 */
const FIXED_DT = 1 / 120;

// Guards against the spiral of death — after a long stall (tab backgrounded,
// shader recompile) we drop the backlog instead of simulating minutes at once.
const MAX_FRAME_TIME = 0.25;

export class BouncePhysics {
  constructor() {
    this.gravity = -9.8;
    this.restitution = 0.8;

    this.dropHeight = 1.5;
    this.groundY = -0.65; // top surface of the platform
    this.objectHalfHeight = 0.7;

    this.position = [0, this.dropHeight, 0];
    this.velocity = [0, 0, 0];

    this.running = false;
    this.accumulator = 0;
    this.restTime = 0;

    this.onSettled = null;
  }

  start() {
    this.position = [0, this.dropHeight, 0];
    this.velocity = [0, 0, 0];
    this.accumulator = 0;
    this.restTime = 0;
    this.running = true;
  }

  stop() {
    this.running = false;
  }

  reset() {
    this.stop();
    this.position = [0, this.dropHeight, 0];
    this.velocity = [0, 0, 0];
  }

  /** @param {number} frameTime seconds elapsed since the previous frame */
  update(frameTime) {
    if (!this.running) return;

    this.accumulator += Math.min(frameTime, MAX_FRAME_TIME);

    // `running` is re-checked here, not just on entry: a step can settle the
    // object mid-frame, and the remaining substeps would otherwise keep
    // simulating it and fire onSettled again.
    while (this.accumulator >= FIXED_DT && this.running) {
      this.step(FIXED_DT);
      this.accumulator -= FIXED_DT;
    }
  }

  step(dt) {
    this.velocity[1] += this.gravity * dt;
    this.position[1] += this.velocity[1] * dt;

    const restY = this.groundY + this.objectHalfHeight;

    if (this.position[1] <= restY) {
      // Snap out of the penetration before reflecting, otherwise the object can
      // stay below the surface and flip its velocity again on the next step.
      this.position[1] = restY;
      this.velocity[1] = -this.velocity[1] * this.restitution;
    }

    // Once it can no longer leave the surface meaningfully, call it settled.
    const resting = this.position[1] <= restY + 0.01 && Math.abs(this.velocity[1]) < 0.35;
    this.restTime = resting ? this.restTime + dt : 0;

    if (this.restTime > 0.25) {
      this.position[1] = restY;
      this.velocity[1] = 0;
      this.running = false;
      if (this.onSettled) this.onSettled();
    }
  }
}
