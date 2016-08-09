#!/usr/bin/env node

'use strict';

var program = require('commander');
program
    .version('0.0.1')
    .on('help', function () {
        console.log('$ httpserver start -p 9999');
    });
program
    .command('start')
    .option('-p,--port <n>', '指定端口', parseInt)
    .action(function (options) {
        var fs = require('fs');
        var path = require('path');
        var open = require("open");
        var serve = require('koa-static');
        var koa = require('koa');
        var app = new koa();

        var favicon = require('koa-favicon');
        var compress = require('koa-compress');
        var conditional = require('koa-conditional-get');
        var etag = require('koa-etag');

        app.use(compress({
            filter: function (content_type) {
                return /text/i.test(content_type)
            },
            threshold: 2048,
            flush: require('zlib').Z_SYNC_FLUSH

        }));

        app.use(conditional());

        app.use(etag());

        //app.use(favicon(__dirname + '/public/favicon.ico'));

        app.use(serve(process.cwd()));

        app.use(function* (next) {
            var files = fs.readdirSync(process.cwd());
            var filePaths = [];
            if (files && files.length) {
                files.forEach(function (fileName) {
                    var filePath = path.normalize(process.cwd() + '/' + fileName);
                    //console.log(filePath);
                    filePaths.push(filePath);
                });
            }
            this.body = filePaths;
        });


        var port = options.port != undefined ? options.port : 8088;
        app.listen(port);
        console.log('listen on port ' + port);

        open("http://localhost:" + port);

    });
program.parse(process.argv);//开始解析用户输入的命令