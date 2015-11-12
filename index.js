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
var path = require('path');
var jpegtran = require('jpegtran-bin');
var child_process = require('child_process');
var gm = require('gm');

function* load(url, findImageCb) {
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

    // Wait for loading all <img>
    yield n.wait(2e3);

    var images = yield n.evaluate(findImageCb);

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
            var localImages = grunt.file.expand(__dirname + '/images/*.{jpg,png,gif}');
            resolve(localImages);
        });
    });
}

function compress(localImages) {
    var oldSize = 0;
    var newSize = 0;
    var details = [];

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
                    details.push({
                        img: path.basename(img),
                        oldSize: o,
                        newSize: n
                    });
                }
                resolve();
            });

        });
    });

    return new Promise(function (resolve) {
        Promise.all(promises).then(function () {
            resolve({
                total: {
                    oldSize: oldSize,
                    newSize: newSize
                },
                list: details
            });
        });
    });
}


function chop(localImages) {
    var promises = [];

    var oldSize = 0;
    var newSize = 0;
    var details = [];

    localImages.forEach(function (img) {
        promises.push(new Promise(function (resolve) {
            child_process.execFile('php', [path.join(__dirname, 'image.php'), img], function (
                err, content) {
                if (!err) {
                    console.log(content);
                    var arr = content.trim().split('/');
                    var o = +arr[0];
                    var n = +arr[1];
                    oldSize += o;
                    newSize += n;
                    details.push({
                        img: path.basename(img),
                        oldSize: o,
                        newSize: n
                    });
                }
                resolve();
            });
        }));
    });

    return new Promise(function (resolve) {
        Promise.all(promises).then(function () {
            resolve({
                total: {
                    oldSize: oldSize,
                    newSize: newSize
                },
                list: details
            });
        });
    });
}

module.exports = {
    cleanJpeg: function (url, cb) {
        new Promise(function (resolve) {
                vo(load)(url, function () {
                    return Array.prototype.map.call(document.images, function (image) {
                        return image.src;
                    });
                }, function (err, images) {
                    resolve(images);
                });
            }).then(function (images) {
                return clean(images);
            })
            .then(function (images) {
                return filter(images);
            })
            .then(function (images) {
                return download(images);
            }).then(function (localImages) {
                return compress(localImages);
            }).then(function (result) {
                cb(null, result);
            });
    },
    cleanBgImg: function (url, cb) {
        new Promise(function (resolve) {
            vo(load)(url, function () {
                return [window.$('#container').css('background-image').match(
                    /url\((.+\.(jpg|png|gif|bmp)).*\)/i)[1]];
            }, function (err, images) {
                resolve(images);
            });
        }).then(function (images) {
            return clean(images);
        }).then(function (images) {
            return download(images);
        }).then(function (localImages) {
            return chop(localImages);
        }).then(function (result) {
            cb(null, result);
        });
    }
};