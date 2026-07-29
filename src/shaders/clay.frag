precision mediump float;

#include "lib/tonemap.glsl"

uniform vec4 ambientProduct;
uniform vec4 diffuseProduct;
uniform vec4 specularProduct;

varying vec3 fPosition;
varying vec3 fNormal;
varying vec4 fLightPosition;

void main() {
  vec3 N = normalize(fNormal);
  vec3 L = normalize(fLightPosition.xyz - fPosition);

  vec3 ambient = ambientProduct.rgb;
  float Kd = max(dot(L, N), 0.0);
  vec3 diffuse = Kd * diffuseProduct.rgb;

  gl_FragColor = vec4(toneMap(ambient + diffuse), 1.0);
}
