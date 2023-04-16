const path = require('path');
const nodeExternals = require('webpack-node-externals');
const slsw = require('serverless-webpack');
const { isLocal } = slsw.lib.webpack;

module.exports = {
  target: 'node',
  stats: 'normal',
  entry: slsw.lib.entries,
  externals: [nodeExternals()],
  mode: isLocal ? 'development' : 'production',
  optimization: { concatenateModules: false },
  resolve: {
    extensions: ['.js', '.ts'],
    alias: {
      '@domains': path.resolve(__dirname, 'src/domains/'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    libraryTarget: 'commonjs',
    filename: '[name].js',
    path: path.resolve(__dirname, '.webpack'),
  },
};
