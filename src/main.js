/**
 * Application entry point
 */
import { WebGLApp } from './core/WebGLApp.js';
import { UIController } from './ui/UIController.js';

async function main() {
  try {
    // Initialize app
    const app = new WebGLApp('gl-canvas');
    const success = await app.init();

    if (!success) {
      console.error('Failed to initialize application');
      return;
    }

    // Setup UI
    const ui = new UIController(app);
    app.onFrame = () => ui.tickFrame();

    // Start render loop
    app.start();

    // Update UI stats
    setInterval(() => {
      ui.updateFPS();
      ui.updateStats();
      ui.updateShaderDisplay();
    }, 100);

    console.log('[Main] Application started');
  } catch (err) {
    console.error('[Main] Fatal error:', err);
    alert(`Fatal error: ${err.message}`);
  }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
