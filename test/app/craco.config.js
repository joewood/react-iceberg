const webpack = require("webpack");

module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            webpackConfig.resolve = webpackConfig.resolve || {};
            webpackConfig.resolve.fallback = {
                ...(webpackConfig.resolve.fallback || {}),
                stream: require.resolve("stream-browserify"),
                buffer: require.resolve("buffer/"),
                zlib: require.resolve("browserify-zlib"),
                path: require.resolve("path-browserify"),
                assert: require.resolve("assert/"),
            };

            webpackConfig.plugins = [
                ...(webpackConfig.plugins || []),
                new webpack.ProvidePlugin({
                    process: "process/browser",
                    Buffer: ["buffer", "Buffer"],
                }),
            ];

            return webpackConfig;
        },
    },
};
