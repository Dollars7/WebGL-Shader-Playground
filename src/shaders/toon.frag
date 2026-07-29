precision mediump float;

uniform vec4 ambientProduct;
uniform vec4 diffuseProduct;
uniform vec4 specularProduct;

varying vec3 fPosition;
varying vec3 fNormal;
varying vec4 fLightPosition;

void main() {
  vec3 N = normalize(fNormal);
  vec3 L = normalize(fLightPosition.xyz - fPosition);

  vec4 ambient = ambientProduct;

  float d = dot(L, N);
  float Kd = step(0.5, d);
  vec4 diffuse = Kd * diffuseProduct;

  gl_FragColor = ambient + diffuse;
  gl_FragColor.a = 1.0;
}
