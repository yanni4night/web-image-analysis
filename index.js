/**
 * Copyright (C) 2015 tieba.baidu.com
 * index.js
 *
 * changelog
 * 2015-10-27[17:19:15]:revised
 *
 * @author yinyong02@baidu.com
 * @version 0.1.0
 * @since 0.1.0
 */

var Nightmare = require('nightmare');
var grunt = require('grunt');
var fs = require('fs');
var vo = require('vo');
var jpegtran = require('jpegtran-bin');
var child_process = require('child_process');

function* load(url) {
    var n = new Nightmare({
        width: 2560,
        height: 1600,
        show: true
    });

    var loaded = false;

    yield n.on('dom-ready', function () {
        loaded = true;
    }).goto(url);

    while (!loaded) {
        yield n.wait(1e3);
    }

    yield n.evaluate(function () {
        document.body.scrollTop = document.body.scrollHeight;
    });

    // Wait for loading all images
    yield n.wait(2e3);

    var images = yield n.evaluate(function () {
        return Array.prototype.map.call(document.images, function (image) {
            return image.src;
        });
    });

    yield n.end();

    return images;
}


function filter(images) {
    var urls = {};
    return new Promise(function (resolve) {
        var jpegs = images.map(function (src) {
            var askIdx;
            if (~(askIdx = src.indexOf('?'))) {
                src = src.slice(0, askIdx);
            }
            if (!urls[src] && /\.(jpe?g)$/i.test(src)) {
                urls[src] = 1;
                return src;
            }
            return false;
        }).filter(function (src) {
            return !!src;
        });

        resolve(jpegs);
    });
}

function clean(images) {
    return new Promise(function (resolve) {
        child_process.exec('rm -rf images/*', function () {
            resolve(images);
        });
    });
}

function download(images) {
    return new Promise(function (resolve) {
        Promise.all(images.map(function (img) {
            return new Promise(function (resolve) {
                child_process.exec('cd images && curl ' + img + ' -sO', resolve);
            });
        })).then(function () {
            var localImages = grunt.file.expand(__dirname + '/images/*.jpg');
            resolve(localImages);
        });
    });
}

function compress(localImages) {
    var oldSize = 0;
    var newSize = 0;

    var promises = localImages.map(function (img) {
        return new Promise(function (resolve) {
            var o = fs.statSync(img).size;

            child_process.execFile(jpegtran, ['-copy', 'none', '-optimize', '-outfile', img + '.jpg',
                img
            ], function (err) {
                if (!err) {
                    var n = fs.statSync(img + '.jpg').size;
                    oldSize += o;
                    newSize += n;
                }/* else {
                     console.error(err.message);
                }*/
                resolve();
            });

        });
    });

    return new Promise(function (resolve) {
        Promise.all(promises).then(function () {
            resolve({
                oldSize: oldSize,
                newSize: newSize
            });
        });
    });
}

module.exports = function (url, cb) {
    new Promise(function (resolve) {
        vo(load)(url, function (err, images) {
            resolve(images);
        });
    }).then(function (images) {
        return clean(images);
    }).then(function (images) {
        return filter(images);
    }).then(function (images) {
        return download(images);
    }).then(function (localImages) {
        return compress(localImages);
    }).then(function (result) {
        cb(null, result);
    });
};