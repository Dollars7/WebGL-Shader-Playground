# lib/ - Shared Libraries & Assets

This directory contains reusable modules and assets shared between the homework and shader-playground versions.

## Contents

### skybox.js
Professional skybox cubemap manager providing a clean API for cubemap operations.

**Features:**
- Asynchronous image loading
- Texture parameter optimization
- Configurable cubemap sizes
- Future skybox swapping support

**API:**
```javascript
// Initialize cubemap in WebGL
SkyboxManager.init(gl, program);

// Get geometry data for skybox cube
const { pointsArray, texCoordArray, normalsArray } = 
  SkyboxManager.getGeometry(planeVertices);

// Switch to different skybox (future)
SkyboxManager.setSkybox('exterior');
SkyboxManager.setSkybox('interior');

// Get current configuration
const config = SkyboxManager.getConfig();
```

**Texture Unit:** TEXTURE1 (reserved for cube map)

**Uniforms Expected:**
- `u_skybox` (samplerCube) - Cubemap texture

### mousy.js
Mouse interaction handler for camera control.

**Features:**
- Left/right button tracking
- Position delta calculation
- Camera orbit and zoom events

**Configured In:**
```javascript
var mouse = {
  prevX: 0,
  prevY: 0,
  leftDown: false,
  rightDown: false,
  scale: 0.01  // Adjust for sensitivity
};
```

**Integration:**
```javascript
canvas.onmousedown = function(event) { ... }
canvas.onmouseup = function(event) { ... }
canvas.onmousemove = function(event) { ... }
canvas.onmouseleave = function(event) { ... }
canvas.onwheel = function(event) { ... }
```

### skyboxAssets/
Pre-processed cubemap textures as JavaScript data URLs.

**Available Textures:**
- `nvlobby_new_posx.png.js` - Positive X face (Right)
- `nvlobby_new_negx.png.js` - Negative X face (Left)
- `nvlobby_new_posy.png.js` - Positive Y face (Top)
- `nvlobby_new_negy.png.js` - Negative Y face (Bottom)
- `nvlobby_new_posz.png.js` - Positive Z face (Front)
- `nvlobby_new_negz.png.js` - Negative Z face (Back)

**File Format:**
Each file exports a global variable:
```javascript
window.nvlobby_new_posx_data_url = "data:image/png;base64,..."
```

**Dimensions:** 512×512 pixels per face

## Usage in Projects

### homework/
```html
<script src="../lib/skybox.js"></script>
<script src="../lib/mousy.js"></script>
<script src="../lib/skyboxAssets/nvlobby_new_*.png.js"></script>
```

### shader-playground/
```html
<script src="../lib/skybox.js"></script>
<script src="../lib/mousy.js"></script>
<script src="../lib/skyboxAssets/nvlobby_new_*.png.js"></script>
```

## Adding New Textures

### Steps to convert PNG to data URL:
1. Take 512×512 PNG image
2. Use online converter or script to create base64 data URL
3. Create `name_face.png.js` file:
   ```javascript
   window.name_face_data_url = "data:image/png;base64,..."
   ```
4. Add to skyboxAssets/
5. Update SkyboxManager configuration

### Example Python script:
```python
import base64

with open('image.png', 'rb') as f:
    data = base64.b64encode(f.read()).decode()
    print(f'window.myimage_data_url = "data:image/png;base64,{data}"')
```

## Future Enhancements

### Multiple Skybox Support
Extend SkyboxManager to manage multiple cubemap sets:
```javascript
SkyboxManager.registerSkybox('exterior', { ... config ... });
SkyboxManager.registerSkybox('interior', { ... config ... });
SkyboxManager.setSkybox('exterior');
```

### Texture Streaming
Optimize large cubemap loading:
- Progressive face loading
- Mipmap pre-generation
- LOD support

### Custom Cubemap Size
Allow runtime size configuration:
```javascript
SkyboxManager.init(gl, program, { size: 1024 });
```

## Performance Considerations

- Cubemap textures are loaded asynchronously
- Mipmapping enabled for better sampling
- Texture parameters optimized for quality
- Mouse input uses efficient delta calculation

## Troubleshooting

**Skybox Not Appearing**
- Verify `u_skybox` uniform exists in shader
- Check TEXTURE1 is bound correctly
- Ensure all 6 cubemap faces are loaded

**Mouse Controls Not Working**
- Verify mousy.js is included before main app.js
- Check canvas element has event listeners attached
- Test mouse.scale value (adjust for sensitivity)

**Texture Loading Issues**
- Check browser console for CORS errors
- Verify data URLs are properly formatted
- Ensure all 6 faces are present
