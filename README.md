# web-image-analysis

Analyze JPEG on web pages.

# usage

```
var wia = require('web-image-analysis');

wia.cleanJpeg('http://tieba.baidu.com/', function(err, result){
    console.log(result);
});
```

You have to run with `--harmony`.

# test

    npm run test

# author
 - <yanni4night@gmail.com>
