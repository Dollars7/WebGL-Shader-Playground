precision mediump float;

#include "lib/tonemap.glsl"

uniform vec4 ambientProduct;
uniform vec4 diffuseProduct;
uniform vec4 specularProduct;
uniform float uTime;

varying vec3 fPosition;
varying vec3 fNormal;
varying vec4 fLightPosition;

void main() {
  vec3 N = normalize(fNormal);
  vec3 L = normalize(fLightPosition.xyz - fPosition);

  vec3 ambient = ambientProduct.rgb * 2.0;

  float Kd = max(dot(L, N), 0.0);
  vec3 diffuse = Kd * diffuseProduct.rgb;

  // Scanlines drifting along the model plus a slow global pulse.
  float scanline = 0.85 + 0.15 * sin(fPosition.y * 60.0 - uTime * 4.0);
  float pulse = 0.9 + 0.1 * sin(uTime * 2.0);

  gl_FragColor = vec4(toneMap((ambient + diffuse) * scanline * pulse), 1.0);
}
