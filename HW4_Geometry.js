// function torus(R, r, usteps, vsteps) {
//   const { vertices, normals } = generateTorusVertices(R, r, usteps, vsteps);
//   const indices = generateTorusIndices(usteps, vsteps);

//   for (let i = 0; i < vertices.length; i++) {
//     pointsArray.push(vertices[i]);
//     normalsArray.push(normals[i]);
//   }

//   for (let i = 0; i < indices.length; i++) {
//     indicesArray.push(indices[i]);
//   }
// }
// function generateTorusVertices(R, r, usteps, vsteps) {
//     const vertices = [];
//     const normals = [];

//     for (let v = 0; v < vsteps; v++) {
//       for (let u = 0; u < usteps; u++) {
//         let a = (2 * Math.PI * u) / usteps;
//         let b = (2 * Math.PI * v) / vsteps;

//         let x = (R + r * Math.cos(b)) * Math.cos(a);
//         let y = (R + r * Math.cos(b)) * Math.sin(a);
//         let z = r * Math.sin(b);

//         let nx = Math.cos(a) * Math.cos(b);
//         let ny = Math.sin(a) * Math.cos(b);
//         let nz = Math.sin(b);

//         vertices.push(vec3(x, y, z));
//         normals.push(vec3(nx, ny, nz));
//       }
//     }
//     return { vertices, normals };
//   }

// function generateTorusIndices(usteps, vsteps) {
//   const indices = [];

//   for (let v = 0; v < vsteps; v++) {
//     for (let u = 0; u < usteps; u++) {
//       let i = (v * usteps + u) % (usteps * vsteps);
//       let next_u = (i + 1) % usteps;
//       let next_v = (i + usteps) % (usteps * vsteps);

//       indices.push(i, next_u, next_v);
//       indices.push(next_v, next_u, (next_v + 1) % (usteps * vsteps));
//     }
//   }

//   return indices;
// }
function torus(R, r, usteps, vsteps) {
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

      pointsArray.push(vec3(x, y, z));
      normalsArray.push(vec3(nx, ny, nz));
      texCoordArray.push(vec3(0.5, 0.5, 0.0));
    }
  }

  //create indices
  for (let v = 0; v < vsteps; v++) {
    for (let u = 0; u < usteps; u++) {
      let i = (v * usteps + u) % (usteps * vsteps);
      let next_u = (i + 1) % usteps;
      let next_v = (i + usteps) % (usteps * vsteps);

      indicesArray.push(i, next_u, next_v);
      indicesArray.push(next_v, next_u, (next_v + 1) % (usteps * vsteps));
    }
  }
}
// function vase(height, radius, segments) {
//   var vertices = [];
//   var normals = [];
//   var indices = [];

//   // Create vertices and normals for the vase
//   for (var i = 0; i <= segments; i++) {
//     var theta = (i / segments) * 2 * Math.PI;
//     for (var j = 0; j <= segments; j++) {
//       var y = (j / segments) * height;
//       var r = radius * (1 - y / height);
//       var x = r * Math.cos(theta);
//       var z = r * Math.sin(theta);
//       vertices.push(vec3(x, y, z));
//       normals.push(normalize(vec3(x, radius - y, z)));
//     }
//   }

//   // Create indices for the vase
//   for (var i = 0; i < segments; i++) {
//     for (var j = 0; j < segments; j++) {
//       var a = i * (segments + 1) + j;
//       var b = a + 1;
//       var c = (i + 1) * (segments + 1) + j;
//       var d = c + 1;
//       indices.push(a, c, b, b, c, d);
//     }
//   }

//   // Add the vertices and normals to the global arrays
//   for (var i = 0; i < vertices.length; i++) {
//     pointsArray.push(vertices[i]);
//     normalsArray.push(normals[i]);
//   }

//   // Add the indices to the global array
//   for (var i = 0; i < indices.length; i++) {
//     indicesArray.push(indices[i]);
//   }
// }
function vase(height, radius, segments) {
  var vertices = [];
  var normals = [];
  var indices = [];

  // Create vertices and normals for the vase
  // 将Y从[0, height]转换为[-height/2, height/2]，使花瓶以原点为中心
  for (var i = 0; i <= segments; i++) {
    var theta = (i / segments) * 2 * Math.PI;
    for (var j = 0; j <= segments; j++) {
      var y_normalized = (j / segments) * height - height / 2;  // 偏移使其以0为中心
      var y_ratio = (j / segments);  // 用于半径计算
      var r = radius * (1 - y_ratio);
      var x = r * Math.cos(theta);
      var z = r * Math.sin(theta);
      vertices.push(vec3(x, y_normalized, z));
      normals.push(normalize(vec3(x, radius - y_ratio * height, z)));
    }
  }

  // Create indices for the vase
  for (var i = 0; i < segments; i++) {
    for (var j = 0; j < segments; j++) {
      var a = i * (segments + 1) + j;
      var b = a + 1;
      var c = (i + 1) * (segments + 1) + j;
      var d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  // Add the vertices and normals to the global arrays
  for (var i = 0; i < vertices.length; i++) {
    pointsArray.push(vertices[i]);
    normalsArray.push(normals[i]);
    texCoordArray.push(vec3(0.5, 0.5, 0.0));
  }

  // Add the indices to the global array
  for (var i = 0; i < indices.length; i++) {
    indicesArray.push(indices[i]);
  }
}
// function sphere(radius, longitudeSteps, latitudeSteps) {
//   let phiSteps = latitudeSteps;
//   let thetaSteps = longitudeSteps;

//   for (let i = 0; i <= phiSteps; i++) {
//     let phi = (Math.PI * i) / phiSteps;
//     let sinPhi = Math.sin(phi);
//     let cosPhi = Math.cos(phi);

//     for (let j = 0; j <= thetaSteps; j++) {
//       let x = radius * sinPhi * Math.cos((2 * Math.PI * j) / thetaSteps);
//       let y = radius * sinPhi * Math.sin((2 * Math.PI * j) / thetaSteps);
//       let z = radius * cosPhi;

//       pointsArray.push(vec3(x, y, z));
//       normalsArray.push(vec3(x / radius, y / radius, z / radius));
//     }
//   }
//   // indices
//   for (let i = 0; i < phiSteps * thetaSteps; i++) {
//     let p1 = i;
//     let p2 = i + 1;
//     let p3 = i + thetaSteps + 1;
//     let p4 = i + thetaSteps + 2;

//     indicesArray.push(p1, p2, p3);
//     indicesArray.push(p2, p4, p3);
//   }
// }
// function createGroundPlane(objectWidth, objectHeight, objectDepth, thickness) {
//   const halfWidth = objectWidth / 2;
//   const halfHeight = objectHeight / 2;
//   const halfDepth = objectDepth / 2;
//   const planeThickness = thickness;

//   // Define the vertices for the cube
//   const vertices = [
//     // Front face
//     vec3(-halfWidth, -halfHeight, halfDepth),
//     vec3(halfWidth, -halfHeight, halfDepth),
//     vec3(halfWidth, halfHeight, halfDepth),
//     vec3(-halfWidth, halfHeight, halfDepth),

//     // Back face
//     vec3(-halfWidth, -halfHeight, -halfDepth),
//     vec3(-halfWidth, halfHeight, -halfDepth),
//     vec3(halfWidth, halfHeight, -halfDepth),
//     vec3(halfWidth, -halfHeight, -halfDepth),

//     // Top face
//     vec3(-halfWidth, halfHeight, -halfDepth),
//     vec3(-halfWidth, halfHeight, halfDepth),
//     vec3(halfWidth, halfHeight, halfDepth),
//     vec3(halfWidth, halfHeight, -halfDepth),

//     // Bottom face
//     vec3(-halfWidth, -halfHeight, -halfDepth),
//     vec3(halfWidth, -halfHeight, -halfDepth),
//     vec3(halfWidth, -halfHeight, halfDepth),
//     vec3(-halfWidth, -halfHeight, halfDepth),

//     // Right face
//     vec3(halfWidth, -halfHeight, -halfDepth),
//     vec3(halfWidth, halfHeight, -halfDepth),
//     vec3(halfWidth, halfHeight, halfDepth),
//     vec3(halfWidth, -halfHeight, halfDepth),

//     // Left face
//     vec3(-halfWidth, -halfHeight, -halfDepth),
//     vec3(-halfWidth, -halfHeight, halfDepth),
//     vec3(-halfWidth, halfHeight, halfDepth),
//     vec3(-halfWidth, halfHeight, -halfDepth),
//   ];

//   // Scale the cube to match the object dimensions
//   const scalingFactor = vec3(1, 1, planeThickness);
//   for (let i = 0; i < vertices.length; i++) {
//     vertices[i] = mult(vertices[i], scalingFactor);
//   }

//   // Translate the cube to the appropriate position
//   const translationOffset = vec3(0, 0, -halfDepth - planeThickness / 2);
//   for (let i = 0; i < vertices.length; i++) {
//     vertices[i] = add(vertices[i], translationOffset);
//   }

//   // Create the vertex buffer and store the vertices in it
//   const vertexBuffer = gl.createBuffer();
//   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
//   gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

//   // Specify the vertex attributes
//   const vPosition = gl.getAttribLocation(program, "vPosition");
//   gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
//   gl.enableVertexAttribArray(vPosition);

//   // Draw the cube
//   gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
// }

// function sphere(gl, radius, latitudeBands, longitudeBands) {
//     const vertexData = [];
//     const indexData = [];

//     for (let lat = 0; lat <= latitudeBands; lat++) {
//       const theta = lat * Math.PI / latitudeBands;
//       const sinTheta = Math.sin(theta);
//       const cosTheta = Math.cos(theta);

//       for (let long = 0; long <= longitudeBands; long++) {
//         const phi = long * 2 * Math.PI / longitudeBands;
//         const sinPhi = Math.sin(phi);
//         const cosPhi = Math.cos(phi);

//         const x = cosPhi * sinTheta;
//         const y = cosTheta;
//         const z = sinPhi * sinTheta;
//         const u = 1 - (long / longitudeBands);
//         const v = 1 - (lat / latitudeBands);

//         vertexData.push(radius * x, radius * y, radius * z, u, v);
//       }
//     }

//     for (let lat = 0; lat < latitudeBands; lat++) {
//       for (let long = 0; long < longitudeBands; long++) {
//         const first = (lat * (longitudeBands + 1)) + long;
//         const second = first + longitudeBands + 1;
//         indexData.push(first, second, first + 1, second, second + 1, first + 1);
//       }
//     }

//     // const vertexBuffer = gl.createBuffer();
//     // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
//     // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

//     // const indexBuffer = gl.createBuffer();
//     // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
//     // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);

//     return {
//       vertexBuffer,
//       indexBuffer,
//       numIndices: indexData.length
//     };
//   }

function initSkybox() {
  const faces = [
    [1, 0, 3, 2], // front
    [2, 3, 7, 6], // right
    [3, 0, 4, 7], // down
    [6, 5, 1, 2], // up
    [4, 5, 6, 7], // back
    [5, 4, 0, 1], // left
  ];

  faces.forEach((face, index) => {
    const isUp = index === 3;
    quad(face[0], face[1], face[2], face[3], isUp);
  });

  var skyboxCube = [
    vec3(-1.0, -1.0, 1.0), // bottom-left-back
    vec3(1.0, -1.0, 1.0), // bottom-right-back
    vec3(-1.0, 1.0, 1.0), // top-left-back
    vec3(-1.0, 1.0, 1.0), // top-right-back
    vec3(1.0, -1.0, 1.0), // bottom-left-front
    vec3(1.0, 1.0, 1.0), // bottom-right-front
  ];

  for (let i = 0; i < skyboxCube.length; i++) {
    pointsArray.push(skyboxCube[i]);
    texCoordArray.push(vec3(0, 0, 3.0));
  }
}

function quad(a, b, c, d, is_up) {
  if (is_up == true) {
    pointsArray.push(plane[a]);
    texCoordArray.push(vec3(0, 0, 1));
    pointsArray.push(plane[b]);
    texCoordArray.push(vec3(1, 0, 1));
    pointsArray.push(plane[c]);
    texCoordArray.push(vec3(1, 1, 1));
    pointsArray.push(plane[a]);
    texCoordArray.push(vec3(0, 0, 1));
    pointsArray.push(plane[c]);
    texCoordArray.push(vec3(1, 1, 1));
    pointsArray.push(plane[d]);
    texCoordArray.push(vec3(0, 1, 1));
  }
  if (is_up == false) {
    pointsArray.push(plane[a]);
    texCoordArray.push(vec3(0, 0, 2.0));
    pointsArray.push(plane[b]);
    texCoordArray.push(vec3(0, 0, 2.0));
    pointsArray.push(plane[c]);
    texCoordArray.push(vec3(0, 0, 2.0));
    pointsArray.push(plane[a]);
    texCoordArray.push(vec3(0, 0, 2.0));
    pointsArray.push(plane[c]);
    texCoordArray.push(vec3(0, 0, 2.0));
    pointsArray.push(plane[d]);
    texCoordArray.push(vec3(0, 0, 2.0));
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
      let theta = (2 * Math.PI * j) / thetaSteps;
      let sinTheta = Math.sin(theta);
      let cosTheta = Math.cos(theta);

      let x = radius * sinPhi * cosTheta;
      let y = radius * sinPhi * sinTheta;
      let z = radius * cosPhi;

      pointsArray.push(vec3(x, y, z));
      normalsArray.push(vec3(x / radius, y / radius, z / radius));
      texCoordArray.push(vec3(0.5, 0.5, 0.0));
    }
  }

  for (let i = 0; i < phiSteps; i++) {
    for (let j = 0; j < thetaSteps; j++) {
      let p1 = i * (thetaSteps + 1) + j;
      let p2 = p1 + thetaSteps + 1;

      indicesArray.push(p1, p2, p1 + 1);
      indicesArray.push(p1 + 1, p2, p2 + 1);
    }
  }
}
