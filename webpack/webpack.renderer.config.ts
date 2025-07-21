import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { fileURLToPath } from 'node:url';
import * as path from 'path';

// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV !== 'production';

export default {
  mode: isDev ? 'development' : 'production',
  entry: './src/app/renderer/main.tsx',
  target: 'web',
  output: {
    path: path.resolve(__dirname, './../dist/renderer'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          configFile: path.resolve(__dirname, '../tsconfig.renderer.json'),
        },
        exclude: "/node_modules/",
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                config: true, // Looks for postcss.config.js automatically
              },
            },
          },
        ],
      },
    ],

  },

  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index.html'),
      // Add this to prevent conflicts:
      filename: 'index.html',
      // Optional: explicitly specify chunks
      // chunks: ['main']
    }),
    // Remove the CopyWebpackPlugin or exclude index.html
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../public'),
          to: '.',
          globOptions: {
            ignore: ['**/index.html'] // Skip the HTML file
          },
          noErrorOnMissing: true // Add this to prevent errors if files don't exist
        }
      ]
    }),
  ],

  devServer: {
    port: 3000,
    hot: true,
    static: {
      directory: path.resolve(__dirname, 'dist/renderer'),
    },
    devMiddleware: {
      writeToDisk: true, // Helps avoid memory issues
    }
  },
};