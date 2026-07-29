# WebGL Shader Playground v2 - Engineering Refactor

## 🎯 What Changed

### Before (Old)
- ❌ 1300-line monolithic `app.js`
- ❌ 400-line fragment shader in HTML
- ❌ No build system
- ❌ Global variables everywhere
- ❌ No error handling
- ❌ ES5 only

### After (v2 - Now)
- ✅ Modular ES6 architecture
- ✅ Separate `.glsl` shader files
- ✅ Vite build system with HMR
- ✅ Class-based design
- ✅ Proper error handling & logging
- ✅ ESLint + Prettier ready
- ✅ Professional structure

## 📁 New Project Structure

```
src/
├── core/
│   ├── WebGLContext.js      # WebGL setup & state
│   ├── WebGLApp.js          # Main application class
│   ├── ShaderManager.js     # Shader compilation & uniforms
│   └── GeometryBuffer.js    # Vertex/index buffer management
├── graphics/
│   ├── Camera.js            # Spherical camera controller
│   ├── Material.js          # Material properties
│   └── Lighting.js          # Lighting properties
├── geometry/
│   └── Geometry.js          # Torus, Vase, Sphere generators
├── ui/
│   └── UIController.js      # Event handlers & UI state
├── shaders/
│   ├── phong.vert           # Vertex shader
│   ├── phong.frag
│   ├── clay.frag
│   ├── ceramic.frag
│   ├── pearl.frag
│   ├── chrome.frag
│   ├── fresnel.frag
│   ├── toon.frag
│   └── hologram.frag
├── styles/
│   └── main.css
├── index.html
└── main.js                  # Entry point
```

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Development
```bash
npm run dev
# Opens at http://localhost:3000 with hot reload
```

### Build for Production
```bash
npm run build
# Output in ./dist/
```

### Lint
```bash
npm run lint
```

## 📚 Key Classes

### `WebGLApp`
Main application orchestrator. Handles:
- Initialization
- Shader & geometry loading
- Render loop
- State management

```javascript
const app = new WebGLApp('gl-canvas');
await app.init();
app.start();
```

### `ShaderManager`
Manages shader compilation and uniforms:
```javascript
await shaderManager.loadAllShaders();
shaderManager.useShader('phong');
shaderManager.setUniform1f('shininess', 100);
```

### `Camera`
Spherical camera with interactive controls:
```javascript
camera.rotate(deltaTheta, deltaPhi);
camera.zoom(delta);
const mvMatrix = camera.getViewMatrix();
```

### `Geometry`
Static methods for mesh generation:
```javascript
const torus = Geometry.generateTorus(0.4, 0.3, 180, 180);
const vase = Geometry.generateVase(0.5, 0.5, 120);
const sphere = Geometry.generateSphere(1.0, 180, 180);
```

## 🔧 Extending the Project

### Adding a New Shader
1. Create `src/shaders/myshader.frag`
2. Add to shader list in `ShaderManager.js`
3. Add button to HTML
4. Done! No monolithic switch statement needed.

### Adding a New Geometry
1. Create static method in `Geometry.js`
2. Call from `WebGLApp.loadGeometry()`
3. Clean, simple, no global state.

## ✨ Benefits of This Refactor

1. **Maintainability** — Each concern in its own file
2. **Scalability** — Easy to add new shaders/geometries
3. **Performance** — Only compile needed shaders (in future: on-demand loading)
4. **Tooling** — Use npm, Vite, ESLint, Prettier
5. **Testing** — Classes are testable (future: add Jest)
6. **Professional** — Shows modern development practices

## 📝 Next Steps (Optional)

- [ ] Add TypeScript for type safety
- [ ] Write unit tests (Jest)
- [ ] Add PBR shader + IBL
- [ ] Shadow mapping
- [ ] Texture support
- [ ] Model loader (OBJ/glTF)

## 🔗 Resources

- [Vite Docs](https://vitejs.dev/)
- [WebGL Fundamentals](https://webglfundamentals.org/)
- [MDN WebGL Reference](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)
