const express = require('express');
const setupDevServer = require('../plugins/visual-edits/dev-server-setup');
const setupHealthEndpoints = require('../plugins/health-check/health-endpoints');

// Mock WebpackHealthPlugin
class MockHealthPlugin {
  constructor() {
    this.status = {
      state: 'success',
      isHealthy: true,
      hasCompiled: true,
      errorCount: 0,
      warningCount: 0,
      compileDuration: 0,
      totalCompiles: 1,
      lastCompileTime: Date.now(),
      lastSuccessTime: Date.now(),
      firstCompileTime: Date.now(),
      errors: [],
      warnings: [],
    };
  }
  getStatus() {
    return this.status;
  }
  getSimpleStatus() {
    return {
      state: 'success',
      isHealthy: true,
      errorCount: 0,
      warningCount: 0,
    };
  }
}

function viteDevServerAdapter() {
  return {
    name: 'vite-dev-server-adapter',
    configureServer(server) {
      // Create express app to handle custom endpoints
      const app = express();

      // Mock devServer object expected by plugins
      const mockDevServer = { app };

      // 1. Setup Visual Edits
      // The setupDevServer function expects a config object and attaches setupMiddlewares to it
      const configMock = {};
      try {
        setupDevServer(configMock);
        if (typeof configMock.setupMiddlewares === 'function') {
          // Execute the setup logic
          // The first arg 'middlewares' is ignored by the implementation usually, or we pass []
          configMock.setupMiddlewares([], mockDevServer);
          console.log('[Vite Adapter] Visual Edits middleware setup complete');
        }
      } catch (err) {
        console.warn('[Vite Adapter] Failed to setup Visual Edits middleware:', err);
      }

      // 2. Setup Health Endpoints
      const healthPlugin = new MockHealthPlugin();
      try {
        setupHealthEndpoints(mockDevServer, healthPlugin);
        console.log('[Vite Adapter] Health Endpoints setup complete');
      } catch (err) {
        console.warn('[Vite Adapter] Failed to setup Health Endpoints:', err);
      }

      // Attach the express app to Vite's connect server
      server.middlewares.use(app);
    },
  };
}

module.exports = viteDevServerAdapter;
