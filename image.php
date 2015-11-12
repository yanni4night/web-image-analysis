<?php
/**
  * Copyright (C) 2015 tieba.baidu.com
  * image.php
  *
  * changelog
  * 2015-11-12[13:12:47]:revised
  *
  * @author yinyong02@baidu.com
  * @version 0.1.0
  * @since 0.1.0
  */
?><?php

if(!isset($argv[1])){
    throw new Exception("Image FileName Is Required!", 1);
}

$imgname = $argv[1];

$dir = dirname($imgname);
$basename = basename($imgname);
$ext = strtolower(end(explode('.', $imgname)));

$target = "$dir/$basename.chopped.$ext";

$size = getimagesize($imgname);

$w = $size[0];
$h = $size[1];

$fixedW = 980;

function createimg(){
    global $ext,$imgname;
    switch ($ext) {
        case 'jpeg':
        case 'jpg':
            return imagecreatefromjpeg($imgname);
        case 'png':
            return imagecreatefrompng($imgname);
            break;
        default:
            throw new Exception("$ext not supported", 1);
            break;
    }
}

function outimg(){
    global $ext,$im,$target;
    switch ($ext) {
        case 'jpeg':
        case 'jpg':
            return imagejpeg($im,$target);
        case 'png':
            return imagepng($im,$target);
            break;
        default:
            throw new Exception("$ext not supported", 1);
            break;
    }
}

$im = createimg();

if($w <= $fixedW){
    outimg();
    exit();
}

$white = imagecolorallocate($im, 255, 255, 255);
imagefilledrectangle($im, $x = ($w - $fixedW) * 0.5, 0, $x + $fixedW, $h, $white);
outimg();
echo filesize($imgname),'/',filesize($target);
?>