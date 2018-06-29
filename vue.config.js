
module.exports = {
    chainWebpack: config => {
        config
            .plugin('extract-css')
            .tap(args => {
                args[0].filename = '[name].css';
                return args;
            });
    },
    configureWebpack: {
        output: {
            filename: '[name].js',
            chunkFilename: '[name].js'
        },
    },
};
