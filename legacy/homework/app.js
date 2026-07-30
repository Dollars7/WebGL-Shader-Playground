var canvas;
var gl;
var program; // shader program

// shape definition
var indicesArray = [];
var pointsArray = [];
var normalsArray = [];

var boundaryArray = [];
var texCoordArray = [];

// movement variables
var transferX;
var transferY;
var transferZ;

var xAxis = 0.0;
var yAxis = 0.0;
var zAxis = 0.0;

// var speedX = -0.003;
// var speedY = -0.004;
// var speedZ = 0.005;

// morphs variables
var xDirection = 1.0;
var yDirection = 1.0;
var zDirection = 1.0;

// size variable
var sizeLoc;

// eye location and parameters to move
var viewer = {
  eye: vec3(0.0, 0.0, 3.0),
  at: vec3(0.0, 0.0, 0.0),
  up: vec3(0.0, 1.0, 0.0),

  // for moving around object; set vals so at origin
  radius: 3,
  theta: 0,
  phi: 0,
};

// ortho box
var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;
var near = 0.01;
var farFactor = 3.0;
var far = viewer.radius * farFactor;

// Create a ground “plane” on which the surface/object sits
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

// Light position in eye coordinates
// Position: (3, 4, 4) provides good 3D depth and balanced lighting
var lightPosition = vec4(3.0, 4.0, 4.0, 1.0);

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

// gold-yellow material
var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
var materialShininess = 100.0;
// red material; try changing light color
/*
var materialAmbient = vec4( 1.0, 0.0, 0.0, 1.0 );
var materialDiffuse = vec4( 0.3, 0.0, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 0.0, 0.0, 1.0 );
var materialShininess = 10.0; 
*/

var ambientColor, diffuseColor, specularColor;
var modelViewMatrix, projectionMatrix;
var modelViewMatrixAxis, projectionMatrixAxis;
//////
var viewDirectionProjectionInverseMatrix;
var u_Sampler;

var l = 2.0;
var h = 0.15;  // Platform thickness - adjusted for better alignment
var w = 2.0;
var transX = 0;
var transY = -0.8;  // Platform center Y - adjusted so top surface at y = transY + h ≈ -0.65
var transZ = 0;
var mat_cube = mat4(
  l,
  0,
  0,
  transX,
  0,
  h,
  0,
  transY,
  0,
  0,
  w,
  transZ,
  0,
  0,
  0,
  1
);

//animation variables
// Initial drop position - models will fall from y=1.5 to platform at y≈-0.65
var vec3_velocity = vec3(0.0, 0, 0.0);
var vec3_location = vec3(0.0, 1.5, 0.0);  // Drop start height
var f_delta_time = 0.016;  // Physics time step
var f_gravirty = vec3(0.0, -9.8, 0.0);  // Standard gravity
var f_bounce = 0.8;  // Energy loss on bounce (0.8 = 80% retained)
var b_bounced = false;  // Tracks if bounce occurred this frame
var i_count = 0;  // Counter for settling detection (15 frames = settled)
var f_object_h = 0.65;  // Default: distance from center to bottom (updated per model)
var b_play = false;
var time = 0.0;
// ==================== run program

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  // gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clearColor(0.94, 0.94, 0.94, 1.0);
  gl.enable(gl.DEPTH_TEST);

  //
  //  Load shaders and initialize attribute buffers
  //
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  ambientProduct = mult(lightAmbient, materialAmbient);
  diffuseProduct = mult(lightDiffuse, materialDiffuse);
  specularProduct = mult(lightSpecular, materialSpecular);
  //debug******************************************************
  // console.log("ambient product = ", ambientProduct);
  // console.log("diffuse product = ", diffuseProduct);
  // console.log("specular product = ", specularProduct);
  //   // load the light
  //   var l3d = vec3(lightPosition[0], lightPosition[1], lightPosition[2]);
  //   pointsArray.push(l3d);
  //   // not used, but size should match points
  //   normalsArray.push(1.0, 0.0, 0.0);

  // console.log("normals[1] = ", normalsArray[1]);
  // console.log("points[1] = ", pointsArray[1]);
  //debug******************************************************

  torus(0.4, 0.3, 180, 180);

  // load the skybox
  initSkybox();

  // Initial light location display
  updateLightLocationDisplay = function() {
    document.getElementById("lightLocation").innerHTML =
      "Light = (" +
      lightPosition[0].toFixed(2) +
      ", " +
      lightPosition[1].toFixed(2) +
      ", " +
      lightPosition[2].toFixed(2) +
      ")";
  };
  updateLightLocationDisplay();

  // load the texture buffer
  var texCoord_Buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoord_Buffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordArray), gl.STATIC_DRAW);
  var texCoord_location = gl.getAttribLocation(program, "a_TexCoord");
  gl.vertexAttribPointer(texCoord_location, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(texCoord_location);

  // general buffer
  var nBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

  var vNormal = gl.getAttribLocation(program, "vNormal");
  gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vNormal);

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

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  modelViewMatrixAxis = gl.getUniformLocation(program, "modelViewMatrix");
  projectionMatrixAxis = gl.getUniformLocation(program, "projectionMatrix");

  transferX = gl.getUniformLocation(program, "transX");
  transferY = gl.getUniformLocation(program, "transY");
  transferZ = gl.getUniformLocation(program, "transZ");
  sizeXDir = gl.getUniformLocation(program, "sizeX");
  sizeYDir = gl.getUniformLocation(program, "sizeY");
  sizeZDir = gl.getUniformLocation(program, "sizeZ");

  // define mouse event listeners
  mouseControls();

  // ============================================
  // Light Position Control
  // ============================================
  document.getElementById("lightPositionButton1").onclick = function () {
    // Position A: 45-degree angle for balanced 3D lighting
    lightPosition = vec4(3.0, 4.0, 4.0, 1.0);
    gl.uniform4fv(
      gl.getUniformLocation(program, "lightPosition"),
      flatten(lightPosition)
    );
    updateLightLocationDisplay();
  };
  
  document.getElementById("lightPositionButton2").onclick = function () {
    // Position B: At camera (eye-space lighting)
    lightPosition = vec4(viewer.eye[0], viewer.eye[1], viewer.eye[2], 1.0);
    gl.uniform4fv(
      gl.getUniformLocation(program, "lightPosition"),
      flatten(lightPosition)
    );
    updateLightLocationDisplay();
  };
  
  // Helper function to update light display
  function updateLightLocationDisplay() {
    document.getElementById("lightLocation").innerHTML =
      "Light = (" +
      lightPosition[0].toFixed(2) +
      ", " +
      lightPosition[1].toFixed(2) +
      ", " +
      lightPosition[2].toFixed(2) +
      ")";
  }

  // light material interaction
  // Shading shading
  // ============================================
  // Material 1: Polished Gold (Phong Shading)
  // High specular for mirror-like reflections
  // ============================================
  document.getElementById("material1").onclick = function () {
    // Polished gold material - highly reflective
    materialAmbient = vec4(0.3, 0.3, 0.0, 1.0);     // Dark ambient base
    materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);     // Gold diffuse
    materialSpecular = vec4(1.0, 1.0, 0.8, 1.0);    // Bright specular (glossy)
    materialShininess = 128.0;                      // Very sharp highlights
    
    updateMaterialAndShading(1);  // Phong shading
  };
  
  // ============================================
  // Material 2: Matte Red (Blinn-Phong Shading)
  // Lower specular for diffuse appearance
  // ============================================
  document.getElementById("material2").onclick = function () {
    // Matte red material - rough surface
    materialAmbient = vec4(0.3, 0.0, 0.0, 1.0);     // Dark red ambient
    materialDiffuse = vec4(0.8, 0.1, 0.1, 1.0);     // Deep red diffuse
    materialSpecular = vec4(0.4, 0.3, 0.3, 1.0);    // Dull specular (matte)
    materialShininess = 16.0;                       // Broad, soft highlights
    
    updateMaterialAndShading(0);  // Blinn-Phong shading
  };

  // ============================================
  // Material 3: Brushed Steel (Phong Shading)
  // Medium specular for industrial look
  // ============================================
  document.getElementById("lightColor1").onclick = function () {
    // Brushed steel material
    materialAmbient = vec4(0.3, 0.3, 0.35, 1.0);    // Gray-blue ambient
    materialDiffuse = vec4(0.7, 0.7, 0.75, 1.0);    // Light gray diffuse
    materialSpecular = vec4(0.8, 0.8, 0.9, 1.0);    // Bright silver specular
    materialShininess = 64.0;                       // Medium-sharp highlights
    
    updateMaterialAndShading(1);  // Phong shading
  };

  // ============================================
  // Material 4: Ceramic/Plastic (Blinn-Phong Shading)
  // Smooth but non-metallic surface
  // ============================================
  document.getElementById("lightColor2").onclick = function () {
    // Ceramic/plastic material - smooth matte
    materialAmbient = vec4(0.2, 0.2, 0.2, 1.0);    // Dark ambient
    materialDiffuse = vec4(0.7, 0.5, 0.2, 1.0);    // Warm brown diffuse
    materialSpecular = vec4(0.5, 0.5, 0.5, 1.0);   // Medium specular (plastic-like)
    materialShininess = 32.0;                      // Medium highlights
    
    updateMaterialAndShading(0);  // Blinn-Phong shading
  };
  // ============================================
  // Helper Function: Update Material & Shading Model
  // ============================================
  function updateMaterialAndShading(shadingModel) {
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv(
      gl.getUniformLocation(program, "ambientProduct"),
      flatten(ambientProduct)
    );
    gl.uniform4fv(
      gl.getUniformLocation(program, "diffuseProduct"),
      flatten(diffuseProduct)
    );
    gl.uniform4fv(
      gl.getUniformLocation(program, "specularProduct"),
      flatten(specularProduct)
    );
    gl.uniform1f(
      gl.getUniformLocation(program, "shininess"),
      materialShininess
    );
    // Enable shading model switch: 1 = Phong, 0 = Blinn-Phong
    gl.uniform1i(gl.getUniformLocation(program, "shadingModel"), shadingModel);
  }

  // viewer projection interaction
  document.getElementById("OrthographicButton").onclick = function () {
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    gl.uniformMatrix4fv(projectionMatrixAxis, false, flatten(projectionMatrix));
  };
  document.getElementById("perspectiveButton").onclick = function () {
    // Perspective box
    var fov = 120.0; // Field of view in degrees
    var aspect = (right - left) / (ytop - bottom); // Aspect ratio
    var near = 0.01;
    var farFactor = 1000.0;
    var far = viewer.radius * farFactor;
    projectionMatrix = perspective(fov, aspect, near, far);
    gl.uniformMatrix4fv(projectionMatrixAxis, false, flatten(projectionMatrix));
  };

  // Model 1: Torus (R=0.4, r=0.3)
  // Range: Y from -(R+r) to +(R+r) = -0.7 to +0.7, centered at origin
  document.getElementById("surface1").onclick = function () {
    // Reset animation state when switching models
    b_play = false;
    vec3_velocity = vec3(0.0, 0, 0.0);
    vec3_location = vec3(0.0, 1.5, 0.0);
    
    indicesArray = [];
    pointsArray = [];
    normalsArray = [];
    texCoordArray = [];
    torus(0.4, 0.3, 180, 180);
    initSkybox();
    // Torus: full radius from center to edge ~ 0.65
    f_object_h = 0.65;

    // load the texture buffer
    var texCoord_Buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoord_Buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordArray), gl.STATIC_DRAW);
    var texCoord_location = gl.getAttribLocation(program, "a_TexCoord");
    gl.vertexAttribPointer(texCoord_location, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoord_location);
    // general buffer

    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indicesArray),
      gl.STATIC_DRAW
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
  };

  // Model 2: Vase (height=0.5, radius=0.5)
  // NOW centered at origin after geometry fix: Y from -0.25 to +0.25
  document.getElementById("surface2").onclick = function () {
    // Reset animation state when switching models
    b_play = false;
    vec3_velocity = vec3(0.0, 0, 0.0);
    vec3_location = vec3(0.0, 1.5, 0.0);
    
    indicesArray = [];
    pointsArray = [];
    normalsArray = [];
    texCoordArray = [];
    vase(0.5, 0.5, 120);
    initSkybox();
    // Vase: height 0.5, centered, so half-height = 0.25 from center to bottom
    f_object_h = 0.25;

    // load the texture buffer
    var texCoord_Buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoord_Buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordArray), gl.STATIC_DRAW);
    var texCoord_location = gl.getAttribLocation(program, "a_TexCoord");
    gl.vertexAttribPointer(texCoord_location, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoord_location);
    // general buffer

    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indicesArray),
      gl.STATIC_DRAW
    );

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
  };
  // document.getElementById("surface3").onclick = function () {
  //   indicesArray = [];
  //   pointsArray = [];
  //   normalsArray = [];
  //   texCoordArray = [];
  //   sphere(0.5, 120, 120);
  //   // load the skybox
  //   initSkybox();
  //   //animate
  //   //paremters for the animation
  //   f_object_h = 0.5;

  //   // load the texture buffer
  //   var texCoord_Buffer = gl.createBuffer();
  //   gl.bindBuffer(gl.ARRAY_BUFFER, texCoord_Buffer);
  //   gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordArray), gl.STATIC_DRAW);
  //   var texCoord_location = gl.getAttribLocation(program, "a_TexCoord");
  //   gl.vertexAttribPointer(texCoord_location, 3, gl.FLOAT, false, 0, 0);
  //   gl.enableVertexAttribArray(texCoord_location);
  //   // general buffer

  //   gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
  //   gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
  //   gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
  //   gl.enableVertexAttribArray(vNormal);

  //   gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  //   gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  //   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  //   gl.bufferData(
  //     gl.ELEMENT_ARRAY_BUFFER,
  //     new Uint16Array(indicesArray),
  //     gl.STATIC_DRAW
  //   );

  //   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  //   gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  //   gl.enableVertexAttribArray(vPosition);
  // };
  // Model 3: Sphere (radius=1)
  // Range: Y from -1 to +1, centered at origin
  document.getElementById("surface3").onclick = function () {
    // Reset animation state when switching models
    b_play = false;
    vec3_velocity = vec3(0.0, 0, 0.0);
    vec3_location = vec3(0.0, 1.5, 0.0);
    
    indicesArray = [];
    pointsArray = [];
    normalsArray = [];
    texCoordArray = [];
    sphere(1, 180, 180);
    // Sphere: radius 1, centered, distance from center to bottom = 1.0
    f_object_h = 1.0;
  
    initSkybox();
      gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
      gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(vNormal);
  
      // texCoord begin
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoord_Buffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordArray), gl.STATIC_DRAW);
      gl.vertexAttribPointer(texCoord_location, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(texCoord_location);
      // texCoord end
  
      gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
  
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indicesArray),
        gl.STATIC_DRAW
      );
  
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  
      gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(vPosition);
  };
  //animation
  document.getElementById("animation").onclick = function () {
    b_play = true;
    vec3_velocity = vec3(0.0, 0, 0.0);
    vec3_location = vec3(0.0, 1.5, 0.0);  // Reset to initial drop position
    // Start audio playback
    var myAudio = document.getElementById("myaudio");
    myAudio.currentTime = 0;
    myAudio.play().catch(function(error) {
      console.log("Audio play failed:", error);
    });
  };

  gl.uniform4fv(
    gl.getUniformLocation(program, "ambientProduct"),
    flatten(ambientProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "diffuseProduct"),
    flatten(diffuseProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "specularProduct"),
    flatten(specularProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "lightPosition"),
    flatten(lightPosition)
  );
  gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);

  projectionMatrix = ortho(left, right, bottom, ytop, near, far);
  gl.uniformMatrix4fv(projectionMatrixAxis, false, flatten(projectionMatrix));

  //pass the mat of cube
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
  // var myimage = new Image();
  // myimage.crossOrigin = "anonymous";

  // myimage.src = "SA2011_black.gif"

  // // if (textureChoice == 0) myimage.src = window.SA2011_black_data_url;
  // // else myimage.src = window.DCHeyePower2_data_url;

  // myimage.onload = function () {
  //   configureTexture(myimage);
  // };

  render(program);
};

function render(program) {
  // setup
  gl.enable(gl.DEPTH_TEST);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  modelViewMatrix = lookAt(vec3(viewer.eye), viewer.at, viewer.up);

  gl.uniformMatrix4fv(modelViewMatrixAxis, false, flatten(modelViewMatrix));

  //animation
  gl.uniform1f(sizeXDir, 1);
  gl.uniform1f(sizeYDir, 1);
  gl.uniform1f(sizeZDir, 1);
  gl.uniform1f(transferX, vec3_location[0]);
  gl.uniform1f(transferY, vec3_location[1]);
  gl.uniform1f(transferZ, vec3_location[2]);
  // ogic foranimating the object,
  // updated variables during each frame of animation.
  animation();
  //draw skybox
  initScene(program);

  //draw plane
  // Set the depth function to draw the ground plane behind other objects
  gl.depthFunc(gl.LESS);
  const groundPlaneVertexCount = 36;
  // Draw the ground plane using the vertices created by createGroundPlane()
  gl.drawArrays(gl.TRIANGLES, pointsArray.length - 42, groundPlaneVertexCount);
  // gl.drawArrays(gl.TRIANGLES, pointsArray.length - 42, 36);
  // createGroundPlane(20,20,20,0);
  // Torus
  gl.drawElements(gl.TRIANGLES, indicesArray.length, gl.UNSIGNED_SHORT, 0);
  gl.depthFunc(gl.LEQUAL);
  gl.drawArrays(gl.TRIANGLES, pointsArray.length - 36, 36);

  requestAnimFrame(render);
}

// relative to texture
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
      return true; // resolve the promise with a boolean value
    })
    .catch(function (error) {
      console.error(error);
      return false; // resolve the promise with a boolean value
    });
}
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
      // Stop audio when animation ends
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

  // load uniforms
  var skyboxAxisation = gl.getUniformLocation(program, "u_skybox");

  // Create a texture.
  gl.activeTexture(gl.TEXTURE1);
  var sky_texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, sky_texture);

  faceInfos.forEach((faceInfo) => {
    const { target, url } = faceInfo;

    // Upload the canvas to the cubemap face.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 512;
    const height = 512;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;

    // setup each face so it's immediately renderable
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

    // Asynchronously load an image
    const image = new Image();
    checkUrl(image, url);
    image.src = url;
    image.addEventListener("load", function () {
      // Now that the image has loaded make copy it to the texture.
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
  // Tell the shader to use texture unit 1 for u_skybox
  gl.uniform1i(skyboxAxisation, 1);

  function radToDeg(r) {
    return (r * 180) / Math.PI;
  }

  function degToRad(d) {
    return (d * Math.PI) / 180;
  }

  var fieldOfViewRadians = degToRad(60);
  var cameraYRotationRadians = degToRad(0);

  var spinCamera = true;
  // Get the starting time.
  var then = 0;
}

function initScene(program) {
  // Compute the projection matrix
  var fieldOfViewRadians = 3.14 / 3;
  var aspect = canvas.clientWidth / canvas.clientHeight;
  var sky_projectionMatrix = m4.perspective(
    fieldOfViewRadians,
    aspect,
    1,
    2000
  );

  // camera going in circle 2 units from origin looking at origin
  time += 0.01;
  var cameraPosition = [viewer.eye[0], viewer.eye[1], viewer.eye[2]];
  var target = [0, 0, 0];
  var up = [0, 1, 0];
  // Compute the camera's matrix using look at.
  var cameraMatrix = m4.lookAt(cameraPosition, target, up);
  // Make a view matrix from the camera matrix.
  var viewMatrix = m4.inverse(cameraMatrix);

  // We only care about direciton so remove the translation
  viewMatrix[12] = 0;
  viewMatrix[13] = 0;
  viewMatrix[14] = 0;

  //modelViewMatrix, projectionMatrix;
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
function configureTexture(myimage) {
  texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // gif image needs flip of y-coord
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
