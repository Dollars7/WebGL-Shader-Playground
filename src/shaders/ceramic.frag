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
  vec3 H = normalize(L + E);

  vec3 ambient = ambientProduct.rgb;

  float Kd = max(dot(L, N), 0.0);
  vec3 diffuse = Kd * diffuseProduct.rgb;

  float Ks = pow(max(dot(N, H), 0.0), shininess * 0.8);
  vec3 specular = Ks * specularProduct.rgb * 0.6;

  if(dot(L, N) < 0.0) {
    specular = vec3(0.0);
  }

  gl_FragColor = vec4(toneMap(ambient + diffuse + specular), 1.0);
}
