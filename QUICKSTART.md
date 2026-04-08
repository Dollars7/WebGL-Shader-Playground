# Quick Start Guide

## 🚀 5-Second Setup

### Option A: Run Original Homework
```
Open: homework/index.html
```
Classic learning assignment with Phong/Blinn-Phong shading and physics.

### Option B: Run Modern Shader Playground  
```
Open: shader-playground/index.html
```
Professional UI with 9 shader presets, material controls, and advanced lighting.

---

## 📁 Project Map

```
📦 WebGL-Shader-Playground
 ├─ 📄 README.md                    ← Start here for overview
 ├─ 📄 REFACTORING_SUMMARY.md       ← Detailed changes
 ├─ 📄 PROJECT_GUIDE.md             ← Technical deep dive
 │
 ├─ 📂 homework/                    ← Original assignment
 │  ├─ 📄 index.html               ← Open this to run
 │  ├─ 📄 README.md                
 │  └─ 📁 assets/
 │
 ├─ 📂 shader-playground/           ← Modern version
 │  ├─ 📄 index.html               ← Open this to run
 │  ├─ 📄 README.md
 │  └─ 📁 assets/
 │
 ├─ 📂 lib/                         ← Shared modules
 │  ├─ 📄 skybox.js                ← Cubemap manager
 │  ├─ 📄 mousy.js                 ← Mouse controls
 │  ├─ 📄 README.md
 │  └─ 📁 skyboxAssets/            ← Textures
 │
 └─ 📂 Common/                      ← WebGL utilities
    ├─ 📄 MV.js
    ├─ 📄 initShaders.js
    └─ 📄 webgl-utils.js
```

---

## 🎮 Controls Reference

### Camera (Both Versions)
- **Left-drag**: Orbit around object
- **Right-drag**: Zoom in/out  
- **Scroll wheel**: Zoom in/out

### Playground-Specific Controls
- **Shader Presets**: Clay, Ceramic, Pearl, Chrome, Fresnel, Toon, Hologram, etc.
- **Material Colors**: Gold, Red, Steel, Copper (instant apply)
- **Light Modes**: 
  - Position A: Fixed at (3, 4, 4)
  - Position B: Follows camera (eye-tracking)
- **Sliders**:
  - Light Intensity: 0-200%
  - Auto Rotation Speed: 0-100%

---

## 📚 What's New in This Organization

### Before
```
Root folder had 22 files mixed together:
- HW4_Shaded.html
- webgl-shader-playground.html
- HW4_Geometry.js  
- nvlobby_new_posx.png.js (×6)
- mousy.js
- ... (cluttered)
```

### After  
```
Organized into clear directories:
✅ homework/        - Original assignment only
✅ shader-playground/ - Modern UI version only
✅ lib/            - Shared modules & assets
✅ Common/         - WebGL utilities
```

---

## 🔧 Key Improvements

### Skybox Refactoring
**Old Way:**
```javascript
function skybox(program) { ... 100+ lines ... }
```

**New Way:**
```javascript
SkyboxManager.init(gl, program);
// Future: SkyboxManager.setSkybox('newname');
```

### Cleaner Imports
Both versions now simply import from `../lib/`:
```html
<script src="../lib/skybox.js"></script>
<script src="../lib/mousy.js"></script>
<script src="../lib/skyboxAssets/nvlobby_new_posx.png.js"></script>
```

### Easy Expansion
Add new skybox:
1. Create 6× PNG textures (512×512)
2. Place in `lib/skyboxAssets/newname_*.png.js`
3. Update `lib/skybox.js` config
4. Call `SkyboxManager.setSkybox('newname')`

---

## 🎯 Version Comparison

| Feature | Homework | Playground |
|---------|----------|-----------|
| **Theme** | Standard | Modern white |
| **Shaders** | 2 (Phong/Blinn) | 9 presets |
| **Materials** | Manual | 4 quick buttons |
| **Lighting** | Fixed position | Fixed + Eye-tracking |
| **Use Case** | Learning | Experimentation |

---

## 📖 Documentation

Each component has its own guide:
- **README.md** - Project overview
- **homework/README.md** - Assignment details
- **shader-playground/README.md** - UI features
- **lib/README.md** - Module reference
- **PROJECT_GUIDE.md** - Technical specifications
- **REFACTORING_SUMMARY.md** - What changed and why

---

## ✨ Browser Support

Works in any modern browser with WebGL:
- ✅ Chrome 26+
- ✅ Firefox 25+
- ✅ Safari 8+
- ✅ Edge 12+

---

## 🚨 Troubleshooting

### Skybox doesn't appear?
1. Check browser console for errors
2. Verify all 6 texture files are loaded
3. Ensure `u_skybox` uniform exists in shader

### Mouse controls not working?
1. Verify mousy.js loaded (check console)
2. Try different mouse button
3. Check canvas has focus

### Files look wrong?
1. Make sure you're in correct directory
2. Verify relative paths in HTML (use `../lib/`)
3. Clear browser cache (Ctrl+Shift+Delete)

---

## 🎓 Learning Path

### Beginner
1. Open `homework/index.html`
2. Rotate object, observe shading
3. Read `homework/README.md`
4. Explore GLSL shaders in HTML

### Intermediate  
1. Open `shader-playground/index.html`
2. Try different shader presets
3. Adjust light intensity
4. Study `app.js` for implementation

### Advanced
1. Modify shaders in HTML `<script>` tags
2. Add new material presets
3. Create new skybox assets
4. Hook into `SkyboxManager` for multiple environments

---

## 📝 Quick Reference

### Run Homework
```
homework/index.html
```

### Run Playground
```
shader-playground/index.html  
```

### Edit Shaders
```
Edit <script id="vertex-shader"> and <script id="fragment-shader">
in index.html, then reload browser
```

### Change Skybox (Future)
```javascript
SkyboxManager.setSkybox('newname')
```

### Add Material
```javascript
function setMaterialMyMaterial() {
  materialAmbient = vec4(r, g, b, 1.0);
  materialDiffuse = vec4(r, g, b, 1.0);
  materialSpecular = vec4(r, g, b, 1.0);
  materialShininess = 50.0;
  updateMaterialDisplay();
}
```

---

## 🎉 You're Ready!

Pick either version and start exploring WebGL. Happy coding! 🚀
