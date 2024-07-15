const path = require('path');
//const TerserPlugin = require('terser-webpack-plugin');
console.log(path.resolve(__dirname, 'dist'))

module.exports = {
  mode: 'production',
  entry: './src/index.js',   // Entry point of your application
  output: {
    filename: 'bundle.min.js',   // Name of the bundled file
   path: "/home/runner/work/BundleTest.js/BundleTest.js/dist", 
   // path: path.resolve(__dirname, 'dist'),   // Output directory for the bundled file
    libraryTarget: 'umd',    // Set the output format as Universal Module Definition (UMD)
    umdNamedDefine: true     // Specify named exports for UMD builds
  },
 // optimization: {
//    minimize: true,
 //   minimizer: [new TerserPlugin()],      // Use TerserPlugin to perform minification
//  },
};
