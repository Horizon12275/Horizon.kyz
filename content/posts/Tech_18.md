---
type: "post"
title: "wireshark入门学习"
author: "horizon"
category: "Tech"
date: "2025-02-01"
slug: "/Tech_18"
postImage: "./img/Tech_18.jpg"
metaDescription: "记录了 wireshark 的入门学习笔记。包含了 wireshark 的基本概念、wireshark 的基本操作、wireshark 的抓包设置、wireshark 的过滤设置、wireshark 的文件提取等内容。"
---

## L1 layout

1. 可以调 preference

2. 可以加数据列（delta time）

3. 可以显示数据包的布局然后显示对应的字段的值

4. tcp.flags.syn == 1 的意思是 tcp 的 flag 里面的 syn 位是 1，也就是 tcp 的第一次握手

## L2 capture settings

1. 点齿轮 界面右下角 manage interface 可以选择显示的网络

2. 可以不抓整个 payload 可以只抓每个包前的 100 字节左右，看到包头之后就差不多可以了

3. 启动 promiscous mode 可以抓到所有的包（就是其他机器间传递的包也可以拿到）

4. pcap 的意思是 packet capture ，是一种数据包捕获的文件格式

5. 要捕获很多小的 pcap、而不是很大的 pcap，因为很大的 pcap 打开会很慢，需要额外的 filter（就是每个 500MB 做一个 pcap 的分割会好一点）

6. 可以在齿轮设置里设置对应的文件保存路径和过滤逻辑

7. 可以设置 ring buffer 设置最大文件个数（环形覆盖）

## L3 cmd

1. 没细看 主要是用 dumpcap 命令

2. 好处是可以在服务器上抓包

## L4 where 2 capture packets

1. 取决于要解决的问题是什么

2. 可以至少在客户端和服务器端的交换机（而不是服务器、因为可能服务器已经在跑很多进程了）都用 wireshark 抓包

## L5 filtering

1. 有 capture filter 和 display filter

2. capture filter 是在抓包的时候就过滤掉不需要的包，display filter 是在抓包之后再过滤

3. capture filter 用的是 pcap filter 语法，display filter 用的是 wireshark 的语法

4. capture filter 在抓的时候设置，display filter 在抓完之后搜索，所以要多用 display filter（因为可以搜索到所有的包）

5. capture filters

```bash
port 53 // 抓 dns 包
tcp port 80
arp
host
```

6. display filters

```bash
tcp.flags.syn == 1 // 抓第一次握手
arp // 抓 arp 包
ip.addr == 192.0.0.1
(ip.addr == 192.0.0.1) and arp // 两个条件
not arp // 不是 arp 包
not arp or not dns // 不是 arp 也不是 dns
tcp.port in {80 443} // tcp 的端口是 80 或者 443
frame contains GET // 包含 GET 的包，大小写敏感
frame matches .*GET.* // 正则匹配
```

7. 或者直接右键包、然后 conversation filter、然后选择对应的协议，或者其他 filter 相关的过滤，右键包里的内容也可以

## L6 name resolution

1. 可以设置显示的 mac 方式

2. 可以设置在 https 旁边显示 443，知名端口

3. 可以在显示的时候利用 dns 信息翻译 ip 地址为域名

4. 在 statistics 里面可以看到 resolved addresses

5. 也可以右键点击 ip 手动设置 resolved addresses

## L7 time column

1. 默认设置 是包的总时间下的运行时间

2. 可以在 view 里面设置 time display format，比如设置为 day time

3. 这个是和当前系统时间有关（和时区有关）

4. 也可以 set time reference，就是从自定义的包开始计时作为零点

5. edit 里面可以 unset all time references

6. 可以注意 server 的 waiting time

## L8 statistics

1. 可以使用 statistics 下的 conversations 查看各种协议的对话情况

   - 比如和看到这个是在文件的什么时候开始的、以及包的持续时间
   - 如果有显示在一个子网下的很多 ip 的话、可能是在扫描子网的情况（也许不是顺序的，可能是一种攻击）

2. 也可以右键来指定过滤两个 ip 之间的所有流量

## L9 extracting files from pcaps

1. 就是怎么从 pcap 里面提取有效的信息和文件，比如传输的图片

2. 很简单，只需要点击 file 里面的 export objects，然后选择对应的协议，然后就可以看到可以导出的所有的文件了

3. 右键点 follow tcp stream 可以看到整个 tcp 的 data 内容（明文传输的话）

## L10 geoIP

1. https://dev.maxmind.com/geoip/geolite2-free-geolocation-data/?lang=en 上下载数据库.mmdb 文件

2. 可能 ip 会发生不定期变动

3. 在设置 name resolution 里面设置 geoip 数据库的路径

4. 好像也可以设置查看的时候显示地图，不过我没找到
