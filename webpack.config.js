const CleanWebpackPlugin = require('clean-webpack-plugin');
const NodeExternals = require('webpack-node-externals');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const path = require('path');

const paths = {
  src: path.resolve(__dirname, 'src'),
  debug: path.resolve(__dirname, 'debug'),
  dist: path.resolve(__dirname, 'dist')
};


const entryFileName = path.join(paths.src, "server.ts");

//const outProductionBundleFileName = '[name].bundle.[hash].js';
const outProductionBundleFileName = '[name].bundle.js';
const outDevBundleFileName = '[name].js';

const nodeEnv = process.env.NODE_ENV || 'development';
const {
  getIfUtils,
  removeEmpty
} = require('webpack-config-utils');

const {
  ifDevelopment,
  ifProduction
} = getIfUtils(nodeEnv);


let config = {

  node: {
    setImmediate: false,
    process: 'mock',
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  },

  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.jsx', '.json', 'sass', 'css', 'vue'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },

  entry: entryFileName,
  output: removeEmpty({
    filename: ifProduction(outProductionBundleFileName, outDevBundleFileName),
    path: path.resolve(__dirname, ifProduction(paths.dist, paths.debug)),
    pathinfo: false
  }),


  mode: nodeEnv,
  devtool: ifDevelopment('cheap-module-source-map', '#source-map'),
  target: 'node', // in order to ignore built-in modules like path, fs, etc. 
  externals: [NodeExternals()], // in order to ignore all modules in node_modules folder 

  optimization: {
    noEmitOnErrors: true,
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false
  },

  module: {
    rules: [

      {
        test: /\.ts$/,
        enforce: 'pre',
        loader: 'tslint-loader',
        options: {
          typeCheck: false,
          emitErrors: false,
          fix: true
        },
        exclude: /node_modules/
      },

      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          transpileOnly: true,
          happyPackMode: false,
          experimentalWatchApi: true
        }
      },

      {
        test: /\.js$/,
        enforce: 'pre',
        loader: 'standard-loader',
        options: {
          typeCheck: true,
          emitErrors: false,
          fix: true
        },
        exclude: /node_modules/
      }
    ]
  },

  plugins: removeEmpty([

    new ForkTsCheckerWebpackPlugin({
      checkSyntacticErrors: true
    }),
    new CleanWebpackPlugin()

    // new webpack.ProgressPlugin(handler)

  ])

};

module.exports = config;