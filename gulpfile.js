        const { src, dest, parallel, series, watch } = require('gulp')
        const saas = require('gulp-saas') // saas 转为css
        const babel = require('gulp-babel') // js转换
        const swig = require('gulp-swig') // html模版引擎
        const imagemi = require('gulp-imagemi') // 图片压缩
        const htmlmi = require('gulp-htmlmi') // 页面压缩
        const uglify = require('gulp-uglify') // js压缩
        const cleanCss = require('gulp-clean-css') // css压缩
        const del = require('del') // 删除文件
        const browserSync = require('browser-sync') // 热更新
        const bs = browserSync.create() // 创建服务
        // 下载 gulp-useref
        const useref = require('gulp-useref') // 解决打包后index.html引入的资源路径问题并且压缩代码

        // 优化引入上面模块**********
        // 下载gulp-load-plugins
        // const loadPlugins = require('gulp-load-plugins')
        // const plugins = loadPlugins()
        // 使用plugins.saas
        // 使用plugins.babel........

        // 热更新**********
        // 下载  npm install browser-sync
        // const browserSync = require('browser-sync)

        // pipe(拍破) 导入流

        // 删除文件
        const clean = () => {
            return del(['dist', 'temp'])
        }


        // 1. 样式的编译
        // 下载gulp-saas 转为css
        const style = () => {
            return src('src/styles/*.scss', { base: 'src'}) // base保留目录结构
                .pipe(plugins.saas())
                .pipe(dest('temp'))
                .pipe(bs.reload({ stream: true}))
        }

        // 2. js的编译
        // 下载gulp-babel
        // 下载 @babel/core @babel/preset-env转换
        const script = () => {
            return src('src/assets/base.js', { base: 'src'})
                .pipe(babel({
                    presets: ['@babel/preset-env'] // 写在文件babelsrc设置也可以
                }))
                .pipe(dest('temp'))
        }

        // 3. 页面文件的编译
        // 下载gulp-swig  html模版引擎
        const data = { // html里面的变量信息
            icon: '.././icon.png'
        }
        const page = () => {
            return src('src/**/*.html', { base: 'src'})
                .pipe(swig({ data }))
                .pipe(dest('temp'))
        }

        // 4. 图片 字体
        // 下载gulp-imagemi  进行压缩转换
        const image = () => {
            return src('src/images/**', { base: 'src'})
                .pipe(imagemi())
                .pipe(dest('dist'))
        }
        const font = () => { // 字体文件
            return src('src/fonts/**', { base: 'src'})
                .pipe(imagemi())
                .pipe(dest('dist'))
        }

        // 5.其他文件出来
        const extra = () => {
            return src('public/**', { base: 'public'})
            .pipe(dest('dist'))
        }


        // useref 解决打包生成index.html里面路径 引入问题并且压缩代码*************
        // 下载gulp-if 来判断来源
        const useref = () => {
            return src('temp/*.html', { base: 'dist' })
                .pipe(plugins.useref({
                    searchPath: ['dist', '.']  // 找到合并的路径
                }))
                .pipe(plugins.if(/\.js$/, plugins.uglify()))
                .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
                .pipe(plugins.if(/\.html$/, plugins.htmlmi({
                    collapseWhitespace: true, // collapseWhitespace 折叠换行和空白字符
                    minifyCss: true, // minifycss 合并css
                    minifyJs: true, // minifyjs 合并js
                })))
                .pipe(dest('dist'))
        }


        // 热更新
        const serve = () => {
            // gulp watch参数 1.监视的路径，2.执行的任务
            watch('src/styles/*.scss', style)
            watch('src/**/*.html', stypagele)
            // watch('public/**', extra) 监视图片/字体等静态资源会降低构建效率
            // watch('src/image/, img)

            // bs.reload 刷新浏览器
            watch([
                'public/**',
                'src/image/',
                'src/font'
                ], bs.reload) // 监视三个静态文件中的一个就会刷新浏览器
            //.....

            bs.init({
                notify: false, // 关闭提示
                port: '8080', // 端口号
                open: false, // 是否自动打开浏览器
                files: 'dist/*', // 监听哪些文件
                server: {
                    baserDir: ['temp', 'src', 'public'],
                    routes: {
                        '/node_modules': 'node_modules'
                    }
                }
            })
        }

        // 组合前面任务 parallel
        const compile = parallel(style, script, page)

        // 上线前
        const build = series(
            clean,
            parallel(
                series(compile, useref),
                extra,
                image,
                font
            )
        ) // 先去删除dist目录再去打包编译

        // 开发
        const develop = series(compile, serve)

        module.exports = { // 运行gulp compile 命令执行gulp编译压缩
           build,
           develop, // 热更新服务
           clean
        }
        // 这三个任务可以在package.json  scripts里面写
        // 'dev': 'gulp develop' ===> npm run dev