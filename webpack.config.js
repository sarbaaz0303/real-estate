const path = require("path");

const env = process.env.NODE_ENV;
const port = 3000;

// Plugins
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const OpenBrowserPlugin = require("open-browser-plugin");

// Plugins Dependency
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

// Absolute Path
const rootPath = (pathname) => path.resolve(__dirname, pathname);

// Webpack Config
const entry = { main: rootPath("src/index.js") };

const output = {
	filename:
		env === "production" ? "[name].[contenthash].js" : "main.bundle.js",
	path: env === "production" ? rootPath("build") : rootPath("dist"),
};

const moduleConfig = {
	rules: [
		// JavaScript
		{
			test: /\.jsx?$/,
			include: rootPath("src"),
			loader: "babel-loader",
			options: {
				presets: ["@babel/preset-env"],
			},
		},
		// SCSS
		{
			test: /\.(sa|sc|c)ss$/,
			use: [
				MiniCssExtractPlugin.loader,
				"css-loader",
				{
					loader: "postcss-loader",
					options: {
						postcssOptions: {
							plugins: [
								autoprefixer,
								env === "production" ? cssnano : null,
							],
						},
					},
				},
				"sass-loader",
			],
		},
		// HTML
		{
			test: /\.html?$/,
			include: rootPath("src"),
			loader: "html-loader",
		},
		// Fonts
		{
			test: /\.(woff2?|ttf)$/,
			loader: "url-loader",
		},
		// Assets
		{
			test: /\.(png|jpe?g|svg|gif|mp4|web(M|P))$/i,
			use: [
				{
					loader: "file-loader",
					options: {
						name:
							env === "production"
								? "[hash].[ext]"
								: "[name].[ext]",
						publicPath: "./",
					},
				},
			],
		},
	],
};

const plugins = [
	new MiniCssExtractPlugin({
		filename:
			env === "production"
				? "style.[contenthash].css"
				: "style.bundle.css",
		chunkFilename: "chunk.[id].css",
	}),
	new HtmlWebpackPlugin({
		template: rootPath("src/templates/index.html"),
		favicon: rootPath("src/assets/favicon.ico"),
		inject: true,
		minify: env === "production" ? { removeAttributeQuotes: true } : false,
	}),
];

const options = {};

if (env === "production") {
	options.mode = "production";
	options.performance = { hints: "warning" };

	plugins.push(
		new CleanWebpackPlugin({
			cleanAfterEveryBuildPatterns: ["build"],
		})
	);
} else if (env === "development") {
	options.mode = "development";
	options.devtool = "eval";
	options.cache = true;
	options.watch = true;
	options.performance = { hints: false };
	options.devServer = {
		port,
		contentBase: rootPath("src"),
	};

	plugins.push(
		new OpenBrowserPlugin({
			port,
		})
	);
} else {
	options.mode = "none";

	plugins.push(
		new CleanWebpackPlugin({
			cleanAfterEveryBuildPatterns: ["dist"],
		})
	);
}

module.exports = {
	entry,
	output,
	module: moduleConfig,
	plugins,
	...options,
};
