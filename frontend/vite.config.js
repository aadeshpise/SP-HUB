const path = require('path');
const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');
const viteDevServerAdapter = require('./vite-plugins/vite-dev-server-adapter');

module.exports = defineConfig(({ command, mode }) => {
  const isDev = mode === 'development';
  let babelMetadataPlugin;

  if (isDev) {
    try {
      babelMetadataPlugin = require('./plugins/visual-edits/babel-metadata-plugin');
    } catch (e) {
      console.warn('Could not load babel-metadata-plugin', e);
    }
  }

  return {
    plugins: [
      react({
        babel: {
          plugins: babelMetadataPlugin ? [babelMetadataPlugin] : [],
        },
      }),
      // Only include the dev server adapter plugin in development mode
      isDev && viteDevServerAdapter(),
    ].filter(Boolean), // Filter out false values
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      // open: true,
    },
  };
});
