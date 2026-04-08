# WebGL Shader Playground - Complete Project

A professional WebGL graphics project featuring both the original homework assignment and a modern shader experimentation environment.

## Project Structure

```
WebGL-Shader-Playground/
├── README.md                          # This file
├── PROJECT_GUIDE.md                  # Detailed technical documentation
│
├── Common/                            # Shared WebGL utilities
│   ├── initShaders.js                # Shader compilation
│   ├── MV.js                         # Linear algebra library
│   ├── webgl-utils.js                # WebGL helper functions
│   └── README.txt
│
├── lib/                               # Shared libraries
│   ├── skybox.js                    # Modular skybox manager
│   ├── mousy.js                     # Mouse input handling
│   └── skyboxAssets/                # Cubemap textures
│       ├── nvlobby_new_posx.png.js
│       ├── nvlobby_new_negx.png.js
│       ├── nvlobby_new_posy.png.js
│       ├── nvlobby_new_negy.png.js
│       ├── nvlobby_new_posz.png.js
│       └── nvlobby_new_negz.png.js
│
├── homework/                          # Original homework assignment
│   ├── index.html                   # Main page
│   ├── app.js                       # Application logic
│   ├── geometry.js                  # Geometry generation
│   ├── assets/
│   │   └── bass-drop.mp3
│   └── README.md
│
└── shader-playground/                 # Modern shader experimentation
    ├── index.html                   # Modern UI
    ├── app.js                       # Main application
    ├── geometry.js                  # Shared geometry functions
    ├── assets/
    │   └── bass-drop.mp3
    └── README.md
```

## Quick Start

### Homework Version
Open `homework/index.html` to experience the original assignment with:
- ✅ Phong/Blinn-Phong shading
- ✅ Interactive 3D geometries
- ✅ Physics-based animation
- ✅ Skybox environment

### Shader Playground
Open `shader-playground/index.html` for the professional interface with:
- ✅ 9 shader effect presets
- ✅ 4 quick material colors
- ✅ Advanced lighting controls
- ✅ Modern UI with responsive design

## Key Differences

| Feature | Homework | Playground |
|---------|----------|-----------|
| Theme | Default WebGL | Modern white UI |
| Shader Effects | 2 (Phong, Blinn-Phong) | 9 presets |
| Materials | Manual configuration | Quick color buttons |
| Lighting | Fixed light at (3,4,4) | Fixed + Eye-tracking |
| UI Layout | Basic HTML | CSS Grid, responsive |
| Code Style | Unstructured | Modularized |

## Shared Core

Both versions build on the same foundation:

### Common Library (`Common/`)
- **initShaders.js**: Shader compilation and linking
- **MV.js**: Matrix and vector mathematics
- **webgl-utils.js**: WebGL context utilities

### Shared Modules (`lib/`)
- **skybox.js**: Professional skybox manager with texture management
  - `SkyboxManager.init(gl, program)` - Initialize cubemap
  - `SkyboxManager.getGeometry(plane)` - Get skybox mesh data
  - `SkyboxManager.setSkybox(name)` - (Future) Swap skybox
  
- **mousy.js**: Mouse event handling for camera control
  - Left-drag: Orbit
  - Right-drag: Zoom
  - Scroll: Zoom

- **skyboxAssets/**: Cubemap textures (nvlobby_new environment)

## Architecture Highlights

### Geometry Generation
Parametric surfaces in separate `geometry.js`:
- Torus parametric surface
- Vase rotation surface
- UV sphere
- Platform with proper normals

### Modular Skybox
Extracted `SkyboxManager` for easy future enhancements:
```javascript
// Change skybox in future versions
SkyboxManager.setSkybox('exterior');
SkyboxManager.setSkybox('interior');
```

### Flexibility
- Same geometry, different interfaces
- Shared utility libraries
- Independent styling
- Version progression (homework → playground)

## Technical Specifications

- **WebGL Version**: 1.0
- **Shader Language**: GLSL ES
- **Math Library**: MV.js
- **Cubemap Size**: 512×512 pixels
- **Geometry Resolution**: 180+ segments
- **Physics**: Gravity 9.8 m/s², bounce damping 0.8

## Browser Requirements

Modern WebGL-enabled browsers:
- Chrome 26+
- Firefox 25+
- Safari 8+
- Edge 12+

## Development Notes

### Adding New Shaders
1. Edit geometry generation in `geometry.js`
2. Add uniform variables to shaders
3. Implement in fragment shader
4. Reference in `app.js` shader selection

### Creating New Skybox
1. Prepare 6 cubemap faces (512×512 recommended)
2. Convert to data URLs with `png.js` format
3. Add to `lib/skyboxAssets/`
4. Update `SkyboxManager` configuration
5. Call `SkyboxManager.setSkybox(name)`

### Modifying Materials
Edit material properties in `app.js`:
```javascript
var materialAmbient = vec4(0.3, 0.3, 0.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 0.8, 1.0);
var materialShininess = 100.0;
```

## Performance Tips

- Adjust auto-rotation speed to reduce per-frame calculations
- Use orthographic projection for fixed viewpoints
- Batch uniform updates when changing multiple properties
- Monitor canvas resolution on high-DPI displays

## Timeline

- **Phase 1**: Original homework with Phong shading
- **Phase 2**: Blinn-Phong implementation
- **Phase 3**: Professional UI (Shader Playground)
- **Phase 4**: Modularized skybox, shared libraries
- **Phase 5** (Future): Multiple skyboxes, custom shaders, advanced effects
