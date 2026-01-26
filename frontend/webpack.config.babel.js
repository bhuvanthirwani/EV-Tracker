import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import webpack from 'webpack';

const BUILD_DIR = path.resolve(__dirname, 'dist');
const APP_DIR = path.resolve(__dirname, 'src');
// const WORKER_DIR = path.resolve(__dirname, 'public');

let outputFile;
let devTool;
let cssPath;
let isDev;

console.log('Running in', process.env.NODE_ENV.toUpperCase(), 'mode');

if (['development', 'staging'].includes(process.env.NODE_ENV)) {
	outputFile = 'js/[name].js';
	devTool = 'eval-source-map';
	cssPath = 'css/[name].css';
	isDev = true;
} else {
	outputFile = 'js/[name]-[fullhash].min.js';
	isDev = false;
}

const commonConfig = {
	mode: process.env.NODE_ENV,
	devServer: {
		port: 3000,
		host: '0.0.0.0',
		allowedHosts: 'all',
		client: {
			progress: true,
			logging: 'error'
		},
		open: true,
		historyApiFallback: true
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
		fallback: { 'stream': require.resolve('stream-browserify') }
	},
	entry: () => !isDev ? {
		app: [APP_DIR + '/index.tsx']
	} : [APP_DIR + '/index.tsx'],
	output: {
		path: BUILD_DIR,
		filename: outputFile,
		publicPath: '/',
		clean: true,
		compareBeforeEmit: true,
	},
	module: {
		rules: [
			{
				test: /\.js?/,
				include: [APP_DIR],
				exclude: /node_modules/,
				use: 'babel-loader'
			},
			{
				test: /\.(ts|tsx)$/,
				exclude: /node_modules/,
				loader: 'ts-loader',
			},
			{
				test: /\.(css|scss|sass)$/,
				use: ['style-loader', 'css-loader', 'sass-loader']
			},
			{
				test: /\.(jpg|jpeg|png|gif|mp3|svg)$/i,
				type: 'asset/resource'
			},
		]
	},
	devtool: devTool,
	plugins: [
		new HtmlWebpackPlugin({
			inject: true,
			hash: true,
			meta: {
				'version': process.env.npm_package_version
			},
			title: 'EV Tracker',
			favicon: APP_DIR + '/assets/images/favicon.png',
			template: APP_DIR + '/index.html',
			minify: {
				html5: true,
				minifyJS: !isDev,
				collapseWhitespace: !isDev,
				minifyCSS: !isDev,
				removeEmptyAttributes: true,
				removeComments: !isDev,
				sortClassName: true,
				sortAttributes: true
			},
			cache: true
		}),
		new webpack.ProvidePlugin({
			React: 'react',
			ReactDOM: 'react-dom',
			ReactRouterDOM: 'react-router-dom'
		}),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
			'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL)
		}),
		isDev ? false : new webpack.optimize.SplitChunksPlugin({
			chunksFilter: true,
			chunks: 'all',
			usedExports: true,
		}),
		isDev ? false : new CompressionPlugin({
			filename: '[path][base]-[fullhash].gz[query]',
			algorithm: 'gzip',
			test: /\.js$|\.css$|\.html$|\.svg$|\.gif$|/,
			threshold: 10240,
			minRatio: 0.5
		}),
		new CopyPlugin({
			patterns: [
				{ from: 'public/assets', to: 'public/assets' },
				{ from: 'public/', to: BUILD_DIR, filter: (filepath) => filepath.endsWith('.js') },
			]
		})
	].filter(Boolean),
	experiments: {
		topLevelAwait: true
	}
};

export default commonConfig;
