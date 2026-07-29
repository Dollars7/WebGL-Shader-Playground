precision mediump float;

#include "lib/tonemap.glsl"

uniform vec4 ambientProduct;
uniform vec4 diffuseProduct;
uniform vec4 specularProduct;
uniform float shininess;

varying vec3 fPosition;
varying vec3 fNormal;
varying vec4 fLightPosition;

void main() {
  vec3 N = normalize(fNormal);
  vec3 L = normalize(fLightPosition.xyz - fPosition);
  vec3 E = normalize(-fPosition);

  // Rim brightness rises as the surface turns away from the viewer.
  float fresnel = pow(1.0 - max(dot(E, N), 0.0), 2.0);

  vec3 ambient = ambientProduct.rgb;

  float Kd = max(dot(L, N), 0.0);
  vec3 diffuse = Kd * diffuseProduct.rgb;

  vec3 rimLight = fresnel * specularProduct.rgb;

  gl_FragColor = vec4(toneMap(ambient + diffuse + rimLight), 1.0);
}
