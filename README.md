# WebGL Shader
conformal transformation of genus-0 surfaces to a unit sphere, based on harmonic energy minimization.
What it is: a WebGL shader playground that demonstrates Phong vs Gouraud, parametric surfaces (torus/sphere/cube), and interactive material/lighting controls.

Why it matters: helps newcomers see how light–material parameters affect shading; supports teaching/demos.

Highlights: inverse-transpose normal matrix, elastic boundary reflection, orthographic/perspective switch, preset recall.

Controls: [Phong/Gouraud] [Material A/B] [Light A/B] [Shininess slider] [Speed sliders] [Ortho/Perspective].

Tech: WebGL1 / GLSL, UI via HTML controls + JS uniforms; stable 60 FPS.
