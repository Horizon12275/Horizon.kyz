---
type: "post"
title: "无人系统设计课程学习笔记"
author: "horizon"
category: "Tech"
date: "2025-02-01"
slug: "/Tech_19"
postImage: "./img/Tech_19.jpg"
metaDescription: "记录了无人系统设计课程的学习笔记。包含了无人系统设计的基本概念、无人系统设计的基本操作、无人系统设计的仿真模型、无人系统设计的控制算法等内容。"
---

## 2.24

1. 调 PID 参数就是一点点调出来的，先调振幅，再一点点调其它的东西

2. 计算机控制中的 PID 算法： PID 控制器是工业过程控制中广泛采用的一种闭环负反馈控制器。

   - P – 指 Proportional（比例）；I – 指 Integral（积分）；D - 指 Differential（微分）。

3. PID 也不是包治百病的、那个类似三角函数的曲线就是会有延迟

4. 也可以采用多层的环、一个控制角度、一个控制位置之类的、就可以实现更复杂的控制

5. 然后讲了强化学习方法

6. 强化学习：强化学习是机器学习的一个分支，强调如何基于环境而行动，以取得最大化的预期利益。强化学习主要关注的是智能体（Agent）与环境的交互，智能体在环境中感知环境的状态，执行动作，得到环境的反馈（奖励或惩罚），并根据反馈调整自己的策略，以达到获得最大累积奖励的目标。

## 2.27

1. 先讲了一下 PID、如果不加 ID 控制、只通过 P 来控制、会出现像 RLC 电路特性图线一样的波动

2. P 就相当输入的开关量（调整的幅度）

3. I 微分项主要是用来调整过充的、过放的情况（就是那个超过了需要调整到的目标值的情况）

4. D 是用来调整超调的、就是那个超过了目标值之后又回来的情况（但是太大了也会导致过充）

5. 说是不需要考虑距离了，这个 PID 就是一个、只需要运动方向朝向目标就可以了，然后差不多到了一个距离、就慢慢停下来就可以了

6. clear all 可以清楚所有变量和参数

7. 回调函数还有暂停仿真的时候的各种执行函数

## 3.3

1. 介绍了一下强化学习

2. 强化学习(Reinforcement Learning, RL) 是一种机器学习方 法，其受到行为心理学的启发， 特别是人类与动物通过在环境中受 到（正面或者负面的）奖赏而采取 决策的方式。

3. 在强化学习中，通常不存在有着优 秀行为的样本（就像在监督学习中 那样）；正相反，与进化（强化）学习类似，算法的训练信号是由 环境，依据一个智能体与其互动的 程度所提供。

4. 强化学习概述：

   - 强化学习是一种目标导向的计算方法，计算机通过与未知动态环境的交互学习执行任务，旨在最大化任务的累积奖励。

5. Agent/智能体：通过观察环境、采取行动、接收奖励来完成学习任务。

6. 强化学习（英语：Reinforcement learning，简称 RL）是机器学习中的一个领域，强调如何 基于环境而行动，以取得最大化的预期利益。

7. 强化学习是除了监督学习和非监督学习之外的第三种基本的机器学习方法。

8. 与监督学习不同的是，强化学习不需要带标签的输入输出对，同时也无需对非最优解的精 确地纠正。

9. 其关注点在于寻找探索（对未知领域的）和利用（对已有知识的）的平衡，强化学习中的 “探索-利用”的交换，在多臂赌博机问题（multi-armed bandit problem）和有限 MDP（马 尔可夫决策过程（MDP，Markovdecisionprocess））中研究得最多。

10. 多臂赌博机问题

    - 这是一个经典的强化学习问题，体现了“探索-利用”权衡困境。
    - 这个名字来源于想象一个赌徒坐在一排赌博机（或称角子机、老虎机）前（有时被称为“单臂赌博 机”），他必须决定玩哪台机器，每台机器玩多少次以及玩的顺序，并且是否继续使用当前机器或 尝试不同的机器。多臂赌博机问题也属于随机调度的广义范畴。
    - 在该问题中，每台机器根据该机器特定的概率分布提供随机奖励，该奖励是先验未知的。
    - 赌徒的目标是最大化通过一系列杠杆拉动所获得的奖励总和。
    - 赌徒在每次试验中面临的关键权衡是在“利用”具有最高预期收益的机器和“探索”以获得有关其 他机器的预期收益的更多信息之间。在问题的早期版本中，赌徒一开始对机器一无所知。
    - 机器学习也面临着探索和利用之间的权衡。

11. 一般会为强化学习问题定义如下几个元素：智能体（Agent）、环境（Environment）、状态（ State）、动作（Action）和奖励（Reward）。

12. 在一个特定的时间点 t 时，智能体（agent）在环境（environment）中处于一个特定的状 态 s（state）中，并且会在它当前状态的所有可用动作中采取一个动作 a （action）。作 为一种回馈，环境将给予一个瞬时的奖赏 r（reward）。

13. 通过智能体与它所在环境之间的连续互动，智能体将逐渐地学习到如何去选择能够最大化 其奖赏总数的动作。

| 分类     | 特点                                                                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 监督学习 | 已知训练数据的标签（Label）。比如金融反欺诈场景中，已经明确训练数据中哪些用户是好客户，哪些客户是欺诈客户。目的非常明确地去学习不同 Label 数据的特征。 |

| 无监督学习 | 未知训练数据的标签（Label）。造成未知的原因有很多，可能是训练数据比较杂乱，标注成本太高、区分难度太大等。实际应用时主要做一些聚类，将相似度高的数据聚类在一起。 |
| 半监督学习 | 将“监督学习”和“无监督学习”融合在一起。训练数据中，可能有一部分数据已经知道 Label，另外一部分不知道 Label，为了使用到所有的数据，就会使用半监督学习的方式。 |
| 强化学习 | 基于环境的反馈而行动，通过不断与环境的交互、试错，最终完成特定目的或者使得整体行动收益最大作。强化学习不需要训练数据的 Label，但它需要每一步行动后环境给予量化的反馈数据，是奖励还是惩罚。 |

14. 强化学习的基本思想–从环境中产生数据

    - 概括地讲：在有监督学习中，我们拥有的是数据；而在强化学习中，我们拥有的是环境。
    - 拥有环境意味着我们可以自主地选择与环境进行交互的方式，从环境中产生需要的数据。

15. 模仿学习

    - 模仿学习的主要思想就是将强化学习问题转换为有监督学习问题。

    - 以自动驾驶为例，智能体需要根据状态（包括车辆雷达检测的路况，以及车载摄像头拍摄的周围环境图像）选择动作（包括转弯、刹车等）。一个自然的想法是收集大量人类驾驶员的驾驶数据，从数据中学习状态到动作的映射关系，这是一个典型的有监督学习问题。

    - 对于一些现实中的复杂问题，模仿学习的实际应用效果很差。这是因为有监督学习与强化学习的性质不同。

16. 数据集聚合（Dataset Aggregation，DAgger ）

    - 为了在模仿学习的框架下解决该问题，就不能仅仅用已经产生的数据进行模仿，而需要找一个人类 专家对新产生的数据不断地进行标注。

17. DAgger 算法

    - DAgger 算法的基本思想是：在每一步，智能体根据当前策略与环境交互，产生新的数据；然后，将这些新的数据交给人类专家进行标注，得到新的训练数据；最后，将新的训练数据与原有的训练数据合并，重新训练智能体的策略。

18. 采取了 DAgger 技巧之后，模仿学习就不再只是经典的有监督学习，而具有了一定的强化学习的性 质。此时，我们不再只拥有给定的数据，而拥有一个可以按需要不断产生数据的环境（能够对数据 进行标注的人类专家）当然，这里的环境与强化学习中所说的环境还是有区别的。这里主要是为了 说明通过交互产生新数据的重要性。

19. 这里还要补充的是，强化学习中有一个分支领域，叫作离线强化学习（Batch Reinforcement Learning，Batch RL），它是近年的研究热点之一。它的最大特点就是规定我们只拥有离线的数据 ，没有可以自由交互产生新数据的环境。（由于它比较前沿，因此本课程中不会过多涉及）

## 3.10

1. 强化学习的基本思想–求解最优策略

   - 如果既要考虑产生有价值的数据，又要考虑从数据中求解最优策略，那么这个问题无疑会非常困难。
   - 为此，现在假设环境已知，这类问题也称为最优控制（Optimal Control）。由于环境是已知的，不必考虑如何产生数据，因此我们可以将精力集中在如何求解最优策略上。
   - 强化学习的两种主要方法：基于价值的算法和基于策略的算法。由于最优控制问题中的环境是完全已知的，因此我们可以更好地学习了解基于价值与于策略这两种方法的基本思想。
   - 总体来说，强化学习就是针对一个未知环境求解最优策略的复杂问题。我们既需要与环境境进行交互产生数据，又需要通过这些数据求解能最大化奖励的最优策略。因此，我们必兼顾上述两方面，同时提升数据效率与训练效率。

2. 有监督学习是机器学习领域最基础的问题。

   - 在这类问题中，目标是利用给定的训练集（X,Y）拟合函数 Y=f(X)，使预测误差尽量小。根据 Y 是连续变量还是分类变量，可以将这类问题分为回归问题与分类问题。
   - 需要注意的是，有监督学习要求数据中有标注，标签代表高度概括的信息，是有价值的知识。 在现实中，获取标签的代价往往较大。

3. 无监督学习主要研究数据的内在结构，它不需要标签，可以直接从数据中学习。 无监督学习包括目标不同的几类问题：

   - 生成模型，寻求 X 的分布 P(X=x)，比较有代表性的成果是生成对抗网络；
   - 降维问题，寻求用低维的随机变量 Z 来表征 X，如主成分分析与自动编码器；
   - 聚类问题，寻求将数据 X 分组的方法，如 K-Means、层次聚类等。

4. 强化学习过程建模

   - 更正式地描述，智能体的目标是探索某种策略 p（policy）（𝜋），这是为了选择一个能够将某种长期奖赏最大化的动作，例如将期望累计奖赏最大化。
   - 一个策略就是某种智能体在依据它当前所处的状态，后续再次对动作进行选择时会遵守的方法。
   - 如果能够表征每个动作的价值的函数存在或是被学习得到了，那么最优策略（𝜋∗）可以通过选择有着最高值的动作来得到。
   - 与环境的交互发生在离散的时序（t=0，1，2，… ）中，并且被建模为一个马尔科夫决策过程（Markov decision process, MDP ） 。

5. 马尔科夫性质

   - 当一个随机过程在给定现在状态及所有过去状态情况下，其未来状态的条件概率分布仅依赖于当前状态；
   - 换句话说，在给定现在状态时，它与过去状态（即该过程的历史路径）是条件独立的，那么此随机过程即具有马尔可夫性质。具有马尔可夫性质的过程通常称之为马尔可夫过程。
   - 简单讲，就是下一步要采取的行动，只取决于当前状态。
   - 马尔可夫过程是一类随机过程。
   - 在现实世界中，有很多过程都是马尔可夫过程，如液体中微粒所作的布朗运动、传染病受感 染的人数、车站的候车人数等，都可视为马尔可夫过程。
   - 最简单的马尔可夫过程就是一阶过程，每一个状态的转移只依赖于其之前的那一个状态，这 个也叫作马尔可夫性质。

6. 马尔科夫决策过程（MDP）被定义为

   - S：一组状态 s1, 𝑠2, … 𝑠𝑛 ∈ 𝑆。环境状态是一个智能体所拥有的关于环境的信息（例如智能体的 输入）的函数。
   - A：一组动作 a1,𝑎2, … 𝑎𝑚 ∈𝐴 在每种状态 s 中都是可能的。动作表示各种不同的智能体在环境 中执行动作的方式。
   - P( 𝑠, 𝑠′, 𝑎) ：给定 𝑎 的情况下从 𝑠 到 𝑠′ 的转移概率。P 给出了在状态 𝑠 上挑选出动作 𝑎 之后会结束 于状态 𝑠′ 的概率，并且它遵循马尔科夫性质（Markovproperty ），这暗示着这个过程中的未来状 态仅取决于当前状态，而不依赖于先前发生的事件序列。因此，P 的马尔科夫性质令预测一步之后 的动态成为可能。
   - R (𝑠, 𝑠′, 𝑎) ：在给定 𝑎 的情况下从 𝑠 到 𝑠′ 的奖赏函数。当一个智能体在状态 𝑠 上挑选出一个动作 𝑎 并且移动到状态 𝑠′，它会从环境那里收到一个瞬时的奖赏 𝑟。
   - P 与 R 定义了世界模型，并且为每种策略都分别表示环境的动态性（P）以及长期奖赏（R）。
   - 学习通过免模型（ model- free ）方法进行，例如蒙特卡罗搜索与时序差分学习。
   - 最常用的时序差分学习方法：Q–Learning。

7. 一些核心概念

   - 各类强化学习问题中的一个核心问题是对当前己经学习到的知识的利用（ exploitation ）以及对搜索空 间中完全陌生并从未见过的区域的探索（exploration）。
   - 随机地选择动作（没有利用）以及根据某个表现或者奖赏的估量来贪婪地选择最佳的动作（没有探索） 这两种方法通常都会在随机环境中产生不良结构。
   - 尽管在各类文献中已经提出了许多种用于解决 探索－利用 平衡问题的方法，但对强化学习动作选择来 说，一种十分普及并且相当有效的机制是被称为 𝜀−greedy 的机制，其由参数 𝜀∈ 0, 1 所决定。
   - 根据 𝜀−greedy 机制，强化学习智能体将会以 1−𝜀 的概率，选择它认为能够返回最高的未来奖赏的动 作；否则它将会一视同仁地随机选择某个动作。
   - 即，使用 ε-贪婪探索机制，按照 ε 的概率随机探索，1-ε 的概率按照最高 Q 值“贪婪”地执行动作。
   - DeepMind 把 ε 初始值设为 1，然后逐渐减小到 0.1 并固定。在开始的时候进行完全的随机探索，然后探 索的概率逐渐减少至一个小的固定值。

8. 强化学习问题的情节性（episodic）和增量式（incremental）

   - 各类强化学习问题可以被分为情节性（episodic）的或者增量式（incremental）的。
   - 在前一种情节性类别中，算法的训练发生于离线状态下，并且是在一个存在多个训练样本的 有限范畴内进行的。在这个范畴内所收到的有关状态，动作与奖赏信号的有限序列被称为一 次片段（episode）。
   - 例如，依赖于重复随机采样的蒙特卡罗方法就是插曲式/情节式强化学习的一个典型案例。
   - 而相反的是，在算法的后一种增量式类别中，学习是于在线状态下发生的，并且它不会被某 种范畴所限制。
   - 将差分学习视为增量式强化学习算法。

9. Q-learning 的内容在 ppt 上

   - 是一种免模型的离线时序差分学习算法，其依赖于一个表格化过的对 𝑸
     𝒔, 𝒂 值的 表示（并正因此而得名）。
   - 非正式地讲，就是 𝑸 𝒔, 𝒂 表示在状态 s 上选择动作 a 的质量（quality）水平有多好。
   - 而从正式的角度来讲，𝑸 就是在状态 s 上采取动作 a 的预期折扣奖励/强化（Discounted Future Reward ）。

10. 过程

    - Q–learning 智能体的目标是通过在每一个状态上都挑选正确的动作以最大化它的期望奖赏。
    - 特别是，这个奖赏是一个经过折扣的对未来奖赏的期望值的权重总和。
    - Q-learning 算法就是在某个迭代过程中于 Q 值上发生的一个简单更新。
    - 一开始，Q 表格有着由设计者所设定的任意值。
    - 之后每次智能体从状态 s 上选择某个动作 a 时，它就会访问状态 s’，并接受一个瞬时奖赏 r

11. 公式

    - 𝛼 是学习率，gamma 是折扣因子
    - 学习率决定 𝑄 的新估计对旧估计的覆盖程度。
    - 而折扣因子则分配前期奖赏与后期奖赏的重要性；𝜸 越接近 1，就会给未来的强化带来越大的权重。

## 3.13

1. 介绍了一下 Q-learning
