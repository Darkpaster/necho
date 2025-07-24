import { fileURLToPath } from 'node:url';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const preloadPath = path.join(__dirname, 'preload.js');

export default {
  mode: 'development',
  target: 'electron-main',
  entry: './src/app/main/main.ts',
  output: {
    path: path.resolve(__dirname, '../dist/main'),
    filename: 'main.js',
    module: true,
  },
  experiments: {
    outputModule: true, // Включаем поддержку ESM на выходе
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
          compilerOptions: {
            module: 'ES2022',
          },
        },
      },
    ],
  },
  node: {
    __dirname: false,
    __filename: false,
    global: false,
  },
};