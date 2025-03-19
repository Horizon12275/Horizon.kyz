---
type: "post"
title: "计算机系统工程CSE课程学习笔记"
author: "horizon"
category: "Tech"
date: "2025-01-01"
slug: "/Tech_12"
postImage: "./img/Tech_12.jpg"
metaDescription: "归档记录了计算机系统工程CSE上课笔记整理，其中包括 A High Scalability Web Server、From single to distributed: inode-based File System & CAP、Remote Procedure Call、Distributed File System （DFS）：NFS & GFS 等。"
---

## 02 A High Scalability Web Server

1. 特点：

   - 高请求量
   - 大量数据
   - transparent scale（隐藏用户规模）

2. 处理每个请求的所耗的时间是不一样的（ai 时代中），推理所耗的时间会长

3. LAMP 架构不能 scale，只能在单台服务器上

4. scalability 1：解耦，把不同的功能分开，不同的功能用不同的服务器来处理，比如数据库服务器，文件服务器，web 服务器

5. scalability 2：缓存，把一些数据缓存起来，比如 page cache，memcached（专门的缓存服务器，用内存来存）memecahed 可以支持在多台服务器上，可以 scale。一个经典的方法就是把 key hash 到不同的服务器上。但是原始的 hash 在 scale 的时候，会造成很多 miss。解决方法是 consistent hashing

6. scalability 3：更多的 app server，比如用负载均衡器来分发请求

7. scalability 4：数据库分库和分表

8. scalability 5：文件系统的扩展，比如一个很大的文件、可以存在不同的服务器上，然后用一个文件系统来管理这些文件。eg. GFS，NFS，HDFS

9. scalability 6：用 CDN，把静态文件放到 CDN 上，CDN 会根据用户的位置，选择最近的服务器来提供服务

10. scalability 7：分开不同的 application 和业务+分布式计算。

11. 分布式系统：A distributed system is a collection of independent computers that appears to its users as a single coherent system.

12. 数据中心的规模。rack -> row -> data center

13. 出错：用户体验到的错误。随着 scale，出错的概率会增加。出错的原因：硬件故障，软件 bug，网络故障，人为错误

14. 例子：unreliable network 的很多原因，见 ppt

## 03 & 04 From single to distributed: inode-based File System & CAP

1. 分布式系统要给人一种一直在线的感觉，即使有一台服务器挂了，用户也不会感觉到。

2. Availabity: 高可用 （x nines）

   - 3-nines = 99.9% = 8.76h/year
   - 5-nines = 99.999% = 5.26m/year
   - 7-nines = 99.99999% = 3.15s/year

3. reliability: 高可靠性

   - 1. MTTF (Mean Time To Failure): 平均故障间隔时间
   - 2. MTTR (Mean Time To Repair): 平均修复时间
   - 3. MTBF (Mean Time Between Failure): 平均故障间隔时间
   - 4. MTTF + MTTR = MTBF

4. 达成高可用：

   - Replication: 相同的副本，比如多个文件服务器
     - 挑战：一致性
   - Handling failures via retry: 重启系统，重新发送请求
     - 挑战：What about consistency? Must made trade-off

5. CAP theorem: 一个分布式系统，最多只能满足三个特性中的两个

   - Consistency: 所有的节点看到的数据是一样的
   - Availability: 每个请求都能得到一个响应
   - Partition tolerance: 系统在网络分区的情况下，仍然能够工作

6. single-node inode-based file system

   - inode: 一个文件的元数据，包括文件名，文件大小，文件权限，文件的地址等
   - block: 文件的内容
   - 一个文件的 inode 会指向多个 block，一个 block 会指向下一个 block，形成一个链表
   - 一个目录的 inode 会指向多个文件的 inode

7. 文件是持久化的、也是有名字的

8. driver 和应用对文件的读写的 api 是不一样的。应用需要更高层的抽象。driver 只可以抽象出 block 的读写。系统层需要在基于硬盘的 block 读写的 api 上，提供文件的读写的 api。

9. naive file system：用 sector index 和 append 和 reallocate 操作。但是这样会有很多问题，比如文件的大小会有限制，文件的读写会很慢，文件的删除会很慢，文件名的查找不可行，文件的权限控制不可行和安全不可行。

10. 所以有了系统层对文件系统的抽象、比如 unix 文件系统的 api

11. 文件系统有很多层。

12. L1 : Block Layer:把 sector 变成 block，一个文件由很多 block 组成。能保证文件系统可以在不同大小的 sector 的硬盘上工作，保证 block 大小相同就行。

13. 如何选择合适大小的 block？

    - 太小：会有很多 block，会有很多 seek，会很慢
    - 太大：会有很多内部碎片，会浪费空间
    - tradeoff = 4KB

14. boot block: 保存文件系统的引导信息

15. super block（每个文件系统一个）: 保存文件系统的元数据，比如 block 的大小，block 的数量，inode 的数量，inode 的大小

16. bitmap: 保存 block 的使用情况

    - 1byte = 8bit，一个 bit 代表一个 block 的使用情况

```c
struct inode
   integer size
   integer block_nums[N]
   integer type
   integer refcnt
```

17. L2 :file layer:

    - inode，一个文件的元数据 (index node),记录了哪个 blocks 属于哪个文件
    - 我们把 inode 存在哪里？因为每个 block 都有大小限制，所以可以把一个父的 inode block 中的几个 index 指向另外几个 indirect block，这样就可以存更多的 block 了
    - 和页表的区别：inode 头上的几个 block 可以只访问一次就可以访问到。但是页表的话，要跳转几次才能访问到。而且文件头上的数据的访问比较常见。

18. L3 : inode Number Layer：Mapping inode number -> inode

    - inode table: 保存 inode number
    - 可以再存一个 inode table 的 table，提高资源利用率

19. L4 :file name layer：Mapping file name -> inode number

    - directory entry: 保存文件名和 inode number 的对应关系
    - mapping table is saved in directory
    - 但是需要遍历
    - 当前运行的目录同样是一个文件
    - 目录的厚度由存储的文件的文件名的长度决定
    - 目录里面记录的是一个字符串到一个 inode number 的映射

20. L5 :所以有了 path name layer：Mapping path name -> inode number

21. links：读一次 path 就可以读到文件

    - 存在多个引用的情况、所以用 refcnt 来记录引用次数，保证正常增删，文件的 refcnt 为 0 的时候就删掉
    - 但是如果文件夹结果有环的话，就会有问题
    - 不允许有环的话、就不允许 link 到 directory（除了.和..）

22. 文件重命名

    - UNLINK(to_name)
    - LINK(from_name, to_name)
    - UNLINK(from_name)
    - 需要原子操作、否则如果在中间出错、就会有问题

23. ppt 中、每一行机器代码都是一个 ext4_dir_entry

24. L6 : Absolution Path Layer

    - 因为会有多个用户，所以需要绝对路径
    - 引入了绝对路径，根目录是 /
    - 根目录下的/.和/..都是指向自己的/

25. 例子：找到"/programs/pong.c"

    - 从 super block 找到 inode table 的 block
    - 找到根目录的 inode：根目录的 inode number 是 1，是固定的、因为不能通过递归的方式找到根目录
    - inode table 中的 number 存的就是 block 的 number
    - block 中文件的 number 存的是 inode table 的 number
    - 最终找到文件在 61 的 block 中
    - 一个 block 可以是一个 directory 或者是一个 file

26. 所以相当于、在 inode table 里存的东西可以是一个目录 directory、也可以是一个文件的所有 block number。

27. 也可以创建硬连接 LINK，但是 naive 的方法、没法在多个文件系统中使用，比如一台电脑上插了两个硬盘

28. L7 : Symbolic Link Layer

    - 可以跨文件系统，即跨磁盘
    - ppt 中的例子：即使/tmp/abc 还不存在、但是可以创建一个指向/tmp/abc 的 symbolic link
    - 但是 cat s-link 会报错，因为/tmp/abc 不存在
    - 创建了之后、再 cat s-link 就可以查看/tmp/abc 中的内容了
    - ls 中的 8 代表一个 symbolic link 的大小（就是保存了/tmp/abc 的路径长度）

29. 所以有了两种连接：hard link 和 symbolic link（就是 soft link）

    - hard link：文件名和 inode number 的映射（通过 inode number 找到文件）
    - symbolic link：文件名和路径的映射

30. Context Change

    - /CSE-web -> /Scholarly/programs/www
    - cd /CSE-web
    - cd ..
    - 这样会回到根目录 / 这是一个 bash 的优化（feature）
    - 只有 cd -P .. 才会回到/Scholarly/programs

31. 文件名是不是文件的一部分？

    - 一个文件的文件名不属于这个文件
    - 因为这个字符串不保存在这个文件的 block 中
    - 一个文件的文件名是保存在他的目录中的
    - name is data of a directory ， and metadata of a file system
    - 元数据是什么？就是文件的属性，比如文件的大小、文件的权限、文件的创建时间等

32. 每一个 hard link 都是等价的

33. directory size 都是很小的（见上原因）

34. 文件系统要实现的 API，包装之后实现为 system call

35. open 和 fopen 的区别（后续都是基于 linux 的 open）：

    - open 是系统调用，fopen 是库函数
    - open 返回的是文件描述符，fopen 返回的是文件指针
    - open 是低级 I/O，fopen 是高级 I/O
    - open 是 POSIX 标准，fopen 是 C 标准
    - open 只能用在 Unix/Linux 系统，fopen 可以用在大多数系统
    - fopen 会有缓冲区，open 不会，所以 fopen 会有更好的性能

36. 真实的 inode 还需要加一点内容

```c
struct inode
    integer size
    integer block_nums[N]
    integer type
    integer refcnt

    integer userid
    integer groupid
    integer mode
    integer atime // last access time （by read）
    integer mtime // last modify time （by write）
    integer ctime // last change time （by LINK）
```

    - 为什么要有ctime呢？要记录文件权限的变化，所以要有 ctime（比如说 chmod的时候）

36. fd : 文件描述符

    - 0: stdin
    - 1: stdout
    - 2: stderr

37. 为什么要这么设计 fd 呢？

    - 选项 1：OS 可以返回一个 inode pointer
    - 选项 2：OS 可以返回文件的所有 block numbers
    - 但是为了 Security（用户永远不能访问到系统的 data structure），和 Non-bypassability（不能绕过系统的安全机制），所以用 fd
    - 又是一层抽象，能控制一个进程没法访问其他的文件

38. file cursor：每个 fd 都有一个 cursor，记录文件的读写位置。进程和他的子进程会共享这个 cursor（即从同一个位置读写）

    - 为什么要这么设计？什么时候合理？要写的时候是合理的、如果不共享一个 cursor，就会覆盖
    - 写东西的时候最好只有一个写者，single writer principle

39. fd_table：记录了所有的 fd,里面有 fd 和 index，index 指向 file table 中的一条

40. file table：记录了所有的 file。其中有 inode num，file cursor，file refcnt 等。

41. 关掉一个 fd 之后、新的 fd 是当前可用的 fd 中最小的那一个（导致不能做并行）

42. ppt 上有一个 disk 的例子图片，还有一个 open read 的时序图的例子

43. 会默认加一个参数 -noatime。

44. 例子 1

    - read 里面的 write、是要写 inode 的 atime

45. 例子 2

    - create 里面、read write inode bitmap 是因为要创建一个文件的写

    - bar inode 里面第一个 read 是因为要先读再写（粒度是 4K）

    - foo 的 inode 第二个写：是因为自己也有 atime，然后更新目录的大小

    - 写里面为什么要读 databitmap，要先读、找到一个空的 block，然后写

    - bar inode 的第二次写、更新 metadata

46. 三种顺序哪种好？

    - Update block bitmap, write new data, update inode (size and pointer)
    - 第一种的顺序稍好、无非是浪费磁盘空间，而且可以监测出来（先扫一遍 inode，再和 bitmap 对比一下，如果一个 block 没有被任何 inode 指向，但是 bitmap 上是 1，就是浪费的，可以回收）（问题不是那么严重）
    - （第二种）要避免数据泄漏：如果新的指针给到了上一次删除的数据，但是在 write data 之前断电了，就会泄漏数据。
    - （第三种）两个 inode 可能指向了同一块 bitmap，动态数据泄漏，也很不安全

47. SYNC

    - 数据不落盘，好处是快、坏处是断电了之后、数据就没了
    - 所以需要 sync，把数据落盘

48. delete after open but before close

```
一个进程已打开文件：
    当一个进程打开文件时，操作系统为该文件创建一个文件描述符，并增加其引用计数。

另一个进程删除文件：
    在Unix/Linux等类Unix系统中，删除文件实际上是从目录中移除该文件的名称，而不是立即删除文件的内容。此时，文件的引用计数会减少。

通过移除指向文件的最后一个名称：
    如果删除了文件的最后一个链接（例如，文件名），引用计数会变为0。

引用计数现在为0：
    这意味着没有任何进程通过文件名再访问这个文件，但文件的实际数据仍然存在，因为某个进程仍然打开着它。

inode在第一个进程调用CLOSE之前不会被释放：
    在Unix/Linux系统中，文件的inode（包含文件元数据的信息）不会被释放，直到所有打开该文件的进程都关闭它。这是为了保持数据的完整性。

在Windows上，可能会禁止删除打开的文件：
    不同于Unix/Linux，Windows系统通常不允许删除正在被任何进程打开的文件。这样做是为了防止数据损坏或不一致性。

在打开后但在关闭之前删除：
    即使在Unix/Linux系统中，文件可以被删除，但只要有进程持有它的文件描述符，文件的数据仍然可以被访问，直到所有相关的文件描述符被关闭。
```

48. renaming

    - 原来的先删除的方法、不行、因为如果断电、那么 a.txt 就没了
    - 所以要用原子性的操作
    - mv 的操作、只改目录的内容、不改文件的内容（inode 不变）

49. 复杂系统的 M.A.L.H 原则

    - M: Modularity 模块化
    - A: Abstraction 抽象
    - L: Layering 分层（每一层只和相邻的层交互）
    - H: Hierarchy 层次化（组合成一个整体）

50. 04 P10 例子，如果改成了找/CSE2020.txt，其中一个 inode block 1024 byte，读一次可以读 512 byte，文件大小为 128 byte

## 05 Remote Procedure Call

1. 开始的例子：一个占用多的硬盘，性能可能不如占用少的硬盘（inode）

2. 在不改变应用程序的情况下（open，read，write），把文件系统放到远程服务器上，通过网络访问，节省本地的硬盘空间（即 without coding the details for the remote interaction）

3. 例子：本地调用服务器上的 GET_TIME() 函数，CALL(GET_TIME())，返回结果。call 里面的参数基本用宏，因为要快。

4. 因为不知道用的是大端还是小端，所以传参之前需要先 convert2external。network byte order 是大端。（逻辑如此、但是这个实现改了代码）

5. 发现这些为每个函数处理这个 rpc 的实现都是差不多的、所以可以根据宏来生成代码。

6. 所以有了 stub。保证了应用层代码的一致性。Stub: hide communication details from up-level code, so that up-level code does not change.

7. Client stub

   - Put the arguments into a request
   - Send the request to the server
   - Wait for a response

8. Service stub

   - Wait for a message
   - Get the parameters from the request
   - Call a procedure according to the parameters (e.g. GET_TIME)
   - Put the result into a response
   - Send the response to the client

9. inside a message:

   - Service ID(function ID)
   - Service parameters(function parameters)
   - using marshal/unmarshal to convert data to/from network byte order (Marshal 和 Unmarshal 本身是很费时的，重点在于内存的拷贝)

   “marshal” 和 “unmarshal” 是计算机科学中常用的术语，特别是在数据序列化和反序列化的上下文中。以下是这两个词的含义及其在网络字节顺序转换中的应用：

   ### Marshal

   - **定义**：将数据结构（如对象或数据类型）转换为一种适合存储或传输的格式。这种格式通常是二进制或文本格式，以便在网络上传输或保存到文件中。

   - **用途**：在网络编程中，marshal 通常是指将数据转换为网络字节顺序（通常是大端字节序），以确保在不同平台之间的一致性。

   ### Unmarshal

   - **定义**：与 marshal 相对，将已序列化的数据转换回原始的数据结构。这个过程通常涉及从网络字节顺序转换回主机字节顺序（可能是小端字节序）。

   - **用途**：当接收到数据时，需要 unmarshal 将接收到的字节流转换为易于处理的数据结构。

10. RPC request （in 1984）:

    - Xid （transaction ID，比如读内存，发包）（client reply dispath uses xid, client remembers the xid of each all）
    - call/reply （它是一个 call 还是一个 reply 的 request）
    - rpc version （新旧版本的兼容性）
    - program # （program number：即二进制文件的号码，# 表示 number）
    - program version （即二进制文件的版本号）
    - procedure # （即调用二进制文件的哪个函数）
    - auth stuff
    - arguments

11. RPC reply message:

    - Xid
    - call/reply
    - accepted? (Yes, or No due to bad RPC version, auth failure, etc.) （是否由于 RPC 版本不对、auth 失败等原因）
    - auth stuff
    - success? (Yes, or No due to bad prog/proc #, etc.)（是否由于 prog/proc # 不对等原因）
    - results

12. 通过 binding sever and client，建立连接。核心是要找到 function ID，然后调用。

13. 接下来就是怎么传递数据和参数了（无论是参数还是返回值）。一开始有 pass by value 和 pass by reference 的区别。在本地都是可以的。

14. 怎么传一个变量的指针呢，而且要求是对的？让不同机器上的虚拟地址空间不重叠。然后当发生 page fault 的时候，发出一个远端的 handler。但是这样会有很多问题，比如读完写同步的情况。所以有指针会复杂。但是可以在多个显示器上有用，只有一个显示器能写，其他只能读。访问一台机器上的内存和硬盘（DSM）（distributed shared memory）（但是如果一块内存要在很多机器上共享，就会有很多问题，比如 cache 一致性问题，所以应用不多）

15. 还要考虑大端和小端的问题。以及服务器 32 位和 64 位的问题，如果客户端的位数和服务器的位数不一样，比如 int 的位数就不一样。还有 float 的表达也不一样。还有比如数据类型对齐的要求不一样。

16. 还有更多的挑战。比如兼容性的问题，backward compatibility 和 forward compatibility。

17. 然后是数据格式。比如 json 有一定缺陷，比如传的数字会有二义性；或者传二进制字符串的时候会有问题。所以要用 xml 存更多的 type 信息。

18. binary formats 性能更好（工业）

    - IDL： interface definition language

19. each field has:

    - type annotation
    - type field
    - a length indication(optional for string, list etc.)
    - data

20. 可以做压缩、比如压缩 type 和 tag 和 length

21. rpc 也会使用到不同的数据传输协议

22. rpc 遇到错误的时候需要处理

23. How RPC handles failures?
    - Depends on the semantic: at-most-once, at-least-once & exactly-once
    - What makes failure handling simpler? Idempotence（幂等性）
    - (幂等性：一个函数调用多次和调用一次的效果是一样的)

## 06 Distributed File System （DFS）：NFS & GFS

1. NFS, GFS 即可以在本地像访问本地文件一样访问远程文件

2. upload & download 的好处：简单

   - 问题 1：客户端只需要其中小部分的数据，但是要下载整个文件
   - 问题 2：如果文件很大，本地客户端的硬盘可能不够用
   - 问题 3：一致性问题，比如一个文件被多个客户端同时修改

3. 一种实现方式：Remote access model （通过 RPC 的方式，访问远程文件）

   - 问题：Possible server and network problem (e.g., congestion)
   - Servers are accessed for duration of file access
   - Same data may be requested repeatedly

4. NFS: network file system 设计目标
   Any machine can be a client or a server
   Support diskless workstations
   Support Heterogeneous deployment ( 支持不同的硬件、操作系统、底层文件系统)
   Different HW, OS, underlying file system
   Access transparency
   Use remote access model
   Recovery from failure
   Stateless, UDP, client retries
   High performance
   Use caching and read-ahead

5. Sun 的实现：挑选了部分的 api 使用 RPC （有些做了修改）

6. 比如 OPEN 和 CLOSE 被删掉了

7. 还有，和之前的 fd 不同，这里引入了 fh（file handler）

8. 然后多了一个 offset

9. NFS client 在本地。

10. 这里 READ（fh，0，n 的时候）不需要传 buffer、因为 buffer 是一个指针。

11. 为什么不提供 open、而是提供 lookup？

    - 因为如果用了 open、那么 RPC 就是 stateful 了。就要考虑 performant 和 scalable
      的问题了。
    - 比如如果 server 挂了、再重启，那么 open 就做不了了。（因为 open 的 context
      是存在内存里的）
    - 如果有多个 client 连到了同一个 server？（所以就要维护很多的 context）
    - 因此 stateless 的 RPC 的可扩展性好

12. 所以要带 offset、这样 read 就是 stateless 的 api 了（否则要维护 cursor）

13. stateless handle failure 的时候、也不能简单地只使用 at least once 策略、因为
    如果有多个 client 的话、遇到网络问题的时候、会冲突。

14. 什么是一个 file handler？是指明要访问服务器上的哪个文件

    - 我们不能用 fd、因为 server 没有 file table
    - 我们能用 path name 吗？其实可以、但是 NFS 没有用，因为会有一个问题： 用 path name 的时候，如果两个 client rename after open 的情况。（会读到另外的文件夹里）
    - 能不能用 inode number 呢？也不行。会有一个 delete After Open 的问题会读到被删除的文件里（单机不会出问题、因为多机没有维护额外信息）（有一种补救方法，让 program2 知道这个文件已经被删掉了）
    - 所以未了避免这种情况范数、引入了一个 generation number。每个 inode 号除了自己的 inode 号之外、还有一个 generation number。
    - Generation number: a number incremented upon assigning an inode number to a new file
    - If read’s fh does not match the current generation, then abort
    - 所以最终设计出来的 fh（file handler） 就包括了 inode number（for server to locate the file ） 和 generation number （for server to maintain consistency of a file）
    - 如果 read 的 fh 和当前的 generation number 不一样，就会返回一个错误（abort）

15. 还有一个问题，就是性能问题

    - 分布式文件系统不一定比单机的慢（看网速和磁盘速度，目前网速会大于磁盘速度）
    - 一种优化：cache at Client

16. cache 最大的难点、coherence 一致性问题

    - close to open consistency:解决方法是 close 的时候，把 cache 数据写回服务器

    - read/write consistency：server 和 client 存 timestamp、定期询问并更新（30s）

17. 还有一种可以增加 read performance 的优化就是 transfer data in large chunks（8KB default）

18. 还有就是 read ahead（prefetch，提取读未来可能用到的数据）

19. nfs 的缺陷

    - 它只能利用单台服务器上的磁盘资源，有磁盘数上限
    - 如果这台服务器挂了、那么所有的文件都不能访问了
    - 这个性能会被限制在单个文件和单个网络带宽上

20. 进一步扩张机器数（重新设计文件层）： L1：Distributed block layer

    - 把 block_id 延申为<mac_id,block_id>
    - 一个 client 如何知道哪台机器有 free block？
      - 第一种方法，随机直到找到
      - 用一台 master server 去记录哪台机器有 free block，然后所有的
        分配和释放都通过 master server 进行

21. L2：File Layer 不用改

22. L3 ：distributed inode number Layer

    - 把 inode table 存在 master 上面

23. L4 ：file name Layer 也不用改

24. L5 ：path name Layer 也不用改

25. 这个 naive design 目前还有问题（只能解决 capacity 的问题）

    - 比如性能：现在需要多个 RTT 找
    - 可靠性：如果挂了、还是访问不了
    - 正确性：如果发送异常，会对整个系统产生影响

26. 解决方法：

    - 可以用 data replication 解决 performance 的问题（不过会影响正确性）

27. 例子：GFS（Google File System）

    - 设计初衷：传统的文件系统没法满足业务了
    - 设计场景：文件很大、而且很多文件被 appended，随机写的情况很少
    - 要解决：scalability，Fault-tolerant，performance

28. Interface（其中要关注 append，因为保证 append 的一致性比 write 简单）

29. 文件系统就是一个大的 byte array 然后把文件分成很多的 chunk

30. 每个 chunk 在不同的 chunk server 上（备份）（chunks size 64MB 很大）

31. chunk 很大、减少和 master 的通信次数。Chunk size = 64 MB (default) 32-bit checksum with each chunk

32. chunk 变大、也能减少 tcp 连接的连接数（重新建立 tcp 连接很耗时，每个 linux 系统对支持的 tcp 连接的个数有上限限制）

33. chunk 变大、master 需要存储的文件的元数据就会变少，就能存更多文件 Master can store all metadata in memory

34. 总结：GFS 和 naive 的对比

    - Master stores current locations of chunks (blocks)
    - Data are stored in large chunks
    - Chunks are replicated for fault tolerance & high performance

35. 为什么 GFS 只用一个 master？

    - 简单，在大部分时间够用
    - All metadata stored in master’s memory

36. GFS 用了 GFS adopts a relaxed consistency model 来保证写一致

37. name-to-chunk mapping 是存在 memory 又持久化在 an operation log 中的

    - Name-to-chunk maps (e.g., using an in-memory tree)
    - Stored in memory
    - Also persist in an operation log on the disk (talk about in later chapters)

38. GFS 没有目录结构

39. Stores chunk ID-to-chunk location maps in memory (and no need for log)

    - This is queried from all the chunkservers at startup
    - Can keep up-to-date: master controls all the management
    - Benefits: simpler for consistency management

## 07 Google file system & from file system to key-value store

1. client 如何和 GFS 交互（另一种模型 Client-GFS interaction model ）

   - GFS client code linked into each app
   - Interacts with master for metadata-related ops
   - Interacts directly with chunkservers for data
   - 就可以让 master 不是一个瓶颈了
   - no caching data at client nor server(Why? Large files offer little opportunity for caching ,因为数据很大、所以 cache 的机会不大)Except for the system buffer cache
   - cache metadata at client（比如说 location of a file’s chunks）

2. 读的情况类似，但是写不一样。

3. 写的时候会带来不一致的问题、一个读没有办法读到写（读了不同的 chunk？）

4. GFS 的解决结果最终实现了 chunk 最终内容都是一致的、但是读不一定保证读到最新的（relaxed consistency model）

5. master 会判断哪个 chunkserver 是 primary 的

   - primary can request extensions of the lease 因为可能 primary 会挂

6. write in GFS

   - 阶段 1：传输数据，通过链传递的方式在 chunkserver 之间传递数据（数据流）
   - 阶段 2 ：写入数据，写入数据到 chunkserver，先写 primary，然后写 secondary（广播）（控制流）
   - data flow makes use of the network bandwidth, the single primary server will not be the bottolneck of transmitting data
   - control flow ensures the consistency of the chunk among all replicas

7. 判断 chunk 的复制是不是旧的，通过 chunk version number

8. 并发写的问题在 GFS 中问题并不大、因为多数文件是 append 的（并发写不会被覆盖掉）

9. HDFS : Hadoop Distributed FS(架构和 GFS 一样)

10. NFS cant scale，is not fault-tolerant，is not high performance

11. Key-value store 的 workload 和 file system 的 workload 有不同，kv 更多是小数据、file system 更多是大数据

12. naive 用文件系统存储 kv store 的问题

    - 会造成多余的系统调用
    - 空间利用率不高

13. 为什么 Why KV builds upon the file system?

    - We still need a system to interact with the disk hardware!

14. Idea: using one or few file to store key-value store data

    - Different key-values can pack into the same disk block
    - Reduce system call overhead: open file once, serve all the requests then

15. How to implement the update? Two strategies:

    - directly modify the file content
    - append the new updates to the last of the file

16. - cpu <-> memory : 100ns
    - memory <-> disk : 10ms

17. - HDD performance (for reference)
    - Sequential: 100 – 200 MB/s
    - Random: 0.5 – 2 MB
    - SSD performance (fore reference)
    - Sequential: 2,000 – 3,500 MB
    - Random: 200 – 300 MB

18. update 和 insertion 变成对日志里的 append 顺序写（因为随机写会很慢）

19. delete 使用 null entry、然后定期清理

20. 所以叫 log-structured file, 是一种 append-only 的

21. 这里需要使用 index 的目的主要是为了加速查找

22. index：使用 offset 来记录

23. 但是存在内存里的 kv 和磁盘里的 kv 是不一样的

24. cuckoo hashing 避免了 naive hash 的 list 过长的问题，保证了 get 在 O(1)时间内完成，但是 put 的时候会慢

25. 解决 cuckoo hash 不够的方法：不够的时候扩充或者 rehash，循环踢

26. 解决这个文件永远增长的问题：compaction

    - 或者 compaction with segmentation（让 compact 变快）（Break a file into fixed-sized segments 固定文件大小）
    - 然后再 merge，否则一个文件的浪费的空间就会变多（因为 compaction 让一个文件变小了）

27. 为了做 operation efficiency，会有 Hash Index (in-memory & on disk) ，在不同条件下结合 log 会有不同的性能特性

28. 为了支持范围查找、会引入 B（+）tree

    - 每个节点都是固定大小的
    - 数据存在叶子节点
    - 支持范围查找（因为有序）
    - 不需要 log-structured，因为 B（+）tree 本身就是有序的，而且可以把值存在叶子节点里面
    - 问题：对于 insertion-intensive workload，B（+）tree 性能不够好，因为会有很多的随机 io
    - 对于小的数据、index 的大小可能会和数据一样大，也是一个问题
    - Get(K), Insert(K,V) and Update(K,V) are slow
    - O(log(n)) random disk accesses
    - Typically, is small, since B-Tree indexes uses large node size. But is still a killer for performance

29. SSTables（sorted string table）：把数据按照 key 排序，然后存到磁盘上

    - 优点 1：找 key 很方便（二分查找）。只需要 sparse index （不需要 hash index）（sparse index：只存一部分 key，比如最大最小的 key）
    - 优点 2：支持范围查找
    - 优点 3：merge 的时候很方便（因为是有序的，和归并排序类似）

30. 怎么保证 SSTable 是有序的呢？

    - 用一个 memtable，把数据先存到 memtable 里，然后再存到 SSTable 里
    - 但是 memtable 会有一个大小限制，如果超过了，就会存到 SSTable 里

31. Reads：先读 memtable，然后读 SSTable，如果 memtable 里没有，就读 SSTable，如果 SSTable 里没有，就读下一个 SSTable

32. 对于单一层的 SSTable，仍然会有缺陷：

    - 找旧的数据会很慢
    - deduplication 会很慢（deduplication：去重）
    - 范围查找还是比较低效

33. 所以引入了 SSTable Hierarchy

    - 除了 L0，其他的都是 compacted SSTable，都是有序的
    - insert 满了后，会和下一层的 SSTable merge
    - Hierarchy can speed up old value lookup
    - 找旧值变快是因为 Each layer has only one file that store the key (except L0)
    - So we can search only one file per-layer (not per-file search)
    - Hierarchy can speed up range query
    - Store a [min, max] per file ，然后用二分查找做每一层的范围查询

34. 如何处理 crash？

    - 再维护一个独立的 log、记录 Memtable 的修改
    - Before inserting to the MemTable, adding the KV to the log first (also a sequential write); reply if the log is successful
    - 重启的时候，会把 log 里的内容 replay 一遍

35. LSM good when

    - massive dataset
    - rapid updates
    - fast single key lookups for recent data

36. LSM 并不完美

    - 因为写的时候会触发 compaction，会慢（Write stall ）（只能用 ssd 来减缓，或者加速合并的逻辑）
    - 查不存在的 key 会很慢（但是可以用 bloom filter 来解决）

## 08 Consistency model (linearzability)

1. KVS 应该怎么部署？

   - 方法 1：保存 KVS 在一个 centralized server 上，All operations: execute an RPC at the server
   - 但是很慢，因为会有很多的网络延迟
   - What are the drawbacks?
   - Inefficiency! Must wait for server ACKs
   - Cannot work with offline!

2. 方法 2：centralized server + at each device

   - 是很多聊天软件的做法
   - Naïve solution
   - Read: return the latest copy on the local KVS
   - Write: update the local KVS, sync with other KVS, then return to client

3. 对于方法 2 中 sync 同步的 naive 方法：

   - 问题 1：不高效（对于 write）（read 还行）（就是写的延迟会很高）
   - 问题 2：不能容忍网络连接性断连 Under network disconnection, the sender will be blocked
   - 改进方法 3：写的时候不等待，直接返回，在后台同步（sync with the others in background & return）

4. 方法 3 会高效很多、但是会有这个数据更新和丢失的问题（ppt 例子）

5. 为了解决这个问题，引入了 consistency model（规定什么情况可以出现、什么情况不能出现）

   - How a data storage system behavior under concurrency, distribution and failure
   - E.g., in GFS, the consistency model is that all the chunk will eventually be the same
   - A strong consistency model will give more precise on what can happen & what cannot

6. 有强和弱的一致性模型，但不一定存在对的和错的一致性模型（因为不同的应用场景需要不同的一致性模型，易于开发和性能的 balance）

   - Note all concurrent execution (exe.) can be deduced to a serial execution

7. 主要关注强的一致性模型

8. 强的一致性模型，符合单线程的读写模型

   - 例子：所有操作都是原子的，所有操作都是线性的
   - 即使一个并发例子是逆时序的，也可能转化成线性的模型（ppt 例子）

9. 最强一致性：strict consistency

   - 根据 global issuing order，所有的操作都是线性的
   - 就是假设有一个全局的统一的时钟、结果完全相当于在单机上面执行的结果
   - 好处就是和单线程一样完全串行
   - 坏处就是难实现，实现这个模型会有挑战、因为如果 p0 先发送请求、p1 后发送请求，但是 p1 先到达 server，那么 server 会先处理 p1 的请求，这样就不是 strict consistency 了

10. 退而求其次：有了 sequential consistency

    - 保证了对于单台设备、单个 process，所有的操作都是线性的
    - 但是不保证 global issuing order
    - 只要保证 process 内的操作是线性的就可以了
    - 但是会有问题、就是先更新 x、但是在另外的设备上没法读到这个更新的值（因为读的时候是读到了旧的值）

11. 所以还有了 linearizability

    - 即可以根据开始-结束时间进行排序
    - 比 sequential 多了一条规则：即如果在全局时钟下、一个操作在另一个操作发出之前完成，那么后续的操作一定要能看到这个写完的状态
    - 比 sequential 强
    - 实际中多使用 linearizability，因为避免读不到写完的内容

12. 所以后面开始讲 linearizability 的实现

    - local property（不考）

13. 下面都是讲如何去实现 linearizability

14. 最简单的实现方式：通过 centralized KVS

    - RPC 有了返回结果即认为完成了
    - 但是(More suitable for the chat app)
      Each device has a replicated KVS on its local machine

15. 有多个 KVS 的时候，方法一：Primary-backup model

    - 一个是 primary，其他的是 backup
    - 但是有问题：读的时候会有额外的 RTT（round trip time）和 primary 通信。读的时候不能读 backup，要读 primary（ppt 例子）
    - 写的时候还需要和 backup 通信。
    - scalability 会由于 primary 的问题而成为瓶颈
    - 解决 primary 的瓶颈：通过 partitioning（让不同的 object 有不同的 primary）

16. Impl. Primary-backup model

    - Each read and write must be handled by a designated device
    - Write must wait for all the replicas to acknowledge

17. 方法 2：使用 seq number 来保证 linearizability

    - 延迟更新、直到前面的操作都做完了
    - ppt 上的那个例子是一个范例、就是说能不能做一个优化、不在 primary 上读、这个反例就不符合 linearizability，所以都需要在 primary 上读
    - 如果这样的话、就会有一个环（读到一个中间状态）

18. what are the drawbacks of primary-backup?

    - Performance issues
    - Fallback to the centralized KVS case for non-primary devices
    - E.g., Extra roundtrip, Primary becomes the bottleneck, etc.
    - Reliability issues
    - If primary crashes, others cannot work
    - 解决方法、在不同的 KVS 上面指定不同的内容作为不同的 primary（partitioning）

## 09 eventual consistency

17. 对于微信这种聊天场景、使用 eventual consistency 来保证性能的提升、而对于一致性的要求不高

    - 因为 linearizability Not practical for our chat applications
    - Performance issue: adding a sentence requires syncing all my devices
    - Availability issue: what if some device (e.g., iPad) is offline?
    - 就是很慢、然后难以提供 fault tolerance

18. All various read/write rule implementations for a better performance

    - Read: return the latest local copies of the data
    - Write: write locally (and directly returns), propagate the writes to all the servers in background (e.g., upon sync), which is the optimal
    - 这是一个比较 weak 的 model

19. GFS 用了 primary 去做 eventual，但是这个只适用于数据中心的场景，需要一个新的适合 chat app 的一致性模型

20. 如果采用向最近的 server 进行写的话、如果同时对不同的 server 有两个写操作、那么会有 write-write conflict

21. eventual consistency 认为 conflict write 是比较少见的、所以就先写、然后再做一致化，能提升性能

    - 相当于对于写冲突，这个是 optimistic 的、而 linearizability 是 pessimistic 的（因为 linearizability 认为写冲突是常见的）
    - 最终的目标都是要让最后的 data 是一致的

22. eventual consistency 还是有两个需要保证的

    - 写写冲突
    - 因果性 causality

23. 如果要做一致化、那么这个类似 chat 的就不能做成 KVS 中那些简单的键值的覆盖、而应该做一个 update 的 function

    - 在这个场景下、应该是类似于 append 的语义
    - 同时、受到了一个 function 之后、不能直接 update、需要先写到 log 里面（log 可能是不一样的、但是没有关系，因为还没有到数据库里面）（可以先 sync log，log 一样之后再 apply）
    - 应该怎么排序呢？
    - 然后排序 log 的 entry、然后再写到数据库里面（怎么排序：还是根据时间戳）（<time T, node ID>，中、还是先根据 time 比较，如果 time 一样、就根据 node id 比较）
    - 一个问题是：什么时候去 apply 呢？如果同步间隔就的话、一致性差异就大。所以可以先 apply，然后 sync log 之后 rollback
    - 但是这个 replay 的 sync 会比较慢、而且会导致比较大的 log 大小
    - Question#1: can we use <node ID, time T> as the ID?
    - Sort the updates: no problem
    - User-experience (or causality preserviung): not so good. For example, I will always see my iphone’s data before my Ipad’s data, even I posted the sentence earlier

24. 如何选择这个独特的 ID 是比较重要的

    - <time T, node ID>如果用这个的话、还是会依靠于这个 nodes 的物理时钟，不同的 server 的物理时钟也是不同步的，比如 Srv1 went first in wall-clock time with <10, Srv1>，Srv2 could still generate update ID <9, Srv2>
    - 这种不同步的物理时钟、甚至会导致不同的 server 之间会 crash（会 rerun delete before add）

25. causality 因果性 causal ordering

    - 比如在一台机器上面、X 先、Y 后、就是 X->Y
    - 或者在不同的机器上、一个操作是由于另外一个操作发生的 X->Y（X 加、Y 删）

26. 所以一种方法是 X 接受到时间戳之后、更新本地的时间戳到更大的时间戳

27. 解决方法 Lamport Clock

    - Lamport clock: a logical clock used to assign timestamps to events at each node
    - 每个 server 维护一个 time T
    - 随着真实时间的增加，T 也会增加（比如 1s 增加一个）
    - 如果看到了一个其他 server 的时间戳 T'，把本地的时间戳和 T' 比较，令 T = max(T, T' + 1)
    - 这就解决了因果性的问题

28. Can lamport clock give a total order to all the events?

    - i.e., given e1 & e2, T(e1) < T(e2) or T(e1) > T(e2)
    - No. There are ties （可能会有相同的情况）
    - Yet, we can trivially break the tie by adding an additional order:
    - E.g., <Logical time, node ID> （所以也可以引入 nodeid 加入排序）
    - The total ordering preserves the causality （这个排序就能保证因果性）
    - Why total ordering is ideal?
    - If replicas apply writes according to total ordering, then replicas converge

29. 扩展：实现 partial order： vector clock （缺陷：会比较大）

    - Each entry corresponds to a local lamport clock on the server （每个条目代表了每个 server 上的 lamport clock 的值
    - Increments local T as real time passes, e.g., one second per second
    - Clocks are represented as a vector (one entry per server)
    - 然后做类似的更新，如果看到了一个其他服务器的更大的 timestamp 的操作、就更新 Ti = Max(Ti, Ti’+1)

30. In comparison:

    - Lamport clock: total order
    - Vector clock: partial order

31. For many scenarios, Lamport clock is sufficient

    - Sufficient to order events （足够去排序事件了）
    - Save space for storing the clock（节省空间）

32. 我们需要对 log 进行进一步优化（truncate log）

    - 因为每个 write 都是立即 write，所以是 unstable 和 tentative 的 （需要做区分）
    - 为了减少 log 大小
    - 为了减少每次回滚的开销
    - 一开始的方法会回滚所有的记录、但是会浪费时间
    - 我们期望能只回滚不 stable 的记录，就是回滚 tentative 的记录

33. 方法 1：可以做一个 De-centralized 的方法

    - 把某条 log 的 entry 作为一个 checkpoint，如果所有的 server 的时间戳都大于这个时间戳，那么就可以把这个 log entry 设为 stable
    - An update (W) is stable iff no entries will have a lamport timestamp < W

34. 但是有一个问题 Problem: If any node is offline, the stable portion of all logs stops growing，如果有设备离线、还是会有很多次回滚，所以引入中心化方法

35. 方法 2：centralized approach

    - 选一个服务器作为 primary
    - 引入<CSN, local-TS, SrvID>的 timestamp，对于每次写操作、都有一个 CSN
    - CSN: commit sequence number
    - CSNs are exchanged between servers
    - CSNs define a total order for committed update
    - Advantage: as long as the primary is up, writes can be committed and stabilized
    - 这种方法可能不能保证所有情况下的因果关系、需要做额外的处理来解决这个问题、比如一次拿很多个的操作？

36. 可能会出现一个问题、就是一个 local-ts 大的 server 会先把这个 log 同步到 primary、然后 local-ts 小的会在后面向 primary 做同步，然后最后同步到另一台机器时、会做 reorder updates、导致用户看到的更新顺序不一致

37. 意思是，一旦某些事务已经提交并且被记录下来，通过 CSN 可以确认它们的状态，之前的日志条目就不再需要保留。Result: No need to keep years of log data

38. lamport clock 会考

39. If TS(event #1) < TS(event #2), what does it say about event #1 (create on node #1) and event #2 (created on node #2)?

    - Event #1 occurred at a physical time earlier than event #2 NO
    - Node #1 must have communicated with Node #2 NO （可以是任意的时钟）
    - If event #1 has been synced to node #2, then event #1 must have occurred at a physical time earlier than event #2 NO （就是在同步之前、这个 node2 的 lamport clock 已经比 node1 的大了）

40. Read may return （可能会有读的问题 eventual consistency）

    - Tentative data
    - Outdated data
    - Trade read/write consistency for high performance

41. 这个 consistency anomalies（异常现象）重要嘛？

    - 会根据发生的频率和重要性来决定
    - 100 万次读可能会有一次
    - 对于 chat app 来说、可能不是很重要

## 10 Consistency under crash: All-or-nothing atomicity

1.  保证事务 all or nothing 的性质

    - 因为 crash 会导致数据的原子性的问题

2.  原始方法：shadow copy，先复制一份 bank_temp、然后再修改，改完再改名字到原来的名字

    - 原来的文件永远是正确的。
    - 如果 rename 的时候挂了、Two names point to fnew’s inode, but refcount is 1， which reference is the correct one?（rename 的时候要改 3 个 data blocks）
    - Naïve solution
    - Ask application to remove the unnecessary inodes
    - i.e., the application knows that "bank_temp" should be removed
    - Typically, not a good idea
    - Problem #1. The filesystem consistency depends on the application. What if the application is buggy or malicious?
    - Problem #2. What about more complex applications?

3.  所以有了一个改进的方法：journaling

    - 应用的恢复策略应该和文件系统的恢复策略解耦
    - 通过 append 日志来记录操作 （但是貌似是 sector、不是文件）（而且这里的日志貌似是记录文件系统操作的日志）
    - 先写日志，然后再写数据
    - 如果写日志的时候挂了，可以根据日志里的信息做回滚或者恢复
    - 应该 naive 的方法是写在一个 sector 里面

4.  Observation: （journaling 的改进，可以只保护关键的 metadata 的写）

    - Not everything in file system has equal importance
    - Usually, the metadata is more important
      E.g., which blocks belong to the inode
    - Mitigation:
    - Only protect metadata via Journaling
      Data is written only once
    - What if data is also important?
    - Ext4 options: data=journal/ordered/writeback
      Application can also handle the write itself, e.g., wait for fsync to flush the data synchronously before proceed to the next

5.  journaling 的缺点

    - 数据要写两次，一次是在 journal 里面、一次是在原位置里
    - 当文件很大的时候会有问题

6.  crassh during commit journal？

    - 假设在写磁盘的一个 sector 的时候、是 all or nothing 的、那么就不会有问题
    - 但是当 log data 比 sector size 大的时候，就会有问题（可以用多个 sector 来存 log，动态大小，现在的 log 是在文件里、就可以解决这个大小的问题、抽象层上再加一层抽象）

7.  shadow copy 的缺点

    - 当多个 client 共享同一个文件的时候，没法做并行（需要强制安排顺序）
    - 很难对多个文件做 copy （会有多级文件和目录的情况，需要对所有的子目录都 copy）
    - 当文件很大的时候，会耗时

8.  所以有了 Logging：

    - Key idea ：和 journaling 很像，Avoid updating the disk states until we can recovery it after failure
    - 分为 log file 和 log entries
    - Log file: a file only contains the updated results
    - Log entries: contain the updated values of an atomic unit (e.g., transfer)
    - 有了 transaction 的概念，需要保证原子性的操作就是 transaction（begin，commit，abort）
    - Before we write the disk, write the log to the disk synchronously
    - 通过 append 日志来记录操作（这里是更新文件）
    - 如何确保一个 log entry 是完整的？（通过一个特殊的标记 checksum（算一遍或者特殊的约定））
    - After the logging succeed, we can update the disk states

9.  每一次操作完的时候、其实不需要直接做 fsync

    - Not necessary, because we can do the recovery

10. 如果 crash 了，可以再执行一遍 log，然后再执行 commit （redo log）

    - Travel from start to end
    - Re-apply the updates recorded in a complete log entry

11. 为什么 commit point 重要？需要确保 all-or-nothing atomicity

12. redo-only 的好处

    - commit 的速度块、只需要 append 操作到日志

13. 但是 redo-only 也有缺点

    - 会浪费磁盘 IO 的时间，就是磁盘很多时候都是空闲的，all disk operations must happen at the commit point
    - 内存可能会不够用（因为直到这个事务提交、都不会落盘）
    - 这个 log file 会不断地变大

14. 为了解决这个问题，引入了 undo-redo logging

    - 因为 We allow the transaction directly writing uncommitted values to the disk
    - Before the commit point to free-up memory space & utilize disk I/O
    - 记录了所有 update actions
    - 回滚到 old state

15. redo-only 和 undo-redo 的区别，Log entry vs. log record

    - redo-only 只 append 了 log entry，Containing all the updates of the transaction
    - undo-redo 会 append log records（会出现多个线程的 operation 记录交织的情况）Containing the updates of a single operation
    - undo-redo 会 At commit point, append a commit record to the log last
    - 相当于这个 redo-only 是一个一个事务整个地写 log 的、undo-redo 是会 interleave 的

16. log record 的格式

    - transaction ID
    - operation ID
    - pointer to the previous record in the transaction
    - (values)

17. 根据 log record 进行恢复

    - 从最后一个 log record 开始
    - Travel from end to start
    - Mark all transaction’s log record w/o CMT log and append ABORT log
    - UNDO ABORT logs from end to start
    - REDO CMT logs from start to end

## 11 Before-or-after atomicity and Serializability

1. 为了防止这个 log 不断地变大、需要引入一个 checkpoint 机制，即定期地将 log 中的内容进行决定、决定哪些可以扔掉、然后扔掉可以扔掉的

   - Checkpoint: Determining which parts of the log can be discarded, then discarded them

2. naive 的方法：全部跑一遍 recovery，但是太慢了、

   - For redo logging, we only need to flush the page caches so we can discard all the logs of committed TXs
   - For undo logging, we only need to wait for TXs to finish to discard all its log entries

3. 做 basic checkpoint 的方法

   - 等到当前没有 transaction 在运行的时候，就可以做 checkpoint 了
   - 然后 flush page cache，然后把所有的 log 都写到 disk 上
   - 然后把 logs 都扔掉
   - 不过会有问题：就是一个 transaction 运行了很长时间，会没法做 checkpoint

4. 改进的 checkpoint 方法

   - 等到当前没有任何 action 操作进行的时候（如果正在写的话、会有正确性的问题）（注意这里才是 action、不是 transaction）
   - 写一个 CKPT 记号到 log 中
     - 包含了当前所有正在运行的 transaction 的 ID 和他们的 log（就是运行这个 transaction 的 log 在 CKPT 里面 ）
   - 然后 flush 一下 page cache
   - 然后把所有 log 都删了、除了 CKPT 中正在运行的 transaction 的 log

5. 对于 ppt 上的例子

   - T1 就不需要做任何事情了
   - T2 需要做 redo、从 checkpoint 开始
   - T3 需要做 redo、从它自己的 log entry 开始
   - T4 因为没有 commit，所以需要做 undo、从它自己的 log entry 开始（和 CKP 也要做）
   - T5 因为没有 commit，所以需要做 undo、从它自己的 log entry 开始

6. Question:

   - Which one is faster during execution? Redo-only logging
   - Which one is faster during recovery? Redo-only logging

7. Redo-only logging 在正常执行的时候的性能更好（下面就是回答了上面的两个问题）

   - Less disk operations compared with undo-redo logging
   - Only need one scan of the entire log file

8. Redo-only logging is typically preferred except for TXs with large in-memory states （除了对于大的事务，一般都用 redo-only log、因为可以自动保证原子性）

9. undo-only logging 没有那么常用、因为性能不好、除了恢复的时候

10. Systematic methods to support all-or-nothing atomicity

    - Shadow copy (Single-file updates)
    - Journaling (Filesystem API)

11. Logging (General-purpose approaches)

    - REDO-only logging (commit logging)
    - UNDO-REDO logging (write-ahead logging)
    - UNDO-only logging

12. Logging 也是一种保证 durability 的方法

    - Durability: Committed Action’s data on durable storage

13. 下面开始讲 before-or-after atomicity

14. 计算机需要将实际上并行进行的操作、整理成一个逻辑上的串行操作

15. 因为这个操作会有 race condition，然后这个 race condition 是很难控制的

16. before-or-after 和 linearizability 是不同的

17. Before or after atomicity 定义：

    - Concurrent actions have the before-or-after property if their effect from the point of view of their invokers is as if the actions occurred either completely before or completely after one another （并发的操作有 before-or-after 的性质、如果他们的效果、从调用者的角度来看、就好像这些操作要么完全在前面、要么完全在后面）

18. before-or-after 要解决 race condition 的问题， need a group of reads/writes to be atomic

    - E.g., cannot see/overwrites the intermediate states of a concurrent action

19. 对于 before-or-after 的实现、需要用到锁

    - naive 的实现是对每个事务都上锁，共用一把大锁

20. 如果用全局的大锁、那么每次操作都要拿锁和释放锁、性能会很差（粒度太粗了）

21. 可以做 fine-grained locking，比如做一个 lock table、对数组里的每个数据项都有一个锁

22. 但是 ppt 上的有一个例子显示了、就是在多个函数中的时候、用这个 fine-grained locking 还是会出现 race condition 的问题

23. 但是 fine-grained lock 对于每个数字都有一个锁、太浪费内存了

24. 所以引入了一个 two-phase locking protocol

    - 2PL can guarantee before or after atomicity with serializability（可串行化）
    - Run actions T1, T2, .., TN concurrently, and have it "appears" as if they ran sequentially (we will prove it later)
    - 就是基于 fine-grained locking 的实现、需要操作哪些数据的时候就获取锁、但是只有当所有的操作都执行完之后、才会释放锁

25. 会有情况是最终结果是对的、但是会有读写冲突之类的

26. 什么是线性的操作顺序？貌似和另外一门课上的概念一样

27. 有时候最终结果是对的、但是并不是完全线性的

28. 所以有了不同的 serializability 的分类

    - final state serializability
      - A schedule is final-state serializable if its final written state is equivalent to that of some serial schedule
    - conflict serializability （最广泛使用的）（条件最强）
    - view serializability

29. Two operations conflict if: （读写冲突、写读冲突、写写冲突）

    - they operate on the same data object, and
    - at least one of them is write, and
    - they belong to different transactions

30. conflict serializability:

    - A schedule is conflict serializable if the order of its conflicts (the order in which the conflicting operations occur) is the same as the order of conflicts in some sequential schedule (可以从一个串行的 schedule 中找到一个和当前 schedule 的冲突顺序一样的 schedule)

31. 对于存在冲突的并发事务调度 S’，在保证冲突操作的次序不变的前提下，通过仅交换不冲突的操作而转化为等价的串行调度 S 时，称调度 S’和调度 S 冲突等价，调度 S’为冲突可串行化调度。

32. PPT 上有 conflict 的例子

    - 这样就能构建一个 conflict graph
    - 如果这个 graph 是 acyclic 的、那么就是 conflict serializable 的
    - （按照执行顺序、可以从 T1 到 T2 画边，或者 T2 到 T1 画边）
    - 那就只需要检查这个图就可以了（如果有环、就不是 conflict serializable 的）

33. 但是又有一个例子、就是结果可以符合线性的，但是上面有环、引入了 view serializability.不过貌似这个第一个例子是 final-state serializabile 的，还有一个是 view serializable 的（这个操作会被另一个线程擦除）

34. view serializability:

    - A schedule is view serializable if the final written state as well as intermediate reads are the same as in some serial schedule
    - ppt 上也有详细定义

35. 视图可串行化调度包含的调度范围比冲突可串行化调度更广，但是判断难度也更大

36. 冲突可串行化调度一定是视图可串行化，但视图可串行化调度不一定是冲突可串行化

37. 一个调度是视图可串行化，但不是冲突可串行化，一般由盲写造成

38. final-state > view > conflict （包含）

39. 2pl 是能很简单实现 conflict serializability 的

    - 即证明这个操作没有环，用反证法，如果有环
    - 因为 T1 必须要在执行完之后再放锁

40. 但是有时候 2pl 也不能保证实现 conflict serializability

    - 主要是因为这个 update 需要扫一遍 list
    - 会出现幻读
    - 解决方法：1. 用 predicate lock 2. 用 index lock（在 B+ tree 上加 range locks）3. 有时候忽略这个问题（性能）
    - 什么时候能保证：所有数据 conflict 都被一把锁给识别出来了。

## 12 Serializability, OCC & Transaction

1. 这个 2pl 会导致死锁，解决方法：

   - 在一个 pre-defined order 中获取锁 （Prevention）
     - Not support general TX: TX must know the read/write sets before execution
   - 用 conflict graph 来检测死锁，如果有环、就死锁了、然后可以 abort 一个 transaction（这个方法不太好，成环监测代价太大）（Detection）
   - using heuriestics to pre-abort the TXs that are likely to cause deadlocks（heuriestics 即启发式算法，比如说用一个 timeout 的时间来检测死锁，超过就 abort）（Retry）
     - May have false positive, or live locks

2. 产生死锁的原因：

   - 因为 2pl 是悲观的，来避免 race condition

3. 所以能不能以乐观的方式去处理这个问题呢？即 Optimistic Concurrency Control，即 OCC

4. 乐观地去拿锁、然后 commit 的时候再检查一下

5. OCC 执行 transaction 的三个阶段：

   - 阶段 1：Concurrent local processing:
     - Read data into a read set
     - Write data into a write set
     - 写的时候，如果这个变量已经被读过了，也要写到 read set 里面
     - 读的时候、如果这个变量已经被读过了、也要先从 read set 里面读
   - 阶段 2：Validation serializability in critical section:
     - Check whether serializability is guaranteed
     - 看一看这个数据是不是被改过了，看一看 read set 里面的值和 commit 时候的值是不是一样（类似地、会有一个 ABA 的问题，即他的值是一样的、但是其实是被改过了、所以在记录数据的时候可以再记录一个版本号，比较的时候比较版本号就可以了）
   - 阶段 3：Commit or abort:
     - If validation is successful, commit
     - If validation fails, abort
     - critical section 就是里面那个监测的步骤、也需要保证 before-or-after atomicity （如何保证、第 2，3 阶段里、让这个提交的函数时候加一把大锁）（因为 The phase 2 & 3 are typically short）

6. occ validate 和 commit 的时候能不能避免 2pl 的死锁呢？

   - 可以避免死锁，把这个 readset 和 writeset 都排序一下，再用 2pl （sort 的时候需要进行排序）

7. 一个 occ validate 和 commit 的时候用 2pl 的优化：

   - 可以不用拿 read set lock，只用拿 write set lock（因为有一个监测是否改动过在）
   - 但是也是不完全等价的，所以要判断这个 d 在 read set 里面有没有被上锁，如果上锁了、就判断为 abort

8. 所以 occ 相对于 2pl 的优势：

   - occ 对于读操作不需要加锁，只有在 commit 的时候才加锁

9. OCC (in the optimal case, i.e., no abort)

   - read to read the data value
   - 1 read to validate whether the value has been changed or not (as well as locked)
   - 2PL
   - 1 operation to acquire the lock (typically an atomic CAS)
   - 1 read to read the data value
   - 1 write to release the lock
   - A single CPU write is atomic, no need to do the atomic CAS

10. 锁的实现：从可以从软件或者从硬件的层面进行实现
    - spin lock 的开销很大

## 13 OCC, MVCC, TX & Multi-site atomicity

1.  Occ 会导致 false aborts 的情况、即一个事务被 abort 了、但是其实是没有冲突的

    - 特别是对于一个长时间的多读的 transaction
    - 即 occ 的问题是活锁 livelock
    - 解决的方法是设置一个 retry limit，如果 abort 次数超过这个 limit，就 delay 其他的 transaction，让这个 transaction 先执行

2.  Occ 和 2pl 没有哪个绝对更好，可以混合使用

3.  hardware transactional memory(HTM) 是 cpu 的一种特性、为了并发地写（保证了 before-or-after atomicity）

    - Intel 实现了一个 restricted transactional memory(RTM)

4.  怎么用 HTM（RTM）

    - XBEGIN()
    - XEND()
    - 如果监测到了冲突，就会 abort，然后 rollback 到 XBEGIN() 的地方，也可以手动 xabort

5.  RTM 的好处和坏处：

    - 好处：保证原子性、然后性能更好
    - 坏处：不能保证成功（因为本质是在硬件上实现了一个 OCC）

6.  RTM 的实现：

    - 复用了 CPU cache 去存储这个 transaction 的 read set 和 write set
    - 用了 cache coherence protocol 去检查冲突
    - 但是这就导致了硬件的限制、比如说 cpu cache 的大小是有限的
    - RTM 的 read wirte sets 大小依靠很多因素（ppt 上）
    - OCC is yet another classic protocol for before-or-after atomicity Whose idea has even been adopted by hardware designers

7.  RTM 也会有受限制的执行时间、因为 CPU interrupt 会随机 abort 这个 transaction，导致这个事务执行越长、abort rate 越高

    - RTM 在不同的 dataset 上面有不同的效果

8.  occ 和 2pl 在长时间运行读操作的事务上的时候、性能都不好（比如说淘宝上的浏览商品）

    - OCC & 2PL are bad when TXs are long running w/ many reads
    - occ 是保守的 abort
    - OCC: abort due to read validation fails
    - 2PL: read will hold the lock and block others

9.  所以就有了 MVCC(multi-versioning concurrency control)

    - 首先让这个数据有很多个版本（把数据改成一个 List、里面有值和版本号）
    - 比如说可以让读永远在一个序列化结果的版本上读，写的时候就写到一个新的版本上
    - 解决方法：用一个 global counter，用 atomic fetch-and-add（FAA）来拿到 TX 的开始和 commit time，读和写的时候会拿着这个 counter 去读或者写对应的 snapshot
    - Using atomic fetch and add (FAA) to get at the TX’s begin & commit time
    - TX Begin: use FAA to get the start time
    - TX Commit: use FAA to get the commit time
    - 也会有一个更好的方法，就是原子钟

10. MVCC 的读写的 idea

    - Read
    - Only read from a consistent snapshot at a start time
    - Write
    - Install a new version of the data instead of overwriting the existing one
    - Version ~= the commit time of the TX
    - Goal: avoid race conditions on reading a snapshot

11. 下面是 Try #1: Optimize OCC w/ MV (incomplete)

12. Acquire the start time

    - Phase 1: Concurrent local processing
    - Reads data belongs to the snapshot closest to the start time
    - Buffers writes into a write set

13. Acquire the commit time

    - Phase 2: Commit the results in critical section
    - Commits: installs the write set with the commit time

14. 好处：read 不用做 validation，Compared to the OCC, no validation is need!

15. 但是会有一种情况、就是读在写后开始的时候、可能读会读不到还没写完的数据（所以需要保证 commit 之后写的原子性）

16. 所以要保证读的 snapshot 内容是需要保证写完的，所以可以在写之前加锁

17. MVCC 保证了 read 没有 race、但是 writes 会有

    - 所以还需要做简单的 validation
    - The validation is simple:
    - During commit time, check whether another TX has installed a new snapshot after the committing TX’s start time (in the write set)
    - P48 示意图

18. 这个 MVCC 会有一个 Write skew anomaly 写偏差异常的情况

    - 需要用 read validation 去解决
    - The simplest way is to validate the read-set in read-write TX
    - Essentially fallbacks to OCC for read-write TX （解决了之后、就退回了 OCC）
    - But read-only TX can still enjoy the benefits from MVCC
      - Never aborts & no validations
    - Usually being ignored in practice (Snapshot isolation)
      - The MVCC without the read validation is also called snapshot isolation (SI)

19. 做了 read validation 之后就是 MV-OCC 的

20. transaction 的概念不仅在数据库里面有用、在分布式系统里面也有用

## 14 Multi-site atomicity & Primary-backup replication

1. 数据库对每一个修改的版本 snapshot 都存在，然后不可能全量复制，因此 snapshot 里面也存的是 incremental 的内容

2. 复习 MVCC

   - phase 1：read 读 snapshot，write 读 buffer，每个数据会写两次、一个 write 是 cache、第二个是 commit
   - phase 2：validation
   - phase 3：commit

3. ppt 里的 write 都是写到数据库里

4. 如果我们简单地把 A-M 和 N-Z 的数据存在不同的数据库里、那么会遇到 multi-site atomicity 的问题

   - 即如果一个 server commit 了但是另外一个 abort 了

5. 第一个 Multi site 场景：high-layer tx 和 low-layer tx （compose multiple single-site TXs ）

6. 第二个 Multi site 场景：跨机器数据的事务 （a TX access data across sites ）

7. 需要保证：所有 low-layer tx 都是原子的

8. 所以有了 Two-phase commit

   - phase 1：准备/投票

     - 延迟这个 low level tx 的 commit
     - low layer 要么 abort，要么进入了 tentaively committed 的状态
     - high layer 的决定 low layer 的状态（通过投票）

   - phase 2：commitment

     - high layer 来决定 low layer 是否需要 commit 或者 abort
     - 会协调 low layer 的 tx 状态，所有人都提交了、再提交

9. 实现：high_begin 和 high_commit，遍历所有的 low layer tx，然后投票

   - 先会发一个 prepare message，然后等待所有的 low layer tx 的回复
   - 如果都回复了、就发一个 commit message，然后等待所有的 low layer tx 的回复

10. 不能直接在 low tx 里面用 commit logging，因为 The high-level transaction can abort

11. 修改：需要把 low layer 的 commit log entry 变成 tentatively commit log entry（PrePared）

    - 还会包含一个 reference 到 higher tx 的 ip，如果可以提交、就变成 commit 状态

12. 分布式下会有一个 partial 的问题

    - 就是 low level 的 tx 不知道其他的 low level tx 的是否 commit 了，只有 high level 的知道，会造成不一致性。
    - 通过 coordinator 来统一解决这个问题，即 worker 不会动、直到 coordinator 说可以动

13. 流程：为了让这个所有 low level tx 要么都提交、要么都不提交

    - 首先、这个 low level 的里面的 log 会记录一个 prepared 的状态（原来是 commit）
    - 然后、high level tx 要 log 一下它是否 commit 了
    - 所以根据 coordinator 的 log、来向所有 low level 的 tx 发信息、等到接收到所有 low level tx 处理完 prepare 之后的返回结果之后、再在 high 上面记录一个 commit、然后再发信息给所有 low level tx，让 low level 的写 commit log 在自己的 log 里面
    - phase 1 是协调 prepare、phase 2 是从 high 的 ok 了，开始 commit 开始提交

14. 出错处理：

    1. 一

    - prepare 阶段（还没 ok）
    - 如果 prepare 发过去的时候出错：timeout retry
    - 如果 prepare 的 ACK 丢了：timeout retry
    - worker failure：abort（给所有 live worker 发一个 abort message）

    2. 二

    - commit 阶段（coordinator 告诉 client ok 了）
    - 如果 commit 发过去的时候出错：timeout retry（low level server 发 tx？）
    - 如果 commit 的 ACK 丢了：timeout retry
    - worker failure：如果 worker restart、会自己重新问 coordinator，然后根据 coordinator 的 log 来决定

    3. 三

    - 如果 coordinator failure during prepare（在有 commit log 之前）：全部 abort（因为这个时候还没有 commit log、根据 ppt 上的图）
    - 如果 coordinator failure during commit：重新 commit 所有的 low level tx（因为这个时候已经有了 commit log）（重复 commit 不会影响正确性、因为如果之前有 commit 过、不做就行了）

15. 为什么 prepare 完之后就能在 high level 里面记录 commit log 了？

    - 因为这个时候所有的 low level tx 都是 prepared 的状态，所以可以 commit 了

16. 总结：

    - tx 是否被 commit/aborted 是必须被记录的
    - prepare 不需要被 log，因为可以恢复
    - 我们需要最小化 logging、这对于性能很重要
    - 怎么做 checkpoint？对 low level 很好做、但是对于 high level 需要额外操作（因为这个 worker 很可能再来问这个 commit entry log 还在不在，所以在实现的时候、high level 会在后台接受所有的 low level 的 commit 确认、然后如果一个 commit 的所有 tx 都提交了、就标记这个 commit entry log 可以被做 checkpoint 了）

17. 在 2pc 里的 2pl 和 occ

    - 2PL: each low-layer TX cannot release its lock until the high-layer TX decides to commit
    - OCC: the validation & commit phases are done by the coordinator

18. Two-phase commit allows us to achieve multi-site atomicity: transaction remains atomic even when they require communication with multiple machines

19. In two-phase commit, failures prior to the commit point can be aborted. If workers (or the coordinator) fail after the commit point, they recover into the PREPARED state, and complete the transaction

20. 问题在于 coordinator 挂了，就不可用了，所以需要 replication 保证高可用

    - 不能依靠重启去做恢复、因为太慢了

21. 2PC only guarantees consistency! in CAP（Consistency， Availability ，Partition tolerance(the system continues to operate despite arbitrary message loss or failure of part of the system) ）

22. replication 的好处

    - Higher throughput: replicas can serve concurrently
    - Lower latency: cache is also a form of replication
    - Maintain availability even if some replicas fail

23. 分为 optimistic replication 和 pessimistic replication

24. Optimistic Replication (e.g., eventual consistency)

    - Tolerate inconsistency, and fix things up later
    - Works well when out-of-sync replicas are acceptable

25. Pessimistic Replication (e.g., linearizability)

    - Ensure strong consistency between replicas
    - Needed when out-of-sync replicas can cause serious problems

26. Some applications may prefer not to tolerate inconsistency

    - E.g., a replicated lock server, or replicated coordinator for 2PC Better not give out the same lock twice
    - E.g., Better have a consistent decision about whether transaction commits

27. Trade-off: stronger consistency with pessimistic replication means:

    - Lower availability than what you might get with optimistic replication
    - Performance overhead for waiting syncing w/ other replicas

28. RSM (Replicated State Machine) 能 ensure single-copy consistency

    - Start with the same initial state on each server
    - Provide each replica with the same input operations, in the same order
    - Ensure all operations are deterministic （确定的、即不受随机干扰）
      - E.g., no randomness, no reading of current time, etc.
      - 并发和随机数会导致输入一样的情况下、输出不一样

29. 但是如果不做协议的话、那么可能会导致每个 replica 受到 request 的顺序不一样（因为广播速度受到距离的影响）

30. 所以可以做 RSM + primary backup replication

    - 一个 primary replica 会接受所有的 request，然后广播给所有的 backup replica
    - backup replica 会等待 primary replica 的确认、然后再执行
    - backup 也有助于状态恢复

## 15 RSM & PAXOS Consistency across multiple machines

1.  有时候这个有 race 或者不一致没有关系、比如商品的人气数据

2.  RSMs provide single-copy consistency

    - Operations complete as if there is a single copy of the data
    - Though internally there are replicas

3.  RSMs can use a primary-backup mechanism for replication

    - Using view server to ensure only one replica acts as the primary（分化出了一个 server 叫做 view server，用来告诉别人谁是 primary）
    - It can also recruit new backups after servers fail

4.  Primary does important stuff

    - Ensures that it sends all updates to the backup before ACKing the coordinator
    - Chooses an ordering for all operations, so that the primary and backup agree (i.e., one writer) （相当于只有一个写者了）
    - Decides all non-deterministic values (e.g., random(), time())

5.  原来、coordinator c 会认为 S1 是 primary、S2 是 backup，如果连不到了 S1，就会把 S2 变成 primary

6.  如果发生了一个 network partition，就相当于 C2 连不到 S1 了、就会把 S2 变成 primary，S1 变成 C2 的 backup

7.  所以引入了一个 view server，来决定谁是 primary，决定完之后、在 view server 上面只需要记录一个 key-value pair，即 primary 和 backup。实际操作的时候、每次 coordinator 会先去 view server 上面问一下、然后再直接根据 view server 返回的 primary 去直接访问那个对应的 primary、不会经过 view server 进行转发、就会导致 view server 的压力很小，不会成为系统中的瓶颈。（view server 只需要听各个 server 的心跳，而且所以因此只需要引入一个 view server）

8.  然后 view server 怎么保证可用性呢？所以就需要 paxos 来维护多个 view server 之间的 kv 值是一样的

9.  view server To discover failures

    - Replicas ping to the view server （replica 会给 view server 发心跳包）
    - If view server misses N pings in a row, it deems a server to be dead （对于几次 ping 失败的情况、view server 会认为这个 server 挂了）

10. Basic failure (actual worker crash):

    - Primary fails; pings cease
    - View server lets S2 know it's primary, and it handles any client requests
      - Before S2 knowing it's the primary, it will simply reject requests that come directly from the coordinator(在 s2 确定自己是 primary 之前、S2 会拒绝所有的请求)
    - View server will eventually recruit a new idle server to act as backup

11. Rules when Facing Network Partitions

    - Primary must wait for backup to accept each request
    - Non-primary must reject direct coordinator requests
      - That's what happened in the earlier failure, in the interim between the failure and S2 hearing that it was primary
    - Primary must reject forwarded requests
      - i.e., it won't accept an update from the backup
    - Primary in view i must have been primary or backup in view i-1

12. 下面是 paxos 的内容

13. 有 3 个角色：

    - proposer: 提出一个 proposal
    - acceptor: 接受一个 proposal
    - learner: 学习一个 proposal（接受上面达成一致的 proposal）

14. 任何一台机器、都可以是 proposer 又是 acceptor

15. 目标：所有的 acceptor 都接受一个 proposal 的值

16. Quorum = any majority of Acceptors（是一个多数派的概念）

17. 大致流程：

    - One proposer decides to be the leader (optional)
    - Leader proposes a value and solicits acceptance from acceptors (majority)
    - Leader announces result or try again

18. 但是最难的问题在于处理以下这些问题：

    - What if >1 proposers become leaders simultaneously?
    - What if there is a network partition?
    - What if a leader crashes in the middle of solicitation?
    - What if a leader crashes after deciding but before announcing results?

19. Paxos has rounds; each round has a unique ID (N)

20. Rounds are asynchronous

    - Time synchronization not required
    - If you are in round j and hear a message from round j+1, abort everything and move over to round j+1
    - Use timeouts; may be pessimistic（即认为不投票的人都是反对的）

21. Each round itself broken into phases

    - Phases are also asynchronous

22. Paxos in Action:

    - Phase 0：Client sends a request to a proposer（客户端发请求给 proposer）

    - Phase 1a (Prepare)：Leader creates a proposal N and send to quorum（发 prepare 请求）

      - N is greater than any previous proposal number seen by this proposer

    - Phase 1b (Prepare)： if proposal ID > any previous proposal

      - reply with the highest past proposal number and value（这时候 server 会返回一个值）
      - promise to ignore all IDs < N
      - else ignore (proposal is rejected)

    - Phase 2a (Accept)（leader）

      - Leader: if receive enough promise
      - set a value V to the proposal V, if any accepted value returned, replace V with the returned one（为什么要设一个 propose 号最新的 value 呢、不然的话这个旧值可能不是被 agree 的）
      - send accept request to quorum with the chosen value V（这时候 proposer 发 accept 请求）
      - 即如果在所有收上来的 promise 里面的 v 都是 null、那么 leader 可以随便设一个 value、如果收上来的 promise 里面有 value、那么 leader 就要设为这个 value（继承遗产）

    - Phase 2b (Accept)（Acceptor）

      - Acceptor: if the promise still holds
      - register the value V
      - send accepted message to Proposer/Learners
      - else ignore the message

    - Phase 3 (Learn) Learner: responds to Client and/or take action on the request

23. 为什么要多个 acceptors、因为一个可能会 fail

24. Why not accepts the first proposal and rejects the rest?

    - Multiple leaders result in no majority accepting
    - Leader dies

25. 注意这个 prepare 和 accept 的对象也可以是发出这个 proposal 请求的自己

26. 抽屉原理、保证不会有两个 leader 同时看到两个 majority

27. 当 Leader receives a majority <accepted, …>的时候、就可以确定这个 value 是确定的了（只有当这个时间点的时候、才知道有 majority 了，但实际上这个值被确定是在这个时间点之前的某个时刻发生的，但是因为节点间不会一直通信导致的）（就是当 A majority of acceptors accepts ok for the same proposal 的时候）

28. What if acceptor fails after sending promise?

    - Must remember Nh
    - What if acceptor fails after receiving accept?
      - Must remember Nh and Na Va
    - What if leader fails while sending accept?
      - Propose Mn again

29. 有很多数据需要记录在 log 硬盘上、在 ppt 第 50 页上（考虑重启的时候、单个节点从失败中恢复时）

30. 就是一轮里面、可能会有多个里面的值不同、比如 9 个里面 5 个是不同的值、其余 4 个是 null、所以可能最终的值是这个 5 个值里面的任意一个、而不保证是最新的那一个

31. paxos 可能选不出来，没有终止的保证，所以会有出现 view server 对应的 primary 和 backup 的 server 不一致的情况

32. 所以 paxos 的目标和达成了就是让所有的机器都接受同一个值

    - Each machine will have the latest state or a previous version of the state

## 16 Multi-Paxos, Raft & NewSQL Consistency across replicas

1. consensus 的本质是固定一个唯一的 writer（paxos 中，号最高的是 writer）

2. 如果没有 learner、本质上也可以拿到 paxos 的统一后的值，就是再发一个 proposal，然后取最新的值，但是会有性能问题、因为要拿到 value 的话、需要两轮 round trick 才能拿到，所以 learner 可以加速拿值

   - n_a 记住是为了辨别哪个 writer 是最新的 writer
   - n_p 记住是为了避免重启之后把票投给多个人
   - my proposal number 是为了 write 的时候发 proposal，如果没有这个应该也可以跑，就是要再发一轮 proposal，直到成功

3. single-decree paxos 其实还不能用来给多个 view server 做同步、因为他只能 accept 一个 value。而这个 primary kv 可能会更改、所以我们需要一个 sequence 的 value

4. 简单的解决方法：multi-paxos，就是用多个 paxos instance 去维护不同的值

   - 问题：如果一个位置上面在其他的 server 上面已经有了值，所以发起一个 accept 就能自动把这个丢掉的值给恢复起来
   - 如果一次 append 没成功、就重起一个 paxos 去做这个新值的维护
   - 但是他有一个性能问题，理论上一次网络操作就期望能存这个 append 的值，但是 basic 的可能需要很多次 append 才能写一个值（会有不同的轮数来解决前面的不匹配 conflict）（而且或者可能很多 server 没拿到 majority、会导致重新投票）
   - 解决方法：选一个 leader，只有 leader 能 propose，然后这个 prepare 请求可以涉及到多个 instance（batch）（把 3 和之后的所有都 prepare）（也可以一次里面 append 多个 entries，即 prepare 2+3）

5. 简单方法的问题：每次需要 2 个 round trick

   With multiple concurrent proposers, conflicts and restarts are likely

   1. The server may conflict on the position of the new log entry to insert
      (our previous example)
   2. Even in the same Paxos instance, different proposer may conflict
      Only the proposers with the highest number can win（冲突的情况）

6. Distinguished proposer (aka. leader)

   - The only one that issues proposals （leader 是唯一发 propose 的，为了避免 proposer conflicts）
     - i.e., no proposer conflicts in the optimal case
   - Client only sends the commands to the leader （client 只发请求给 leader）
     - Decides the value position
   - Question: is single leader necessary for multi-paxos? （本质上不需要单一维护的 leader）
     - No: if two or more servers act as proposers at the same time, the protocol still works correctly

7. 但是还是会有问题，就是 log 里面有 hole 怎么办（所以需要程序自己去推导、貌似就需要 raft 了）所以 multi paxos 好像没啥实现

## 16 Multi-Paxos, Raft & NewSQL Consistency across replicas

1. CAP theorem: 一个分布式系统，最多只能满足三个特性中的两个

   - Consistency: 所有的节点看到的数据是一样的
   - Availability: 每个请求都能得到一个响应
   - Partition tolerance: 系统在网络分区的情况下，仍然能够工作

2. 后面讲的就是 raft 了

   - paxos 是 bottom-up 的（先保证单值）
   - raft 是 top-down 的（直接解决多个 log 一致的问题、不用先解决单值一致的问题）
   - raft 和 paxos 是等价的协议
   - 一个值被 majority 了、也会在 raft 里被改

3. raft 的分解：

   - Leader election
     - Select one server as the leader
     - Detect crashes, choose new leader
   - Log replication (normal operation)
     - Leader accepts commands from clients, append to its log
     - Leader replicates its log to other servers (overwrites inconsistencies)
   - Safety
     - Keep logs consistent
     - Only servers with up-to-date logs can become the leader

4. raft：通过状态机 RSM+log

   - 三种状态：leader、follower 和 candidate
   - Leader: handles all client interactions, log replication
     - Invariant achieved: At most 1 viable leader at a time
   - Follower: passive (only responds to incoming RPCs)
   - Candidate: used to elect a new leader
   - 所有 log 只能由 leader 能做（限制），每个 term 里面只有一个 leader，leader 挂了会选一个新的
   - 为什么不能直接变成 leader 呢、因为会有 primary backup 的不一致问题
   - 只有 leader 可以发起 log 的 append，然后 follower 会把这个 log append 到自己的 log 里面

5. raft 通过 heartbeat 来决定是否需要 election（leader 挂了）

   - 如果收到了大多数 server 的投票、就变成 leader
   - 每个 server 只能投一票
   - 也是有一个 term 号、和 paxos 里的 proposal 号类似
   - 如果没人赢、就重试

6. election 需要 saftey 和 liveness

   - liveness：有可能从 candidate 里面永远选不出：解决方法：用一个随机 timeout 的 heartbeat
   - 每台机器只需要记住 currentTerm 和 votedFor（对于 election）

7. Log entry = index, term, command （log[]）

   - commit 就是把 log 输入到 statemachine 里
   - crash 的时候会造成 log 不一样的问题
   - 所以有两步走：先把这个 log 变成大概率是一样的、然后在这些大概率是一样的 log 的里面去做 consistency

8. 它保证的是一个 prefix 的 coherence

   - 就是如果 prefix 一样的话、才 appendEntries
   - 如果 prefix 不一样、就不会 appendEntries
   - 如果 prefix 不一样的话、会由 leader 发起进行一个覆盖的操作
   - 如果有很多不一致、所以就会递归覆盖、就是全部覆盖
   - 所以会导致 majority 写了、还是最后被覆盖了

9. 实现：

   - 保证这个 leader 是 truth
   - 如果不一样、就把其他的覆盖掉、变成 leader 的 log

10. 如何保证一个 log 被 commit 之后不被 overwrite 呢？

    - 可以避免一个比较少的 log server 变成 leader（选 leader 的时候加限制就行了，要有最新的 term 和 index 数，先按照 term 比、再按照 index 比）
    - 但是 ppt 上有一个例子、就是会覆盖掉 majority 的值，但是也有解决方法
    - 比如说、不能让 S5 成为 leader、就不会覆盖掉这个 2 了
    - 一旦这个 log 被 commit 了、所以就要保证这个 log 在 future leader 里面
    - 所以在选举 leader 的时候、加一个限制就可以了(lastTermV > lastTermC) ||(lastTermV == lastTermC) && (lastIndexV > lastIndexC)

## 17 Introduction to Network

1.  OSI, TCP/IP & Protocol Stack

    - OSI 有 7 层
    - TCP/IP 有 4 层（最常用）
    - CSE 只 care 3 层

2.  Layers in Network

    1. Application

    - Can be thought of as a fourth layer
    - Not part of the network

    2. End-to-end layer

    - Everything else required to provide a comfortable application interface （解决数据传输出问题的问题）

    3. Network layer

    - Forwarding data through intermediate points to the place it is wanted (找节点的邻居，怎么找到一条线连接到目标节点)

    4. Link layer

    - Moving data directly from one point to another （两个节点直接相连）

3.  UDP 更关注的是速度，不保证发出的包一定能收到

4.  因为这个包的数据是往前增长的、所以会用 socket buffer 预留前面的空间（就是先分配包的空间、然后再填数据）

5.  transport layer

    - 为了区分然后建立多个连接、所以会有 port（共 65535 个）
    - 建立的连接数是有限的
    - 握手的时候的 seq number 是根据直到当前发的数据决定的（就是这个 seq number 是随机的）、所以可以防止第三方进入

6.  network layer：

    - 解决怎么找到一条路径的层的问题

7.  The Link Layer

    The bottom-most layer of the three layers
    Purpose: moving data directly from one physical location to another

    1. Physical transmission
    2. Multiplexing the link（一条线怎么传多个数据）
    3. Framing bits & bit sequences
    4. Detecting transmission errors
    5. Providing a useful interface to the up layer

8.  传输数据的方法：

    1. （同步的方法）用 shared clock，时钟上升沿的时候就去数据线上读数据（但是需要采样很精确，容错空间小、数据的周期也需要和时钟一样）（只在 cpu 内部这么传）（两条线、时钟线和数据线，但是两条线需要高度的协同）
    2. 不用 shared clock、可以用异步传输（ppt 过程，一开始 ready 和 ack 是 0，data 是 0 或 1，如果要传数据了、就把 ready 设成 1，然后 b 看到 ready 了、就读 data、然后把 ack 设成 1，a 看到 ack 是 1 了、就设 ready 是 0，b 看到 ready 是 0 了、就设 ack 是 0，然后结束）（好处：不需要时钟，不需要对表、而且采样不会出错、因为 ready 了才读数据）（缺点：是 2Δt （每次数据传递需要 Δt ）才能传一个 bit）（解决方法：一次传 N 个 bit，parallel transmission，比如 data 不是 1 个 bit、data 传 64 个 bit）
    3. serial transmission（usb 使用）（有时候这个波形会变形，所以会需要使用压控震荡器，能恢复出信号对应的时钟周期）（问题在于有时候这个信号没有变化、所以需要编码）
    4. 并行的接口有问题：数据传过去、每一处都有一个 bottleneck、会受限制，而且会有线的电源干扰、所以这个就是 usb 的使用（usb 就是串行的快速变化的一根线）

9.  VCO：压控传感器、从数据信号中恢复时钟，因为有时候这个数据会失真（但是这个需要这个变化的波形、如果有大量的 0 或者大量的 1 的时候、就会有问题、所以需要下面的曼彻斯特编码）

10. 曼彻斯特编码：

    - 本质是把变化嵌入到了每一个 bit 里面
    - 0 -> 01
    - 1 -> 10
    - 还有一个 8B10B 编码（8 bit -> 5 + 3 bit）（10 bit -> 6 + 4 bit）（就是把 8b 的编码变成 10b 的编码）（111100，1110）（0001）（好处就是增加变化）（数据率高一点）
    - 缺点：数据率只有 50%

11. 如何共享一个连接

    - Isochronous（同步的复用，第一种方法，现在用得很少）：对一条数据线分时复用（好处就是这个 8bit frame 是预留的，能保证语音的质量）（坏处是这根线上只能有 703 个同时的 conversations，因为带宽有限，超过 703 就会拒绝接入）
    - 相当于是 5624 / 8 = 703
    - 所以会有一个 multipexing/demultiplexing 的过程，可以把包放在一个 buffer queue 里面（单纯加内存不能解决问题、因为会导致等待的时间变长、然后就会 timeout、然后会重新发包、然后会导致时延变长）（所以丢包是一个好的选择）（因为发包的速度远大于收包的速度）
    - 有优先级的问题，比如两个包同时到、收哪个包
    - 还有一个 Frame and Packet: Asynchronous Link 的方法，用发包的方式进行数据传输（变长的数据包，使用包交换的方式）

12. 包头和包尾的作用：识别什么时候开始和结束一个 frame

    - 怎么通过 01 判断有一个新的 frame 来了，所以通过编码的方式来解决这个问题
    - Simple method
    - Choose a pattern of bits, e.g., 7 one-bits in a row, as a frame-separator
    - Bit stuffing: if data contains 6 ones in a row, then add an extra bit (0) （需要对数据做额外处理、如果数据里面有 6 个 1，就加一个 0）

13. Error Detection

    - 如果传错了、就需要重传、有额外的代价。
    - 首先、用一个 checksum 来检测错误
    - 最好也能够纠错：所以需要冗余的思想
    - hamming distance：两个 bit 之间的距离（两个 bit 之间的差异的数量），可以通过 hamming distance + simple parity check 来监测错误
    - hamming 距离越大、合法值之间的变化就越不可能发生
    - 4bit -> 7bit 中为什么要在 1，2，4 位上，因为这样就能够推出 3，5，6，7 位的错误的位置（为了电路设计）（不过错了两位就没办法了）（就是做异或）
    - 然后通过计算 P1，P2，P4，然后查表、如果是哪些组合出错了、那么就是哪个位错了
    - 问题是，错了一位可以纠错、但是如果错了 2 位、可以检测、三位有可能能监测出来
    - 缺点是效率低、数据利用率低

## 18 Network Layer All about routing

0. IP: Best-effort Network

   1. Best-effort network（尽力而为）
      If it cannot dispatch, may discard a packet

   2. Guaranteed-delivery network
      Also called store-and-forward network, no discarding data（存储转发网络，不会丢包）
      Work with complete messages rather than packets
      Use disk for buffering to handle peaks
      Tracks individual message to make sure none are lost
      In real world
      No absolute guarantee
      Guaranteed-delivery: higher layer; best-effort: lower layer

1. 网络传输中的所有数据不是同样重要的、比如包头信息会更重要（所以包头后面会有 checksum）

1. The Network Layer

   - Network attachment points 网络接入的节点（AP）
   - Network address
   - Source & destination

1. 为什么 send 对应的不是 receive，而是 handle

   - 因为还可能会对这个包做转发

1. Managing the Forwarding Table: Routing

   - 每个门就是一个端口
   - 所以需要一个表去记录每个包要去哪
   - 也有一个截获流量的例子（这个表是会变的）
   - Static routing vs. adaptive routing 就是找到一条路线，而且要考虑到路线上面节点的状态

1. IP Route Table

   - 简单的是 network-interface pair
   - 但是实际的路由表很复杂
   - 落在不同的网络段、就从哪个网络口出去
   - 里面存的是下一跳的地址+端口？

1. Control-plane VS. Data-plane

   - 所以把这个网络层的任务分成了两个部分，一个是 control-plane，一个是 data-plane
   - Control-plane：如何构造这张表（和性能相关度不是特别大，要求 adaptive 就可以了）
   - Data-plane：如何通过这张表去转发数据（性能相关度很大）

1. 每台路由器上的路由表都是不一样的，会更多关注 local 的节点

   - 并不存在一张全局的表，因为没人能存的下，而且也没有必要存那么多
   - Allow each switch to know, for every node dst in the network, a route to dst
   - Allow each switch to know, for every node dst in the network, a minimum-cost route to dst
   - Build a routing table at each switch, such that routing_table[dst] contains a minimum-cost route to dst
   - 所以需要让这个全球的网络可以通过这个表的转发相连

1. Distributed Routing: 3 Steps in General

   - Nodes learn about their neighbors via the HELLO protocol（敲门）

   - Nodes learn about other reachable nodes via advertisements（把自己的邻居告诉别人）

   - Nodes determine the minimum-cost routes (of the routes they know about)（要做的、就是找到最短的路径）

1. Two Types of Routing Protocol

   - 第一种叫做 link-state routing 一个是通过 flooding 所有的 neighbor 状态（广告里面包含了 neighbor 和到 neighbor 的 cost）（然后通过 Dijkstra 算法找最短路径）（交互的内容少、但是发给所有人）
   - 第二种叫做 Distance-vector Routing 第二个是只告诉 Nodes advertise to neighbors with their cost to all known nodes（只给自己的 neighbor 发包、但是信息量大）

1. W 是还没有处理过的节点

   - 然后讲了一下 link-state routing 就是用了 Dijkstra 算法去找最短路径
   - 通过 dijkstra 不断更新这个表
   - flood 对 failure 的容忍还是比较高的（因为是全都发）（如果有一个节点挂了、通过 flood 的机制、所以还能到达其他节点就可以了）
   - 但是 flooding 的 overhead 很高、因为会充满这个邻居数据的包（n 平方）

1. Distance-vector Routing

   - 所以为了降低上面的 overhead，所以只给自己的 neighbor 发包
   - 每个节点收到自己 neighbor 的 advertisement
   - A’s neighbors do not forward A’s advertisements; they do send advertisements of their own to A（不给邻居发包含它自己的信息）
   - 相当于 bellman-ford 算法，所以只做一轮得到的结果不是最优解、所以要多次迭代后得到最优解
   - 但是对 failure 的容忍度不高、因为只是告诉邻居
   - limits 是 failure handling

1. 有一个 infinity 的问题、就是这个节点不可达的时候、会不停地给邻居发值、导致这个值变成无穷大

   - 通过 split horizon 的方法来解决这个问题，即这个节点不会把来自源的信息再发给源
   - 从一端收到的信息、不会再发回去
   - 就是发过的重复信息、不会再发、只发更改过的信息、所以 a 不会发没改过的 bc 信息给 b

1. Link-State Summary
   Pros:
   Fast convergence
   Cons:
   flooding is costly: 2 x #Node x #Line advertisements
   Only good for small networks

1. Distance Vector
   Pros:
   Low overhead: 2x #Line advertisements
   Cons:
   Convergence time is proportional to longest path
   The infinity problem
   Only good for small networks

1. 上面这个 Distance Vector 和 Link-State Summary 的方法都只适用于比较小的网络、因为会有很多的 overhead，怎么 scale 呢？

1. 3 Ways to Scale

   - Path-vector Routing（不记一个点、记一条路）

     Advertisements include the path, to better detect routing loops

   - Hierarchy of Routing

     Route between regions, and then within a region

   - Topological Addressing（让 hierarchy 反映出它自己的结构）

     Assign addresses in contiguous blocks to make advertisements smaller

1. Path Vector Exchange

   - 网络中的每个节点都维护一个 path vector
   - 也是通过 advertising 进行更新

1. 这里的例子是关于站在 G 节点的视角的

   - 通过 path vector 的方法、可以降低收敛的时间
   - 为什么好，因为有一个 path 在里面
   - 也提到了几个对 path vector 的问题的处理方法

1. How do we avoid permanent loops?

   - When a node updates its paths, it never accepts a path that has itself （就是这个更新路的时候、一条路里面没有自己就行）
   - What happens when a node hears multiple paths to the same destination?
     - It picks the better path（同样的路时、选更快的）
   - What happens if the graph changes?
     - Algorithm deals well with new links
     - To deal with links that go down, each router should discard any path that a neighbor stops advertising （把挂掉的点的路给删了、重新快速收敛）

1. 通过 region 的方法做 Hierarchical Address

   - 即相当于做 local 的 routing，然后再做 global 的 routing（层次结构）
   - 可以大大压缩路由表的大小
   - 但是缺点就是更加复杂了、而且需要把 region 和 ip（地址） 进行绑定了（因为需要通过 ip 快速定位到 region）
   - 也可以有很多层次的 region

1. hierarchy 的问题

   - Problems introduced by hierarchy: more complex
   - Binding address with location （因为相邻的地址做编码会方便）
   - Has to change address after changing location
   - Paths may no longer be the shortest possible
   - Algorithm has less detailed information
   - More about hierarchy
   - Can extend to more levels
   - Different places can have different levels

1. Routing Hierarchy

   - 跨 region 的路由需要用到 BGP （Border Gateway Protocol）

1. Topological Addressing

   - 类似于掩码的逻辑 18.0.0.0/24（CIDR notation），从 18.0.0.0 到 18.0.0.255 都是从一个端口出去、这样就可以压缩路由表
   - CIDR: Classless Inter Domain Routing
   - 就可以用一条去表达很多条
   - 为了 scale：所以要让路由表变小

1. 上面讲的都是 control-plane，下面讲的是 data-plane

1. data-plane 里面只需要考虑单机了

   - handle 可能还需要调用 send、所以不是 receive
   - net_packet.destination != MY_NETWORK_ADDRESS 的话、才需要 link_send
   - 就是如果是 localhost 的话、就不用 send 了
   - 如果收到一个不是自己的包、那自己可能就是路由器（就需要把包转发啊）
   - 一共有四条路径：收包的时候、可能是自己的或者不是自己的、发包的时候、也可能是自己的或者不是自己的，用一个 handler 判断需要往哪里走

1. forward 一个包的时候、需要做很多事情

   - 先查表
   - TTL：在网上能够通过多少个路由器转发、防止无限循环，如果 TTL 是 0 的话、就把这个包丢掉
   - (Time To Live) TTL：能在网络上通过多少个路由器进行转发
   - 更新包的 checksum（因为要减少 TTL）（有专门的硬件进行加速）
   - 然后再转发

1. Data-plane Case Study: Intel's DPDK

   - 是 bypass 了 kernel
   - RX 和 TX 分别代表了收包和发包
   - 直接访问网卡中的内存空间
   - 是通过轮询 hardware queue 的方式去做的、就没有 kernel 的介入（很快，没有中断）

1. RouteBricks

   - 用了很多个便宜的网卡机来代替了一个昂贵的路由器
   - 降低了成本

1. NAT (Network Address Translation)

   - Private network Public routers do not accept routes to network 10 (e.g., 10.8.8.8)
   - 因为网络的出口比较少、所以会不够用
   - 就是在发送的时候、把自己发出去的包的内网 ip + port 翻译成一个公网 ip （相当于是 router 的 ip）
   - 然后在接受的时候、再把这个公网 ip 翻译成内网 ip + port
   - 其实不太好、因为在网络层用到了不是网络层的 port 的信息、破坏了层和层之间的封装性（需要更改 payload 里的 port）
   - port 是 end to end layer、让你去复用一个网络
   - 就是消耗路由器的端口、然后 router 的端口是有限的、相当于是一个端口对一个端口
   - NAT 是有限个的，如果 10 个笔记本连一个路由器、最多每个分到十分之一个 NAT
   - NAT 表会成为瓶颈
   - 对于 IP-set，不能经过 NAT、因为是 payload 里面的 port 是加密的，所以不能用 NAT
   - ftp 也不能经过 NAT（其实也破坏了封装性的设计）（因为把 ip 写到了数据层 data 里）

1. NAT router: bridge the private networks

   - Router between private & public network
   - Send: modify source address to temp public address
   - Receive: modify back by looking mapping table

1. Limitations

   - Some end-to-end protocols place address in payloads
   - The translator may become the bottleneck
   - What if two private network merge?

## 19 End-to-end Layer Best-effort is not enough

1. 以太网 Ethernet

   - 就是需要监听所有的包、不能有冲突
   - 需要监测一个人发包的时候没有其他人在发包
   - 这个包不能太小、需要有 padding、不然会导致传输失败（最小 368）

2. 以太网发包的时候、拓扑结构有两大类

   - Hub：所有的包都会发给所有的人（广播）（意味着可以做监听）（A 10/100Mbps hub must share its bandwidth with each port）
   - Switch：会通过路径的调转，只会发给目标的人（不会广播）（Keeps a record of the MAC addresses of all the devices）

3. 以太网广播的时候，handle 函数里面就不需要转发了

4. Layer Mapping:

   - 例子里的上面这些 block identifier 都是 ip 地址、下面的数字 ethernet 是 mac 地址
   - mac 地址：48 bits
   - 在 ip 层发的时候、也会在包头包含 ip 的 source 和 destination 的地址
   - 到 ethernet 层、通过 mac 地址进行传输（相当于在包头填了一个 mac 地址）
   - 但是会有一个现象、就是 mac 地址是可以重复的，所以会有不同的设备有同样的 mac 地址
   - 自己的 mac 地址也可以修改，多个 mac 地址是可以一样的（只有 ip 需要唯一、而且 mac 可以改）（所以只要在同一个网段不重叠不重复就可以了）
   - 例子里面、如果要发包给 E、就要设置目标的 ip 地址为 E（E 的 ip 地址），然后设置目标的 mac 地址为 router K 的 mac、即 19，这样 K 才能收到这个包
   - 然后 router 从 4 号口发出去

5. layer mapping（arp cache）

   - 会在表里面存储 ip->mac 的映射
   - 如果发给网段之外的、就是 mac 就是路由器的 mac
   - 之前上面的 routing table 是通过 hello protocol 和 advertisement 来更新的
   - 这里使用了 ARP 协议（Address Resolution Protocol）来解决当一个新加入网络的时候、如何找到这个新加入的设备的 ip 地址和 mac 地址的映射，就是新加入节点能有这张表
   - 会通过广播的方式来找到这个映射（如果有人回应、就会更新这个表）（这里的表是存在了每个设备上。这个存的 station 为啥是 19？因为是路由器）（貌似每个机器都会存一个 cache）
   - 这个表就像 cache 一样、会不断更新

6. RARP：Reverse ARP

   - mac -> ip
   - 通过 mac 地址找 ip 地址

7. gateway 貌似就是 router 的意思，这里有一个例子

   - 在例子里面，会先填 target mac 为 gateway 的 mac
   - 然后根据 route table 修改接下来的包的 source 和 target 信息
   - 所以 link layer 通过修改 mac 地址来完成相邻节点的包的传输
   - source ip 也会改
   - 就是只用 mac 地址来完成两个点之间的传输

8. 会有一个 arp spoofing(投毒) 的攻击

   - 核心方法是 arp poisoning（本质上是对 arp 表的污染）
   - hacker 在没人问路的情况下广播很多消息，把正确的 ip-mac 映射关系给替换掉，然后这个包就被发到了 hacker 的机器上
   - 相当于 hacker 会变成一个中间人，可以看到所有的包（在不需要路由的场景下、hacker 把自己变成了一个路由器，就可以监听）

9. 如何防止 arp spoofing

   - 这个主要是因为协议问题、所以会比较难解决
   - 方法是：定期监听网络中的 arp 包的流量，然后发现有异常流量和数据的包的时候、就会发警告。但是没法根本性地解决。
   - 还有一个方法是：用静态的人为设定的 arp 表，但是这样的话、就会导致网络的可扩展性变差

10. 上面讲的都是网络层的问题，下面讲的是 end-to-end 层的问题

    - NAT 和 ARP 都是在网络层中会发生的变化

11. 网络里 如果网络不同会怎么办？考试？

12. end-to-end 层

    - 因为 network layer 没有保证很多东西、所以需要 end-to-end 层根据不同的应用场景进行设计（Delay - Order of arrival Certainty of arrival - Accuracy of contentRight place to deliver）
    - 没有 one-size-fits-all solution
    - TCP 保证了数据的完整性、但是 UDP 不保证数据的完整性
    - TCP 的 flow control 是可以当数据发得太快的时候、控制发送的速度
    - 这里介绍了 UDP、TCP 和 RTP

13. end-to-end 考虑了 7 种问题

    - Assurance of at-least-once delivery
    - Assurance of at-most-once delivery
    - Assurance of data integrity
    - Assurance of stream order & closing of connections
    - Assurance of jitter control（实验）
    - Assurance of authenticity and privacy
    - Assurance of end-to-end performance
    - 最难的是第 7 个问题、performance 的问题

14. Assurance of At-least-once Delivery

    - RTT (Round-trip time) to_time + process_time + back_time (ack)
    - 问题是：如何确定一个包丢失了
    - 可以通过 timeout 来确定（但是需要首先知道 RTT）
    - nonce：一个随机数、用来标记这个包是第几个包（网络中常用的方法）（唯一用来标识网络中的包）
    - Dilemma 是不知道是哪个阶段丢的包，可能是 ack 的时候或者是发送的时候丢的
    - Try limit times before returning error to app(方法即是每隔一段 timeout 就重新发一个 data 包)
    - 所以他不能保证 No assurance for no-duplication （就是有可能会重复发送）（at least once）

15. 怎么设置这个 timeout 呢？

    - 太长、要长时间才能监测丢包，性能变差
    - 太短、会导致误判
    - 首先不能设置 fixed timer，（有一个路由器的例子）因为没有要到时间就会轮询、然后轮询了之后就更要不到时间、因为会大量阻塞，最后导致服务器崩了
    - 还有一个固定的收邮件的 timer、也会固定导致阻塞

16. 所以用 adaptive timer

    - E.g., adjust by currently observed RTT, set timer to 150%（比如可以简单地设置为 RTT 的 150%）
    - 可以用一个 adaptive timer，比如说根据 RTT 来设置这个时间，或者根据指数增长的方式来设置这个时间
    - 当前 linux 的设置是通过一个不断更新的 avg（存在权重） 和 dev（标准差） 来进行设置的 timeout = avg + 4 \* dev（经验数据）
    - 还有一个是 nak(Negative AcKnowledgment)，就是当收到几个包的时候，receiver 会告诉 sender 哪些包丢了，然后对方会重新发这个包，这样 sender 就不需要对每个包维护一个 timer 了、只需要 sender 维护一个全局的 timer（但是 NAK 也会丢包）
    - 只要 at least once、就要有 timer（timeout）

17. Exponentially Weighted Moving Average（具体方法）

    - Estimate both the average rtt_avg and the deviation rtt_dev
    - Procedure calc_rtt(rtt_sample)
    - rtt*avg = a*rtt*sample + (1-a)\_rtt_avg; /* a = 1/8 \_/
    - dev = absolute(rtt_sample – rtt_avg);
    - rtt*dev = b*dev + (1-b)_rtt_dev; /_ b = 1/4 \_/
    - Procedure calc_timeout(rtt_avg, rtt_dev)
    - Timeout = rtt_avg + 4\*rtt_dev

18. SNTP 里面会有一个 go away 的设置、即如果超过了这个时间、就会让他不要再发包了

19. Assurance of At-most-once Delivery

    - 最基本的实现：receiver 收到一个 nonce 相同的包、就不处理
    - Maintains a table of nonce at the receiving side
    - 但是这样就会让这个 table 无限增长，导致搜索开销变大和 tombstones 的问题
    - 另一个方法：通过幂等操作来解决这个问题，允许多次处理同一个包（即一个操作多次执行和一次执行的效果是一样的）（让 application 容忍重新发包）
    - 第三个方法：（Duplicate Suppression）还可以设置一个最大的 sequence number（比如上一个接受到的包）、小于这个 number 的包就不接受、大于这个 number 的包就接受，但是这个 old nonce 也会变成一个 tomstone（但是要保证这个 nounce 是递增的、而且不会乱序出现）
    - 第四个方法：每次用不同的端口处理请求（一旦服务完就关掉、但是端口是有限的、所以还是需要复用）、但是旧的端口就会变成一个 tombstone

20. Accept the possibility of making a mistake

    E.g., if sender always gives up after five RTT (cannot ensure at-least-once), then receiver can safely discard nonces that are older than five RTT
    It is possible that a packet finally shows up after long delay (solution: wait longer time)

    - 比如 sender 会在 5 个 RTT 之后放弃，那么 receiver 就可以安全地丢弃 5 个 RTT 之前的包，节省了空间

21. Receiver crashes and restarts: lose the table

    - 实现 At-most-once 会比较难、需要更多的资源，而且 crash 了之后因为 table 在 cache 里、会丢失
      One solution is to use a new port number each time the system restarts
      Another is to ignore all packets until the number of RTT has passed since restarting, if sender tries limit times

22. Idempotent could be another choice

    Ensure that the effects of multiple execution equals execution once

    - 所以幂等操作是一个比较好的选择

23. Assurance of Data Integrity

    - 使用 checksum（但是还是有很小的概率，但是不用考虑）（防止数据被改）（在 end-to-end 层添加）

24. Segments and Reassembly of Long Messages（顺序问题）

    - Bridge the difference between message and MTU
    - Message length: determined by application
    - MTU: determined by network（最大传输单元）
    - Segment contains ID for where it fits
    - E.g., "message 914, segment 3 of 7"
    - 需要有一个 buffer、然后填这个 buffer
    - 需要进行拆包
    - out of order 的时候、会有不同的方法解决这个问题（各有优劣）
    - 方法 1：只顺序接受包
    - 方法 2：等待顺序位置的包到了之后、再把这个包放到 buffer 里面（问题是：网络出问题的时候、需要维护一个很大的 buffer，收到之后才能 free、有资源消耗大）
    - 方法 3：combine the two methods above（buffer 满了、就把 buffer 清掉、全部重传）
    - 方法 4：当发现一个包没收到的时候、主动返回去要这个包，发一个 NAK 的消息
    - 这个 buffer 是 os buffer，所以不能允许一个 app 的占用的 buffer 空间太大、如果 NAK causing duplicates，stop NAKs
    - TCP 基于 ACK 的重传（这个是基于超时的、其实是慢一点的），而不是 NAK （NAK 会快一点）

25. Assurance of Jitter Control

    - 相当于看视频的时候的提前缓冲，来避免卡顿，因为看到的是缓存好的，而新来的数据有快有慢地来是感受不到的
    - 公式：（最长时延 - 最短时延）/ 平均时延 = segment buffer 的大小

26. Assurance of Authenticity and Privacy

    - 通过证书机制
    - 加密：公钥私钥（非对称加密）（用公钥加密的东西，只有私钥能解开）（用私钥加密的东西，只有公钥能解开）

## 20 TCP Congestion Control & DNS

1.  End-to-end Performance

    - lock-step protocol:收到 ack 之后再发下一个包，但是问题就是、网络时延会变成一个瓶颈（中间有大量的带宽）
    - 所以引入了 Multi-segment message，可以一次先发多个包（Overlapping Transmissions）（Pipeline style）
    - 但是 Overlapping Transmissions 的时候会有一个问题、需要考虑丢包的时候怎么办
    - 性能由 receiver 收包的能力和网络带宽决定（就是每次发多少个包、停下来等一等）（如果 sender 很慢、receiver 很快、那么就没关系）
    - 所以引入了 fixed window（这个 window 的大小是 receiver 给的，例子里是每次收发 3 个包）
    - 然后为了提升性能、引入了 sliding window（这个 window 会根据目前收发到了多少个包进行滑动）（就能缩短 receiver 的 idle 时间，减少浪费的带宽）

2.  有一个解决丢包的例子

    - 因为 2 号包丢了、所以不能滑到 3 号包的 window 那边
    - timeout 之后会重发 2 号包
    - 所以这个 TCP 解决丢包的方案是比较保守的、会等待 2 号包的 ack 回来之后、再继续发包

3.  Sliding Window Size 的大小需要合理进行设置

    - 如果 window 太小了、就造成很长的 idle 时间
    - 如果 window 太大了、就会造成网络拥堵
    - window size ≥ round-trip time（一个来回的时间） × bottleneck data rate（瓶颈的带宽）
    - 500KBps（receive） \* 70ms （RTT）= 35KB = 70 segments（a segment is 0.5KB）
    - 但是单单根据这个公式得到的还是不准确的、因为其中可能还会有其他的瓶颈、如果传得太快、就会发送拥堵
    - 而且这个不知道这个瓶颈带宽是多大、而且会可能实时变化
    - 为了解决这个问题、就有了后面的 TCP Congestion Control

4.  TCP Congestion Control

    - 大量的包出现在网络中、会导致网络拥堵
    - 需要既涉及到 network layer 也涉及到 end-to-end layer
    - 因为要排队、所以会需要把包存在队列里面，会存在网络资源的浪费（放不下之后、就会丢包，也可能会处理超时的包、所以会浪费）

5.  Network layer

    - Directly experiences the congestion（直接感受到拥堵，比如路由器、来不及处理了、就要丢包、有两种选择、一种是丢了、这样端到端也可以发现 ack 丢了，但是 congestion 从发生到被感受到就有很长的时间）
    - Ultimately determine what to do with the excess packets

6.  End-to-end layer

    - Control to reduce the sending rate, is the most effective way

7.  所以为了 congestion control，也要控制 window size 的最大值

    - window size ≤ min(RTT x bottleneck data rate, Receiver buffer)
    - 但是 bottleneck data rate 是动态的、所以问题在于怎么找到这个值
    - 节点只能感受到丢包、所以需要通过丢包来感知网络的拥堵

8.  congestion control basic idea

    - Increase congestion window slowly（一开始缓缓增加）
    - If no drops -> no congestion yet
    - If a drop occurs -> decrease congestion window quickly（一旦发生了丢包、就要快速减小）
    - 缓慢地增加、迅速地下降、很保守的方法
    - 还需要考虑怎么保证 fairness 的问题

9.  有一个 AIMD 的方法（Additive Increase, Multiplicative Decrease）

    - Every RTT:
    - No drop: cwnd = cwnd + 1
    - A drop: cwnd = cwnd / 2

10. 但是有很多问题

    - 比如一开始的一段时间、速度巨慢
    - 解决方式：只有在第一阶段用指数的方式增长（slow start）（Congestion_window ← 2 \* Congestion_window）
    - 这里 ppt 上有一个增长的示意图

11. duplicate ack received 是实际中引入的、receiver 当很多时间没有收到一个包的时候、会重发一个已经发过的 ack、这样主动地告知 sender 出问题了，就能标识网络问题

    - 一旦收到了 duplicate ack，就会减半 cwnd（cwnd = cwnd / 2）
    - 然后如果有一段时间 expires stop sending 之后（就是超时之后）、会重新从头开始 slow start（因为发生丢包了、说明有很严重的问题产生）
    - 但是问题还是有、就是图像上会有区域的带宽没有充分利用
    - 所以有了 DC-TCP 这些改进的方法（贴近最优带宽进行调整）、比如说针对数据中心的场景进行使用（针对不同场景有不同优化）（数据中心带宽很高、而且网路情况很稳定）

12. AIMD Leads to Efficiency and Fairness

    - 就是会先都腰斩变成一半、然后再每个都加 1、然后最后会收敛到这个 y=x 的直线上面
    - 这样不断调整就会调整到中间的点，然后来回震荡（因为落到了中间的线上）

13. 为什么不用减法？因为就没法自动保证 fairness

14. 丢包不一定是由于 congestion 导致的、比如在不稳定的无线网里、由于信号导致的丢包、我们甚至应该加快发包速度

    - 所以传统的 TCP 直接应用在无线网上的时候、会导致恶性循环(动不动就退到 0，所以需要重新设计)

15. Weakness of TCP

    - If routers have too much buffering, causes long delays （性能，延迟）
    - Packet loss is not always caused by congestion（丢包的原因不一定是拥堵）
    - Consider wireless network: if losing packet, sender may send faster instead
    - TCP does not perform well in datacenters（在数据中心里表现不好，因为数据中心的网络是很稳定的，而且带宽很高，时延很低）
    - High bandwidth, low delay situations
    - TCP has a bias against long RTTs
    - Throughput inversely proportionally to RTT
    - Consider when sending packets really far away vs really close
    - Assumes cooperating sources, which is not always a good assumption

16. 总结：Congestion window is adapted by the congestion control protocol to ensure efficiency and fairness

17. Domain Name Service

    - 需要从 host names 转换成 ip 地址（计算机通过 ip 访问）
    - router 不知道怎么发包到域名

18. 为什么不只用 ip

    - 首先不够用户友好
    - 其次 ip 是动态的、会进行变化（地点变化、服务器迁移）

19. Questions on DNS

    - 一个 name 可以有多个 ip address（这样就可以选一个近的、就会更快）
    - 一个 ip 也可以有多个 name（这样就可以有多个域名指向一个 ip、比如说一个网站有多个域名）（server consolidation）（比如说网站使用不频繁的时候）
    - ip-name 的映射是动态的、可以变化（用户无感知）

20. Look-up Algorithm

    - 一开始是存在每个机器里的 txt “hosts.txt” 里、但是不能 scale
    - 所以就有了 DNS server，一开始叫做 BIND（Berkeley Internet Name Domain）

21. Distributing Responsibility

    - 分散：减轻压力
    - 结构化：也能和现实中的企业和组织结构相对应
    - 需要对 name 域名进行结构化、做分层 hierarchy 的结构，然后按层去寻找

22. Name Servers

    - The root zone（根域名）
      Maintained by ICANN, non-profit（仅负责一级域名）（数量不用特别多）
    - The ".com" zone
      Maintained by VeriSign, add for money
    - The ".sjtu.edu.cn" zone
      Maintained by SJTU

23. 它是从后往前解析的

24. Context in DNS

    - Names in DNS are global (context-free)
      - A hostname means the same thing everywhere in DNS
    - Actually, it should be "ipads.se.sjtu.edu.cn."（只是被省略了最后的 .）
      - A hostname is a list of domain names concatenated with dots
      - The root domain is unnamed, i.e., "." + blank

25. Fault Tolerant

    - Each zone can have multiple name servers （为了容错，每个域名都会有多个 name server）
      - A delegation usually contains a list of name servers
      - If one name server is down, others can be used

26. 下面讲了如何 Three Enhancements on Look-up Algorithm

27. 方法 1：可以指定地绑定和搭建 dns

    - 通过修改 hosts 文件
    - 设置/etc/resolv.conf，指定 dns server，如果找到了对应的、就直接从这个 dns server 里返回、如果没有找到、就会去找其他的 dns server
    - 好处是什么呢？既可以自己主动地去改动一些指定的域名、也可以在小范围内增强对域名访问的控制力（监管管理，实验室内部）

28. 方法 2：recursion 的方式的通信性能会更好一点、因为服务器之间的网络稳定、性能会更好

    - 但是要求就是对 root 的要求太高了
    - 而且是需要服务器维护有状态的（root 挂了就没了）
    - 如果 non-recursion、服务器就不需要维护状态
    - 实际中如何利用他们两个的优点呢？
    - 可以使用 caching

29. 方法 3：caching

    - 比如 sjtu 的服务器、不仅会解析 sjtu 的域名、还会解析其他的域名
    - DNS clients and name servers keep a cache of names

      - Your browser will not do two look-ups for one address(服务器 cache 这个映射，就不用每次都去找一次 dns server 了)
      - 电脑上自己也会有 cache

    - Cache has expire time limit（缓存有一个过期时间）

      - Controlled by a time-to-live parameter in the response itself
      - E.g., SJTU sets the TTL of www.sjtu.edu.cn to 24h

    - TTL (Time To Live)

      - Long TTL VS. short TTL
      - 如果太长了、就会体验到错误（比如个人网站部署的服务器迁移更新了，怎么让用户感受不到服务中断，所以需要留 24h 再关掉、因为 dns 的缓存是 24h）

30. 全世界也有很多 root dns

31. sjtu 也需要对内和对外的 dns server

32. 找第一个的地址的时候会比较麻烦、因为还没上网、所以需要口口相传，或者电子邮件

33. Comparing Hostname & Filename（比较 hostname 和 filename）

    - File-name -> inode number
    - Host-name -> IP address
    - File-name and host-name are hierarchical; inode num and IP addr. are plane

    - They are both not a part of the object（他们都不是锁映射的的一部分）

      - File-name is not a part of a file (stored in directory)
      - Host-name is not a part of a website (stored on name server)

    - Name and value binding （多对多绑定的关系）

      - File: 1-name -> N-values (no，没有意义，或者备份、版本管理); N-name -> 1-value (yes，hard link)
      - DNS: 1-name -> N-values (yes，加速和容错); N-name -> 1-value (yes，website consolidation，服务器聚合)

34. 貌似最后还讲了一点东西，dns 就是类似于 metadata server，单机的时候会有瓶颈、所以可以扩展几个 dns server，然后通过负载均衡的方式来进行访问

## 21 P2P Network

1. Good Points on DNS Design

   - Global names (assuming same root servers)
     - No need to specific a context
     - DNS has no trouble generating unique names
     - The name can also be user-friendly
   - Scalable in performance （性能好）
     - Simplicity: look-up is simple and can be done by a PC（lookup table）
     - Caching: reduce number of total queries
     - Delegation: many name severs handle lookups （很多服务器可以处理查询）
   - Scalable in management
     - Each zone makes its own policy decision on binding
     - Hierarchy is great here
   - Fault tolerant
     - If one name server breaks, other will still work
     - Duplicated name server for a same zone

2. Bad Points on DNS Design

   - Policy
     - Who should control the root zone, .com zone, etc.? Governments? （这个 root zone 应该由谁来控制？）
   - Significant load on root servers
     - Many DNS clients starts by talking to root server
     - Many queries for non-existent names, becomes a DoS attack
   - Security
     - How does a client know if the response is correct?
     - How does VeriSign know "change Amazon.com IP" is legal?

3. 怎么解决域名服务器逐层 cache miss 的问题（转化为 DoS 攻击）

   - 比如输入一个不存在的域名
   - 可能 root 更新的速度比 sjtu 的速度要快，所以可能会误报
   - 用分层定时扩散域名的方式（sjtu 定时获取）（root 不知道 sjtu 在哪、但是 sjtu 知道 root 在哪）（但是缺点是可能新域名要过一段时间才能获取到）

4. Security：使用证书机制保证 dns 服务器的安全

5. Behind the DNS Design（下面讲了原理，naming schema）

6. Naming for Modularity

   - Retrieval（检索）
   - Sharing（比如说硬链接）
   - Hiding（虚拟地址和实际地址解耦，保证了安全性）
   - User-friendly identifiers
   - Indirection:与实际位置解耦

7. Software uses these names in an obvious way
   E.g., memory addresses
   Hardware modules connected to a bus

8. 比如：EAX - 是一个寄存器的名字

   - 所有机器上都有 EAX，而且叫这个名字的寄存器有很多个（实际映射到很多不同个的隐藏的寄存器上）
   - 所以可以并发地去做一些操作
   - hiding
   - indirection（所有机器上都有 EAX，但是代码不用关心这个 EAX 是什么，只需要知道这个 EAX 就行）

9. 或者 phone number 的虚拟号码、也是保护隐私（indirection）

10. naming model 里的 context 有些是 global 的、有些是 local 的，比如针对说一块磁盘（这张图很好）（或者域名的 context 就是全球、或者没有 context）

11. bind 和 unbind，unbind 很多时候现在做得不好（电话卡）

    - Binding – A mapping from a name to value
    - Unbind is to delete the mapping
    - A name mapping algorithm resolves a name

12. Naming Context

    - Type-1: context and name are separated
    - E.g., inode number’s context is the file system
    - Type-2: context is part of the name
    - E.g., xiayubin@sjtu.edu.cn
    - Name spaces with only one possible context are called universal name spaces
    - Example: credit card number, UUID, email address
    - Embedded in name itself
      cse@sjtu.edu.cn:
      Name = “cse”
      Context = “sjtu.edu.cn”
    - Taken from environment (Dynamic)
      Unix cmd: “rm foo”:
      Name = “foo”, context is current dir

13. name mapping algorithm 本质上就是查表 Table lookup

14. recursive lookup 是递归的，multiple lookup 是平行的（比如说\$PATH，有很多个、但是不是递归的关系）

15. FAQ of Naming Scheme

    - What is the syntax of names? 比如说网址里的.分隔符
    - What are the possible value?
    - What context is used to resolve names?
    - Who specifies the context?
    - Is a particular name global (context-free) or local?

16. 这里说的 5-4-5 范式是什么意思？

17. content distribution

    - 如果每次都要去 b 站访问视频，会有很大的带宽消耗，所以需要 cache 到 sjtu 的服务器上，然后客户再从 sjtu 的服务器上获取
    - 相当于就是分布式的 cache，比如 b 站服务器把视频主动推送到 sjtu 的服务器上、然后避免对主视频服务器的多次访问（缓解了压力）

18. content distribution network（CDN）

    - Network of computers that replicate content across the Internet

      - Bringing content closer to requests
      - End users only use local (not shared) network capacity

    - Content providers actively pushes data into the network

      - Improve performance and reduce costs

19. 访问时在选择目标服务器的时候

    - 一开始是通过 http 重定向在进行，但是这样会有很多的 overhead（额外的 round trips）
    - 然后是通过 dns 来选择、是选择最近的（避免了 redirect）（缺点是通过 ip adress 来找这个 dns 服务器，但是不一定是最快）
    - 然后演化成了 akamai 的形式、逐层地找 dns、直到找到最近的 cdn 服务器，最后从最近的 akamai 服务器获取内容数据
    - cdn 提供商会从 content provider 主动获取数据、然后再 cdn 的服务器上缓存，然后再把内容数据发送到对应的 end user 的机器上
    - 用户一定是从最近的 nearby cdn server 上获取的内容、而不是从 content provider 上获取的
    - 好处是减少了带宽成本（如果每次用自己的服务器、成本巨大）

20. 下面讲的是 P2P

    - 就是相当于如果把 cdn 放在家里
    - 中心化的基础设施会有一些缺点：比如说单点故障、性能瓶颈
    - P2P 是一种去中心化的方式，没有中心化的节点

21. Usage Model: Cooperative

    - User downloads file from someone using simple user interface
    - While downloading, BitTorrent serves file also to others
    - BitTorrent keeps running for a little while after download completes

22. BitTorrent 有三个角色

    - Tracker：What peer serves which parts of a file
    - Seeder: Own the whole file （是一个特殊的 peer）
    - Peer: Turn a seeder once has 100% of a file (有一部分文件、100%文件的时候就变成了 seeder)

23. 首先会需要把 .torrent file 发到一个中心化的 web server 上（根节点，公共知道的地方）

    - Publisher a .torrent file on a Web server
      - URL of tracker, file name, length, SHA1s of data blocks (64-512Kbyte)
    - Tracker
      - Organizes a swarm of peers (who has what block?)
    - Seeder posts the URL for .torrent with tracker （把自己的文件信息告诉 tracker）
      - Seeder must have complete copy of file
    - Peer asks tracker for list of peers to download from （peer 会问 tracker 有哪些 peer 可以下载）
      - Tracker returns list with random selection of peers （tracker 会返回一个随机的 peer 列表）
    - Peers contact peers to learn what parts of the file they have etc.（peer 会联系其他 peer，了解他们有什么文件）
      - Download from other peers
    - 这些信息可能马上会变动（比如下完了马上关掉）

24. 这个去中心化建立在中心化的基础上（traker）

    - tracker 起到了中心化的作用
    - 所有这个网站就保证了定期发布了 tracker 的信息

25. 这个 bitTorrent 有不同的下载策略

    - Random
    - Rarest first（比如从最少的资源开始下载，这样可以保证整个文件能够下载下来）
    - Strict
    - Parallel

26. bitTorrent 的缺点就是 rely on tracker

27. 所以引入了一个 DHT: Distributed hash table

    - 即在分布式下的 hash table
    - 有 put 和 get

28. Chord Properties

    - Efficient: O(log(N)) messages per lookup
    - N is the total number of servers
    - Scalable: O(log(N)) state per node
    - Robust: survives massive failures

29. Chord IDs

    - SHA-1 is a hash function
    - Key identifier = SHA-1(key)
    - Node identifier = SHA-1(IP address)
    - 这个 key id 和 node id 是在同一个 value space

30. Consistent Hashing

    - 就是这个 node 对应负责小于等于这个 node id 的 key
    - lookup 的时候、node 会一个一个往前、然后直到找到一个 node 能够负责这个 key（O（n））
    - 然后可以用一个"Finger Table" 的优化、让这个查找更快（二分），然后每个节点也不需要保存所有的邻居节点、只需要保存比较少的邻居节点 O（log（n））
    - 如果有 failure 之后，会有一个问题：就算例子里的 K90 其实最后是保存在 N113 里的，但是 N120 不知道，所以会从 N120 继续往后找（相当于跳过了 N113，就找不到 K90 了）
    - 可以使用 successer lists 来解决这个问题（每个节点保存自己的后继节点）
    - 这时候最简单的方法就是顺序，所以解决方法是合二为一（同时维护 finger table 和 successer lists）
    - list 要多长：不会有人退出的话、可以短一点、如果频繁变化、可以长一点

31. 这个初始化的例子里、新加入节点之后、原来节点里的内容也不用删除，因为查找对应 key 的时候自己的负载也不会变大

    - 比如说一开始加一个 n36
    - 第一步、把 n40 上面的小于等于 36 的 key 都给 n36
    - 然后再把 n25 的指针指向 n36
    - 这里 n40 中 k30 还是在的

32. 做负载均衡的时候、可以引入虚拟节点的概念、然后和实际节点做映射，让负载均衡做得更均匀

    - Load balance could be a problem Some nodes have most value
    - One physical node can have multiple virtual nodes
    - More virtual nodes, better load balance

## 22 The distributed (and parallel) programming: it’s all about scalability

1. 怎么去加快计算呢，方法就是 Parallelism

2. 一开始是硬件上的 pipeline，但是单核上的频率有瓶颈、因为超标量和主频的提升会停滞。所以第一个方法变成了多核

3. 在多核情况下、会有一个 Cache coherence protocols，保证内存的一致性

   - 一个是 Snoop-based cache，还有一个方法是用一个来统一

4. 但是问题是不能 scaling、因为会涉及到要 snoop 很多个核（gpu 是没有 cache coherence 的）

5. 第二个方法是通过加更多个 alu 单元（本质区别是和更多的硬件空间留给了 alu）

6. New ISA: SIMD processing：用了 SIMD 之后、需要额外写很多代码

   - 每次可以做 8 个 4bit 操作
   - why not 8X faster? 因为不仅仅是做计算、还需要做访存（访存速度没有那么快）

7. 访存有两个限制

   - 一个是访存的延迟
   - 一个是访存的带宽
   - Both factors matters ，取决于实际应用的场景和需求

8. 用 SIMD 优化之后、cpu 的性能就受制于访存上了（可以通过计算）

## LEC 22: Distributed Computing: Intro

- 人工智能的发展导致需要大量的计算资源 也就必须得扩展为分布式计算
- AI 训练计算所需要的性能是非常好计算的
  - 一个神经网络层 W 是 m\*k 的矩阵 X 是 k\*B 的矩阵 B 为 batch size k 为输入维度 m 为输出维度 那么计算 W\*X 的时间复杂度为 (2k-1)\*m\*B
  - backward path（反向传播）需要计算 dW 和 dX 时间复杂度为(2m-1)\*k\*B 和(2B-1)\*k\*m 都可以约为 2\*参数数量\*Batch Size
  - 最终的结论就是 AI 模型训练总的时间复杂度为 6\*参数数量\*Batch Size
  - 对于 GPT 来说 有 1.76trillion 个参数 一张 A100 显卡的性能是 19.5TFLOPS 那么训练一个 GPT 需要 30s 进行一次迭代 非常的耗时
- 我们最终的目的是使用足够的算力进行分布式训练 接下来将先从单个计算设备开始讲起

### Computing Device

- 单个设备提升算力的根本就是并行

#### CPU

- 单核 CPU 系统 算力上限取决于 Clock Rate 一个时钟周期最多做一次指令 （当然也有使用 pipeline 和超标量（一次性做 4 条或者 8 条指令，本质是预测，前提是下一条指令和上一条指令没有关系）的方法来提高单核的算力）然而硬件的主频基本上因为散热问题已经到了极限
- 多核 CPU 系统 算力上限取决于核心数 然而和分布式类似 最恶心的还是 cache 中的 coherence 问题
- 另一种类似多核的方法是增加每个核的 ALU 数量 即 SIMD（Single Instruction Multiple Data）的思想 一条指令处理多个数据
  - 需要新的指令集（比如 Intel 的 AVX）增加了代码的复杂度
  - 性能增益不可能达到理论的倍增 因为指令可能有依赖
  - 有时候访存也会成为性能瓶颈 访存的时间 = Latency + Payload / Bandwidth
  - Roofline Model：刻画算力与带宽的关系图 y 轴是算力 单位是 GFLOP/s 即每秒多少次浮点运算 x 轴是应用利用内存的效率 单位是 Flop/Byte 即读取一个字节数据可以进行多少次运算 于是斜率就是应用对于带宽的需求 单位为 Byte/s 于是设备在图中表示为两条线 一条代表算力的水平线与一条代表带宽的斜线 应用的 OI（Operational Intensity）所落在哪条线 就说明哪个因素是瓶颈

#### GPU

- 也是两种方式提升算力：增加核心数和 SIMD
- GPU 的 ALU 数量远远多于 CPU 因为 GPU 没有 cache coherence
- SIMD 难以实现分支条件 但是可以通过 mask 来实现 也就是执行所有分支 但是写回的数据会用条件的 mask 来选择 不过还是会造成很多无用的计算 而且编程变得很复杂
- 于是 NVIDIA 实现了 SIMT（Single Instruction Multiple Threads）：（没听懂 说是超纲了）应该就是相当于用户指定某一个线程执行某一个任务 比如指定第 i 个线程执行第 i 位的相加

#### TPU

- Tensor Core：专门用于矩阵运算的核心 替换掉了原来的 ALU 用于加速矩阵运算
- TPUs（Tensor Processing Units）：谷歌的专门用于矩阵运算的芯片

#### Summary

- 单个设备的算力由于种种限制没法无限提高（比如主频是因为散热问题 多核是因为芯片面积问题等）连老黄的显卡的提升也只是因为使用了 tensor core 或是增加了核心数
- 于是就需要分布式计算来提高算力 大部分情况下使用一个开源的分布式计算框架足以 接下来我们介绍一个经典的分布式计算框架：MapReduce

## 23 The distributed (and parallel) programming on a single device & MapReduce

1. mapreduce 是一种分布式的计算框架

2. 超标量用于单核，但也有上限（pipeline）

3. 可以用 SIMD，但是传统的 cpu 不支持、而且需要写额外的代码

4. SIMD 之后、继续增加的话就是用多核（还有多个 ALU），（不能无限增加数量是因为硬件的数目和空间是有限制的）

5. 如果还没从内存中 load 出来的话、cpu 就会空转

6. roofline model 就能刻画一个设备时受制于算力还是访存（y 轴代表每秒需要计算多少浮点数）（横竖线时设备的计算能力）

7. 怎么刻画访存需求：访存本质上是间接需求（好的应用是每次 load 能做很多次计算、而不是每次计算都需要 load 内存）

8. x 轴刻画的是 operation intensity （越大、越能利用算力、越小、访存越多）

9. 斜线即代表了它带宽的需求（斜率）

10. 左边 intensity 和斜线相交、就是访存 bottleneck、在右边和 peak flops 相交、就是算力 bottleneck（给出应用的优化方向 application intensity）（比如说可以优化 gpu 算力、或者是将 intensity 竖线右移）

11. 因为 gpu 上面没有 cache coherence，也没有预测分支，也没有预取的硬件空间、所以可以承载更多个 SIMD ALU，所以 ALU 能放更多

12. 但是 SIMD 的操作只是针对底层硬件的，比较原始（而且是 vector 中批量做的）

13. 对于 relu 这种函数怎么做优化呢、可以先都做计算、然后如果小于零那么就让结果不生效（mask 方法）

    - 本质上是 branch prediction（每个 branch 都做一遍）
    - ppt 上的例子是：比如在分支中、先全部做 True 的情况、然后再把对应的情况写入寄存器、然后再做 False 的情况、再做写入寄存器（实现了 conditional branch 中的减少计算、这样只需要做两次）
    - 但是这种方法还是会有 50% 的计算浪费

14. cuda 是 nvidia 的 SMID 的框架

    - 是一种 SIMT，在 SIMD 上抽象了一个更高层的概念
    - 然后就不需要写很多 SIMD 中的重复的代码了，比如 if 里的 mask 操作
    - 每个 thread 在同一个时间都只执行同一条指令
    - 有了这个方法之后、就能用 CUDA 去写多 kernel 上的代码了
    - 矩阵乘法的硬化是会有很大的效能提升的
    - 性能提升主要在于 tensor core

15. 主频的提升是有上限的、因为会有很多的热量产生

16. 但是单卡还是不够、所以需要分布式

    - 存在很多分布式计算框架
    - batch processing（spark、hadoop）

17. batch processing

    - 场景：谷歌要统计很多网站每天的点击量
    - 传统的是在 log 中用命令行去统计，但是它是单线程的，很难 scale
    - 所以可以手动做一个任务划分、每台机器做一个 log 的统计，然后最后再做汇总

18. rpc 不够高效、因为有集群

19. mapReduce

    - map：把一个函数应用到很多个数据上（因为 map 这个事情非常适合并行化）
    - reduce：把 map 的结果做一个累加（必须等 map 全部做完）
    - 这里假设了函数程序不会有 side effect、所以如果出错了之后、直接重做就可以了

20. 这个 reduce 其实是根据 key 做 reduce 的

    - 这样就可以让 reduce 也具有并行性
    - 用 partition 的方式来类似地去做 reduce
    - 有了 mapreduce 之后、我们只需要考虑 functionality 就可以了

21. 例子：统计页面中出现了多少次每个单词

22. 只需要把代码直接给 mapReduce runtime 就可以了

23. MapReduce 执行流

    - 就是把原始数据分为不同的 shard 来进行（64MB）
    - master 负责启动所有的 mapper 和协调 reduce worker 什么时候开始执行
    - 对于用户是不可见的
    - 第一步：把大的文件分为很多小的 chunks（不能太小也不能太大）（太大的话在不同的 chunkserver 上、需要从很多个 server 上面拉这个数据）（选择了 64MB 的大小、因为 gfs 的 chunk 大小是 64MB，就能保证一次 rpc 就可以了）
    - 第二步：用 master 起所有的 map worker 和 reduce worker（一台机器上可以起多个 map worker 和 reduce worker，比如 reduce worker 不做事情的时候其实不怎么耗费资源）
    - 第三步： map task（它的所有中间结果都是先放在内存里、这样更快、然后再异步的方式去刷回到磁盘）
    - 第四步：这个 intermediate files 需要保证每个 reduce worker 负责的 key value 要放在一起、不然的话会有很多的磁盘上的随机访问、就会降低性能（会把文件做 partition，如果是 reducer1，就写到 partition1 里，每个 partition 对应于一个 reducer）
    - 第五步：mapper 结束之后、会告诉 master 可以启动 reducer 了，然后 master 会指定哪些 reducer 去读哪些 partition。这里的先 sort 是为了保证 reducer 在读的时候、一次可以把一个 key 的所有 value 都读完（如果在本地排序整个文件、会有很多 overhead、所以有一个优化，就是类似于归并排序，每个 map worker 会把一个 partition 的 key 先做一个排序，然后 reducer 做合并的时候就用归并排序的方式）
    - 第六步：做 reduce，产出最终 output file
    - 第七步：把结果返回给用户

## 24 Distributed Computing frameworks MapReduce, computation graph & Distributed training

1. mapReduce 的优化：首先是要做 fault tolerance

   - 一种是 worker failure
   - 一种是 master failure

2. 有两个让 mapReduce 很好 handle failure 的原因

   - 因为这个 map or reduce 的 function 没有 side effect，所以可以直接重做
   - 基于一个可靠的服务 GFS

3. worker failure

   - 第一个是 detection：监测心跳包（或者是 timeout 时间到了）
   - 第二个是 recovery：重做这个任务，会给这个 worker reset 到初始状态、或者直接把这个 job 给其他的 worker（re-execution）

4. master failure

   - 因为这个 job 往往会需要很长的时间、比如 8 个小时。所以直接重做不太好
   - 所以 master 会把自己的状态定期地持久化到 GFS 中、然后如果 master 挂了、就会从这个状态中恢复
   - 它是一个 periodical 的 checkpoint（所以就不需要重做所有的操作了）（但是做 checkpoint 还是会有性能开销）

5. 用户给 mapReduce 的函数，如果会有第三方库、有可能会触发这些第三方库的 bug

   - 一种是 report 给 developer、但是 developer 不一定写的这个库
   - 后来发现这些很多 bug 是由于一些特点和报错、比如会导致 segmentation fault
   - 如果出了这些错、那就把对应的 input 数据给直接丢掉不计算了

6. Optimization for Locality

   - 因为带宽和网速不够快，所以需要尽量减少网络的传输
   - 当时的计算和存储是在同一个机器上的、所以可以直接从本地读取数据然后在本地计算

7. stragglers 是那些跑得特别慢的机器 （Refinement: redundant execution）

   - 因为一个机器上可能不仅仅跑了 mapReduce 的进程、所以会影响性能
   - 或者 cpu 没有 cache（由于配置错误）
   - 所以会出现如果只有一个 mapper 没有做完的话、那么就需要等待这个 mapper 做完才能做 reduce
   - 解决方法：做冗余，每一个 job 可以分在不同的机器上面去执行，如果这个 map 在任意一个机器上被做完了、那么就认为它做完了。
   - 但是这个在训练的时候不太使用、因为训练模型需要很多计算

8. reducer 0 负责 0-1000，reducer 1 负责 1001-2000

9. Sort 的时候也是分 partition 去做的

10. 但是，MapReduce cannot address all the issues

    - 因为本身这个 map reduce 的函数比较简单（通过迭代，就是没有方法去编写一些比较复杂的例子）
    - 但是就不适用近似实时的计算和场景了

11. start penalty：启动 mapper 的时候需要预热（fork 进程）

12. 可以通过直接把 map 的结果发送给 reducer，而不是先写到磁盘上，来做优化（减少写磁盘的时间）

13. 为了抽象更复杂的计算，就需要 computation graph

14. computation graph

    - 一个节点代表一个数据或计算（要么是一个数据、要么是一个计算）（没有 side effect）
    - 一个边代表数据的依赖关系
    - 一个 job 就可以表示为一个 DAG
    - 因为 DAG 对于容错比较友好、如果一个红色的节点挂了怎么办、那么就可以去它的上游找对应的数据还在不在，然后做对应的恢复
    - 有环就不干净了
    - DAG 还能判别出哪些任务是可以进行并行执行的（没有路径依赖的话）

15. 用 kv store 存储中间状态的数据（内存、不存硬盘、因为硬盘太慢了）

16. 这个 failure 也会有 recursive 的情况

    - 只要回溯找到第一个没有挂的节点，然后就可以从这个节点开始重新计算

17. computation graph 也把系统和底层的算法做了解耦（机器学习）

18. 也可以去做图优化（把几个小的 kernel 合并成一个大的 kernel，好处就是 kernel 的访存效率提高了）（cuda graph）（针对于 gpu 硬件的实现）

19. Graph fusion：将多个节点合并成一个节点 减少通信开销

20. 下面开始讲 distributed training

21. x 是数据、y 是 label（期望值），w 是参数，然后一轮之后就是更新

22. 但是这个计算图的问题是、它没有办法并行、因为全是 dependency

23. 所以分布式训练研究的就是怎么把一个计算图变成一个可以并行化的计算图

24. 有两种主要的并行化方式

    - 一种是 data parallelism，就是把数据的 batch 分成很多份，然后每个机器上都做子 batch 的计算，这里的限制就是每个计算图的节点上面都有一个完整的模型、但是对现代的深度学习模型来说、这个模型是很大的、所以这个方法不太适用
    - 一种是 model parallelism，就是把模型的计算过程分成很多份，然后每个机器上都做一次计算，然后再把结果合并
    - 还有一种是跨 iteration 的 parallelism，就是可以做同步或者异步的更新（讲得会比较少）（现在基本所有大模型都是同步更新出来的）

25. 同步的 data parallelism

    - 图中就显示出了讲输入的数据去做分割，然后每个机器上都做一次计算，然后再把结果合并
    - 最后的梯度需要相加
    - 最后的问题是它什么时候做汇总，因为要 syncronize，所以会有一个 bottleneck（要等所有的都算完）

26. 这个 allreduce 是因为要把汇总的结果给所有人广播、所以叫 all

    - 问题就是怎么把这个汇总的操作做得快

27. 里面最大的问题是需要减少 network overhead

    - Overhead analysis: computation + network（computation 的其实很少）
    - 一个是带宽的 bottleneck
    - 还有一个是瞬时的 concurrent 的 message 的数量（比如 1 万张卡的数据同时给到一个机器）

28. 实现 1：parameter server

    1. Each process pushes the data to the parameter server (PS)
    2. After receiving all data, aggregate the data at the PS
    3. The PS pushes the data back to the processes

    - 好像就是一个简单的模型
    - 对 parameter server 的性能需求（带宽和并发数）和机器数是成正比的 O(N \* P)
    - N: the size of the parameters; P: the number of processors
    - Step #1: O(N) at each process, O(N \* P) at the PS
    - Step #3: O(N) at each process, O(n \* P) at the PS

29. Co-located & sharded PS

    - 每台机器只负责 1/n 份的数据
    - Total communication per-machine ：O(N \* (P – 1) / P )
    - Total communication rounds: O(1) -> Good!
    - O(P) fan-in -> Bad!

30. fan-in 就是很多机器在同一个时间给同一台机器发很多流量，会造成阻塞

    - Congest control overhead （控制阻塞信息的 overhead）
    - Resource contentions
    - 所以希望同一时间只有一台机器和 x 通信

31. 第二个方法：De-centralized approach for allreduce

    - 做一些协调、让每个机器的发送有一定间隔、而且不在同一瞬时
    - 每个机器做完之后主动通知下一台机器去发
    - 然后用类似方法发回信息
    - 这个 fan-in 就是 1
    - 但是还是有问题、就是每台机器要传的参数量还是很多，而且这个通信的轮数还是很多 O(P \* P)

## 25 Distributed Computing frameworks MapReduce, computation graph & Distributed training

0. 业界实际场景会使用 3D Parallelism 即同时使用下面三种并行化方法

1. naïve decentralized reduce 有个坏处、就是虽然它的 fan-in 是 1，但是它需要传的总数据量很大、是 N \* (P – 1) data(就是要传完整的参数)

1. 还有一个是用类似分 shard 的方式管理、但是还是有问题、就是当连接数大的时候、还是会有很多通信和网卡受不了的情况出现

1. 也可以采取一个优化方法 Ring allreduce（就是通过类似一个环的方式去传每个 shard 的数据）、就是每个机器只和邻居相连，然后然后每次传的时候做一个 reduce，然后再把 reduce 完的结果传给下一个邻居。然后最后一个传到的机器就有一个完整的数据。（这样的话每台机器的网络连接数就是 constant 了）（量还是一样的、但是就是每次传的数据不一样）

   - 好处是不需要 coordination、而且每个机器只需要维护邻居的网络链接了
   - 就是每台机器只负责一个 partition
   - 但是问题是其他人没有对应的最终结果。所以需要再做一个 broadcast，然后每个机器都有了最终的结果（训练中的完整的梯度）。

1. 但是由于有些 gpu 计算中的浮点操作（比如加法）是不满足交换律的，所以这个 Ring allreduce 会改变一些计算顺序、所以应用的时候需要注意。

1. Total communication per-machine 总数据量 2 _ (P-1) _ N / P

1. O(1) fan-in

1. 但是上面的 decentralized reduce 还是有问题、因为它还是需要做 k 轮通信

   - Total communication rounds: O(P)
   - Much higher than the parameter server approach (O(1))

1. Double Binary Tree All-Reduce

   - 为什么需要 double binary tree 呢，因为这个单个的 tree，load balance 不好，所以需要两个 tree（因为有些节点是根节点、有些则是叶子节点）
   - Log(p) rounds of communication
   - 所以可以把数据切成一半、然后把一半给叶子节点做、一半给父节点做
   - 这个 fan-in 就只有 O（1）

1. 主要就是三个参数的权衡

   - Communication round
   - Peak node bandwidth
   - Fan-in

1. 上面都是 data parallelism，下面开始讲 model parallelism

   - data parallelism 中，每台机器都需要存储完整的参数 w，但是现在的 llm 太大了
   - 而且现在的 llm 还需要存储优化器、比参数还大

1. 这个 model 的切法就是切分开来这个 w，然后横着切（不同 gpu 放不同层）、就是 pipeline parallelism，纵着切（把一个很大的 w 切到不同的机器上）、就是 tensor parallelism

1. pipeline parallelism

   - 会有一个 bubble 的问题、所以需要 reduce bubble

1. 第一个优化 pipeline parallelism 的方法是 micro-batching，就是把一个 batch 切成很多小的 batch，然后每个小的 batch 都可以并行计算（类似于 cpu pipeline 中的流水线并行）

   - 这个在 forward path 里面还不错
   - 但是在 backward path 里面就不太好了、因为还是需要等到所有的都算完才能做进行计算，所以还是有 bubble

1. Question: what is the overhead of pipeline parallelism?

   - bubble 的时间是 p-1
   - Bubble time fraction: (𝑝 −1)/𝑚

1. Optimization directions 但是都不大可行

   1. increase m (e.g., increase the batch size) （首先、每个 batch size 不能太小因为需要每个 batch 都保证一定的最小大小、因为如果太小、这个 gpu 的计算效率会很低）（然后这个 batch size 不能太大、因为会导致这个模型的收敛会很慢）
   2. reduce p (reduce the #partitions) （不太现实、因为 gpu 放不下那么多层的参数）

1. 所以有了 tensor parallelism

   - 相当于一层参数放到了不同的机器上面去
   - Partition the parameters of a layer
   - Each partition is deployed on a separate GPU
   - 使用了分块矩阵乘法
   - 涉及了 forward pass
   - 也涉及 backward pass，要算 ∇X 和 ∇W

1. tensor parallelism 和 pipeline parallelism

   - 前者比后者的通信量要多很多
   - 一般现在的卡会先在一个 scala network 上面、这个 network 用 nvlink 连接、带宽差不多在 800GB/s 左右、然后这个 network 里面、用 tensor parallelism
   - 然后在机器之间、会用比较慢的网络、比如 RDMA、是 100GB/s，在跨机器的时候用 pipeline parallelism

1. 3D parallelism 就是把上面三种并行放在一起

   - nvlink
   - data parallelism 用在四台机器的 data replica 中
   - 一台机器内用 tensor parallelism
   - 机器之间用 pipeline parallelism

1. 异步更新

   - 是为了解决这个 struggle 的问题
   - 算完之后、马上把梯度发给下一个人、然后用现有的结果再去做下一轮计算
   - 讲得比较少、因为会影响精度（可能只有在传统的图计算里面有用）

## 26 Introduction to System Security

1. 一开始的例子、就是说一个商家假扮成一个买家、然后篡改了交易的签名、然后 amazon 就会打钱给他、而不是给原来的商家。

2. Internet makes attacks fast, cheap, and scalable

3. Users often have poor intuition about computer security

4. Security is a negative goal

   - 指目标是一件事情不能发生，所以安全很难判断
   - 比如说有很多可以获取一个文件的方法

5. Why not using fault tolerant techniques for security?

   - 有时候可以 Some security issue can be seen as a kind of fault
   - 但是其中的攻击和 fault 的原因是不一样的
   - 而且这个 attack 导致的 failure 基本是 correlated 的、而单纯的 failure 是 independent 的
   - 所以 No complete solution; we can't always secure every system

6. What are we going to learn?

   - How to model systems in the context of security
   - How we think about and assess risks
   - Techniques for assessing common risks
   - There are things we can do to make systems more secure
   - Know trade-offs

7. Policy: Goals （下面的 CIA），拆开来的原因是因为他们三个相对来说是正交的。

8. Information security goals:

   - Confidentiality: limit who can read data （加密解决）
   - Integrity: limit who can write data

9. Liveness goals:

   - Availability: ensure service keeps operating

10. 拆解目标之后、就可以针对每个目标做对应优化

11. Threat Model: 就是做出 Assumptions

    - What does a threat model look like?
    - 建模之后、就能进一步简化问题
    - 一个假设是只有打开的一个软件是恶意的、其他的都不是恶意的

## 27 ROP and CFI

1. Authentication: Password

   - 这个攻击的例子是、如果密码的第二部分在内存里的另一页、那么如果前面几位匹配了、那么就会换页、就会慢、如果前面几位不匹配、那么就不会换页、就很快（这样就可以通过时间来判断密码的对错）（时间就变成了 26\*8 而不是 26^8）
   - 但是今天这个攻击不太好做、因为要把内存设置成这个样子的话不太方便，但是在当时的 os 里面很容易实现
   - 解决方法：先 hash 或者全部匹配完再返回 true or false

2. Idea: Store Hash of Password

   - 如果密码到 hash 值是一一对应的、那么就可以通过 hash 值来判断密码是否正确（构造）
   - Often called a "rainbow table"
   - 所以为了解决这个问题、需要往密码里加盐（salt）

3. Salting: make the same password have different hash values

   - 就是输入密码的时候、存之前再用一个随机数加到一起哈希
   - 加盐是明文的、但是从根本上还是没有解决这个问题
   - 但是为攻击者加高了很多攻击的代价
   - 因此这个是从工程的角度解决这个安全的问题的

4. Bootstrap Authentication

   - Do not want to continuously authenticate with password for every command
   - 就是为了避免每次操作都要输入密码
   - web 里面是用 cookie 的方式做保存的
   - {username, expiration, H(server_key | username | expiration)}
   - cookie 里面因为用了 server_key 即服务器端的 key 做 hash、所以难以伪造

5. Session Cookies: Strawman 的问题

   - 但是其中会有一个二义性、就是在做字符串拼接然后做 hash 的时候、会有不同的用户名+日期会得到相同的结果字符串（字符串拼接的时候会损失语义）
   - E.g., "Ben" and "22-May-2012" may also be "Ben2" and "2-May-2012"
   - 所以需要用更精确的方式、比如用一个特定的分隔符

6. Phishing Attacks

   - 钓鱼攻击、就是让你输入密码到别人的网站里
   - 比如域名里面只有一个小字符不一样
   - 这个就是密码最大的问题、一旦知道了密码、别人就可以伪造你的身份

7. 下面的 R 是：a random value R

8. Tech 1: challenge-response scheme

   - 如果朴素地做传递密码、会在通信的时候密码被截获，不管这个值是不是被 hash 过了的、都会有这个问题（如果被 hash 过了、之后也可以继续用这个值）
   - 服务器给用户一个随机数、然后客户端用密码和这个随机数做 hash、然后再发给服务器
   - 服务器也有这个随机数、然后也做 hash check、然后比较
   - 这样就不会有密码泄露的问题
   - 但是缺陷是 server 这里需要保存明文

9. Tech 2: use passwords to authenticate the server

   - 这里有两种小的子方法、第一种是 Client chooses Q, sends to server, server computes H(Q + password), replies， Only the authentic server would know your password!
   - 就是用密码去反向验证服务器的真实性（是用来反钓鱼的）
   - 但是真实的系统很少有这么做的，因为可以用同样的一种方式去欺骗 server
   - 第二种是 First, try to log into the server: get the server's challenge R
   - Then, decide you want to test the server: send it the same R
   - Send server's reply back to it as response to the original challenge
   - 简单概括就是发 server 一个随机数、然后 server 对这个随机数做一个 hash、然后发给 client、然后 client 用这个随机数发给 server、就可以登录了（就是两个方法合起来？）
   - 但是这个貌似也是不行的、会变成一个中继，什么都不用干就可以假冒一个用户登录

10. Tech 3: turn offline into online attack

    - 就是加一个验证码、这个验证码是每次都不一样的、所以就不会有中继的问题了
    - 然后服务器还可以记录哪些 ip 是在不停地发送请求（通过日志记录）、有可能会有固定的 ip 发送不同的用户名密码、就可以 ban 掉这个 ip

11. Tech 4: Specific password

    - 用户端：每个服务设置一个不同的密码

12. Tech 5: one-time passwords

    - 就是用一次就不能用，比如手机的验证码
    - 所以会有一个 Hash n 的密码发送策略、然后每次用完之后就会把这个 hash n-1 次后的密码发给 server、然后 server 再做一次 hash，然后发一次、本地的下一次发送、减去一个 1 再发送一次
    - 这个是为了防止攻击者投到中间的 hash 密码
    - 这里还有一个银行用于小的验证码的验证的工具、就是一个不联网的设备、通过初始状态相同、然后同步时间信息、就可以和银行中目前的验证码相同、然后且保证这个验证码不是固定的。然后这里还会需要涉及到银行端做时间上的容错、因为这个时间可能会和设备的时间有微小差异、所以应该在银行端可以计算出一个时间范围内的验证码，都合法。
    - Server stores x = H(H(H(H(...(H(salt+password)))))) = Hn(salt+password)
    - To authenticate, send token=H{n-1}(salt+password)
    - Server verifies that x = H(token), then sets x <- token
    - Google's App-specific password：每个密码只能用一次、然后每次都会有一个新的密码，上一次登录会记录登录的用途

13. Tech 6: bind authentication and request authorization

    - 比如转账这个操作、单单登录之后、使用 cookie ，不输入密码是不行的、还需要再输入一次密码

14. Tech 7: FIDO: Replace the Password

    - 比如说指纹
    - 把密码放在一个安全的区域、还是用指纹去获取这个密码
    - 最后还是用密码去做登录的验证
    - Three Bindings 是阐述了指纹密码的实现：就是服务器先通过 userID 加上个人的公钥、生成一个东西、然后发给 client、client 用这个东西加上自己的私钥做一个签名、然后发给服务器、服务器用这个签名和自己的公钥做一个验证、然后就可以登录了
    - 怎么去做上面的签名呢、就是用 fingerprint、这样就不用输密码了

15. Bootstrapping

    - 在重置密码的时候、如何通过邮箱里的 url 来重置你的密码呢？会涉及到一个参数。但是其中包含一个随机数（只有服务器知道）、所以一般人构造不出这个能够让你重置密码的 url（进而修改任何人的密码）
    - 对于随机数、很多时候通过设备里的/dev/random 来获取这个随机数（其中包含很多内容、比如键盘敲击的次数等）
    - 一个随机性更强的方法就是用熔岩灯的照片

16. 下面讲的是一些 Security Principles

17. Principle of Least Privilege

    - 比如 linux 不要用 root、要用普通用户、这样可以保护自己不做 rm -rf /这种事情

18. Least Trust 最小化可信

    - Privileged components are "trusted"，要尽可能减少这类组件
    - 增加 Untrusted components （does not matter if they break）
    - trust 本身是好的、但是要尽可能减少

19. Users Make Mistakes

20. Cost of Security（安全是有代价的）

21. 下面开始讲 ROP 和 CFI

22. ROP （Return Oriented Programming）

    - 一开始讲了一个例子、是如何通过 buffer overflow 中注入一点点代码就执行很多操作的、就是只需要注入 batch 命令的对应的二进制代码就可以了（然后让一个机器变成一个 bash）
    - 所以有了 Defense: DEP (Data Execution Prevention)：就是用硬件来保证栈和堆可写不可执行、来避免上面的问题
    - 有了不可执行之后、第二个攻击是 Attack: Code Reuse (instead of inject) Attack。这个核心就是复用当前的代码片段（ROP）、所以可以在覆盖的时候、多覆盖几个地址、然后通过 return 将很多个代码片段粘在一起（后面的几张 ppt 讲的是攻击的方法）

23. 怎么去防御呢：第一种方法是藏起来所有的二进制文件；第二种方法是 ASLR、就是随机化地址空间、就是你看得到对应的代码、但是这样就不容易找到对应的地址了；第三种方法就是 canary、就是在栈上面放一个随机数（因为 canary 肯定放在了 return addr 前面）、然后在 return 的时候检查这个随机数是不是对的、如果不对就直接退出、去监测 overflow

24. ASLR

    - 每次运行程序的时候、二进制的地址都是随机的
    - 但是如果是 fork 的话、子进程的地址是和父进程一样的、就没法这样随机了（如果要保证还是随机的话、那么成本就是很高的）

25. CFI：Control Flow Integrity

    - 就是用来 defend ROP 的
    - ROP 的本质是覆盖掉原来的正常的 control flow、然后用攻击者自己的 control flow
    - 所以本质上需要在每次 return 的时候、返回 call 的下一行、而不是其他地方
    - 二进制语义中的控制流语义约束就没了
    - 所以需要在二进制代码中、把固定的控制流约束给它嵌入进去、就能控制了

26. 控制流主要有直接跳转和间接跳转

    - 直接跳转：地址是固定的（direct call，jump）
    - 间接跳转：地址是不固定的（return，indirect call，jump）
    - 这里有一个表、显示了大量的运行时的控制流都是间接跳转的（然而在二进制文件中、更多的是直接跳转的代码）然后下面的数据显示、程序跳转到的位置并不是那么地发散
    - has 1 target: 94.7%
    - <= 2 targets: 99.3%
    - > 10 targets: 0.1%
    - 所以能不能在 binary 里面加入程序的控制流的信息、让他不要乱跳

27. 这个上面有一个 CFG 的例子（Control-Flow Graph）

    - 具体是两个地方 call 同一个地方的函数、以及同一个地方 call、两个不同的函数
    - 12345678 是随机数、可以改的、用来比较是否是正确的 control flow，如果不一样、就跳到一个 error label（所以攻击者只能修改 ecx、而不能修改这个硬编码的值 12345678），因为其他地方也会检查
    - 这个硬编码的例子也有问题、因为有些是一些代码是发布的一个库、所以它不兼容（就是 library 里的代码已经是安全的了、但是实际应用程序里的代码可能还没有打 patch、所以就会导致出错）
    - 所以这里有一个工程上的小 trick 加入了一条 prefetchnta 12345678 的指令、它本身是一条可以执行的代码、但是这个 12345678 显然不是一个合法地址、所以它这个 prefetchnta 就偷偷地不执行了、就可以正常地运行没有打 patch 的代码了（可以正常执行那个硬编码的数字）（好处就是兼容性很强）

28. CFI 还是有问题的：Suppose a call from A goes to C, and a call from B goes to either C, or D (when can this happen?)

    - 这个会带来一个问题、就是原来 A 调用 D 是非法的、但是 A 和 D 的 label 是同样的 12345678，就导致了 A 就能调用 D
    - 还有一个问题、就是这个关于 A、B、F 中，return 的标签都是一样的（就是两个地方调用一个地方的问题）（比如说 A 到 F，B 到 F，然后 F 返回的时候、可能会返回到 A 或者 B，这个时候就会有问题）
    - Solution: shadow call stack
    - Maintain another stack, just for return address
    - Intel CET to the rescue (not available yet)
    - Shadow Call Stack 的工作原理
    - 维护一个额外的栈：程序在原始栈之外，维护一个独立的 影子栈，只用于存储函数调用时的返回地址。这个栈与程序的主栈相对独立，专门用来存储每个函数调用的返回地址。
    - 分离保护：这样，如果栈上的数据被恶意修改，攻击者可能无法影响影子栈中的返回地址，因为它们是独立的。即使栈本身的内容发生变化，影子栈中的返回地址仍然可以被验证。
    - 保护验证：当函数返回时，程序不仅要检查主栈上的返回地址，还要检查影子栈上的返回地址。如果两者不一致，程序就会检测到攻击，并可以采取适当的防御措施（例如终止程序或抛出异常）。
    - 优势：防止栈溢出攻击：通过分离和保护返回地址，防止攻击者通过栈溢出修改返回地址。
    - 劣势：提高了内存和性能开销：由于需要维护额外的栈

29. 所以需要做一个优化 CFI: Control Flow Enforcement

    - 一个优化保证就是要就是做到一对一
    - 每个标签都需要是唯一的，但是很难做到（需要复制很多的 call、如果一个 call 的地址有 10 份）
    - 所以目前的选择是目前的 CFI 并不会这么细、目前还是粗粒度的 CFI
    - 这个是微软提供出来的（CFI）

30. CFI: Security Guarantees

    - 防御了 Stack-based buffer overflow, return-to-libc exploits, pointer subterfuge
    - 但是不防御 Does not protect against attacks that do not violate the program's original CFG （就是不防御不违背控制流图的攻击）

31. 后面这个 Possible Execution of Memory 的图就显示了在不同的实现下面、程序会有不同的可能的执行内存地址

    - 首先是加不能执行的栈
    - 然后再加入 RISC、只能跳到对齐的头
    - 然后再加入 CFI、就是只能跳到对应的地址（控制流图加入）

## 28 Control Flow Integrity & Secure Data Flow

1. 上面主要攻击的方式还是 buffer overflow。

2. 防御方式：目标地址前面的随机数要是一样的，不一样就直接退出。加大攻击者的难度，但是不是完全消除危险。（就像加盐、只是增加了攻击者的代价）

3. 还有的方法：就是随机化地址、因为不同机器上的内存偏移不一样、所以就不容易找到对应的地址了。（从工程的角度，提升攻击难度）

4. 讲了一个具体的攻击例子 Blind ROP （defeat ASLR）

5. 它貌似就是通过发送 http 请求的方式、将这个请求变成一个 bash、然后就可以执行一些命令，然后控制这台机器了

6. 这个能够知道的假设：就是攻击者唯一知道机器里有一个 buffer overflow 的 vulnerability(能通过很多种方式知道)，但是不知道这个机器的地址空间是在什么地方、也并不知道它的二进制。

7. 它有可能 Get 一个内容、然后返回一个 404（正常返回），就是找不到。也可能 get 一个可能造成 buffer overflow 的内容，然后会跑飞、就是 connection closed（立刻关掉）。还有一种情况就是不返回任何消息(hang 住了)。（一共三种反馈）

8. 第一种方式是 stack reading，就是通过不断尝试覆盖掉多大的数组大小、当什么时候报错、就能正好找到对应的 return 的地址（正好一个 byte，碰到 return address）然后一直试，直到变到不崩、就找到了正确的 return address 的位置。（可能会试几百次）（为什么有地址随机化、还是一样呢？因为 nginx 里面服务某一个的进程是 fork 出来的、由于父进程和子进程的地址是一样的、所以就不会有地址随机化的问题）（只有父进程 crash 了、才是随机化）（如果不是这样的话、有 100 个子进程但是挂了 1 个、会需要把所有其他的子进程都重新启动，不科学）

9. 怎么找到能够为我所用的代码片段 gadgets 呢？首先需要让服务器把它的二进制传过来。这样就需要先执行 gadgets 运行一些代码，所以很难。

   - stop 就是 hang 住了
   - crash 就是 connection close 了

10. 这里就是讲了尝试跳转到不同的内存地址、然后找 gadget 的一个过程。这里会有三种不同的 gadget，stop gadget（从不 crash），crash gadget（总是 crash）和 useful gadget（会有 return）。

11. 这里有两种 crash 的原因、第一种是 401170 本身就会 crash、还有一种是因为 401170 return 之后、执行了 other 的 gadget、然后导致了 crash、这里可以通过修改 other 的地址、来判断这个 401170 是不是第三类 gadget。（如果修改之后会 hang 或者会直接 crash、就代表这个修改是有效的）

12. 找到了 useful gadget 之后、就要找 write system call。这个 sock 就是传给攻击者的 socket、buf 就是对应要写的地址内容、比如 401170，然后这个 len 也是越长越好。现在就是要让 buffer overflow 的部分地址去跳转到这个函数部分中。这个 rdi、rsi、rdx 就是传参的寄存器，然后再 call。为什么是 pop rdi；ret 呢、因为攻击者是控制了栈上的内容、所以就相当于把栈上的内容 pop 到 rdi 里面去。

13. 在所有的 x86-64 的函数代码中、都会有一段 pop 寄存器的代码、因为这些个寄存器是 callee-saved 的、所以在函数调用的时候、会把这些个寄存器的值保存起来、然后在函数结束的时候、再把这些个寄存器的值 pop 出来。

14. 这个 BROP（Blind rop）gadget 就是通过不断地修改这个栈上的地址、如果中间夹了 6 个 crash 的地址、然后最后修改上面的地址是 crash 或者 stop（hang），就可以确定这个 gadget 是不是把中间六个地址都给 pop 出来了、就可以获取这个 gadget（这个 gadget 可以解决 rsi 和 rdi 的问题）

15. 但是还是不知道怎么解决 pop rdx，因为 rdx 是 caller 的，所以就把这个变成了 call strcmp（因为可以 call write、所以这个 strcmp 就在这个 write 边上，就相差 8byte，因为这个是 libc 的函数）因为在运行 strcmp 的时候、rdx 是一个 strcmp 的参数、所以 rdx 就会被设置成这个 string 的长度，后面穿的这个参数的长度就会变成 rdx（具体是多少、取决于这个 传进去的 string 的指针对应的字符串的长度是多少）（其他修改 rdx 的函数也可以）

16. 最后是要怎么找到 write 的地址。通过 PLT 表、找到动态链接，然后会有 GOT 表、就把 libc 里的 write 的地址给找到了。

17. 对于攻击者、找到一个地址之后、由于是 8byte 对齐的、如果跳 16byte 之后、都是 useful gadget、那就找到了 PLT 表、这个表有规律性、就有很多的 gadget。

18. 另外，大部分的 PLT 项都不会因为传进来的参数的原因 crash，因为它们很多都是系统调用，都会对参数进行检查，如果有错误会返回 EFAULT 而已，并不会造成进程 crash。所以攻击者可以通过下面这个方法找到 PLT：如果攻击者发现好多条连续的 16 个字节对齐的地址都不会造成进程 crash，而且这些地址加 6 得到的地址也不会造成进程 crash，那么很有可能这就是某个 PLT 对应的项了。

19. 有了 PLT 表、怎么找 strcmp 呢？可以设置参数的特征、然后一个个地去尝试、满足这个 crash 表的特征的就可能是 strcmp（控制参数模式）

20. 最后是找 write。通过 socket 能不能收到 server 的信息、来判断是不是 write sys call（如果正好跳到的是 write、就会在收到的消息里面有很多乱七八糟的值）

    - 然后就可以通过 write 的方法、把整个服务器的二进制 write 到 socket 里面

21. 用同样的方法、可以通过 PLT 表找到更多的 gadget、比如说 execve、然后就可以执行 shell 了

22. 最终的次数里、stack reading find PLT 和 find BROP gadget 要的次数最多的。

23. 前面讲的都是 control flow、攻击者劫持执行的一个角度，也不能从根本上解决问题、因为有可能代码本身写的就是错的、所以没法解决这个问题，所以后面讲了 data flow protection（初心是为了要保证安全，比如说数据不要被人偷走）

24. 有两大类追踪数据的方法：方法 1：跟踪数据在程序中的流动。（正向的，保证这个数据不泄露）

25. 方法 2：（反向的）比如机器学习中的数据、要保证这个数据不会被修改（防止恶意数据，数据投毒）（可疑数据需要隔离开来，检测可疑数据的流动，然后可以删掉被污染的模型）

26. 比如说有手机上的 key logger、记录下你的按键的位置。或者通过钓鱼 app、记录下密码。

27. 还有就是直接扫物理内存，比如说某些邮箱软件、在打开之后会把邮件内容和密码直接保存在内存中、所以直接扫一遍内存就能偷到大量的密码。

28. 以及截屏的权限、也是会有能够获取密码的风险。或者低温让手机冻住、然后内存丢失的速度就会慢，就能找到所有的文件了。以及手机的倾斜。

29. Tainting: Data Flow Tracking

30. taint tracking：敏感信息的生命周期一定要最小化。然后会有换页、所以内存里的数据会被不定期地换到硬盘里、而 OS 完全不知道、所以会有泄露的风险。

    - 跟踪来自外部的 input 数据

31. 有三个步骤：初始化、传播、检查。如果前面的不是常量、后续就会传播 taint、如果是变量、taint status 就会不断传播 true。检查就是通过 jmp 的方式或者 send，可以通过程序员去决定。所以 jmp 能不能运行、取决于这个值是不是 taint 的，是动态的。

    - 这个 taint、如果不加检查、会被覆盖、比如打压缩包，就会让 taint 丢失，所以有了下面的详细方法

32. taintDroid：关键是怎么做 propagation。首先，在 java 里面所有应用程序所有的数据、对应一个 taint 传递（内存级别，成本很高，taint 值对应也要操作）然后到了 IPC 这个级别、只要有数据的一个 byte 是被 taint 了、就认为这个数据是 taint 了，然后去跟踪跨应用的数据传递（比如说一个应用有 gps 权限、另一个没有、如果它们之间有 rpc、那么就不安全）然后最后在 untrusted app 的 sink 的时候、如果发现有 taint、那就可以卡住、就能保证安全。

33. 有一个 taint propagation 表。就对应了 taint 传播的规则（就是监测一个是否是外部传进来的函数指针、把对应本来的指针内容给覆盖了）

34. defending malicious input。怎么找 bug

    - 首先决定找什么东西的 bug、比如开源 library
    - 找到攻击攻击模块
    - 然后定位到攻击数据
    - 最后跟踪数据是怎么流的

35. 下面举的例子是 ffmpeg

    - 出 bug 最多的是 parser
    - 越是不常用的格式代码，bug 越多（4xm.c）
    - 它做了一个 unsigned int 赋值到 int 的一个语句
    - 然后在数组 tracks 里面做负数的索引，会导致内存写的问题、然后就可以做任意内存任意写的操作。

36. 能不能通过 taint 来找到这个 bug 呢、可以、因为是一个用户传进来的值。分为 seed、track 和 assert。但是 TaintCheck 方法的问题是性能很差。overhead 非常高

37. 最后这个图讲的就是、如果一个应用是 io intensive 的、而不是 cpu intensive 的、就适合用 taint 方法，否则会造成很多性能损失。

## 29 Privacy & Review

1. 设备和远端的设备通信的时候、就需要进行很多加密了

   - 第一个操作是加密，这个是为了保证数据的机密性、但是不保证数据的完整性
   - 第二个操作是算 MAC，就是不知道这个 key、就算不出对应的 token，可以保证数据的完整性（如果被改了、会对不上）（是一个加密的 hash、可以把 token 和 message 放在一起传播）（就是只有你能够发布这个 message，别人做不了这个事情）

2. 但是上面的 MAC 和加密、并不能防止 replay attack，就是有一个中间人拿到了对应的 c|h、然后重发之后、还是能打开对应的锁（因为密文本身是合法的）所以可以加上一个 sequence number、是不断往上加的、这样就能防止 replay attack（bob 会忽略掉对应的 c|h）

3. 但是就算有了 seq number ，还是可以做 reflection attacks（就是 alice 和 bob 发的消息是对称的，因为不同的几个消息可能 sequence number 是一样的，所以攻击者可以通过反射的方式，把消息发回给 alice、但是正真要发的消息就发不过去了。）

4. 所以就要让消息变得不对称，可以通过两个密钥的方式、比如 alice 用密钥 a 加密、用密钥 b 解密、bob 用密钥 b 加密、用密钥 a 解密。这样就能防止 reflection attacks。（不对称）

5. Diffie-Hellman Key Exchange，就是使用了一个 mod 和次方的数学性质、然后让两端可以用同一个 seed 去做加密，最终得到了一个统一的 key

6. 但是上面的方法还是没法避免 Man-in-the-Middle 的攻击、因为没法验证对方是不是确实要通信的人

7. 所以有了 RSA 的算法，分为了公钥和私钥、这里的场景是 bob 用自己的私钥加密、然后把公钥发给 alice、然后让 alice 用公钥解密、能解出来就代表是 bob 发的消息。还有一个场景是如果不知道 bob 在哪、alice 可以广播一个用 bob 的公钥加密的消息、然后 bob 就能用自己的私钥解密、然后就能知道是 alice 发的消息了。

8. 公钥可以从机构获得，可以知道 bob 的公钥是多少

9. 所以解决方法是、当我访问支付宝的时候、支付宝会把自己的公钥加上域名加上第三方的签名发给我（合起来就是证书）、然后我就能用这个公钥去解密、然后就能知道是支付宝发的消息了。

   - 然后可以把这个公钥加上签名去机构算一下、如果能算出来就代表是真的

10. 如何保证这个机构的公钥是对的呢，是在这个浏览器里自带的，二十几个

11. 量子计算能够直接从证书反推产生这个签名的明文、所以就破坏了 RSA 的安全性

12. privacy 使用技术的手段进行保护

13. OT：Oblivious Transfer

    - 一个例子就是 alice 有两个文件、bob 要获取其中一个文件、但是 alice 不知道 bob 选的是哪个文件
    - 但是不能让 bob 拿到所有两个文件，只能给它一个
    - 这个是通过 OT 协议来实现的

14. 1-out-of-2 OT

    - 就是 bob 只能最后得到两个密钥中的一个，其中解密出来的 k 就是对应的随机数 r（这个 k0 和 k1 之间只有一个数是 r）、只有 bob 知道
    - bob 最后再通过做异或操作的方式、就能得到最后的加密信息

15. differential privacy

    - 一个例子就是 bob 有一个数据库、然后 alice 有一个查询、然后 alice 通过查询这个数据库、就能知道 bob 的信息
    - 但是 bob 不想让 alice 知道自己的每一个条目的信息
    - 可以通过限制 query 的次数、或者让返回值不精确、或者是固定规则、不让它返回对应的单独人的工资条目、所以是有损的。

16. Secret Sharing

    - 比如有 10 个密钥、要同时有 6 个人同时在才能打开这个锁
    - 好处：每个人节省空间（比如说可以只存 70%的数据），然后节省了 communication cost
    - 缺点：communication overhead 会很高

17. Homomorphic Encryption

    - 就是希望搜索 但是不希望看到明文
    - 可以基于密文做索引，就是 google cloud 可以不知道你的搜索内容，但是可以给搜索做索引

18. SWHE: SomeWhat Homomorphic Encryption

    - 有一个同态加和同态乘的操作
    - 就是密文相加和相乘 解密之后就是对应的明文相加和相乘

19. Trusted Execution Environment (TEE)

    - 云服务上的加密内存、加密虚拟机的服务
    - 内存是密文、可以从内存到 cache 的时候解密
    - cache 里面是明文
    - 信任方变成了处理器厂商
    - 特点 1：Isolated execution 运行时隔离、保证获取不到对应的内存数据
    - 特点 2：Remote attestation 远程验证

20. Process of fixing a bug/vulnerability

21. Phase-1: finding a bug

    - Survey whether the bug has been found
    - Simply the process of re-producing bug 复现
    - Evaluate the seriousness, if belongs to security, offer an exploit
    - Provide a patch if you have one.

22. Phase-2: Report

    - Not security bug：kernel mailing list, bugzilla
    - Security bug：security@kernel.org

23. Phase-3: handle the bug

    - Related developers and maintainers join the discussion
    - Patch proposing and discussion
    - Test and patch review

24. Phase-3.5：Embargo Period （可选）

    - discuss with maintainers of distributions, prepare to fix
    - Why not just fix it?
    - Submit a patch in public mailing list means public
    - Prevent distributions not fix the bugs in time
    - Decide whether embargo period is needed: evaluate

25. Phase-4: Public

    - Merge to mainstream
    - Backport to related stable versions
    - Publish to public mailing list, security group
    - E.g., oss-security@lists.openwall.com
    - Update CVE status to public

## 30 Review

1. ROP 的本质：控制流劫持、以预期的方式去执行代码片段

2. canary 可以通过 BROP 被干掉、就是一点一点读出来

3. 这个 taint 也可以通过一些方法把 taint 洗掉、比如用 if else 来判断（a==1 时、b=1，a==2 时，b=2）、然后就可以把 taint 的值给覆盖掉

4. 曼彻斯特编码、为了防止这个连续的 1 和 0 出现、导致读不到时钟信号的变化、因此加入了变化

5. dns 能够 scale 的本质、去中心化的管理、找到最近的服务器节点去加就可以了

6. raft 解决了 replicated state machine 的问题

   - 大部分时间 leader 在发 rpc、follower 在接 rpc
   - 每一个任期内只能有一个 leader
   - term 号最高的作为 leader
   - heartbeat 不能随便设、不然选不出来、一直重试
   - 超过 majority 的节点认为成功了、就 commit（leader 先）
   - 维护的是前缀的 consistency，那么如果一个 entry 是一样的、那么前面都是一样的
   - 为了实现 prefix consistency，appendEntries 会检查前一个 entry 是不是一样的，如果不一样，就会返回失败
   - 如果 commit 了、可以 overwrite
   - 额外的机制，哪些 entry 是 commited 了
   - 还有一个是一个 entry 不会被 overwrite 掉
   - 只有当前最新的机器才有资格做一个 leader（看 term 是否是更大的、如果一样、那就看 log 是否是最长的）
   - snapshot 也要复习一下

7. master 的 failure 会比较罕见
