# WebGL Shader Playground

A real-time shader visualization tool for learning and demonstrating WebGL lighting models. Explore different materials and lighting effects in an interactive 3D environment.

## Quick Start

### Open the Project

1. Open `/shader-playground/index.html` in a browser.
2. You should see a golden torus in the center.
3. The parameter control panel is on the right side.

### Basic Controls

* **Drag on the Canvas** → Rotate the model
* **Mouse wheel** → Zoom in or out
* **Adjust sliders** → Change lighting, shininess, and other parameters in real time
* **Click buttons** → Switch shaders, geometry, and projection modes

---

## UI Layout

```text
┌─────────────────────────────────────────────────┐
│  Shader Playground - Header                     │
└─────────────────────────────────────────────────┘
│                                  │               │
│      Canvas (1024×768)           │ Control Panel │
│      3D Model Display            │  (340px wide) │
│                                  │               │
│                                  │ • Projection  │
│                                  │ • Lighting    │
│                                  │ • Shader      │
│                                  │ • Material    │
│                                  │ • Display     │
│                                  │ • Technique   │
│                                  │               │
└──────────────────────────────────┴───────────────┘
```

---

## Feature Modules

### 1️⃣ VIEW: Projection and Camera

| Control                 | Description                                            |
| ----------------------- | ------------------------------------------------------ |
| **Ortho / Perspective** | Switch between orthographic and perspective projection |
| **Reset**               | Reset the camera to its default position               |
| **Auto Rotate**         | Auto-rotation speed from 0% to 100%                    |

### 2️⃣ LIGHTING: Lighting Controls

| Control            |             Range | Description                                                                |
| ------------------ | ----------------: | -------------------------------------------------------------------------- |
| **Light Position** | Fixed / Eye-Track | Use a fixed light position `(3, 4, 4)` or make the light follow the camera |
| **Intensity**      |            0–200% | Lighting intensity; affects overall brightness                             |
| **Ambient**        |            0–100% | Ambient light ratio; affects darker areas                                  |

### 3️⃣ MATERIAL / SHADER: Materials and Shaders

#### 🎨 Shader Preset

**Main Shader:**

* `Phong` (-1) — Classic Phong lighting model

#### 📊 Form / Analysis

* `Clay` (0) — Pure diffuse shading without specular highlights
* `Normal` (1) — Normal visualization for debugging
* `Wire` (2) — Wireframe overlay for displaying geometric details

#### 💎 Material Simulation

* `Ceramic` (3) — Ceramic material with medium specular highlights
* `Pearl` (4) — Pearl-like material with strong highlights
* `Chrome` (5) — Mirror-like material with extremely strong highlights

#### ✨ Stylized Effects

* `Fresnel` (6) — Fresnel rim lighting
* `Toon` (7) — Toon shading with discrete color bands
* `Hologram` (8) — Hologram effect with flickering animation

#### 🌈 Material Colors

Quick color presets: Gold, Red, Steel, Copper

**Shininess slider** → Range: 1–200. Controls the sharpness of specular highlights.

* Matte (1) = rough surface, almost no highlights
* Mirror (200) = mirror-like surface with sharp highlights

### 4️⃣ DISPLAY: Display Settings

| Control      | Options               | Description                                |
| ------------ | --------------------- | ------------------------------------------ |
| **Geometry** | Torus / Vase / Sphere | Three available geometry models            |
| **Skybox**   | nvlobby               | Cubemap background                         |
| **Physics**  | Start Drop            | Starts the physics-based falling animation |

### 5️⃣ TECHNIQUE: Technical Information

Displays the current parameter combination in real time:

```text
shader=5 → #5 Chrome/Mirror
- intensity=120 → Lighting intensity: 120%
- ambient=50 → Ambient light: 50%
- shininess=150 → Shininess: 150
- lightPos=1 → Eye-Track mode
- projMode=1 → Perspective projection
```

**Keywords:** Describe the main characteristics of the selected shader.

---

## Parameter Details

### Shader Index

| ID | Name                 | Purpose                                                   |
| -: | -------------------- | --------------------------------------------------------- |
| -1 | Phong Illumination   | Standard lighting model for learning the basics           |
|  0 | Clay / Matte         | Non-glossy material for debugging diffuse shading         |
|  1 | Normal Visualization | Displays normal directions to debug normal-related issues |
|  2 | Wire Overlay         | Shows geometric details and mesh structure                |
|  3 | Ceramic / Semigloss  | Glossiness between Clay and Pearl                         |
|  4 | Pearl / Glossy       | Highly glossy surface similar to jewelry                  |
|  5 | Chrome / Mirror      | Mirror-like reflection with extreme specular highlights   |
|  6 | Fresnel Rim          | View-dependent rim highlight                              |
|  7 | Toon Shading         | Cartoon-style shading with two-level quantization         |
|  8 | Hologram             | Neon flicker effect with time-based animation             |

### Light Position

* **Fixed `(3, 4, 4)`** — Fixed in the upper-right direction; commonly used for stable lighting
* **Eye-Track** — Follows the camera view in real time for a more dynamic lighting effect

### Projection

* **Orthographic** — Parallel projection with no perspective distortion; suitable for an industrial or technical look
* **Perspective** — Perspective projection similar to human vision; more natural for 3D viewing

---

## Common Use Cases

### Choose a Shader Based on Appearance

| Material Type      | Recommended Shader   | Suggested Parameters |
| ------------------ | -------------------- | -------------------- |
| Fabric, skin       | Clay + low Shininess | Shininess: 1–20      |
| Plastic            | Ceramic              | Shininess: 30–60     |
| Ceramic, porcelain | Ceramic + Pearl      | Shininess: 40–80     |
| Glass, pearl       | Pearl                | Shininess: 80–120    |
| Metal, mirror      | Chrome               | Shininess: 150–200   |
| Mesh debugging     | Wire or Normal       | —                    |

### Demo Flow

1. **Learn basic lighting**
   Use `Phong`, then adjust `Intensity` and `Ambient` to observe the changes.

2. **Understand specular highlights**
   Compare `Ceramic → Pearl → Chrome`, and observe how `Shininess` changes the highlight shape.

3. **Explore special effects**
   Try `Fresnel` for rim lighting, `Toon` for cartoon shading, and `Hologram` for flickering effects.

4. **Test different geometry models**
   Start with `Torus`, then try `Vase` for more complex surfaces, and `Sphere` for smooth shading.

---

## Interaction Tips

### Mouse Controls

```text
Drag: Rotate the view
Scroll up: Move the camera closer
Scroll down: Move the camera farther away
```

### Real-Time Parameter Feedback

* All sliders and buttons take effect immediately.
* The `TECHNIQUE` section displays the current parameter values in real time.
* There is no loading delay; all rendering is calculated on the GPU in real time.

### Skybox Background

* Uses the `nvlobby_new` cubemap.
* Improves the environmental realism of the scene.
* The background is fixed and does not rotate with the model.

---

## Technical Details

### Shader Implementation

* **Vertex Shader** — Computes vertex positions, normals, and lighting vectors.
* **Fragment Shader** — Implements 10 different lighting and shading models:

  * Phong / Blinn-Phong
  * Pure diffuse shading
  * Normal visualization
  * Multiple specular highlight variations
  * Special effects such as Fresnel and Toon shading

### Material System

```text
Color = Ambient + Diffuse + Specular
      = Ka·La + Kd·(N·L) + Ks·(N·H)^p
```

Where:

* `Ka` = ambient coefficient
* `Kd` = diffuse coefficient
* `Ks` = specular coefficient, affected by Material Colors
* `p` = shininess value

### Cubemap

* Uses six textures for six directions: top, bottom, left, right, front, and back.
* Simulates an infinitely distant environment.
* Enhances the realism of the lighting and background.

---

## Browser Compatibility

* ✅ Chrome 90+
* ✅ Firefox 88+
* ✅ Edge 90+
* ✅ Safari 14+

Requires a browser that supports **WebGL 1.0**.

---

## Project Structure

```text
WebGL-Shader-Playground/
├── shader-playground/
│   ├── index.html          ← Main page
│   ├── app.js              ← Application logic
│   ├── geometry.js         ← Geometry definitions
│   └── assets/
├── lib/                    ← Utility libraries
│   ├── mousy.js            ← Mouse controls
│   ├── skybox.js           ← Cubemap / skybox logic
│   └── skyboxAssets/       ← Texture files
├── Common/                 ← WebGL utility functions
│   └── initShaders.js      ← Shader initialization
├── README.md               ← This file
└── .git/                   ← Version control
```

---

## Learning Resources

### WebGL Basics

* [WebGL Official Documentation](https://www.khronos.org/webgl/)
* [WebGL Fundamentals](https://webglfundamentals.org/)

### Lighting Models

* Phong Illumination — Classic lighting model
* Blinn-Phong — Improved version with more natural specular highlights
* PBR, Physics-Based Rendering — Modern physically based rendering approach

### Practice Suggestions

1. First understand the three components of the Phong shader: ambient, diffuse, and specular.
2. Adjust the parameters and observe the changes to build visual intuition.
3. Use the Normal shader to debug normal directions.
4. Use the Wire shader to understand the geometry structure.

---

**Last Updated:** 2026-04-08
**Version:** 2.0
**Status:** Production Ready ✅
