const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = function(options) {
  return {
    ...options,
    entry: {
      main: './apps/consumers/src/main.ts'
    },
    externals: [
      nodeExternals(),
    ],
    output: {
      path: path.join(__dirname, 'dist', 'apps', 'consumers'),
    },
  };
}