const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin');
const NodeExternals = require('webpack-node-externals');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const path = require('path');
const fs = require('fs')

const paths = {
  src: path.resolve(__dirname, 'src'),
  debug: path.resolve(__dirname, 'debug'),
  dist: path.resolve(__dirname, 'dist'),
  types: path.resolve(__dirname, 'types')
};
const entryFileName = path.join(paths.src, "ExpressApplication.ts");
const outProductionBundleFileName = 'index.js';
const outDevBundleFileName = 'index.dev.js';


class RsnDeleteFolderPlugin {
  apply(compiler) {
    compiler.hooks.beforeRun.tap('RsnDeleteFolderPlugin', () => {
      fs.rmdirSync(paths.types, {
        recursive: true
      });
    });
  }
};

class RsnGenDtsIndexPlugin {
  constructor() {
    this.importSt = ''
  }

  apply(compiler) {
    compiler.hooks.done.tap('RsnGenDtsIndexPlugin', () => {
      this.processFolder(paths.types)
      this.writeDtsIndexFile()
    });
  }

  processFolder(folderPath) {
    fs.readdirSync(folderPath).forEach((file, index) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        this.processFolder(curPath);
      } else {
        this.processFile(curPath)
      }
    });
  }

  processFile(filePath) {
    // let fromImort = filePath.replace(paths.types, '').replace(/path.delimiter/g, '/').replace(/@/g, '.').replace('.d.ts', '')
    // pass this variable in to my regex string
    let fromImort = filePath.replace(paths.types, '').replace(/@/g, '.').replace('.d.ts', '').split(path.sep).join('/')
    this.importSt = this.importSt + `export * from '.${fromImort}'` + '\n';
    console.log(path.sep)
  }

  writeDtsIndexFile() {
    let indexPath = path.resolve(paths.types, 'index.d.ts')
    if (fs.existsSync(indexPath)) {
      fs.unlinkSync(indexPath);
    }
    fs.writeFileSync(indexPath, this.importSt)
  }
};


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
          configFile: "tsconfig.json",
          happyPackMode: false,
          experimentalWatchApi: true
        }
      }
    ]
  },

  plugins: removeEmpty([
    new ForkTsCheckerWebpackPlugin({
      checkSyntacticErrors: true
    }),
    new CleanWebpackPlugin(),
    new RsnDeleteFolderPlugin(),
    new RsnGenDtsIndexPlugin()
  ])

};

module.exports = config;