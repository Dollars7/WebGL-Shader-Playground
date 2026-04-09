# WebGL Shader Playground

一个实时着色器可视化工具，用于学习和演示 WebGL 光照模型。在交互式 3D 环境中探索不同的材质和光照效果。

## 快速开始

### 打开项目
1. 在浏览器中打开 `/shader-playground/index.html`
2. 应该看到一个金色的圆环体 (Torus) 在中央
3. 右边是参数控制面板

### 基本操作
- **鼠标拖拽** Canvas → 旋转模型  
- **鼠标滚轮** → 缩放模型  
- **调整滑块** → 实时改变光照、光泽度等参数  
- **点击按钮** → 切换着色器、几何体、投影方式  

---

## UI 布局

```
┌─────────────────────────────────────────────────┐
│  Shader Playground - Header                     │
└─────────────────────────────────────────────────┘
│                                  │               │
│      Canvas (1024×768)          │ Control Panel │
│      3D Model Display           │  (340px wide) │
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

## 功能模块

### 1️⃣ VIEW (投影与相机)

| 控制项 | 说明 |
|------|------|
| **Ortho / Perspective** | 正交 / 透视投影切换 |
| **Reset** | 重置相机到默认位置 |
| **Auto Rotate** | 0-100% 自动旋转速度 |

### 2️⃣ LIGHTING (光照控制)

| 控制项 | 范围 | 说明 |
|------|------|------|
| **Light Position** | Fixed / Eye-Track | 固定位置(3,4,4) 或跟随相机 |
| **Intensity** | 0-200% | 光照强度，影响亮度 |
| **Ambient** | 0-100% | 环境光比例，影响暗部 |

### 3️⃣ MATERIAL / SHADER (材质与着色器)

#### 🎨 Shader Preset
**主着色器：**
- `Phong` (-1) - 经典Phong光照模型

#### 📊 Form / Analysis (形式分析)
- `Clay` (0) - 纯漫反射，无高光
- `Normal` (1) - 法线可视化，用于调试
- `Wire` (2) - 线框叠加，显示几何细节

#### 💎 Material (材质模拟)
- `Ceramic` (3) - 陶瓷，中等高光
- `Pearl` (4) - 珍珠，强高光  
- `Chrome` (5) - 镜面，极强高光

#### ✨ Stylized (艺术化)
- `Fresnel` (6) - 菲涅尔边缘光
- `Toon` (7) - 卡通着色，离散颜色
- `Hologram` (8) - 全息效果，闪烁动画

#### 🌈 Material Colors
快速预设颜色：Gold, Red, Steel, Copper

**Shininess 滑块** → 1-200，控制高光锐度
- Matte (1) = 粗糙，无高光
- Mirror (200) = 镜面，尖锐高光

### 4️⃣ DISPLAY (显示设置)

| 控制项 | 选项 | 说明 |
|------|------|------|
| **Geometry** | Torus / Vase / Sphere | 3个几何体模型 |
| **Skybox** | nvlobby | 立方体贴图背景 |
| **Physics** | Start Drop | 启动物理下落动画 |

### 5️⃣ TECHNIQUE (技术信息)

实时显示当前参数组合：

```
shader=5 → #5 Chrome/Mirror
- intensity=120 → 光照强度 120%
- ambient=50 → 环境光 50%
- shininess=150 → 光泽度 150
- lightPos=1 → 跟随相机 (Eye-Track)
- projMode=1 → 透视投影 (Perspective)
```

**Keywords:** 关键词说明该着色器的特点

---

## 参数详解

### Shader 索引

| ID | 名称 | 用途 |
|----|------|------|
| -1 | Phong Illumination | 标准光照，学习基础 |
| 0 | Clay/Matte | 无光泽材质，调试漫反射 |
| 1 | Normal Visualization | 显示法线方向，调试法线问题 |
| 2 | Wire Overlay | 看几何细节，理解网格结构 |
| 3 | Ceramic/Semigloss | 光泽介于Clay和Pearl之间 |
| 4 | Pearl/Glossy | 高光泽，类似珠宝表面 |
| 5 | Chrome/Mirror | 镜面反射，极端高光 |
| 6 | Fresnel Rim | 边缘高亮，视角相关 |
| 7 | Toon Shading | 卡通风格，2色量化 |
| 8 | Hologram | 霓虹闪烁，时间动画 |

### Light Position

- **Fixed (3,4,4)** - 固定在右上方，常用
- **Eye-Track** - 跟随相机视角，实时变化，更逼真

### Projection

- **Orthographic** - 平行投影，无透视，工业风格
- **Perspective** - 透视投影，如人眼所见，更自然

---

## 常见用途

### 根据外观选择着色器

| 材质类型 | 推荐着色器 | 参数建议 |
|---------|----------|--------|
| 布料、皮肤 | Clay + 低Shininess | Shininess: 1-20 |
| 塑料制品 | Ceramic | Shininess: 30-60 |
| 陶瓷、瓷器 | Ceramic + Pearl | Shininess: 40-80 |
| 玻璃、珍珠 | Pearl | Shininess: 80-120 |
| 金属、镜子 | Chrome | Shininess: 150-200 |
| 调试网格 | Wire 或 Normal | - |

### 效果演示流程

1. **学习基础光照**  
   Shader: Phong → 调整 Intensity 和 Ambient 看效果

2. **理解高光**  
   Ceramic → Pearl → Chrome，观察 Shininess 变化

3. **特殊效果**  
   Fresnel (边缘光)、Toon (卡通)、Hologram (闪烁)

4. **不同几何体**  
   Torus (已调教) → Vase (更复杂) → Sphere (平滑)

---

## 交互技巧

### 鼠标控制
```
拖拽：旋转视角
滚轮向上：拉近相机
滚轮向下：拉远相机
```

### 参数实时反馈
- 所有滑块和按钮修改立即生效
- TECHNIQUE 区域实时显示当前参数值
- 没有加载时间，GPU 实时计算

### Skybox 背景
- 使用 nvlobby_new 立方体贴图
- 增强场景的环境真实感
- 固定背景，不随视角改变

---

## 技术细节

### 着色器实现
- **顶点着色器** - 计算顶点位置、法线、光照向量
- **片段着色器** - 10种不同的光照模型实现
  - Phong/Blinn-Phong
  - 纯漫反射
  - 法线可视化
  - 高光各种变体
  - 特殊效果（Fresnel、Toon 等）

### 材质系统
```
色彩 = 环境光 + 漫反射 + 高光
     = Ka·La + Kd·(N·L) + Ks·(N·H)^p
```
其中：
- Ka = 环境光系数
- Kd = 漫反射系数  
- Ks = 高光系数（根据 Material Colors 改变）
- p = 光泽度（Shininess）

### 立方体贴图
- 6个方向的纹理（上下左右前后）
- 模拟无限远的环境
- 增强光照真实感

---

## 浏览器兼容

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+

需要支持 **WebGL 1.0** 的浏览器

---

## 项目结构

```
WebGL-Shader-Playground/
├── shader-playground/
│   ├── index.html          ← 主页面
│   ├── app.js              ← 应用逻辑
│   ├── geometry.js         ← 几何体定义
│   └── assets/
├── lib/                    ← 工具库
│   ├── mousy.js            ← 鼠标控制
│   ├── skybox.js           ← 立方体贴图
│   └── skyboxAssets/       ← 贴图文件
├── Common/                 ← WebGL 工具函数
│   └── initShaders.js      ← 着色器初始化
├── README.md               ← 本文件
└── .git/                   ← 版本控制
```

---

## 学习资源

### WebGL 基础
- [WebGL 官方文档](https://www.khronos.org/webgl/)
- [WebGL Fundamentals](https://webglfundamentals.org/)

### 光照模型
- Phong Illumination - 经典光照模型
- Blinn-Phong - 改进版本，高光更自然
- PBR (Physics-Based Rendering) - 物理基础渲染

### 实践建议
1. 先理解 Phong 着色器的三个分量（环境、漫、高光）
2. 调整参数观察变化，建立直观理解
3. 用 Normal 着色器调试法线方向
4. 用 Wire 着色器理解几何结构

---

**更新日期**: 2026-04-08  
**版本**: 2.0  
**状态**: 生产就绪 ✅
