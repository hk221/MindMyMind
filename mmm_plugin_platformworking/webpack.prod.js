const HtmlWebpackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const uuid = require("uuid");
const pack = require("./package.json");
const path = require("path");

const deps = pack.dependencies;

module.exports = {
  entry: "./src/prod/index",
  cache: false,

  mode: "production",
  devtool: "source-map",

  output: {
    filename: "[name].[fullhash].js",
    chunkFilename: "[name].[chunkhash].js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
    uniqueName: uuid.v4(),
  },

  optimization: {
    moduleIds: "deterministic",
  },

  performance: {
    maxEntrypointSize: 512000 * 1024,
    maxAssetSize: 512000 * 1024,
  },

  resolve: {
    extensions: [".jsx", ".js", ".json"],
  },

  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.jsx?$/,
        loader: require.resolve("babel-loader"),
        options: {
          presets: [require.resolve("@babel/preset-react")],
        },
      },
    ],
  },

  plugins: [
    new ModuleFederationPlugin({
      name: "PLUGIN",
      filename: "remoteEntry.js",
      remotes: {},
      exposes: {
        "./Plugin": "./src/Plugin",
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: deps.react,
        },
        "react-dom": {
          singleton: true,
          requiredVersion: deps["react-dom"],
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      chunks: ["main"],
      hash: true,
    }),
  ],
};
