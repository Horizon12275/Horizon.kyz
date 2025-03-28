---
type: "post"
title: "《区块链技术与应用》公开课笔记"
author: "horizon"
category: "Tech"
date: "2025-03-19"
slug: "/Tech_14"
postImage: "./img/Tech_14.jpg"
metaDescription: "记录了《区块链技术与应用》公开课的笔记。包含密码学原理、数据结构、比特币中的共识协议、比特币系统的具体实现等内容。"
---

## 02 密码学原理

0. 比特币用到了密码学的哪些原理？哈希和签名

1. collision resistance:没有什么高效的方法、去找到两个哈希值相同的输入

   - 用途：监测文件是否被篡改
   - MD5：可以人为制造碰撞，不安全了

1. hiding: 哈希函数的计算过程是单向的，不可逆的

   - 哈希值没有泄露有关输入的任何信息
   - 成立前提：输入的空间要足够大，同时取值要均匀

1. digital commitment: 将 collision resistance 和 hiding 结合起来

   - 用途：数字签名
   - 即是：预测结果不能提前公开（sealed envelope，将预测结果交给第三方保存），可以将哈希值公布出去，等到结果公布时，再公布输入

1. 实践时候：X||nonce，nonce 是随机数，X 是输入，这样保证了足够随机

1. puzzle friendly：哈希值的计算是事先不可预测的

   - 就是不能够知道哪些输入会产生前缀为固定的哈希值，比如预测前缀为 00000 的哈希值，不能提前知道哪些输入会产生这样的哈希值
   - 应用：挖矿的过程没有捷径、所以挖矿的币可以作为工作量证明
   - 但是验证挖矿的结果是很容易的，只需要验证哈希值是否满足条件即可（difficult to find, easy to verify）

1. SHA-256：比特币中使用的哈希函数（Secure Hash Algorithm 256 bits）

1. 哈希讲完了、下面讲签名

1. 首先讲比特币的账户管理

   - 开户的时候，会生成一对公私钥，公钥是地址，私钥是签名（很简单、是去中心化的）
   - 是非对称的加密（asymmetric cryptography），公钥加密私钥解密（用的是同一个人的公钥加密和私钥解密，接收方的）
   - 公钥公开、私钥保存在本地就可以了

1. 别人怎么知道这个发起交易的人的真实性呢、就是发起交易的时候、用私钥加密、然后其他人用公钥解密（也是同一个人的）

1. 生成公私钥的过程需要有好的随机源，否则会有安全隐患

1. 一般是对 message 取一个 hash、然后再对这个 hash 进行签名

## 03 数据结构

1. 哈希指针 hash pointers

   - 除了保存了数据的地址，还保存了数据的哈希值

2. 区块链和普通链表的区别

   - 用哈希指针代替了普通链表的指针
   - 第一个区块叫做 genesis block，最近的区块叫做 most recent block
   - 每个后继的区块都保存了指向前驱区块的哈希指针

3. 区块链的结构能够实现 tamper-evident log

   - 任何一个区块的数据被篡改，那么这个区块的哈希值就会发生变化，那么这个区块的哈希指针就会发生变化，那么这个区块的后继区块的哈希指针也会发生变化，以此类推，整个区块链的哈希指针都会发生变化
   - 所以我只要保存了最后一个区块的哈希值，就可以验证整个区块链的完整性（即验证这个区块链是否发生变化）
   - 怎么知道别人给你的区块是不是正确的、只需要算一下哈希值就可以了

4. merkle tree 和 binary tree 的区别

   - 用哈希指针代替了普通树的指针
   - 最下面的一层是数据块（data blocks）
   - 中间的几层都是 hash pointers
   - 根节点也可以再取一个 hash（root hash）
   - 用途：只需要保存 root hash、就可以监测出树中的任何位置的数据是否被篡改（因为若修改了、hash 会从数据块一层层向上传递到根节点）

5. data blocks 每一个其实相当于一个交易 transaction（tx）

   - 每一个 block 可以分为
   - block header：包含了前一个区块的哈希值、merkle root
   - block body：包含了多个交易（交易的列表）

6. merkle tree 的一个用途就是提供 merkle proof

7. 节点一共有 2 类：

   - full node（全节点）：保存了 block headers 和 block bodies（有交易的具体信息）
   - light node（轻节点）：只保存了 block headers

8. 怎么给一个 light node 提供 merkle proof

   - proof 的本质：找到交易所在的位置，然后提供一条从这个位置到根节点的路径
   - （这个路径上的哈希值都是已知的，所以 light node 可以验证这个路径上的哈希值是否正确，从而验证这个交易是否在这个区块中）（这个就是 merkle proof）
   - 具体流程：给一个全节点发送一个请求，请求这个交易所在的位置，然后全节点返回这个路径给 light node（路径上的哈希值计算：每个全节点保存了 2 个哈希值（即左子树的哈希值和右子树的哈希值），路径上会涉及到向全节点请求的哈希值（红色），以及 SPV 本地计算的哈希值（绿色），每一层、通过当前层自己计算的哈希值结合请求来的哈希值在一起、就可以计算出父节点的哈希值、一直到根节点。（一开始的交易哈希值、是通过交易节点在本地计算的）
   - 注意：只能查交易路径上的哈希值、旁边分支的哈希值是不能查的
   - 原理：因为树里的任意一个位置的哈希值更改之后、都会影响到根哈希值
   - 这种交易也叫做 proof of inclusion（membership）

9. 如何高效地证明 proof of non-membership?

   - 如果对叶节点的顺序不做一些假设、那么就没有很好的方法
   - 如果有顺序的话、可以用 binary search（log(n)，但是代价就是要排序）（方法：证明和其兄弟的数据节点能验证这个 root hash 的值）（sorted merkle tree）（比特币中没有用到、因为没有这个需求）

10. 只要这个数据结构是无环的、都可以用哈希指针来代替（有环就不可以，因为会有循环依赖的问题）

## 04 比特币中的共识协议

1. 不能直接地像现实世界中的一样、通过中心化的方式去发行货币、否则会有 double spending attack 的问题（就是可以复制这个发行的货币）（也可以通过央行维护一个数据库去解决，但是这个方案太麻烦了、是个中心化的方案，每一次交易都需要通过央行进行监管）

2. 两个问题：

   - 如何发行货币
   - 如何证明交易的有效性

3. 比特币的解决方案（证明交易的有效性）：

   - 通过所有用户来维护
   - 例子：铸币交易<--花费交易
   - 每个交易都包含输入和输出两部分，输入部分要说明币的来源（签名者，以及多层级的哈希指针、比如指向前面某个交易的哈希指针，证明这个币不是凭空捏造的、而且要避免 double spending，可以通过哈希指针的方式去判断是否合法）。输出部分要给出收款人公钥的哈希

4. Block header

   - 包含了区块中的宏观的信息（比如哪个协议） version
   - 区块链中指向前一个区块的哈希指针（取哈希的时候是把所有的 block header 都取哈希就足够了）
   - 整棵 merkle tree 的根哈希值 root hash
   - 挖矿的难度目标阈值（target）
   - 随机数 nonce

5. Block body

   - 交易列表 transaction list

6. 系统中的节点分为全节点和轻节点

   - 全节点：保存了所有的区块链数据（验证每一个交易的有效性）（也叫 fully validating node）
   - 轻节点：只保存了区块链的头部信息（没有办法独立验证交易的有效性）（系统中的大部分节点都是轻节点）（没有参与区块链的构造与维护）

7. 账本的内容要取得分布式的共识（distributed consensus）

   - 例子：分布式哈希表（distributed hash table）

8. FLP impossibility theorem：在异步系统中、有一个节点失效、就不能保证达成共识

9. CAP theorem：在分布式系统中、不能同时满足一致性（consistency）、可用性（availability）、分区容忍性（partition tolerance）

10. Paxos：一个分布式共识算法（CSE 讲过）（但是与比特币的实际应用关系不大）

11. 比特币中的共识协议（Consensus in BitCoin）

    - 假定系统中的大多数节点都是好的，有一小部分节点是恶意的
    - membership：投票权的问题

12. sybil attack（女巫攻击）：恶意节点可以通过伪造身份来获得更多的投票权（所以简单投票是不行的，因为谁都能创造账户）

13. 所以比特币是基于算力进行投票的

    - 需要验证 H(block header) <= target

14. 这里会有一个问题、就是如果在同一个节点上插入两个区块、那么就会有分叉的问题

    - 为了解决这个问题、需要选择最长且合法的链（longest valid chain）
    - 例子：比如说想要通过插入一个自我转账的区块（用于回滚交易），虽然这个区块在一开始检查的时候是合法的，但是不在最长的链上，所以是无效的（因为验证区块有效性的时候、只会去证明在这个分支链上的交易是否有效）（这个就是 forking attack）

15. 如果有两个节点同时或者在差不多的时间找到一个 nonce、那么也会有分叉的问题

    - 这时候会同时产生两个节点
    - 解决方法：各个节点接受第一个收到的区块（接受：即往下扩展一个区块）（相当于各拉一帮人，然后看谁先找到下一个，通过算力竞争或者运气先算到）
    - 所以会维持一段时间，直到最后有一个节点找到下一个区块，然后就会胜出，失败的就叫做 orphaned block

16. 为什么要消耗很多资源去获得记账权：有记账权节点有一定权力、可以决定哪些节点能写到下一个区块里

    - 但是初衷是应该所有合法的交易都应该被写到区块链上，不应该让这个成为争夺记账权的主要动力
    - 解决方法：出块奖励（block reward）获得记账权的节点、在发布的区块里可以有一个特殊的交易，即铸币交易（coinbase transaction）在这个交易里，可以发布一定数量的比特币（比特币系统中发布比特币的唯一途径，其他所有交易都是转账交易）
    - 最开始是 50 个比特币、每 210000 个区块减半

17. hash rate：得到记账权的节点的算力

18. 因此避免了 sybil attack ，创建账户并不会使得你有更多的记账权

19. 比特币争夺记账权的过程就是挖矿（mining），争夺记账权的节点叫做矿工（miner）

## 05 比特币系统的具体实现

0. ledger：账本

1. 系统上没有显式地记录账户余额，只有交易记录（需要通过交易记录来计算余额）

1. transaction-based ledger：比特币的全节点需要维护一个 UTXO（unspent transaction output）集合

   - 就是所有未被花费的交易输出
   - 注意：一个交易可能会有多个输出，但是只有被花费的输出才会从 UTXO 集合中删除（所以同一个交易中、有些币在 UTXO 集合中、有些币不在）
   - 需要给出产生这个输出的交易的哈希值和它在这个交易里是第几个输出（output index），就可以定位到 UTXO 中的输出
   - UTXO 的作用：为了监测 double spending（因为只有 UTXO 集合中的币才是有效的，所以只要检查这个交易的输入是否在 UTXO 集合中就可以了）
   - 全节点需要在内存中维护这个 UTXO 集合，以便快速验证交易的有效性
   - 交易会产生新的 UTXO，也会消耗掉一些 UTXO 的内容（如果不交易、就会永久留在 UTXO 集合中，但是足够存在一个服务器的内存中的）
   - 每个服务器 total inputs = total outputs
   - 同时，有记账权的节点还能获取手续费（防止只处理自己的交易）
   - 这种的隐私保护性比较好（所以在交易的时候需要说明币的来源，有额外的代价）

1. 还有 account-based ledger：以太坊（系统中需要显式地记录账户余额）

1. block 解读

   - difficulty：每隔 210000 个区块、会调整一次难度目标（difficulty target），保证出块时间是 10 分钟左右
   - nonce：随机数，这里显示的是挖矿时找到的随机数
   - hash：区块头的哈希值（只包括块头）（符合难度要求的 hash，它的块头都包含一长串的 0）
   - merkle root：这个区块中构成的交易的根的哈希值
   - 为了找到满足要求的哈希值、需要不断地尝试不同的 nonce（挖矿的过程）
   - 但是只改变 nonce 还是不够的，所以可以更改根哈希值（time 也可以在小范围内更改）

1. 更改根哈希值的方法：

   - 通过 CoinBase 里的交易，可以在交易中加入一些额外的信息，这个信息不会影响交易的有效性，但是会影响到根哈希值（什么都可以写）
   - 最后是有两层循环的、搜索空间是 2^96，通过 nounce+coinbase 里的 extra nounce

1. Transaction 解读

   - 交易是通过脚本的形式去实现的，即把 Input Scripts 和 Output Scripts 放在一起，然后执行这个脚本，如果能够配对成功、那么这个交易就是有效的
   - 注意：不是同一个交易里的输入脚本和输出脚本配对，是当前的输入脚本和前一个节点的输出脚本进行配对（要能够顺利执行），当前的输出脚本和下一个节点的输入脚本进行配对

1. 挖矿的分析：

   - 就是不断地尝试不同的 nonce，直到找到一个满足要求的哈希值
   - 每次尝试 nonce 可以看作是一个 Bernoulli trial（a random experiment with binary possible outcomes）
   - 多次尝试，构成了一个 Bernoulli process（a sequence of independent Bernoulli trials）
   - Bernoulli process 的特点：无记忆性（memoryless），即每次尝试的结果都是独立的，不受之前的影响
   - 挖矿的场景下、可以用泊松过程（Poisson process）来模拟这个过程
   - 因此，出块时间是服从指数分布的（exponential distribution）
   - 所以是 progress free 的，不会因为之前做的工作越多、而对之后的工作有影响（否则算力强的矿工会有不成比例的优势，就是 10：1 的算力，可能会超过 10 倍的几率）（挖矿公平性的保证）
   - 由于这个挖矿的公式，系统中总共的总量是有限的，是 2100 0000 个比特币
   - 比特币的难度是人为地减少的、而不是为了解决什么数学问题，本身是没有什么实际意义的、但是挖矿的过程是对比特币的系统和机制的维护是至关重要的（Bitcoin is secured by mining）即这个过程是为了保证大部分的节点都是好的、都在诚实的人手中

1. 但是这种方案也不能保证这个记账权全部都不在恶意节点上

   - 所以最后相当于是，只需要诚实的节点都认这个交易（即沿着合法的区块往后挖，因为要扩展最长合法链）、如果这个交易只在恶意的节点上被认可、也是没有用的
   - 同时，对攻击者来说、这种新加入非法交易的区块是不会被认可的、攻击者还会因此丢掉这些比特币

1. 预防 fork attack：

   - 挖矿之前就需要指定前一个区块、然后最后的 hash 就是这个区块的 hash
   - 一种简单的方法就是多等几个确认（confirmation）（比如默认的是等 6 个区块确认，才认为前面那个交易是不可篡改的）
   - 这种不可篡改性也是一种概率的保证

1. 还有一个 zero confirmation，就是不用等到这个交易写到区块链上，就可以认为这个交易是有效的。（因为这个接受是按照时间上的最先接受的为准的，而且比特币系统以外、如果商家发现这个币是转到了无效的区块上、就可以不发货）

1. 如何反制这个区块不接受交易写入呢：通过手续费的逻辑，会总归写到一个后续的诚实的节点中去

1. selfish mining：正常是挖到一个区块、就发布了、但是有一种攻击方式、就是挖到一个区块、但是不发布、等到挖了多个区块时、然后就可以做 forking attack 了（但是这么做有一个前提、就是有恶意的节点要占用很大一部分的算力）

   - 还有一种 selfish mining 的得利：就是可以让别人沿着原来的区块继续挖、然后可以让挖得慢的人都白挖了（但是需要风险、而且需要很大的算力，但是回报也不是很高）

## 06 比特币网络的工作原理

1. The BitCoin Network:

   - 应用层（application layer）：比特币协议（Bitcoin protocol）
   - 网络层（network layer）：P2P Overlay Network（所有节点都是平等的）（有的 P2P 有 super node 或者是 master node，但是比特币没有）
     - 如果要加入这个网络、需要至少知道有一个种子节点（seed node），通过 tcp 连接、有利于穿透防火墙
     - 离开的时候直接退出就可以了、别的节点听不到你的消息、会自动从节点列表中删除

2. 比特币网络的设计原则：

   - 简单、鲁棒、而不是高效
   - 消息传播在网络中采用 flooding 的方式（即一个节点收到消息之后、会广播给所有的节点），下一次收到相同的消息时、就不会再转发了
   - 邻居节点的设定是随机的、没有拓扑结构的、就是不按照地理位置组合。这样可以增强系统的鲁棒性，因此给你身边的人转账和给远处的人转账是一样的）
   - 等待写入区块链的交易会写入一个集合中、下一次听到这个交易的时候就不转发了、避免了无限转发

3. race condition

   - 有 A->B 和 A->C 两个交易、但是用了相同的币，只能有一个能够写入区块链
   - 如果一个节点听到了 A->B 或者 A->C 已经被写入其他的区块链了，那么就会把这个交易从集合中删除

4. 比特币网络的特性：

   - 区块的传播和交易是类似的
   - 越大的区块在网络中传播的时间越慢（限制是 1MB，因为带宽是瓶颈）
   - 是 best effort 的：不保证消息一定能够传播到所有的节点，顺序也不一定是一样的（而且有些节点可能不转发，就是去中心化的网络中会遇到的问题）
   - 无法支持中心化的投诉
   - 回滚的解决方法：通过两个不同的交易，而不是数据层面的回滚（就是转账和退款的两个交易）

## 07 挖矿难度

1. H(block header) <= target

   - target 越小、挖矿难度越大
   - 调整挖矿难度就是调整整个挖矿空间在输出空间中的比例
   - 使用 SHA-256 哈希函数（整个输出空间是 2^256）
   - 调整：就是要求算出来的哈希 H 前面的 0 的个数越多、难度越大
   - 挖矿难度（difficulty）和 target 是反比的关系
   - difficulty = difficulty_1_target / target（difficulty_1_target 指的是挖矿难度为 1 的时候的目标阈值 target，难度最小就是 1）

2. 调整挖矿难度的原因：因为比特币的算力是在不断增加的，所以需要调整难度，保证出块时间是 10 分钟

   - 如果出块时间太短： 因为区块在网络上传播就至少需要几十秒、如果在几秒钟同时出了多个区块、就会有分叉的问题（而且不止是二分叉，可能是多分叉）
   - 分叉如果过多的话、对系统的安全性是有影响的（分叉攻击，降低了分叉攻击所需要的算力百分比），对达成共识也是有影响的
   - 也不是一定要 10 分钟出块时间，只不过需要一个常数范围内的时间（比如 10 分钟左右）
   - 以太坊的出块速度就很快，是 15 秒一个区块（不过也需要调整难度以保持稳定）

3. 具体怎么调整挖矿难度：

   - 每 2016 个区块调整一次（大概是 2 周）（2016\*10/60/24 = 14 天）
   - 调整公式：target = target \* (actual time / expected time)（actual time 是实际的时间，就是系统中最近产生 2016 个区块实际经过的区间，expected time 是预期的时间，就是 2016\*10min = 2 周）（会实际提高或降低 target，以保证实际的出块时间和预期的出块时间一致，最高最低这个倍数有 4 倍的限制）
   - 如果恶意的区块不调整难度的话、那么诚实的矿工不会认这个区块节点（无法通过区块的合法性）

4. 比特币是没有法币背书的，而且选择的参数也是比较保守的，也是经验公式

5. 比特币系统中的实际情况

   - 总算力指数增长（体现在 hash rate 和时间的关系上）
   - 挖矿难度和总算力是正相关的（因为挖矿难度是根据总算力来调整的，使得出块时间是稳定的）
   - 如果挖矿难度 difficulty 是不断减少的、那么这个币一般来说就要很快不行了
   - 每天的出块时间都是稳定的、维持在 10 分钟左右
   - 挖矿难度和目标阈值是反比的关系（公式可能会混淆）

## 08 比特币挖矿

1. 全节点

   - 一直在线
   - 在本地硬盘上维护完整的区块链信息
   - 在内存里维护 UTXO 集合，以便快速检验交易的正确性
   - 监听比特币网络上的交易信息，验证每个交易的合法性
   - 决定哪些交易会被打包到区块里
   - 监听别的矿工挖出来的区块，验证其合法性
   - 挖矿
     - 决定沿着哪条链挖下去？
     - 当出现等长的分叉的时候，选择哪一个分叉？

2. 轻节点

   - 不是一直在线
   - 不用保存整个区块链，只要保存每个区块的块头
   - 不用保存全部交易，只保存与自己相关的交易
   - 无法检验大多数交易的合法性，只能检验与自己相关的那些交易的合法性
   - 无法检测网上发布的区块的正确性
   - 可以验证挖矿的难度
   - 只能检测哪个是最长链，不知道哪个是最长合法链
   - 即如果只需要转账、不需要挖矿的话、可以用轻节点

3. 挖矿的设备

   - 大部分内存和 cpu 中的设置都是闲置的、所以利用率太低，所以用 gpu（还是有点浪费了，因为是专门为了通用并行计算设计的）
   - 所以现在基本用 asic 芯片（专门为了挖矿设计的芯片）（Application Specific Integrated Circuit）（没有多余的电路逻辑，只有挖矿的逻辑，所以效率很高）
   - 而且有专门的为了设计固定种类币的芯片
   - mining puzzle：挖矿的过程就是解决这个谜题的过程
   - merge mining：新发布的币的规则是和比特币一样的
   - alternative mining puzzle：抗 asic 的挖矿算法，为了让通用的计算机也能参与挖矿

4. 挖矿的趋势：

   - 大型矿池的出现：把矿工组织起来、形成一个整体
   - pool manager：负责全节点的其他职责
   - miner：负责挖矿，计算哈希值（因为是 asic 芯片）
   - 分配奖励：用工作量证明的方式来分配奖励（按照算力来分配奖励）
   - 所以分配可以基于降低难度的方法：share，almost valid block（提交给矿主，证明矿工的工作量，矿主只需要记录挖到了多少个 share 进行分配就可以了）
   - 有没有可能矿工自己发布区块：没用，因为矿主的区块的收款人是矿主自己，所以矿工发布的区块是没有用的。而且如果修改了收款人、那么这个区块的哈希值就会发生变化，矿主就不认这个 share 的工作量证明
   - 但是可以捣乱和破坏竞争对手，比如挖到了不发布
   - 有一个矿池分布的统计
   - 矿池给矿工减轻了负担
   - on demand mining：可能把算力分布在不同的矿池中、然后发动攻击的时候再集中

5. Boycott：封锁禁域，就是要让某个用户的交易一上链的时候、就马上分叉

## 09 比特币脚本

1. 比特币的交易脚本：基于栈的语言，只能访问栈空间

2. vin 和 vout

   - vin：输入，包含了交易的来源
   - vout：输出，包含了交易的去向

3. confirmations：交易的确认信息次数

4. vin

```json
"vin": [{
       "txid": "a3e2b1f3f7e0e4e8f2c3e1",//之前交易的哈希值
       "vout": 0,//之前交易的第几个输出
       "scriptSig":{ //输入脚本，给出一个前面signature，可能会有多个签名、说明多个来源
           "asm": "3045022100...",
           "hex": "483045022100..."
       },
}],
```

5. vout

```json
"vout": [{
       "value": 0.01,//输出的金额
       "n": 0,//输出的编号
       "scriptPubKey":{ //输出脚本，最简单的形式是给出一个公钥哈希
           "asm": "OP_DUP OP_HASH160 404371705fa9bd789a2fcd52d2c580b65d35549d OP_EQUALVERIFY OP_CHECKSIG",
           "hex": "76a914404371705fa9bd789a2fcd52d2c580b65d35549d88ac",
           "reqSigs": 1,
           "type": "pubkeyhash",
           "addresses": [
               "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
           ]
       }
}],
```

6. P2PK：pay to public key

   - 交易的输出脚本是一个公钥
   - 交易的输入脚本是一个签名
   - 实际脚本为了安全、是分段执行的

```
PUSHDATA(Sig) //压栈签名
PUSHDATA(PubKey) //压栈公钥
OP_CHECKSIG //检查签名，弹栈
```

7. P2PKH：pay to public key hash

   - 交易的输出脚本是一个公钥哈希
   - 交易的输入脚本是一个签名和一个公钥

```
PUSHDATA(Sig) //压栈签名
PUSHDATA(PubKey) //压栈公钥
DUP //复制栈顶元素，栈顶又多了一个公钥
HASH160 //计算栈顶元素的哈希值
PUSHDATA(PubKeyHash) //压栈公钥哈希
EQUALVERIFY //比较两个栈顶元素是否相等，不相等就停止执行
CHECKSIG //检查签名，弹栈
```

8. P2SH：pay to script hash

   - 交易的输出脚本是一个脚本哈希
   - 交易的输入脚本是一个脚本
   - 实际是为了支持多重签名实现的（为私钥的泄露提供保护、为私钥的丢失提供了冗余）

```
// 第一阶段
PUSHDATA(Sig) //压栈签名
PUSHDATA(Script) //压栈脚本（redeem script）
HASH160 //计算栈顶元素的哈希值
PUSHDATA(ScriptHash) //压栈脚本哈希
EQUALVERIFY //比较两个栈顶元素是否相等，不相等就停止执行
// 第二阶段
PUSHDATA(Pubkey) //压栈公钥
CHECKSIG //检查签名，弹栈
```

9. 多重签名

   - 最初实现上有一个 bug、会多压入一个元素
   - 一开始、实际使用币购物的时候会不太方便、比如需要标出是 3of5 或者是 2of3，复杂性就交给了用户了。
   - 然后用 P2SH 来实现多重签名，就可以电商公布脚本的哈希值就可以了（就相当于了一种封装）

10. Proof of Burn

    - 为了证明自己有权利、可以烧掉一些币，然后就可以获得一些权利（比如要修改某个区块的内容）
    - 或者有一些小的币种，要求烧掉一些比特币，然后就可以获得这个币种（AltCoin）
    - 或者作 digital commitment
    - 如果 output 是 0，那么全节点就不需要维护到 UTXO 中

11. 这种语言就叫做比特币脚本语言（Bitcoin Script），甚至不支持循环、就不用担心死循环的问题

## 10 分叉

1. state fork：由于挖矿出块的不同导致的分叉

2. forking attack（deliberate fork）

3. protocal fork：由于协议的不同导致的分叉（不同意或者还没更新不同的版本）

4. hard fork：对比特币协议添加一些新的特性、没升级的节点会认为这个区块是无效的，就会导致分叉（例子：比特币中的区块大小限制，因为小的区块大小、会限制交易的 through put、而且会增加交易的延迟（因为会推迟到后续的节点））

   - 这个分叉是永久性的、只要旧节点不更新软件、就会一直存在分叉
   - 区块的大小也不是越大越好，因为采取 flooding 的方法、带宽是瓶颈
   - 会形成社区分裂（比如 ETH 和 ETC），账户余额也是分开的
   - 这个 fork 原来会有一个问题、就是一条链上的交易可以在另一条链上回放、通过 chain id 的方式解决了这个问题

5. soft fork：对比特币协议加了一些限制、原来的一些区块、在新链上不是合法的了，就会产生分叉

   - 比如说把一个节点的区块大小限制为 500KB，而原来的区块大小是 1MB，那么这个旧节点挖出的区块会认为小的那个长的区块链是合法的、但是系统不会有永久性的分叉（所以叫软分叉）

6. 著名的软分叉例子：P2SH

## 11 问答

1. 转账交易的时候、如果接收者不在线会怎么办？

   - 不需要接收者在线，只需要在区块链上记录就可以了

2. 收款地址，有没有可能是这个发送者从来没听说过的？

   - 有可能，因为比特币的地址只有在交易的时候才会被其他人知道，创建的时候、链上的人是不知道的

3. 私钥丢失了怎么办？

   - 没有办法了，因为没有中心化的机构可以找回（账户上的钱变成了死钱，因为没有重置密码）
   - 比特币存在交易所里、那么就可以找回联系交易所
   - 但是这些交易所缺乏监管，可能会被黑
   - 最著名的例子是 Mt.Gox（不是个例，卷款跑路也是有可能的）

4. 私钥泄露了怎么办？

   - 转到另一个安全的账户里去
   - 没有办法冻结账户，因为没有中心化的机构可以冻结账户（公私钥生成之后是无法改动的）

5. 转账的时候写错了地址怎么办？

   - 没有办法了，因为没有办法取消一个已经发布了的交易（没有提供撤销交易的机制）

6. OP_RETURN 为什么能够被写到区块链里？

   - OP_RETURN 是永久返回错误的
   - 但是因为他是在输出脚本里的，而不是在输入脚本里的，所以不会影响到交易的合法性检查

7. 会不会有某个矿工偷答案，怎么知道是哪个矿工最先找到这个 nounce？

   - 因为 head 里面有一个 coinbase tx 里的收款人的地址、如果改变的话、会导致 hash 值的改变、原来的 nounce 就作废了

8. 怎么知道哪些交易费应该给哪个矿工？

   - 事先不需要知道（总输入减去总输出就是手续费），差额就可以给这个矿工

9. 变化和发展趋势

   - Blockchain size 在不断增大
   - UTXO 集合是在不断增大的（也有历史原因、比如有些账户私钥丢失了
   - 矿池的百分比
   - 交易量的增长，波动非常大（也是由于价格导致的）
   - 交易数目的增长
   - 每个区块的交易数量的增长

## 12 匿名性

1. 跟现金相比，比特币的匿名性是有限的。但是和银行账户相比，比特币的匿名性是更好的。（因为实名，如果银行是匿名的，那么比特币还是没有银行好、因为比特币的账本是公开的，而且是不可篡改的）

2. 即使每次交易都换一个地址，也是可以把很多个地址联系在一起的、所以匿名性也会被破坏

   - 比如说有多个输入、可能是同一个人的（为了找零）
   - 输出地址中也会有一个找零的地址（但是可以通过账本来分析出来）
   - 如果要更强的隐私保护、可以多生成几个不必要的输出地址（但是现在常用的都基本是几个钱包、因此只要分析这几个生成策略就可以了）

3. 同时、这个比特币账户可以同现实世界中的操作联系起来（即当实体世界中发生联系的时候，就会泄露）

   - 即在资金转入和转出区块链的时候就会发生泄露（除非场外交易，即线下交易、但其实也会泄露身份）
   - 为了反洗钱：就是盯紧这个转入和转出资金的过程
   - 以及、比特币支付的时候（但是是 bad idea，因为延迟很大、而且交易费很大，而且会隐私泄露）
   - 而且交易账户之间都是有联系的，所以也是可以追踪个人的其他账户的
   - 即是是信用卡支付、也是有可能被追踪的（时空过滤的研究例子）
   - 所以比特币的匿名性没有那么好

4. 比特币的匿名性谁保持的最好？中本聪，因为没有和现实银行的往来

5. 怎么增强比特币使用的匿名性？

   - 首先在网络层的匿名性、比如使用不同的 ip、或者多路径转发（TOR 洋葱路由）、比如中间要经过很多跳
   - 应用层怎么保证匿名性呢？把币混在一起：coin mixing（但是没有什么信誉比较高的 coin mixing 机构）

6. 零知识证明：一方向另一方证明某个陈述时正确的、而不泄露除了陈述是正确的外的任何其他信息

   - 数学基础：同态隐藏
     - 如果 x,y 不同、那么算出来的加密函数值 E(x)和 E(y)也是不同的
     - 给定 E(x)的值、很难算出 x 的值（不可逆的）
     - 给定 E(x) 和 E(y) 的值、可以算出 E(x+y) 的值（同态加）
     - 给定 E(x) 的值、可以算出 E(k\*x) 的值（同态乘）
     - 扩展到多项式
   - 这里的例子是 CSE 中举过的例子

7. 还有一个盲签的例子（银行签名）

   - 一个盲签的例子：盲签就是签名的时候、签名者不知道签名的内容是什么
   - 目的：银行不知道这个币是哪来的、银行无法把 A 和 B 联系起来

8. 零币和零钞

   - 零币：存在基础币和零币，通过基础币和零币的转换、消除旧地址和新地址的关联性，类似于混币
   - 零钞：使用 zk-SNARKs，即零知识证明，证明自己有一定数量的币，但是不泄露具体的数量
   - 但是也不是很主流，因为为了匿名性付出了性能的代价，而且可能需要强匿名性的用户也不是很多
   - 而且也不是百分百安全，就是和现实世界转账的时候、与实体发生交互的时候、会留下痕迹、暴露身份

## 13 思考

1. 指针中的地址只在本地中有意义、那么在实际中怎么做到呢？

   - 其实实际上只有哈希、没有指针
   - 全节点一般把这些区块存在一个 key-value 数据库里（比如 levelDB）

2. 区块恋

   - 如果丢失了、那么就取不出来了
   - 而且截断私钥会降低安全性，因为原来是是 256 位的，剩下的可以暴力破解
   - 所以对于多个人的共享账户、不要用截断私钥的方法、应该用多重签名的方法 MULTISIG（每个私钥都是独立产生的）
   - 而且如果不取出来、这个币就会永久保存在 UTXO 里面、对矿工是不友好的

3. 分布式共识

   - 为什么比特币系统没法绕开分布式系统中的不可能结论？
   - 因为并没有达到真正意义上的共识，可能会有分叉之类的
   - 异步的宕机是不可能理论上解决的、但是例子给出了、可以给一个值班人员打一个电话（就不是理论上的异步模型了），进一步解决：就是再给一个服务器连一根电话线（因为电话线不会拥堵）

4. 比特币的稀缺性

   - 但是总量恒定的货币不太适合作为货币的
   - 但是一个好的货币是需要有通货膨胀的功能的（即使黄金都是新挖出来的，但是黄金增长的速度没有货币增长的速度快）（类似于房地产）

5. 量子计算

   - 首先会冲击传统金融业

## 14 以太坊概述

1. 以太坊对比特币的实际使用中的问题进行了改进（比如出块时间）

2. 还改进了 mining puzzle

   - 比特币是计算密集型（导致了硬件的专业化）
   - 以太坊是内存密集型（memory hard）（实现了 ASIC resistance）

3. 同时将工作量证明（proof of work）改成了权益证明（proof of stake）

4. 同时增加了一个对智能合约的支持（smart contract）

   - BitCoin：decentralized currency
   - 去中心化的货币好处：跨国转账（用法币很麻烦）
   - Ethereum：decentralized contract
   - 去中心化合约的好处：保证合同的有效性（通过代码写好的技术手段保证不违约）
