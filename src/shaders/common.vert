// Shared vertex shader for every fragment shader in the playground.
// Everything is emitted in eye space so the fragment shaders can treat
// fPosition / fNormal / fLightPosition as one consistent coordinate system.

attribute vec3 vPosition;
attribute vec3 vNormal;
attribute vec3 a_TexCoord;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec4 lightPosition;
uniform float transX;
uniform float transY;
uniform float transZ;

varying vec3 fPosition;
varying vec3 fNormal;
varying vec4 fLightPosition;

void main() {
  vec4 pos = vec4(vPosition + vec3(transX, transY, transZ), 1.0);

  fPosition = vec3(modelViewMatrix * pos);
  fNormal = normalize(vec3(modelViewMatrix * vec4(vNormal, 0.0)));
  fLightPosition = modelViewMatrix * lightPosition;

  gl_Position = projectionMatrix * modelViewMatrix * pos;
}
