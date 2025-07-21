import { fileURLToPath } from 'node:url';
import * as path from 'path';

// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.error(__dirname);

export default {
  mode: 'development',
  target: 'electron-main',
  entry: './src/app/main/main.ts',
  output: {
    path: path.resolve(__dirname, '../dist/main'),
    filename: 'main.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          configFile: path.resolve(__dirname, '../tsconfig.main.json'),
        },
      },
    ],
  },
  node: {
    __dirname: false,
    __filename: false,
  },
};