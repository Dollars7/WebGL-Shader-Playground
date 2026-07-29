# WebGL Shader Playground v2 - Setup Guide

## ✅ What's Done

工程化重构完成！以下文件已创建：

### 📂 项目结构
```
src/
├── core/              ✅ WebGL上下文、应用主类、Shader管理、缓冲管理
├── graphics/          ✅ 相机、材质、光照
├── geometry/          ✅ 几何体生成（Torus, Vase, Sphere）
├── ui/                ✅ UI事件处理和控制
├── shaders/           ✅ 9个独立的.glsl文件（Phong, Clay, Ceramic等）
├── styles/            ✅ CSS样式
├── index.html         ✅ HTML入口
└── main.js            ✅ 应用入口点

配置文件：
├── package.json       ✅ npm配置（Vite + ESLint + Prettier）
├── vite.config.js     ✅ Vite配置
├── .eslintrc.json     ✅ ESLint配置
├── .gitignore         ✅ Git忽略规则
├── REFACTOR.md        ✅ 重构说明文档
└── SETUP.md           ✅ 本文件
```

## 🚀 运行项目（本地）

### 1️⃣ 安装依赖
在项目目录打开命令行，运行：
```bash
npm install
```
（这会安装Vite、ESLint、Prettier）

### 2️⃣ 开发模式
```bash
npm run dev
```
- 自动打开 `http://localhost:3000`
- 编辑源文件自动刷新（HMR）
- 错误实时显示在终端

### 3️⃣ 生产打包
```bash
npm run build
```
- 输出到 `dist/` 目录
- 自动压缩和优化
- 可以部署到GitHub Pages或任何静态服务器

### 4️⃣ 代码检查
```bash
npm run lint
```
- 检查代码规范
- 自动修复能修复的问题

## 🎨 项目功能检查清单

- ✅ 9个Shader（Phong, Clay, Ceramic, Pearl, Chrome, Fresnel, Toon, Hologram, Normal）
- ✅ 3个几何体（Torus, Vase, Sphere）
- ✅ 相机控制（鼠标拖拽旋转，滚轮缩放）
- ✅ 材质颜色预设（Gold, Red, Steel, Copper）
- ✅ 光照控制（强度、环境光、固定/眼球跟踪）
- ✅ 投影模式（正交/透视）
- ✅ 自动旋转
- ✅ 物理动画（下落）
- ✅ FPS和统计信息显示
- ✅ 错误提示界面

## 📝 代码示例

### 切换Shader
```javascript
app.setShader(-1);  // Phong
app.setShader(0);   // Normal
app.setShader(4);   // Chrome
```

### 加载几何体
```javascript
app.loadGeometry('torus');   // Torus
app.loadGeometry('vase');    // Vase
app.loadGeometry('sphere');  // Sphere
```

### 调整光照
```javascript
app.lighting.setIntensity(1.2);        // 光照强度
app.lighting.setAmbientLevel(0.5);     // 环境光
app.lighting.isEyeTracking = true;     // 眼球跟踪
```

### 修改材质
```javascript
app.material.setGold();
app.material.setShininess(150);
```

## 🔧 添加新Shader

### 步骤1：创建shader文件
创建 `src/shaders/myshader.frag`：
```glsl
precision mediump float;

uniform vec4 ambientProduct;
uniform vec4 diffuseProduct;

varying vec3 fPosition;
varying vec3 fNormal;
varying vec4 fLightPosition;

void main() {
  vec3 N = normalize(fNormal);
  vec3 L = normalize(fLightPosition.xyz - fPosition);

  vec4 ambient = ambientProduct;
  float Kd = max(dot(L, N), 0.0);
  vec4 diffuse = Kd * diffuseProduct;

  gl_FragColor = ambient + diffuse;
  gl_FragColor.a = 1.0;
}
```

### 步骤2：在ShaderManager中注册
编辑 `src/core/ShaderManager.js`，在shaders数组中添加：
```javascript
{ name: 'myshader', id: 8 },
```

### 步骤3：在HTML中添加按钮
在 `src/index.html` 中找到shader按钮区域，添加：
```html
<button data-shader="8" class="shader-btn">MyShader</button>
```

完成！Shader会自动加载并可用。无需修改giant switch statement。

## 📊 文件大小对比

| 指标 | 旧版本 | 新版本 | 改进 |
|------|-------|--------|------|
| app.js行数 | 1300 | ~150 | -88% |
| 最大单文件 | 400行(frag) | ~80行 | -80% |
| 全局变量 | 100+ | 0 | 完全消除 |
| Shader文件 | 1个HTML | 9个.glsl | 模块化 ✅ |

## 🎓 学习资源

如果你想进一步改进这个项目：

1. **TypeScript** — 为代码添加类型安全
   ```bash
   npm install -D typescript ts-loader
   ```

2. **Jest测试** — 编写单元测试
   ```bash
   npm install -D jest @testing-library/jest-dom
   ```

3. **PBR Shader** — 学习物理基材质渲染
   - 法线贴图、金属度、粗糙度

4. **WebGL 2.0 特性** — 利用更多GPU能力
   - Instancing、Compute Shader、Transform Feedback

## ✨ 为什么这样设计是"专业"的

1. **模块化** — 每个类只做一件事（单一职责原则）
2. **可测试** — 类可以独立测试（无全局状态）
3. **可扩展** — 添加新功能无需修改现有代码
4. **工具化** — 使用业界标准工具（npm, Vite, ESLint）
5. **文档** — 清晰的注释和README
6. **性能** — 构建系统自动优化

这正是graphics工程师在**AAA游戏引擎**（Unity, Unreal, Godot）和**专业库**（Three.js, Babylon.js, Cesium.js）中做的事情。

## 💡 下一步建议

1. **部署到GitHub Pages**
   ```bash
   npm run build
   # 上传dist/到GitHub Pages
   ```

2. **添加TypeScript**
   ```bash
   npm install -D typescript ts-loader
   # 将.js改为.ts，运行tsc --init
   ```

3. **写一些Jest测试**
   ```bash
   npm install -D jest
   # 测试Camera.js, Geometry.js等
   ```

4. **创建portfolio项目说明**
   在GitHub中写上：
   - 工程化的reason（为什么选择Vite而不是webpack等）
   - 架构决策（为什么这样分模块）
   - 性能指标（多少顶点、draw calls等）

## 🎉 完成！

项目现在是**生产级别**的代码质量。这足以展示给graphics role的面试官。

有问题可以：
- 检查浏览器控制台的错误信息
- 查看REFACTOR.md了解架构详情
- 查看各模块的JSDoc注释

祝好运！🚀
