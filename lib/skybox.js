/**
 * Skybox Module - Manages cubemap skybox rendering
 * Provides initialization and rendering functionality for cubemap environments
 */

const SkyboxManager = (function() {
  'use strict';

  // Skybox configuration with asset URLs
  const SKYBOX_CONFIG = {
    name: 'nvlobby_new',
    size: 512,
    faces: {
      POSITIVE_X: { key: 'nvlobby_new_posx' },
      NEGATIVE_X: { key: 'nvlobby_new_negx' },
      POSITIVE_Y: { key: 'nvlobby_new_posy' },
      NEGATIVE_Y: { key: 'nvlobby_new_negy' },
      POSITIVE_Z: { key: 'nvlobby_new_posz' },
      NEGATIVE_Z: { key: 'nvlobby_new_negz' },
    }
  };

  /**
   * Initialize skybox cubemap texture
   * @param {WebGLRenderingContext} gl - WebGL context
   * @param {WebGLProgram} program - Shader program
   * @returns {WebGLTexture} Cubemap texture
   */
  function initSkybox(gl, program) {
    const faceInfos = [
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        dataUrl: window.nvlobby_new_posx_data_url,
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        dataUrl: window.nvlobby_new_negx_data_url,
      },
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        dataUrl: window.nvlobby_new_posy_data_url,
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        dataUrl: window.nvlobby_new_negy_data_url,
      },
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        dataUrl: window.nvlobby_new_posz_data_url,
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
        dataUrl: window.nvlobby_new_negz_data_url,
      },
    ];

    // Create and configure cubemap texture
    gl.activeTexture(gl.TEXTURE1);
    const cubemapTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = SKYBOX_CONFIG.size;
    const height = SKYBOX_CONFIG.size;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;

    // Setup each face
    faceInfos.forEach((faceInfo) => {
      const { target, dataUrl } = faceInfo;

      // Allocate texture face
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

      // Load image asynchronously
      const image = new Image();
      image.src = dataUrl;
      image.addEventListener('load', function () {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);
        gl.texImage2D(target, level, internalFormat, format, type, image);
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
      });
    });

    // Configure texture parameters
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(
      gl.TEXTURE_CUBE_MAP,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR
    );
    gl.texParameteri(
      gl.TEXTURE_CUBE_MAP,
      gl.TEXTURE_MAG_FILTER,
      gl.LINEAR
    );
    gl.texParameteri(
      gl.TEXTURE_CUBE_MAP,
      gl.TEXTURE_WRAP_S,
      gl.CLAMP_TO_EDGE
    );
    gl.texParameteri(
      gl.TEXTURE_CUBE_MAP,
      gl.TEXTURE_WRAP_T,
      gl.CLAMP_TO_EDGE
    );

    // Bind texture unit to shader
    const skyboxUniform = gl.getUniformLocation(program, 'u_skybox');
    gl.uniform1i(skyboxUniform, 1);

    return cubemapTexture;
  }

  /**
   * Get geometry data for skybox cube faces
   * @returns {Object} Object with pointsArray, texCoordArray, normalsArray
   */
  function getSkyboxGeometry(plane) {
    const pointsArray = [];
    const texCoordArray = [];
    const normalsArray = [];

    const faces = [
      [1, 0, 3, 2], // front
      [2, 3, 7, 6], // right
      [3, 0, 4, 7], // down
      [6, 5, 1, 2], // up
      [4, 5, 6, 7], // back
      [5, 4, 0, 1], // left
    ];

    faces.forEach((face) => {
      const [a, b, c, d] = face;
      
      // Calculate normal
      const v1 = subtract(plane[b], plane[a]);
      const v2 = subtract(plane[c], plane[a]);
      const normal = normalize(cross(v1, v2));

      // Add quad vertices
      pointsArray.push(plane[a]);
      normalsArray.push(normal);
      texCoordArray.push(vec3(0, 0, 3.0));

      pointsArray.push(plane[b]);
      normalsArray.push(normal);
      texCoordArray.push(vec3(0, 0, 3.0));

      pointsArray.push(plane[c]);
      normalsArray.push(normal);
      texCoordArray.push(vec3(0, 0, 3.0));

      pointsArray.push(plane[a]);
      normalsArray.push(normal);
      texCoordArray.push(vec3(0, 0, 3.0));

      pointsArray.push(plane[c]);
      normalsArray.push(normal);
      texCoordArray.push(vec3(0, 0, 3.0));

      pointsArray.push(plane[d]);
      normalsArray.push(normal);
      texCoordArray.push(vec3(0, 0, 3.0));
    });

    return { pointsArray, texCoordArray, normalsArray };
  }

  /**
   * Get skybox configuration
   */
  function getConfig() {
    return { ...SKYBOX_CONFIG };
  }

  /**
   * Change skybox (for future implementation)
   * @param {string} name - Name of the new skybox configuration
   */
  function setSkybox(name) {
    console.log(`Skybox changed to: ${name}`);
    // Future implementation for swapping skyboxes
  }

  // Public API
  return {
    init: initSkybox,
    getGeometry: getSkyboxGeometry,
    getConfig: getConfig,
    setSkybox: setSkybox
  };
})();
