# web-image-analysis

Analyze the JPEG on web pages.

# usage

```
var wia = require('web-image-analysis');

// Output:{oldSize:1024, newSize:512}
wia('http://tieba.baidu.com/', function(err, result){
    console.log(result);
});
```

You have to run with `--harmony` because of [nightmare](https://github.com/segmentio/nightmare).

# author
 - <yanni4night@gmail.com>
