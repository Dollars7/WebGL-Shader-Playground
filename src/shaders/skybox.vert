// Fullscreen triangle pair. The position is already in clip space, and z is
// forced to w so the skybox always lands on the far plane and loses the depth
// test against any real geometry.

attribute vec2 aClipPosition;

varying vec4 vClipPosition;

void main() {
  vClipPosition = vec4(aClipPosition, 1.0, 1.0);
  gl_Position = vClipPosition;
}
