# web-image-analysis

Analyze JPEG on web pages.

# usage

```
var wia = require('web-image-analysis');

// Output:{oldSize:1024, newSize:512}
wia('http://tieba.baidu.com/', function(err, result){
    console.log(result);
});
```

You have to run with `--harmony`.

# test

    npm run test

# author
 - <yanni4night@gmail.com>
