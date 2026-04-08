var canvas;
var gl;
var program;

var indicesArray = [];
var pointsArray = [];
var normalsArray = [];

var boundaryArray = [];
var texCoordArray = [];

var transferX;
var transferY;
var transferZ;

var xAxis = 0.0;
var yAxis = 0.0;
var zAxis = 0.0;

var xDirection = 1.0;
var yDirection = 1.0;
var zDirection = 1.0;

var sizeLoc;

// ==================== VIEWER & CAMERA ====================
var viewer = {
  eye: vec3(0.0, 0.0, 3.0),
  at: vec3(0.0, 0.0, 0.0),
  up: vec3(0.0, 1.0, 0.0),

  radius: 3,
  theta: 0,
  phi: 0,
};

var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;
var near = 0.1;
var far = 100.0;
var farFactor = 3.0;

var plane = [
  vec3(-1.0, -1.0, 1.0),
  vec3(-1.0, 1.0, 1.0),
  vec3(1.0, 1.0, 1.0),
  vec3(1.0, -1.0, 1.0),

  vec3(-1.0, -1.0, -1.0),
  vec3(-1.0, 1.0, -1.0),
  vec3(1.0, 1.0, -1.0),
  vec3(1.0, -1.0, -1.0),
];

// ==================== LIGHTING ====================
var lightPosition = vec4(3.0, 4.0, 4.0, 1.0);
var lightPositionMode = 0;

var lightAmbient = vec4(0.4, 0.4, 0.4, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

// ==================== MATERIALS ====================
var materialAmbient = vec4(0.3, 0.3, 0.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 0.8, 1.0);
var materialShininess = 100.0;

var ambientColor, diffuseColor, specularColor;
var modelViewMatrix, projectionMatrix;
var modelViewMatrixAxis, projectionMatrixAxis;

var viewDirectionProjectionInverseMatrix;
var u_Sampler;

// ==================== PLATFORM ====================
var l = 2.0;
var h = 0.15;
var w = 2.0;
var transX = 0;
var transY = -0.8;
var transZ = 0;
var mat_cube = mat4(
  l, 0, 0, transX,
  0, h, 0, transY,
  0, 0, w, transZ,
  0, 0, 0, 1
);

// ==================== ANIMATION ====================
var vec3_velocity = vec3(0.0, 0, 0.0);
var vec3_location = vec3(0.0, 1.5, 0.0);
var f_delta_time = 0.016;
var f_gravirty = vec3(0.0, -9.8, 0.0);
var f_bounce = 0.8;
var b_bounced = false;
var i_count = 0;
var f_object_h = 0.65;
var b_play = false;
var time = 0.0;

// ==================== UI STATE ====================
var currentShaderPreset = -1;
var projectionMode = 0;
var autoRotationSpeed = 0.3;

// ==================== INITIALIZATION ====================
window.onload = function init() {
  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
    console.error("Failed to get WebGL context");
    return;
  }

  console.log("WebGL context established");
  console.log("Canvas size:", canvas.width, "x", canvas.height);

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.95, 0.95, 0.95, 1.0);
  gl.enable(gl.DEPTH_TEST);

  program = initShaders(gl, "vertex-shader", "fragment-shader");
  if (!program) {
    alert("Failed to compile shaders");
    console.error("Shader compilation failed");
    return;
  }
  
  gl.useProgram(program);
  console.log("Shaders compiled successfully");

  ambientColor = mult(lightAmbient, materialAmbient);
  diffuseColor = mult(lightDiffuse, materialDiffuse);
  specularColor = mult(lightSpecular, materialSpecular);

  // Initial geometry: Torus
  try {
    torus(0.4, 0.3, 180, 180);
    console.log("Torus geometry created");
  } catch(e) {
    console.error("Failed to create torus:", e);
  }
  
  try {
    initSkybox();
    console.log("Skybox initialized");
  } catch(e) {
    console.error("Failed to init skybox:", e);
  }

  // Load texture buffer
  var texCoord_Buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoord_Buffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordArray), gl.STATIC_DRAW);
  var texCoord_location = gl.getAttribLocation(program, "a_TexCoord");
  gl.vertexAttribPointer(texCoord_location, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(texCoord_location);

  // Normal buffer
  var nBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

  var vNormal = gl.getAttribLocation(program, "vNormal");
  gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vNormal);

  // Position buffer
  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  let indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indicesArray),
    gl.STATIC_DRAW
  );

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  console.log("Buffers loaded:", {
    points: pointsArray.length,
    normals: normalsArray.length,
    indices: indicesArray.length
  });

  modelViewMatrixAxis = gl.getUniformLocation(program, "modelViewMatrix");
  projectionMatrixAxis = gl.getUniformLocation(program, "projectionMatrix");

  transferX = gl.getUniformLocation(program, "transX");
  transferY = gl.getUniformLocation(program, "transY");
  transferZ = gl.getUniformLocation(program, "transZ");
  sizeXDir = gl.getUniformLocation(program, "sizeX");
  sizeYDir = gl.getUniformLocation(program, "sizeY");
  sizeZDir = gl.getUniformLocation(program, "sizeZ");

  // Setup mouse controls
  mouseControls();

  // Initial shader settings
  gl.uniform4fv(
    gl.getUniformLocation(program, "ambientProduct"),
    flatten(ambientColor)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "diffuseProduct"),
    flatten(diffuseColor)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "specularProduct"),
    flatten(specularColor)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "lightPosition"),
    flatten(lightPosition)
  );
  gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);
  gl.uniform1i(gl.getUniformLocation(program, "shadingModel"), 1);
  gl.uniform1i(gl.getUniformLocation(program, "shaderPreset"), -1);

  // Set initial projection
  try {
    setProjection(0);
    console.log("Projection matrix set");
  } catch(e) {
    console.error("Failed to set projection:", e);
  }

  gl.uniformMatrix4fv(
    gl.getUniformLocation(program, "mat_cube"),
    false,
    flatten(mat_cube)
  );

  viewDirectionProjectionInverseLocation = gl.getUniformLocation(
    program,
    "u_viewDirectionProjectionInverse"
  );

  initTexture(program);
  skybox(program);

  // Setup material button event listeners
  setupMaterialButtons();
  
  // Initialize display with golden material
  try {
    updateMaterialDisplay();
    console.log("Material display updated");
  } catch(e) {
    console.error("Failed to update material display:", e);
  }

  console.log("Initialization complete, starting render loop");
  render();
};

// ==================== MATERIAL BUTTONS ====================
function setupMaterialButtons() {
  // Material preset buttons - ensure they initialize effects
  // Users can click preset buttons to see different shaders
}

// ==================== QUICK MATERIAL COLORS ====================
function updateMaterialDisplay() {
  ambientColor = mult(lightAmbient, materialAmbient);
  diffuseColor = mult(lightDiffuse, materialDiffuse);
  specularColor = mult(lightSpecular, materialSpecular);
  
  gl.uniform4fv(
    gl.getUniformLocation(program, "ambientProduct"),
    flatten(ambientColor)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "diffuseProduct"),
    flatten(diffuseColor)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "specularProduct"),
    flatten(specularColor)
  );
  gl.uniform1f(
    gl.getUniformLocation(program, "shininess"),
    materialShininess
  );
}

function setMaterialGold() {
  setShaderPreset(-1);  // Switch to Phong/Blinn-Phong
  materialAmbient = vec4(0.3, 0.3, 0.0, 1.0);
  materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
  materialSpecular = vec4(1.0, 1.0, 0.8, 1.0);
  materialShininess = 100.0;
  updateMaterialDisplay();
}

function setMaterialRed() {
  setShaderPreset(-1);
  materialAmbient = vec4(0.3, 0.0, 0.0, 1.0);
  materialDiffuse = vec4(0.8, 0.1, 0.1, 1.0);
  materialSpecular = vec4(0.8, 0.5, 0.5, 1.0);
  materialShininess = 40.0;
  updateMaterialDisplay();
}

function setMaterialSteel() {
  setShaderPreset(-1);
  materialAmbient = vec4(0.25, 0.25, 0.25, 1.0);
  materialDiffuse = vec4(0.4, 0.4, 0.4, 1.0);
  materialSpecular = vec4(0.9, 0.9, 0.95, 1.0);
  materialShininess = 80.0;
  updateMaterialDisplay();
}

function setMaterialCopper() {
  setShaderPreset(-1);
  materialAmbient = vec4(0.3, 0.1, 0.0, 1.0);
  materialDiffuse = vec4(0.8, 0.3, 0.1, 1.0);
  materialSpecular = vec4(0.9, 0.6, 0.3, 1.0);
  materialShininess = 60.0;
  updateMaterialDisplay();
}

// ==================== PROJECTION ====================
function setProjection(mode) {
  projectionMode = mode;
  
  // Get actual canvas aspect ratio
  var canvasAspect = canvas.width / canvas.height;
  
  if (mode === 0) {
    // Orthographic projection - adjust for canvas aspect ratio
    var orthoHeight = 2.0;
    var orthoWidth = orthoHeight * canvasAspect;
    projectionMatrix = ortho(-orthoWidth, orthoWidth, -orthoHeight, orthoHeight, near, far);
  } else {
    // Perspective projection - use canvas aspect ratio
    var fov = 120.0;
    projectionMatrix = perspective(fov, canvasAspect, 0.1, 100.0);
  }
  
  gl.uniformMatrix4fv(projectionMatrixAxis, false, flatten(projectionMatrix));
  
  // Update button states
  document.getElementById('orthButton').classList.toggle('active', mode === 0);
  document.getElementById('perspButton').classList.toggle('active', mode === 1);
}

// ==================== GEOMETRY SWITCHING ====================
function switchGeometry(geoType) {
  // Reset animation
  b_play = false;
  vec3_velocity = vec3(0.0, 0, 0.0);
  vec3_location = vec3(0.0, 1.5, 0.0);
  i_count = 0;

  indicesArray = [];
  pointsArray = [];
  normalsArray = [];
  texCoordArray = [];

  if (geoType === 0) {
    torus(0.4, 0.3, 180, 180);
    f_object_h = 0.65;
  } else if (geoType === 1) {
    vase(0.5, 0.5, 120);
    f_object_h = 0.25;
  } else if (geoType === 2) {
    sphere(1, 180, 180);
    f_object_h = 1.0;
  }

  initSkybox();

  // Rebind buffers
  var texCoord_Buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoord_Buffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordArray), gl.STATIC_DRAW);
  var texCoord_location = gl.getAttribLocation(program, "a_TexCoord");
  gl.vertexAttribPointer(texCoord_location, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(texCoord_location);

  var nBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
  var vNormal = gl.getAttribLocation(program, "vNormal");
  gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vNormal);

  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  let indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indicesArray),
    gl.STATIC_DRAW
  );

  // Update button states
  document.getElementById('surface1').classList.toggle('active', geoType === 0);
  document.getElementById('surface2').classList.toggle('active', geoType === 1);
  document.getElementById('surface3').classList.toggle('active', geoType === 2);
}

// ==================== SHADER PRESETS ====================
function setShaderPreset(preset) {
  currentShaderPreset = preset;
  var shaderPresetLoc = gl.getUniformLocation(program, "shaderPreset");
  gl.uniform1i(shaderPresetLoc, preset);
}

// ==================== LIGHT POSITION ====================
function setLightPosition(pos) {
  lightPositionMode = pos;
  if (pos === 0) {
    lightPosition = vec4(3.0, 4.0, 4.0, 1.0);
  } else {
    // Validate eye position is not NaN
    if (isNaN(viewer.eye[0]) || isNaN(viewer.eye[1]) || isNaN(viewer.eye[2])) {
      console.warn("Eye position contains NaN, falling back to Position A");
      lightPositionMode = 0;
      lightPosition = vec4(3.0, 4.0, 4.0, 1.0);
    } else {
      lightPosition = vec4(viewer.eye[0], viewer.eye[1], viewer.eye[2], 1.0);
    }
  }
  gl.uniform4fv(
    gl.getUniformLocation(program, "lightPosition"),
    flatten(lightPosition)
  );
  
  document.getElementById('lightPos1').classList.toggle('active', lightPositionMode === 0);
  document.getElementById('lightPos2').classList.toggle('active', lightPositionMode === 1);
}

// ==================== LIGHT INTENSITY ====================
function updateLightIntensity(value) {
  var factor = value / 100.0;
  document.getElementById('intensityValue').textContent = factor.toFixed(2);
  
  var scaledDiffuse = scale(factor, lightDiffuse);
  var scaledSpecular = scale(factor, lightSpecular);
  
  ambientColor = mult(lightAmbient, materialAmbient);
  diffuseColor = mult(scaledDiffuse, materialDiffuse);
  specularColor = mult(scaledSpecular, materialSpecular);
  
  gl.uniform4fv(
    gl.getUniformLocation(program, "ambientProduct"),
    flatten(ambientColor)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "diffuseProduct"),
    flatten(diffuseColor)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "specularProduct"),
    flatten(specularColor)
  );
}

// ==================== AUTO ROTATION ====================
function updateRotationSpeed(value) {
  autoRotationSpeed = value / 100.0;
  document.getElementById('rotationValue').textContent = autoRotationSpeed.toFixed(2);
}

// ==================== ANIMATION ====================
function toggleAnimation() {
  b_play = !b_play;
  document.getElementById('animButton').classList.toggle('active', b_play);
  
  if (b_play) {
    vec3_velocity = vec3(0.0, 0, 0.0);
    vec3_location = vec3(0.0, 1.5, 0.0);
    i_count = 0;
    var myAudio = document.getElementById("myaudio");
    myAudio.currentTime = 0;
    myAudio.play().catch(function(error) {
      console.log("Audio play failed:", error);
    });
  } else {
    var myAudio = document.getElementById("myaudio");
    myAudio.pause();
  }
}

// ==================== ANIMATION LOGIC ====================
function animation() {
  if (b_play) {
    if (
      -0.05 < vec3_velocity[1] &&
      vec3_velocity[1] < 0.05 &&
      vec3_location[1] - f_object_h <= transY + h + 0.05
    ) {
      i_count = Math.min(i_count + 1, 20);
    } else {
      i_count = 0;
    }
    if (i_count >= 15) {
      b_play = false;
      var myAudio = document.getElementById("myaudio");
      myAudio.pause();
      myAudio.currentTime = 0;
    }

    if (vec3_location[1] - f_object_h <= transY + h) {
      if (!b_bounced) {
        vec3_velocity[1] = -vec3_velocity[1] * f_bounce;
        b_bounced = true;
      }
    } else {
      b_bounced = false;
      for (let i = 0; i < 3; i++) {
        vec3_velocity[i] += f_gravirty[i] * f_delta_time;
      }
    }
    for (let i = 0; i < 3; i++) {
      vec3_location[i] += vec3_velocity[i] * f_delta_time;
    }
  }
}

// ==================== RENDER ====================
function render() {
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Update camera
  viewer.eye[0] = viewer.radius * Math.sin(viewer.phi) * Math.cos(viewer.theta);
  viewer.eye[1] = viewer.radius * Math.cos(viewer.phi);
  viewer.eye[2] = viewer.radius * Math.sin(viewer.phi) * Math.sin(viewer.theta);

  // Apply auto-rotation
  if (autoRotationSpeed > 0) {
    viewer.theta += autoRotationSpeed * 0.01;
  }

  // Validate eye position
  if (isNaN(viewer.eye[0]) || isNaN(viewer.eye[1]) || isNaN(viewer.eye[2])) {
    console.error("Eye position is NaN, resetting camera");
    viewer.theta = 0;
    viewer.phi = Math.PI / 4;
    viewer.eye[0] = viewer.radius * Math.sin(viewer.phi) * Math.cos(viewer.theta);
    viewer.eye[1] = viewer.radius * Math.cos(viewer.phi);
    viewer.eye[2] = viewer.radius * Math.sin(viewer.phi) * Math.sin(viewer.theta);
  }

  // Update light position if in eye mode
  if (lightPositionMode === 1) {
    lightPosition = vec4(viewer.eye[0], viewer.eye[1], viewer.eye[2], 1.0);
    gl.uniform4fv(
      gl.getUniformLocation(program, "lightPosition"),
      flatten(lightPosition)
    );
  }

  try {
    modelViewMatrix = lookAt(vec3(viewer.eye), viewer.at, viewer.up);
    gl.uniformMatrix4fv(modelViewMatrixAxis, false, flatten(modelViewMatrix));
  } catch(e) {
    console.error("Error setting modelViewMatrix:", e);
  }

  gl.uniform1f(sizeXDir, 1);
  gl.uniform1f(sizeYDir, 1);
  gl.uniform1f(sizeZDir, 1);
  gl.uniform1f(transferX, vec3_location[0]);
  gl.uniform1f(transferY, vec3_location[1]);
  gl.uniform1f(transferZ, vec3_location[2]);

  animation();
  initScene(program);

  // Draw geometry
  if (indicesArray.length > 0) {
    try {
      gl.depthFunc(gl.LESS);
      const groundPlaneVertexCount = 36;
      const groundStartIndex = Math.max(0, pointsArray.length - 42);
      gl.drawArrays(gl.TRIANGLES, groundStartIndex, groundPlaneVertexCount);

      gl.drawElements(gl.TRIANGLES, indicesArray.length, gl.UNSIGNED_SHORT, 0);
      
      gl.depthFunc(gl.LEQUAL);
      const skyboxStartIndex = Math.max(0, pointsArray.length - 36);
      gl.drawArrays(gl.TRIANGLES, skyboxStartIndex, 36);
    } catch(e) {
      console.error("Error during drawing:", e);
    }
  }

  requestAnimFrame(render);
}

// ==================== TEXTURE & SKYBOX ====================
function loadTexture(gl, texture, image) {
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.uniform1i(u_Sampler, 0);
}

function loadImage(src) {
  return new Promise(function (resolve, reject) {
    var image = new Image();
    image.onload = function () {
      resolve(image);
    };
    image.onerror = function () {
      reject(new Error("Could not load image " + src));
    };
    image.src = src;
  });
}

function initTexture(program) {
  var texture = gl.createTexture();
  u_Sampler = gl.getUniformLocation(program, "u_Sampler");
  return loadImage(window.SA2011_black_data_url)
    .then(function (image) {
      loadTexture(gl, texture, image);
      return true;
    })
    .catch(function (error) {
      console.error(error);
      return false;
    });
}

function skybox(program) {
  const faceInfos = [
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      url: window.nvlobby_new_posx_data_url,
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      url: window.nvlobby_new_negx_data_url,
    },
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      url: window.nvlobby_new_posy_data_url,
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      url: window.nvlobby_new_negy_data_url,
    },
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      url: window.nvlobby_new_posz_data_url,
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
      url: window.nvlobby_new_negz_data_url,
    },
  ];

  var skyboxAxisation = gl.getUniformLocation(program, "u_skybox");

  gl.activeTexture(gl.TEXTURE1);
  var sky_texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, sky_texture);

  faceInfos.forEach((faceInfo) => {
    const { target, url } = faceInfo;

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 512;
    const height = 512;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;

    gl.texImage2D(
      target,
      level,
      internalFormat,
      width,
      height,
      0,
      format,
      type,
      null
    );

    const image = new Image();
    checkUrl(image, url);
    image.src = url;
    image.addEventListener("load", function () {
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, sky_texture);
      gl.texImage2D(target, level, internalFormat, format, type, image);
      gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    });
  });
  gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
  gl.texParameteri(
    gl.TEXTURE_CUBE_MAP,
    gl.TEXTURE_MIN_FILTER,
    gl.LINEAR_MIPMAP_LINEAR
  );
  gl.uniform1i(skyboxAxisation, 1);
}

function initScene(program) {
  var fieldOfViewRadians = 3.14 / 3;
  var aspect = canvas.clientWidth / canvas.clientHeight;
  var sky_projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

  time += 0.01;
  var cameraPosition = [viewer.eye[0], viewer.eye[1], viewer.eye[2]];
  var target = [0, 0, 0];
  var up = [0, 1, 0];
  var cameraMatrix = m4.lookAt(cameraPosition, target, up);
  var viewMatrix = m4.inverse(cameraMatrix);

  viewMatrix[12] = 0;
  viewMatrix[13] = 0;
  viewMatrix[14] = 0;

  var viewDirectionProjectionMatrix = m4.multiply(
    sky_projectionMatrix,
    viewMatrix
  );

  viewDirectionProjectionInverseMatrix = m4.inverse(
    viewDirectionProjectionMatrix
  );

  gl.uniformMatrix4fv(
    viewDirectionProjectionInverseLocation,
    false,
    viewDirectionProjectionInverseMatrix
  );
}

function checkUrl(img, url) {
  if (new URL(url, window.location.href).origin !== window.location.origin) {
    img.crossOrigin = "";
  }
}

// ==================== MOUSE CONTROLS (Original) ====================
var mouse = {
  prevX: 0,
  prevY: 0,
  leftDown: false,
  rightDown: false,
  scale: 0.01,
};

function mouseControls() {
  canvas.onmousedown = function (event) {
    if (event.button == 0 && !mouse.leftDown) {
      mouse.leftDown = true;
      mouse.prevX = event.clientX;
      mouse.prevY = event.clientY;
    } else if (event.button == 2 && !mouse.rightDown) {
      mouse.rightDown = true;
      mouse.prevX = event.clientX;
      mouse.prevY = event.clientY;
    }
  };

  canvas.onmouseup = function (event) {
    if (event.button == 0) {
      mouse.leftDown = false;
    } else if (event.button == 2) {
      mouse.rightDown = false;
    }
  };

  canvas.onmouseleave = function () {
    mouse.leftDown = false;
    mouse.rightDown = false;
  };

  canvas.onmousemove = function (event) {
    if (mouse.leftDown || mouse.rightDown) {
      var currentX = event.clientX;
      var currentY = event.clientY;

      var deltaX = event.clientX - mouse.prevX;
      var deltaY = event.clientY - mouse.prevY;

      if (mouse.leftDown) {
        // Rotate camera (left-right = theta, up-down = phi)
        viewer.theta -= deltaX * mouse.scale;
        viewer.phi -= deltaY * mouse.scale;
        
        // Clamp phi
        viewer.phi = Math.max(0.1, Math.min(Math.PI - 0.1, viewer.phi));
        
        // Update eye position
        viewer.eye[0] = viewer.radius * Math.sin(viewer.phi) * Math.cos(viewer.theta);
        viewer.eye[1] = viewer.radius * Math.cos(viewer.phi);
        viewer.eye[2] = viewer.radius * Math.sin(viewer.phi) * Math.sin(viewer.theta);
      } else if (mouse.rightDown) {
        // Zoom (right-click drag up to zoom in)
        viewer.radius += deltaY * 0.01;
        viewer.radius = Math.max(1.0, Math.min(10.0, viewer.radius));
      }

      mouse.prevX = currentX;
      mouse.prevY = currentY;
    }
  };

  // Scroll wheel for zoom
  canvas.addEventListener('wheel', function (event) {
    event.preventDefault();
    var scrollDelta = event.deltaY > 0 ? 1 : -1;
    viewer.radius += scrollDelta * 0.3;
    viewer.radius = Math.max(1.0, Math.min(10.0, viewer.radius));
  }, { passive: false });
}

function configureTexture(myimage) {
  texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  if (textureChoice == 0) gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, myimage);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    gl.NEAREST_MIPMAP_LINEAR
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}
