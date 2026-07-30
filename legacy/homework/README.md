# WebGL Homework Project

Original homework assignment featuring WebGL graphics, 3D geometry manipulation, and shader effects.

## Overview

This is the foundational homework implementation with:
- **Geometry**: Torus, Vase, Sphere with proper normal vectors
- **Shading Models**: Phong and Blinn-Phong lighting
- **Platform**: Textured ground plane with physics-based bouncing
- **Skybox**: Cubemap environment using nvlobby textures
- **Animation**: Gravity simulation with collision detection

## Directory Structure

```
homework/
├── index.html          # Main HTML file
├── app.js             # Original HW4_Shaded.js - main application logic
├── geometry.js        # HW4_Geometry.js - geometry generation functions
├── assets/
│   └── bass-drop.mp3  # Audio file for animation
└── README.md          # This file
```

## Key Features

### Geometries
- **Torus**: Parametric surface with major/minor radius control
- **Vase**: Rotationally symmetric shape
- **Sphere**: Latitude/longitude based mesh

### Materials & Shading
- Phong and Blinn-Phong shading models
- Configurable ambient, diffuse, specular properties
- Materialshininess control

### Camera & Controls
- **Orbit camera**: Left-drag to rotate around object
- **Zoom**: Right-drag or scroll wheel
- **Fixed light position**: At (3, 4, 4)

### Physics
- Gravity simulation (9.8 m/s²)
- Elastic bounce collision with platform
- Velocity and position tracking

## Shared Resources

This project shares common resources with the Shader Playground:
- **Common/** - Shared WebGL utilities and shader compilation
- **lib/skybox.js** - Cubemap skybox manager
- **lib/skyboxAssets/** - Cubemap texture files
- **lib/mousy.js** - Mouse event handling utilities

## Running

Simply open `index.html` in a modern WebGL-enabled browser.

## Technical Notes

- Uses MV.js for linear algebra (vectors, matrices)
- WebGL 1.0 context
- GLSL ES shaders for vertex and fragment processing
- Cubemap textures loaded asynchronously
