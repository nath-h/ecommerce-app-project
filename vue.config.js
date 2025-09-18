const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack');
module.exports = {
  transpileDependencies: true,
  css: {
    loaderOptions: {
      sass: {
        implementation: require('sass'),
      },
    },
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
      }),
    ],
  },
};
