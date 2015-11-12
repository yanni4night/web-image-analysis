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
var forums = ["巨野", "成武", "曾厝垵", "丰南", "鹿邑", "固始", "曹妃甸", "沂源", "铜川", "贴吧地区test", "莱阳", "通许", "高碑店", "威县", "邓州", "安康", "海阳", "茌平", "故城", "阳谷"];
//["萌萌哒天团官方", "peg组合", "百度贴吧粉丝节", "百度贴吧粉丝节官方", "lunar少女组合官方", "uniq官方", "1931女子偶像组合官方", "李易峰官方", "陈伟霆官方", "范冰冰官方", "黄晓明官方", "tfboys官方"];

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
    var totalSize = 0; //results.length;
    var diff = 0;
    var old = 0;
    for (var i = 0; i < results.length; ++i) {
        diff += results[i].total.oldSize - results[i].total.newSize;
        old += results[i].total.oldSize;
        if (results[i].total.oldSize) {
            ++totalSize;
        }
    }
    require('fs').writeFileSync('results.json', JSON.stringify({
        'total-cleaned': ((diff / 1024) | 0) + 'kb',
        percent: (diff / old).toFixed(2) * 100 + '%',
        count: totalSize,
        diff: diff,
        list: results
    }, null, 2));
});