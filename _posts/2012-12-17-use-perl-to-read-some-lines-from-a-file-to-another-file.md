---
layout: page
title: "使用perl来读写文件"
category: perl
tags: [file]
description: "使用perl来读取文件，并写入到新文件中"
---

# 使用Perl从文件中读取字符串，一般有两种方法：

1.一次性将文件中的所有内容读入一个数组中(该方法适合小文件)：

{%highlight javascript%}
open(FILE,"filename")||die"can not open the file: $!";
@filelist=<FILE>;

foreach $eachline (@filelist) {
    chomp $eachline;
}
close FILE;
{%endhighlight%}

2.一次从文件中读取一行，一行行地读取和处理(读取大文件时比较方便)：
{%highlight javascript%}
open(FILE,"filename")||die"can not open the file: $!";

while (defined ($eachline =<FILE>)) {
    chomp $eachline;
    # do what u want here!
}
close FILE;
{%endhighlight%}

# 使用perl输入到文件
STDOUT是perl预设的一个文件句柄，print语句就默认使用它来输出到屏幕。如果要输出到文件就需要指定一个我们定义的文件句柄，例如：
{%highlight javascript%}
open(RESULTFILE,">","result.log");
print RESULTFILE content;
{%endhighlight%}

# 综合实例
该例子实现边读边写功能：
{%highlight javascript%}
#!/usr/bin/perl
open(FINDFILE,"<:utf8","Conet.log");
open(RESULTFILE,">","result.log");

while (<FINDFILE>) {
    #通过正则匹配出需要输出的内容
    if(/.*redis_event.*/){
        print RESULTFILE $_;
    }
}

close FINDFILE;
close RESULTFILE;
{%endhighlight%}