# WebGL Shader Playground

A professional, modern shader experimentation environment built on the original homework assignment.

## Overview

The Shader Playground is a clean, white-themed interface for experimenting with WebGL shaders, materials, and 3D rendering techniques. It features:

- **9 Shader Presets**: Clay, Normal View, Wire, Ceramic, Pearl, Chrome, Fresnel Rim, Toon, Hologram
- **4 Quick Materials**: Gold, Red, Steel, Copper with distinct surface properties
- **3 Geometries**: Torus, Vase, Sphere
- **Dynamic Lighting**: Two light mode modes (Fixed + Eye-tracking)
- **Interactive Controls**: Orbit camera, intensity adjustment, auto-rotation

## Directory Structure

```
shader-playground/
├── index.html          # Modern UI with shader controls and sliders
├── app.js             # Main application logic (webgl-shader-playground.js)
├── geometry.js        # Geometry generation functions
├── assets/
│   └── bass-drop.mp3  # Audio file for animation
└── README.md          # This file
```

## Key Features

### Shader Effects

#### Material Presets
- **Phong/Blinn-Phong**: Classic lighting models with configurable shininess
- **Clay**: Matte surface rendering
- **Normal View**: Surface normal visualization
- **Wire**: Wireframe overlay effect
- **Ceramic**: Smooth white with subtle specularity
- **Pearl**: Glossy with high specularity
- **Chrome**: Mirror-like metallic finish
- **Fresnel Rim**: Rim lighting effect
- **Toon**: Flat-shaded cartoon style
- **Hologram**: Flickering neon effect

#### Quick Material Colors
Apply preset material properties instantly:
- Gold: Warm diffuse, high specularity
- Red: Diffuse red, moderate specularity
- Steel: Industrial gray, sharp specularity
- Copper: Warm metallic, moderate specularity

### Camera & Controls

- **Orbit**: Left-mouse drag to rotate
- **Zoom**: Right-mouse drag or scroll wheel
- **Auto-Rotation**: Adjustable speed slider
- **Projection**: Toggle Orthographic ↔ Perspective
- **Light Modes**:
  - **Position A**: Fixed light at (3, 4, 4)
  - **Position B**: Light follows camera (eye-relative)
- **Light Intensity**: 0-200% adjustment slider

### Geometries

- **Torus**: Parametric donut shape
- **Vase**: Curved rotationally symmetric form
- **Sphere**: UV sphere with specified resolution

### Physics Animation

- Gravity-based falling animation
- Elastically bouncing off the platform
- Real-time collision detection
- Audio sync (bass drop when landing)

## Shared Resources

Inherits from the homework assignment core:
- **Common/** - WebGL initialization and utilities
- **lib/skybox.js** - Modular skybox manager
- **lib/skyboxAssets/** - Cubemap environment textures
- **lib/mousy.js** - Mouse handling library

## Running

Open `index.html` in a modern WebGL-enabled browser.

Features high-DPI canvas support and responsive layout for various screen sizes.

## Technical Stack

- **WebGL 1.0**: Core rendering
- **GLSL ES**: Vertex and fragment shaders
- **MV.js**: Linear algebra (vectors, matrices, transformations)
- **Cubemap Textures**: nvlobby environment
- **Responsive CSS Grid**: Modern UI layout

## UI Design

Clean, minimalist white interface with:
- Top header with title and description
- Right sidebar for shader controls and material selection
- Main canvas area for 3D rendering
- Bottom control bar with sliders and projection toggles
- Responsive design for desktop and tablet size

## Future Enhancements

- Multiple skybox support (easy swap via `SkyboxManager.setSkybox()`)
- Custom shader editor
- Material preset save/load
- Advanced lighting modes (multiple lights, shadows)
- Texture upload for models
