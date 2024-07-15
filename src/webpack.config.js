// webpack.config.js

const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    library: {
      type: 'module',
    },
  },
  experiments: {
    outputModule: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
  },
};
