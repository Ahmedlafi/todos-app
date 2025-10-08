const webpack = require('webpack');
const dotenv = require('dotenv');

module.exports = (config, options) => {
  // Load environment variables
  const env = dotenv.config().parsed;
  
  // Create environment variables object
  const envKeys = {};
  if (env) {
    Object.keys(env).forEach(key => {
      envKeys[key] = JSON.stringify(env[key]);
    });
  }

  // Add environment variables to webpack DefinePlugin
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env': envKeys
    })
  );

  return config;
};

