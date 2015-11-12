/**
 * Copyright (C) 2015 tieba.baidu.com
 * test.js
 *
 * changelog
 * 2015-10-28[17:57:55]:revised
 *
 * @author yinyong02@baidu.com
 * @version 0.1.0
 * @since 0.1.0
 */
var forums = ["萌萌哒天团官方", "peg组合", "百度贴吧粉丝节", "百度贴吧粉丝节官方", "lunar少女组合官方", "uniq官方", "1931女子偶像组合官方", "李易峰官方", "陈伟霆官方",
    "范冰冰官方", "黄晓明官方", "tfboys官方"
];

//forums = ['福娃留学'];

var wia = require('./index');
var async = require('async');

var results = [];

async.series(forums.map(function (name) {
    return function (resolve) {
        wia.cleanJpeg('http://tieba.baidu.com/f?ie=utf-8&kw=' + encodeURIComponent(name), function (err,
            result) {
            if (result) {
                result.forumName = name;
                results.push(result);
            }
            resolve();
        })
    };
}), function () {
    var totalSize = results.length;
    var diff = 0;
    var old = 0;
    for (var i = 0; i < totalSize; ++i) {
        diff += results[i].total.oldSize - results[i].total.newSize;
        old += results[i].total.oldSize;
    }
    require('fs').writeFileSync('results.json', JSON.stringify({
        all: ((diff / 1024) | 0) + 'kb',
        percent: (diff / old).toFixed(2) * 100 + '%',
        count: results.length,
        diff: diff,
        list: results
    }, null, 2));
});