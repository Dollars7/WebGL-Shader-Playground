# WebGL Material & Shading Demonstration - Project Guide

## 📖 Project Overview

This is an **interactive teaching project** designed to help learners understand:
- **Shading Models**: Phong vs Blinn-Phong
- **Material Properties**: How ambient, diffuse, specular, and shininess affect appearance
- **Light-Material Interaction**: How different materials respond to light
- **3D Geometry**: Different parametric surfaces and their lighting characteristics

---

## 🎯 Learning Objectives

Students will learn:

1. **Shading Model Differences**
   - **Phong Shading**: Uses `(H·N)` for specular calculation (sharp, mirror-like)
   - **Blinn-Phong Shading**: Uses `(N·H)` for specular calculation (soft, diffuse)
   
2. **Material Behavior**
   - How shininess affects specular size and sharpness
   - How specular color differs from diffuse color
   - How ambient color provides base illumination

3. **Visual Feedback**
   - Interactive switching between materials
   - Real-time observation of light interaction
   - Animation with physics to demonstrate bounce and lighting changes

---

## 🎨 Material Library

### Phong Shading Group (Sharp Specular Highlights)

#### 1. Polished Gold
- **Button**: `material1`
- **Appearance**: Mirror-like, highly reflective
- **Properties**:
  - Ambient: `(0.3, 0.3, 0.0)` - Dark base
  - Diffuse: `(1.0, 0.8, 0.0)` - Saturated gold
  - Specular: `(1.0, 1.0, 0.8)` - Bright, whitish highlights
  - Shininess: `128.0` - Very sharp highlights
- **Real-world analogy**: Polished metal surface, jewelry, mirrors

#### 2. Brushed Steel
- **Button**: `lightColor1`
- **Appearance**: Industrial, directional brushed finish
- **Properties**:
  - Ambient: `(0.3, 0.3, 0.35)` - Gray-blue base
  - Diffuse: `(0.7, 0.7, 0.75)` - Light gray
  - Specular: `(0.8, 0.8, 0.9)` - Silver-white highlights
  - Shininess: `64.0` - Medium-sharp highlights
- **Real-world analogy**: Stainless steel, aluminum surfaces

### Blinn-Phong Shading Group (Soft Diffuse Highlights)

#### 3. Matte Red
- **Button**: `material2`
- **Appearance**: Rough, non-reflective
- **Properties**:
  - Ambient: `(0.3, 0.0, 0.0)` - Dark red base
  - Diffuse: `(0.8, 0.1, 0.1)` - Deep red
  - Specular: `(0.4, 0.3, 0.3)` - Dull grayish highlights
  - Shininess: `16.0` - Broad, soft highlights
- **Real-world analogy**: Rubber, matte plastic, fabric

#### 4. Ceramic
- **Button**: `lightColor2`
- **Appearance**: Smooth but dull, soft finish
- **Properties**:
  - Ambient: `(0.2, 0.2, 0.2)` - Dark gray base
  - Diffuse: `(0.7, 0.5, 0.2)` - Warm brown
  - Specular: `(0.5, 0.5, 0.5)` - Medium gray highlights
  - Shininess: `32.0` - Medium-soft highlights
- **Real-world analogy**: Ceramic cups, glazed pottery, plastic toys

---

## 🔧 Controls & Interactions

### 📦 Geometry Selection
| Button | Geometry | Properties |
|--------|----------|-----------|
| Torus | Ring-shaped surface | Y-range: [-0.7, 0.7] |
| Vase | Tapered vessel | Y-range: [-0.25, 0.25] |
| Sphere | Perfect sphere | Y-range: [-1.0, 1.0] |

### 💡 Light Position
| Button | Position | Characteristics |
|--------|----------|-----------------|
| Position A (3,4,4) | 45-degree angle | Balanced 3D lighting |
| Position B (Eye) | Camera location | Front-lit only |

### 🎨 Material + Shading Model
| Button | Material | Shading Model | Group |
|--------|----------|---------------|-------|
| Polished Gold | High-reflective | Phong (H·N) | Metallic |
| Brushed Steel | Industrial finish | Phong (H·N) | Metallic |
| Matte Red | Rough matte | Blinn-Phong (N·H) | Non-metallic |
| Ceramic | Smooth dull | Blinn-Phong (N·H) | Non-metallic |

### 🔍 View Modes
- **Orthographic**: Parallel projection (no perspective distortion)
- **Perspective**: Realistic 3D perspective view

### 🎬 Physics Animation
- Objects drop from height 1.5 and bounce on platform (Y ≈ -0.65)
- Different geometries have different `f_object_h` values for collision detection
- Bounce damping: 80% energy retention per bounce
- Background music plays synchronized with drop

---

## 📐 Shader Formulas

### Vertex Shader
Transforms vertices to eye space and calculates:
- Light vector: `L = normalize(light_pos - vertex_pos)`
- View vector: `E = normalize(eye_pos - vertex_pos)`
- Surface normal: `N = normalize(mat * normal)`

### Fragment Shader

#### Phong Shading (shadingModel == 1)
```glsl
H = normalize(L + E)
Kd = max(L·N, 0)
Ks = pow(max(H·N, 0), shininess)
Final = ambient + (Kd * diffuse) + (Ks * specular)
```

#### Blinn-Phong Shading (shadingModel == 0)
```glsl
H = normalize(L + E)
Kd = max(L·N, 0)
Ks = pow(max(N·H, 0), shininess)
Final = ambient + (Kd * diffuse) + (Ks * specular)
if (L·N < 0) specular = 0  // No specular if back-lit
```

---

## 🎓 Teaching Suggestions

### Observation Activities

1. **Phong vs Blinn-Phong Comparison**
   - Switch between "Polished Gold" and "Matte Red"
   - Observe how specular highlight shape differs
   - Phong: Sharper falloff; Blinn-Phong: Softer, broader

2. **Material Property Investigation**
   - Compare "Polished Gold" vs "Brushed Steel" (both Phong)
   - Notice how shininess controls highlight size
   - Observe specular color effects

3. **Geometry & Lighting Interaction**
   - Try each geometry with same material
   - See how different shapes interact with light
   - Sphere shows most uniform lighting
   - Torus shows interesting concave/convex effects

4. **Light Position Impact**
   - Toggle between Position A and B
   - See how light angle affects material appearance
   - Position A is more balanced for 3D perception

5. **Animation Analysis**
   - Watch how material appearance changes during drop
   - Observe lighting continuity across different object positions
   - Notice material differences are most apparent with proper illumination

---

## 🔄 Code Structure

### Key Files

- **HW4_Shaded.html**: UI layout and shader definitions
- **HW4_Shaded.js**: Material system, interaction handlers, physics
- **HW4_Geometry.js**: Geometry generation (Torus, Vase, Sphere)
- **mousy.js**: Mouse controls for camera

### Material System in JS

```javascript
// Each material button calls updateMaterialAndShading()
function updateMaterialAndShading(shadingModel) {
  // Calculate material products (material * light)
  ambientProduct = mult(lightAmbient, materialAmbient);
  diffuseProduct = mult(lightDiffuse, materialDiffuse);
  specularProduct = mult(lightSpecular, materialSpecular);
  
  // Upload to GPU
  gl.uniform4fv(..., flatten(ambientProduct));
  gl.uniform4fv(..., flatten(diffuseProduct));
  gl.uniform4fv(..., flatten(specularProduct));
  gl.uniform1f(..., materialShininess);
  
  // Set shading model (1=Phong, 0=Blinn-Phong)
  gl.uniform1i(..., shadingModel);
}
```

---

## 📊 Sample Learning Outcomes

After exploring this project, students should be able to:

✓ Explain the difference between Phong and Blinn-Phong shading
✓ Interpret material properties (RGB values) and their appearance
✓ Predict how changing shininess affects highlight appearance
✓ Understand why different materials need different shading models
✓ Recognize real-world materials by their lighting characteristics
✓ Debug shader code by observing visual results

---

## 🚀 Extension Ideas

1. **Add More Materials**
   - Glass (high specular, transparent)
   - Skin (complex multi-layer appearance)
   - Cloth (anisotropic specular)

2. **Enhance Shaders**
   - Normal mapping (texture-based surface detail)
   - Parallax mapping (depth-based surface offset)
   - Fresnel effect (angle-dependent reflectivity)

3. **Interactive Features**
   - Real-time material editor (RGB sliders)
   - Light color control
   - Multiple lights

4. **Advanced Concepts**
   - Physical-based rendering (PBR)
   - Image-based lighting
   - Shadow mapping

---

**Created for WebGL educational purposes**
*Last Updated: April 8, 2026*
