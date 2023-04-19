var canvas;
var gl;

// shape definition
var indicesArray = [];
var pointsArray = [];
var normalsArray = [];

var boundaryArray = [];

// movement variables
var transferX;
var transferY;
var transferZ;

var xAxis = 0.0;
var yAxis = 0.0;
var zAxis = 0.0;

var speedX = -0.003;
var speedY = -0.004;
var speedZ = 0.005;

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

// frame
var frame = [
  vec3(-1.0, -1.0, -1.0),
  vec3(1.0, -1.0, -1.0),
  vec3(1.0, 1.0, -1.0),
  vec3(-1.0, 1.0, -1.0),

  vec3(1.0, -1.0, -1.0),
  vec3(1.0, -1.0, 1.0),
  vec3(1.0, 1.0, 1.0),
  vec3(1.0, 1.0, -1.0),

  vec3(1.0, -1.0, 1.0),
  vec3(-1.0, -1.0, 1.0),
  vec3(-1.0, 1.0, 1.0),
  vec3(1.0, 1.0, 1.0),

  vec3(-1.0, -1.0, 1.0),
  vec3(-1.0, -1.0, -1.0),
  vec3(-1.0, 1.0, -1.0),
  vec3(-1.0, 1.0, 1.0),
];

// light position is defined in eye coordinates
// var lightPosition = vec4(3.0, 3.0, 5, 1.0 );
// var lightPosition = vec4(0.0, 0.0, 0.0, 1.0 );
var lightPosition = vec4(10.0, 0.0, 0.0, 1.0);

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

// ==================== run program

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  gl.enable(gl.DEPTH_TEST);

  //
  //  Load shaders and initialize attribute buffers
  //
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  ambientProduct = mult(lightAmbient, materialAmbient);
  diffuseProduct = mult(lightDiffuse, materialDiffuse);
  specularProduct = mult(lightSpecular, materialSpecular);

  console.log("ambient product = ", ambientProduct);
  console.log("diffuse product = ", diffuseProduct);
  console.log("specular product = ", specularProduct);

  //   // load the light
  //   var l3d = vec3(lightPosition[0], lightPosition[1], lightPosition[2]);
  //   pointsArray.push(l3d);
  //   // not used, but size should match points
  //   normalsArray.push(1.0, 0.0, 0.0);

  console.log("normals[1] = ", normalsArray[1]);
  console.log("points[1] = ", pointsArray[1]);

  torus(0.4, 0.3, 180, 180);

  for (var i = 0; i < frame.length; i++) {
    pointsArray.push(frame[i]);
  }
  // report light location
  document.getElementById("lightLocation").innerHTML =
    "Light location (in eye coordinates) = " +
    lightPosition[0].toFixed(2) +
    ", " +
    lightPosition[1].toFixed(2) +
    ", " +
    lightPosition[2].toFixed(2);

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

  // light position interaction
  document.getElementById("lightPositionButton1").onclick = function () {
    lightPosition = vec4(10.0, 0.0, 0.0, 1.0);
    gl.uniform4fv(
      gl.getUniformLocation(program, "lightPosition"),
      flatten(lightPosition)
    );
    // report light location
    document.getElementById("lightLocation").innerHTML =
      "Light location (in eye coordinates) = " +
      lightPosition[0].toFixed(2) +
      ", " +
      lightPosition[1].toFixed(2) +
      ", " +
      lightPosition[2].toFixed(2);
  };
  document.getElementById("lightPositionButton2").onclick = function () {
    lightPosition = vec4(viewer.eye[0], viewer.eye[1], viewer.eye[2], 1.0);
    console.log(lightPosition);
    gl.uniform4fv(
      gl.getUniformLocation(program, "lightPosition"),
      flatten(lightPosition)
    );
    // report light location
    document.getElementById("lightLocation").innerHTML =
      "Light location  = " +
      lightPosition[0].toFixed(2) +
      ", " +
      lightPosition[1].toFixed(2) +
      ", " +
      lightPosition[2].toFixed(2);
  };

  // light material interaction
  // Shading shading
  document.getElementById("material1").onclick = function () {
    materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
    materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
    materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
    materialShininess = 100.0;
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
    gl.uniform1i(gl.getUniformLocation(program, "shadingModel"), 0);
  };
  // Gouraud shading
  document.getElementById("material2").onclick = function () {
    materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
    materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
    materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
    materialShininess = 100.0;

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
    gl.uniform1i(gl.getUniformLocation(program, "shadingModel"), 1);
  };

  // gold-yellow material
  document.getElementById("lightColor1").onclick = function () {
    materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
    materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
    materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
    materialShininess = 100.0;
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
    gl.uniform1i(gl.getUniformLocation(program, "shadingModel"), 0);
  };

  //  red material; try changing light color
  document.getElementById("lightColor2").onclick = function () {
    var materialAmbient = vec4(1.0, 0.0, 0.0, 1.0);
    var materialDiffuse = vec4(0.3, 0.0, 0.0, 1.0);
    var materialSpecular = vec4(1.0, 0.0, 0.0, 1.0);
    var materialShininess = 10.0;

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
    gl.uniform1i(gl.getUniformLocation(program, "shadingModel"), 0);
  };
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
    var farFactor = 10.0;
    var far = viewer.radius * farFactor;
    projectionMatrix = perspective(fov, aspect, near, far);
    gl.uniformMatrix4fv(projectionMatrixAxis, false, flatten(projectionMatrix));
  };

  // change shape
  document.getElementById("surface1").onclick = function () {
    indicesArray = [];
    pointsArray = [];
    normalsArray = [];

    torus(0.4, 0.3, 180, 180);
    pointsArray.push(...frame);

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

  document.getElementById("surface2").onclick = function () {
    indicesArray = [];
    pointsArray = [];
    normalsArray = [];
    cube(1, 4);
    // for (var i = 0; i < frame.length; i++) {
    //   pointsArray.push(frame[i]);
    // }
    pointsArray.push(...frame);

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
  document.getElementById("surface3").onclick = function () {
    indicesArray = [];
    pointsArray = [];
    normalsArray = [];
    sphere(1.5, 180, 180);

    for (var i = 0; i < frame.length; i++) {
      pointsArray.push(frame[i]);
    }
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

  render();
};

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  modelViewMatrix = lookAt(vec3(viewer.eye), viewer.at, viewer.up);

  gl.uniformMatrix4fv(modelViewMatrixAxis, false, flatten(modelViewMatrix));
  // set movement
  xAxis = xAxis + speedX;
  yAxis = yAxis + speedY;
  zAxis = zAxis + speedZ;
  if (Math.abs(xAxis) < 0.5 && Math.abs(yAxis) < 0.5 && Math.abs(zAxis) < 0.5) {
    gl.uniform1f(transferX, xAxis);
    gl.uniform1f(transferY, yAxis);
    gl.uniform1f(transferZ, zAxis);
  } else {
    reflection(xAxis, yAxis, zAxis);
  }

  // draw boundary
  for (var i = pointsArray.length - 16; i < pointsArray.length; i += 4) {
    gl.drawArrays(gl.LINE_LOOP, i, 4);
  }

  // Torus
  gl.drawElements(gl.TRIANGLES, indicesArray.length, gl.UNSIGNED_SHORT, 0);

  requestAnimFrame(render);
}

function generateTorusVertices(R, r, usteps, vsteps) {
  const vertices = [];
  const normals = [];

  for (let v = 0; v < vsteps; v++) {
    for (let u = 0; u < usteps; u++) {
      let a = (2 * Math.PI * u) / usteps;
      let b = (2 * Math.PI * v) / vsteps;

      let x = (R + r * Math.cos(b)) * Math.cos(a);
      let y = (R + r * Math.cos(b)) * Math.sin(a);
      let z = r * Math.sin(b);

      let nx = Math.cos(a) * Math.cos(b);
      let ny = Math.sin(a) * Math.cos(b);
      let nz = Math.sin(b);

      vertices.push(vec3(x, y, z));
      normals.push(vec3(nx, ny, nz));
    }
  }
  return { vertices, normals };
}

function generateTorusIndices(usteps, vsteps) {
  const indices = [];

  for (let v = 0; v < vsteps; v++) {
    for (let u = 0; u < usteps; u++) {
      let i = (v * usteps + u) % (usteps * vsteps);
      let next_u = (i + 1) % usteps;
      let next_v = (i + usteps) % (usteps * vsteps);

      indices.push(i, next_u, next_v);
      indices.push(next_v, next_u, (next_v + 1) % (usteps * vsteps));
    }
  }

  return indices;
}

function torus(R, r, usteps, vsteps) {
  const { vertices, normals } = generateTorusVertices(R, r, usteps, vsteps);
  const indices = generateTorusIndices(usteps, vsteps);

  for (let i = 0; i < vertices.length; i++) {
    pointsArray.push(vertices[i]);
    normalsArray.push(normals[i]);
  }

  for (let i = 0; i < indices.length; i++) {
    indicesArray.push(indices[i]);
  }
}

function sphere(radius, longitudeSteps, latitudeSteps) {
  let phiSteps = latitudeSteps;
  let thetaSteps = longitudeSteps;

  for (let i = 0; i <= phiSteps; i++) {
    let phi = (Math.PI * i) / phiSteps;
    let sinPhi = Math.sin(phi);
    let cosPhi = Math.cos(phi);

    for (let j = 0; j <= thetaSteps; j++) {
      let x = radius * sinPhi * Math.cos((2 * Math.PI * j) / thetaSteps);
      let y = radius * sinPhi * Math.sin((2 * Math.PI * j) / thetaSteps);
      let z = radius * cosPhi;

      pointsArray.push(vec3(x, y, z));
      normalsArray.push(vec3(x / radius, y / radius, z / radius));
    }
  }
  // indices
  for (let i = 0; i < phiSteps * thetaSteps; i++) {
    let p1 = i;
    let p2 = i + 1;
    let p3 = i + thetaSteps + 1;
    let p4 = i + thetaSteps + 2;

    indicesArray.push(p1, p2, p3);
    indicesArray.push(p2, p4, p3);
  }
}

function reflection(x, y, z) {
  // Define the incident vector
  const incident = vec3(speedX, speedY, speedZ);

  let normal, directions;
  if (x >= 0.5 || x <= -0.5) {
    normal = vec3(x >= 0.5 ? -1 : 1, 0, 0);
    directions = { xDirection: 0.5, yDirection: 1.0, zDirection: 1.0 };
  } else if (y >= 0.5 || y <= -0.5) {
    normal = vec3(0, y >= 0.5 ? -1 : 1, 0);
    directions = { xDirection: 1.0, yDirection: 0.5, zDirection: 1.0 };
  } else if (z >= 0.5 || z <= -0.5) {
    normal = vec3(0, 0, z >= 0.5 ? -1 : 1);
    directions = { xDirection: 1.0, yDirection: 1.0, zDirection: 0.5 };
  }

  // Calculate the reflection vector
  const dotProduct = dot(incident, normal);
  const reflection = subtract(incident, scale(2 * dotProduct, normal));

  // Set the direction values and update the speed components
  gl.uniform1f(sizeXDir, directions.xDirection);
  gl.uniform1f(sizeYDir, directions.yDirection);
  gl.uniform1f(sizeZDir, directions.zDirection);
  const offset = 0;
  speedX = reflection[0] + offset;
  speedY = reflection[1] + offset;
  speedZ = reflection[2] + offset;
}

function cube(sideLength, numSteps) {
  let halfLen = sideLength / 2;
  let points = [
    vec3(-halfLen, -halfLen, halfLen),
    vec3(-halfLen, halfLen, halfLen),
    vec3(halfLen, halfLen, halfLen),
    vec3(halfLen, -halfLen, halfLen),
    vec3(-halfLen, -halfLen, -halfLen),
    vec3(-halfLen, halfLen, -halfLen),
    vec3(halfLen, halfLen, -halfLen),
    vec3(halfLen, -halfLen, -halfLen),
  ];
  let normals = [
    vec3(0, 0, 1),
    vec3(0, 1, 0),
    vec3(1, 0, 0),
    vec3(0, 0, -1),
    vec3(0, -1, 0),
    vec3(-1, 0, 0),
  ];
  let indices = [
    0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 1, 5, 6, 1, 2, 6, 0, 4, 7, 0, 3, 7, 0,
    1, 5, 0, 5, 4, 2, 3, 7, 2, 6, 7,
  ];
  for (let i = 0; i < points.length; i++) {
    pointsArray.push(points[i]);
    normalsArray.push(normals[i % normals.length]);
  }
  for (let i = 0; i < indices.length; i++) {
    indicesArray.push(indices[i]);
  }
}
