const webpack = require('./config/webpack.config');
const config = {
    secure: false,
    changeOrigin: true,
    logLevel: "debug"
};
module.exports = webpack(env => {
    return {
        port: 8099,
        proxy: {
            /**
            * 脚手架服务器地址
            */
            '/server': {
                target: 'http://localhost:8765',
                // pathRewrite: {
                //     "^/server": ""
                // },
                ...config
            },
            /**
             * swaggerDoc 代理地址
             */
            '/swaggerDoc': {
                target: 'http://localhost:8765/',
                pathRewrite: {
                },
                ...config
            },
        },
        deployWrite: `
        <!--             写点什么进去？             -->
        `,
        // 字符串写入 需要 使用 JSON.stringify 转换
        DefinePlugin: {
            APIADDRESS: JSON.stringify(env.type == "deploy" ? "/api" : "/api"),
        }
    }
})