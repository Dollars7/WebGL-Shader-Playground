precision mediump float;

uniform samplerCube uSkybox;
// inverse(projection * viewWithoutTranslation) — turns a clip-space point back
// into the world-space direction the camera is looking along for that pixel.
uniform mat4 uViewDirectionProjectionInverse;

varying vec4 vClipPosition;

void main() {
  vec4 direction = uViewDirectionProjectionInverse * vClipPosition;
  gl_FragColor = textureCube(uSkybox, normalize(direction.xyz / direction.w));
}
