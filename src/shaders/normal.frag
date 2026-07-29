precision mediump float;

varying vec3 fPosition;
varying vec3 fNormal;

void main() {
  vec3 N = normalize(fNormal);
  gl_FragColor = vec4(N * 0.5 + 0.5, 1.0);
}
