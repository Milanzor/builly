// Get path
const path = require('path');

// Get webpack
const webpack = require('webpack');

// Webpack globs
const WebpackWatchedGlobEntries = require('webpack-watched-glob-entries-plugin');

// Css plugin
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// Config
module.exports = (env) => {

    if (typeof env !== 'object' || !'env' in env) {
        env = {
            env: 'dev'
        };
    }

    return {

        // Devtool
        devtool: env.env === 'dev' ? 'source-map' : false,

        // Entries
        entry: WebpackWatchedGlobEntries.getEntries(path.resolve(__dirname, 'assets', 'Entry', '**', '*.{js,scss}')),

        // Output
        output: {
            filename: "[name].js",
            path: path.resolve(__dirname, 'public', 'dist'),
            chunkFilename: "[name].js",
            publicPath: "/",
        },

        // Mode
        mode: env.env === 'dev' ? 'development' : 'production',

        resolve: {
            alias: {
                'jquery': path.resolve(__dirname, 'node_modules', 'jquery'),
                'daemonite-material': path.resolve(__dirname, 'node_modules', 'daemonite-material'),
            },
        },

        // Module
        module: {
            rules: [

                // SCSS rule
                {
                    test: /\.scss$|.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: "css-loader",
                            options: {
                                minimize: env.env !== 'dev',
                            },
                        },
                        'postcss-loader',
                        "sass-loader",
                    ]
                },

                // Babel rule
                {
                    test: /\.js$/,
                    use: [
                        "babel-loader",
                    ],

                },

                // Font and img rules
                {
                    test: /\.(eot|svg|ttf|woff|woff2|jpg|jpeg|png|gif)$/,
                    use: {
                        loader: "file-loader",
                        options: {
                            publicPath: './',
                            name: "[name].[ext]"
                        }
                    },
                }

            ],
        },

        // Optimization
        optimization: {
            runtimeChunk: {
                name: 'commons',
            },
            splitChunks: {
                chunks: "all",
                cacheGroups: {
                    vendors: false,
                    default: false,
                    style: {
                        test: /\.scss$|.css$/,
                        name: "commons",
                        minChunks: 1,
                    },
                    commons: {
                        name: "commons",
                        chunks: "all",
                        minChunks: 3,
                        enforce: true
                    },
                },
            }
        },

        // Performance
        performance: {
            hints: false
        },

        // Stats
        stats: {
            // chunkModules: false,
            assets: false,
        },

        // Plugins
        plugins: [
            new MiniCssExtractPlugin({
                filename: "[name].css",
                chunkFilename: "[name].css"
            }),
            new WebpackWatchedGlobEntries(),
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery",
                "window.jQuery": "jquery"
            }),
        ]
    };
};
