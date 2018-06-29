module.exports = {
    chainWebpack: config => {
        if (process.env.NODE_ENV === 'production') {
            config
                .plugin('extract-css')
                .tap(args => {
                    if (process.env.NODE_ENV === 'development') {
                        return [];
                    }

                    if (args.length === 0) {
                        return [{filename: '[name].css'}];
                    }

                    args[0].filename = '[name].css';
                    return args;
                });
        }
    },
    configureWebpack: {
        output: {
            filename: '[name].js',
            chunkFilename: '[name].js'
        },
    },
};
