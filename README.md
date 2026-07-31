# WebGL Shader Playground

Real-time shading model explorer built directly on the WebGL API — no Three.js,
no rendering framework. Nine shading models, an IBL-ready cubemap environment,
and a fixed-timestep physics drop, all driven from a live control panel.

**[Live demo](https://dollars7.github.io/WebGL-Shader-Playground/)**

```bash
npm install
npm run dev      # http://localhost:3000
```

---

## Architecture

```
src/
├── core/
│   ├── WebGLContext.js    context creation, GL state, DPR-aware resize
│   ├── ShaderManager.js   compilation, #include resolution, uniform binding
│   ├── GeometryBuffer.js  VBO/IBO lifecycle
│   └── WebGLApp.js        frame loop and pass ordering
├── graphics/
│   ├── mat4.js            column-major matrix math
│   ├── Camera.js          spherical orbit camera
│   ├── Material.js        surface parameters
│   ├── Lighting.js        light parameters and product terms
│   ├── Skybox.js          cubemap background
│   └── BouncePhysics.js   fixed-timestep integrator
├── geometry/Geometry.js   torus, surface-of-revolution vase, sphere, box
├── shaders/               one .frag per model + shared lib/
└── ui/UIController.js     DOM events

legacy/                    original coursework version (see legacy/README.md)
scripts/decode-skybox.js   asset pipeline: base64 JS → PNG
```

---

## Notes on the implementation

Things that were non-obvious enough to be worth writing down.

### Shaders get a real include mechanism

GLSL ES 1.0 has no `#include`. Rather than duplicating shared helpers across
nine fragment shaders, `ShaderManager.resolveIncludes()` inlines them:

```glsl
#include "lib/tonemap.glsl"
```

Paths resolve relative to the including file, and each file is inlined at most
once per program — which both avoids redefinition errors and terminates any
accidental include cycle.

Every model also shares a single vertex shader, so the vertex stage is compiled
once instead of nine times.

Sources are pulled in with `import.meta.glob(..., { query: '?raw' })` rather
than fetched at runtime. Vite only emits files something imports, so fetching
would 404 in production — and inlining additionally turns a missing shader into
a build failure instead of a runtime one, at zero extra requests for the
deployed page.

### Tone mapping, so the intensity control means something

Gold's diffuse colour is `(1.0, 0.8, 0.0)`. At 100% intensity the red channel
is already at 1.0, so without tone mapping the driver hard-clamps everything
above that and the entire upper half of the Intensity slider is a no-op.

Extended Reinhard (`WHITE_POINT = 3.0`) keeps dim values essentially linear and
rolls highlights off smoothly instead, which makes the full range usable.

### Skybox as a fullscreen pass, not a cube

Each pixel reconstructs its own view direction by transforming its clip-space
position through `inverse(projection × viewWithoutTranslation)`, then samples
the cubemap along it. No cube geometry, and the background cannot clip against
the model.

It runs *after* the scene with `depthFunc(LEQUAL)` and depth fixed at 1.0, so
it only shades pixels the geometry didn't already claim.

### Normals from the actual surface derivative

The vase is a surface of revolution whose profile is a Catmull-Rom spline
through nine control radii. Its normals come from the cross product of the two
surface tangents, with the profile derivative taken by central difference — so
changing the silhouette needs no hand-derived analytic normal.

### Physics that doesn't depend on frame rate

The drop integrates on a fixed 1/120s step with an accumulator. A per-frame
delta would make restitution frame-rate dependent — the same drop would bounce
to different heights at 60Hz and 144Hz.

Penetration is corrected before the velocity is reflected, otherwise a slow
object can remain below the surface and flip its velocity again on the next
step, producing jitter.

Measured against the analytic solution:

| rebound       | 1     | 2     | 3     | 4     |
| ------------- | ----- | ----- | ----- | ----- |
| height        | 0.902 | 0.574 | 0.361 | 0.225 |
| ratio to prev | —     | 0.636 | 0.630 | 0.622 |

Expected ratio is `e² = 0.64` for a restitution of 0.8.

### Assets are decoded, not embedded

The cubemap originally shipped as six ~500KB JavaScript files, each assigning a
base64 data URL to a global — 33% size overhead, parser-blocking, and
uncacheable as images. `scripts/decode-skybox.js` turns them back into PNGs
(3.0MB → 2.2MB) that the browser fetches in parallel and caches normally.

---

## Shading models

| Model     | Technique                                          |
| --------- | -------------------------------------------------- |
| Phong     | Blinn-Phong with a half-vector specular term        |
| Clay      | Lambertian diffuse only                             |
| Ceramic   | Narrowed specular exponent, attenuated highlight    |
| Pearl     | Full-strength specular                              |
| Chrome    | Suppressed diffuse, sharpened specular              |
| Fresnel   | View-angle dependent rim term                       |
| Toon      | Quantized diffuse via `step()`                      |
| Hologram  | Time-driven scanlines and pulse                     |
| Normal    | Surface normals remapped to RGB, for debugging      |

---

## Adding a shading model

1. Drop `src/shaders/yourmodel.frag` in place — it receives `fPosition`,
   `fNormal`, and `fLightPosition` in eye space from the shared vertex shader
2. Add `{ name: 'yourmodel', id: 8 }` to the list in `ShaderManager.js`
3. Add `<button data-shader="8" class="shader-btn">Your Model</button>`

No central switch statement to update — the preset list drives loading, and the
button's `data-shader` attribute drives selection.

## Controls

Drag to orbit · scroll to zoom · sliders and buttons apply immediately.

## Tests

```bash
npm test
```

Covers the invariants that are slow and unreliable to verify by staring at a
running renderer — normals unit-length and outward-facing, indices within range
for a `UNSIGNED_SHORT` buffer, no degenerate triangles, projection matrices
mapping to the canonical view volume, `inverse` round-tripping, and the physics
settling identically at 60Hz and 144Hz.

The suite has already earned its keep: it caught `update()` failing to re-check
`running` inside its substep loop, which fired the settle callback twice.

## Build and deploy

```bash
npm run build    # → dist/
npm run lint
```

Pushes to `main` run lint, tests, and a build in CI, then publish to GitHub
Pages. The deploy also copies `legacy/` through as static files, and
`/shader-playground/` forwards to the site root — that path is linked
externally, so it has to keep resolving.

`base` defaults to the repository subpath and can be overridden with
`PUBLIC_BASE_PATH` for a fork or a custom domain.

Requires WebGL 1.0; uses WebGL 2.0 when available.
