"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var node_url_1 = require("node:url");
var path = require("path");
// @ts-ignore
var __filename = (0, node_url_1.fileURLToPath)(import.meta.url);
var __dirname = path.dirname(__filename);
console.log(__dirname);
exports.default = {
    mode: 'development',
    target: 'electron-main',
    entry: './src/app/main/main.ts',
    output: {
        path: path.resolve(__dirname, 'dist/main'),
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
                    configFile: path.resolve(__dirname, 'tsconfig.main.json'),
                },
            },
        ],
    },
    node: {
        __dirname: false,
        __filename: false,
    },
};
