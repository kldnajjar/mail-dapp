const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const Dotenv = require("dotenv-webpack");

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.(css|scss)$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8192,
            },
          },
        ],
      },
    ],
    // fixes Critical dependency: the request of a dependency is an expression
    // https://github.com/amark/gun/issues/743
    noParse: [/gun\.js$/, /sea\.js$/],
    // noParse: [/(\/gun|gun\/sea)\.js$/],
  },
  devtool: "inline-source-map",
  plugins: [
    new Dotenv(),
    new HtmlWebpackPlugin({
      title: "client",
      template: "./public/index.html",
    }),
  ],
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  devServer: {
    static: "./public",
    historyApiFallback: true,
    port: 9000,
  },
};
