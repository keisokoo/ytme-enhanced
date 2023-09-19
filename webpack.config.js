const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const fs = require('fs')
const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const { WebpackManifestPlugin } = require('webpack-manifest-plugin')

function syncManifest(isDevelopment) {
  const manifestPath = path.resolve(__dirname, 'dist/manifest.json')
  const assetManifestPath = path.resolve(__dirname, 'dist/asset-manifest.json')

  // asset-manifest.json 읽기
  const assetManifest = require(assetManifestPath)
  // manifest.json 읽기
  const manifest = require(manifestPath)

  // 파일 이름 업데이트
  if (assetManifest['options.html'])
    manifest.options_page = assetManifest['options.html']
  // if (manifest.action?.default_popup && assetManifest['popup.html'])
  //   manifest.action.default_popup = assetManifest['popup.html']
  manifest.content_scripts[0].css = [assetManifest['content.css']]
  manifest.content_scripts[0].js = [assetManifest['content.js']]
  manifest.background.service_worker = assetManifest['background.js']

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
}

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development'
  return {
    devtool: 'cheap-module-source-map',
    entry: {
      background: './src/background/index.ts',
      content: './src/content/index.tsx',
      popup: './src/pages/popup/index.tsx',
      options: './src/pages/options/index.tsx',
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
    },
    devServer: {
      hot: true,
      port: 3030,
    },
    module: {
      rules: [
        {
          test: /\.(j|t)sx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  '@babel/preset-env',
                  '@babel/preset-typescript',
                  ['@babel/preset-react', { runtime: 'automatic' }],
                ].filter(Boolean),
                plugins: [
                  isDevelopment && require.resolve('react-refresh/babel'),
                ].filter(Boolean),
              },
            },
          ],
        },
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: ['autoprefixer', 'cssnano'],
                },
              },
            },
            'sass-loader',
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      fallback: {
        assert: false,
        fs: false,
        path: false,
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'popup.html',
        template: 'src/pages/popup/popup.html',
        chunks: ['popup'],
        scriptLoading: 'defer',
      }),
      new HtmlWebpackPlugin({
        filename: 'options.html',
        template: 'src/pages/options/options.html',
        chunks: ['options'],
        scriptLoading: 'defer',
      }),
      new CopyPlugin({
        patterns: [{ from: 'public', to: '.' }],
      }),
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[id].css',
      }),
      // {
      //   apply: (compiler) => {
      //     compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
      //       syncManifest(isDevelopment)
      //     })
      //   },
      // },
      new ForkTsCheckerWebpackPlugin(),
      new WebpackManifestPlugin({
        fileName: 'asset-manifest.json',
        publicPath: '/',
      }),
      isDevelopment &&
        new ReactRefreshWebpackPlugin({
          options: {},
        }),
    ].filter(Boolean),
    watchOptions: {
      ignored: /node_modules/,
    },
  }
}
