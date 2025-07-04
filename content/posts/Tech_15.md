---
type: "post"
title: "软件测试课程学习笔记"
author: "horizon"
category: "Tech"
date: "2025-03-19"
slug: "/Tech_15"
postImage: "./img/Tech_15.jpg"
metaDescription: "记录了软件测试课程的学习笔记。包含软件测试的概述、软件测试方法、功能性测试、结构性测试等内容。"
---

## 2.17 软件测试概述

1. The grade of the course will be determined
   as follows:
   Projects 1~4：40%,
   Usual test ：10%
   Final exam: 50%

2. Even good design cannot guarantee a perfect product

3. How get high quality software (Two ways)：

   - Process management
   - Testing

4. What is Software Testing?

   - Testing= process of finding input values to check against a software (focus of this course)
   - Test case consists of test values and expected results
   - Debugging = process of finding a fault given a failure

5. Goals of testing(找错误)

   - Testing is a process of executing a program with the intent of finding an error.
   - A good test is one that has a high probability of finding an as yet undiscovered error.
   - A successful test is one that uncovers an as yet undiscovered error.
   - The objective is to design tests that systematically uncover different classes of errors and do so with a minimum amount of time and effort.

6. Testing cannot show the absence of defects, it can only show that software defects are present （只能找到，不能验证）

7. 在当前的软件开发方法学指导下开发软件，软件测试仍是保证软件质量和可靠性的重要手段。

8. Glossary

   - Error (ISO)(错误)
     - A good synonym is mistake. Errors tend to propagate;
   - Fault (故障)
     - A fault is the result of an error. Defect (see the ISTQB Glossary) is a good synonym for fault.
   - Failure (IEEE)(失效)
     - The inability of a system or component to perform its required functions within specified performance requirements.
   - Incident (事件)
     - When a failure occurs, it may or may not be readily apparent to the user (or ustomer or tester). An incident is thesymptom associated with a failure that alerts the user to the occurrence of a failure.
   - Exception (IEEE)(例外/越界)
     - An event that causes suspension of normal program operation. Types include addressing exception, data exception, operation exception, overflow exception,
       protection exception, underflow exception
   - Anomaly (IEEE)(异常)
     - Anything observed in the documentation or operation of software, that deviates from expectations based on previously verified software products or reference documents

9. Example – State Representation

   - 通过 <var1 = v1, …, varn = vn, PC = program counter> 来表示程序当前运行时的变量状态（PC 是行数）
   - 所以有时候是程序的状态的变量错了，也可以测试出来（但是测试的还是最终结果）

10. RIPR Model

    - Reachability（可达性）：错误可到达
    - Infection（传染性）：错误可引起状态变化和传递
    - Propagation（传播性）：错误可引起状态变化和传递
    - Revealability（显现性）：错误可引起错误状态显示出来

11. Myers principle（myers 准则）

    - Early test and continual test （早测试，持续测试，否则要重构）
    - Avoid test software by programmer him/her self（要单独的测试工程师去做测试，更容易找到错误）
    - Test case = input data + expected result（输入数据+预期结果）期望结果应该是软件设计之初就设计好的，对于用户来说是正确的
    - Test case should include expected（valid）input data and unexpected（invalid）input data（包括有效和无效的输入数据）
    - Test program = what it should to do + what it should not do （测试程序应该做什么和不应该做什么）
    - The probability of existing errors is direct proportion to the errors have being uncovered. （已经发现的错误越多，未发现的错误越多，一般是成正比的）
    - Check each test result roundly （要不断的检查测试结果）
    - Software test is an most innovational work

12. Independent principle

    - Software test should be execute by the group which is independent from development group. 第三方测试

## 2.24 软件测试方法

1. Non-execution based Verification（非执行验证）

   - 比如说就看一遍，在脑子里运行一遍，看看有没有问题
   - Walk through（走查）
   - Inspection（审查）
   - 在开发的初始阶段用到，不需要运行程序

2. Walk through

   - 是由一个项目组去做
   - 测试组的人一行一行地看代码
   - 然后形成测试用例，包括输入和预期输出
   - The goal of the walkthrough team is to detect faults, not to correct them.（找错误，不是改错误）

3. Inspection（审查）

   - 更加严格

4. Execution-based Verification （执行验证）

   - 通过运行程序来验证
   - 有两种方法：黑盒测试和白盒测试
   - Testing to Specifications, also known as black-box test.
   - Testing to Code, also called glass-box, white-box test.

5. Black-box test

   - 输入->程序->输出
   - 不需要看程序的内部结构，只需要看输入和输出的表象

6. 测试好不好：要用最少的测试用例，满足测试的要求

7. Equivalence testing（等价类测试）

   - 一个等价类是指一组输入数据，这组数据的输出应该是一样的（比如数轴上的一个范围）
   - 一个等价类的测试用例应该包括一个有效的输入和一个无效的输入
   - 一个等价类的测试用例应该包括一个最小的输入和一个最大的输入

8. White-box test

   - 检查程序中的深层次的错误（逻辑上的错误）
   - 逻辑（路径）驱动测试
   - 白盒测试是做最多的
   - 涉及：语句覆盖、判定覆盖、条件覆盖、路径覆盖

9. Formal verification（形式化验证）

   - 通过数学的方法来验证程序的正确性
   - 一般是用在安全性要求高的地方

10. Def-Use test（定义-使用测试）

    - 检查变量的定义和使用是否正确
    - 主要是对数据流做的测试

11. Mutation test（变异测试）

    - 是注入错误流进行测试
    - 通过改变程序中的一些内容，让它变成错的，然后测试
    - 是去增强测试的充分性
    - 然后要注入经常犯的错误

12. Regression Testing（回归测试）

    - 迭代式开发中形成的习惯
    - 一般是在软件的迭代开发中，每次迭代都要做回归测试
    - 一般是用自动化测试工具
    - 可以只测一部分，全测的话效率太低

13. Fault Statistics（错误统计）

    - 一般是用来评估测试的效果，证明测试充分性
    - 比如说找到标识的错误
    - 或者找到所有测试的错误的覆盖率

14. Reliability Analysis （可靠性分析）

    - 也是通过统计的方法来评估软件的可靠性

15. Clean-room（清洁室）

    - 比如统计一千行代码有多少故障率，如果小于多少的话，那么认为这个软件是可靠的

## 功能性测试

1. 提纲

   - 边界值测试
   - 等价类测试
   - 基于决策表的测试
   - 测试的效率

2. 依据（基本要求）：软件的功能需求文档（里的输入输出）

3. 核心：选择合适的输入（本质上是黑盒测试）

4. 边界测试

   - 边界值（边界点上经常会发生软件错误）
   - 边界值测试的取值: 最小值、略高于最小值、正常值、略低于最高值、最高值。（为了达到最小用例能够覆盖所有的情况）
   - 单缺陷假设：失效极少是由 2 个（或更多）缺陷同时发生引起的。（基本上是一个缺陷引起的）
   - N 个变量的测试用例数：4N+1

5. 健壮性测试

   - 除了 5 个边界值，再增加一个略小于最小值（min ）,一个略大于最大值（max+）。
   - 即:要考虑无效值的输入!
   - N 个变量的测试用例数：6N+1
   - 也是单缺陷假设

6. 最坏情况测试

   - 拒绝单缺陷假设，考虑全部边界输入的组合，即各个变量输入的笛卡儿积（多缺陷）。
   - 就是多缺陷的情况会比较少、但是也要测试
   - 最坏情况测试：N 个变量的测试用例：5^N。
   - 健壮（需要增加 2 个无效输入）最坏情况测试： N 个变量的测试用例： 7^N
   - 例子：三角形问题 边界值测试：4\*3+1=13 健壮性测试：5^3=125 最坏情况测试：7^3=343

7. 随机测试

   - 即使完成边界值的全部测试，也不能发现程序的全部错误，有些错误会存在于非边界值之中。使用随机函数取出测试值，避免了人为的测试偏见。
   - 但是多少测试用例才是充分的？（后面再说明）何时停止用例生成？
   - 保证每类输出至少有一个。

8. 等价类测试

   - 划分:互不相交的一组子集,这些子集的并是全集。
   - 1）弱（单缺陷）一般等价类覆盖单缺陷
     - 测试数：取 N、 M 中的大者。（只需要覆盖单维度上的等价类就可以了）
   - 2） 强一般等价类（基于多缺陷假设）
     - 覆盖多缺陷：测试数 N×M。
   - 3）弱健壮等价类测试
     - 弱：单缺陷
     - 健壮：考虑无效值
     - 测试数：取 N、M 的大者（3）再加无效值（2）。（无效值这样是因为需要最小测试用例、去覆盖所有无效区间，就是这两个点就可以了）
     - 测试数：取 N、M 的大者（3）再加无效值（2X 变量个数）。（多一点也可以、因为需要保证到定位到错误）
   - 4）强健壮等价类测试
     - 强：多缺陷组合（笛卡儿积）
     - 健壮：考虑无效值
     - 测试数：（N+2）×（M+2）。（相当于覆盖了每个小区域）

9. ppt 上有一个三角形测试和日期测试的实例例子

10. 基于决策表的测试

    - c 是条件
    - a 是行动
    - 就相当于在哪些规则条件下、程序应该会执行哪些行动
    - 可以以条件组合的方式、去描述程序的逻辑
    - 实际上是功能的输入和输出映射的关系
    - 方法的问题：有时候条件组合过多、不是很好构建决策表
      - 从第一次的 256 个测试规则到现在的 13 个测试规则，测试等价类的完备性是一样的。
      - 换言之，从决策表测试方法，我们可以充分地认识到，测试用例越多，并不能增加测试的完备性。而通过分析与合并，使用尽可能少的测试用例来达到测试完备性要求，正是测试技术研究的核心内容和目标。
    - 复杂关系用决策表来测试

11. 软件测试技术研究的目标:使用尽可能少的测试用例,发现尽可能多的软件错误。提高测试的效率。

12. 功能测试的指导方针

    - 如果变量引用的是物理量，可采用边界值分析和等价类测试；
    - 如果变量是独立的，可采用边界值分析和等价类测试；
    - 如果变量不是独立的，可采用决策表测试；
    - 如果可保证是单缺陷假设，可采用边界值分析和健壮性测试；
    - 如果可保证是多缺陷假设，可采用最坏情况测试、健壮最坏情况测试和决策表测试；
    - 如果程序包含大量例外处理，可采用健壮性测试和决策表测试；
    - 如果变量引用的是逻辑量，可采用等价类测试和决策表测试。

## 3.10 结构性测试

1. 作业：准备一个例子，也有开源的例子，黑盒测试要有依据，要使用工具

2. 这节课讲的是白盒测试

3. 结构性测试的方法：

   - 路径测试
   - 数据流测试

4. 目的

   - 结构性测试力求提高测试覆盖率
   - 结构性测试主要用于软件验证
   - 功能性测试是一种确认技术

5. 黑盒测试与白盒测试的比较

   - 黑盒测试：从用户观点出发，按规格说明书要求的输入数据与输出数据的对应关系设计测试用例。因此它是根据程序外部特征进行测试。
   - 白盒测试：根据程序内部逻辑结构进行测试。
   - 这两类测试方法是从完全不同的起点出发，并且是两个完全对立的出发点。这两类方法各有侧重，在测试的实践中都是有效和实用的。
   - 在进行单元测试时大都采用白盒测试，而在系统测试中采用黑盒测试。

6. 有了“黑盒”测试，为什么还要“白盒”测试？

   - 黑盒测试是从用户的观点出发，根据程序外部特性进行的测试。如果外部特性本身有问题或规格说明的规定有误，用黑盒测试方法是发现不了的。
   - 黑盒测试只能观察软件的外部表现，即使软件的输入输出都是正确的，却并不能说明软件就是正确的。因为程序有可能用错误的运算方式得出正确的结果，这种情况只有白盒测试才能发现真正的原因。
   - 白盒测试能发现程序里的隐患，像内存泄漏、误差累计问题。在这方面，黑盒测试存在严重的不足。

7. 先讲 路径测试

8. 程序图

   - 程序图是一种有向图，图中的节点表示语句片段，边表示控制流。
   - 好像考试时要画
   - 如果 i 和 j 是程序图中的节点，从节点 i 到节点 j 存在一条边，当且仅当对应节点 j 的语句片段可以在对应节点 i 的语句片段之后立即执行。

9. DD-路径图（决策到决策）

   - 程序流图是一种有向图，其中的节点表示语句，边表示控制流。
   - 对于给定的程序，可以使用多种不同的程序流图，所有这些程序流图，都可以简化为唯一的 DD-路径图。

10. DD-路径定义

    - DD-路径是程序图中的一条链，使得：
    - 情况 1：由一个节点组成，入度=0。
    - 情况 2：由一个节点组成，出度=0。
    - 情况 3：由一个节点组成，入度 >= 2 或出度 >= 2。
    - 情况 4：由一个节点组成，入度=1 并且出度=1。
    - 情况 5：长度 >=2 的最大链(单入单出的最大序列)。
    - 换言之：DD-路径是程序图中的最小独立路径，不能被包括在其它 DD-路径之中。
    - 应该就是把程序图压缩了路径后的图

11. DD 路径定义:对给定用命令语言编写的一段程序, 其 DD 路径是有向图，其中节点表示程序图的 DD 路径，边表示连续 DD 路径之间的控制流。 换言之，DD 路径是一种压缩图，其中的一个节点（DD 路径），对应程序中的语句片段。

12. 测试覆盖指标

    - 测试的主要评测方法包括覆盖和质量。
    - 测试覆盖是对测试完全程度的评测。测试覆盖是由测试需求和测试用例的覆盖或已执行代码的覆盖表示的。
    - 覆盖指标提供了“测试的完全程度如何？”这一问题的答案。最常用的覆盖评测是基于需求的测试覆盖和基于代码的测试覆盖。

| 指标         | 覆盖描述                                    |
| ------------ | ------------------------------------------- |
| $C_0$        | 所有语句（语句覆盖）                        |
| $C_1$        | 所有 DD-路径（分支覆盖）                    |
| $C_{1}p$     | 所有判断的每种分支（条件判断）              |
| $C_{2}$      | C1 覆盖+循环覆盖                            |
| $C_{d}$      | C1 覆盖+DD-路径的所有依赖对偶               |
| $C_{mcc}$    | 多条件覆盖                                  |
| $C_{i}K$     | 包含最多 K 次循环的所有程序路径（通常 K=2） |
| $C_{start}$  | 路径具有“统计重要性”的部分                  |
| $C_{\infty}$ | 所有可能的执行路径                          |

13. 语句覆盖（$C_0$）

    - 使程序中每一可执行语句至少执行一次；

14. DD-路径测试

    - 分支覆盖（$C_1$）：使程序中的每个逻辑判断的取真取假分支至少经历一次；
    - 条件覆盖（$C_{1}p$ ）：所有判断的每种分支（让所有 bool 表达式的条件都满足至少一次）

15. 多条件覆盖（$C_{mcc}$）

    - 使得每个判断表达式中条件的各种可能组合都至少出现一次；
    - ppt 的例子虽然满足条件组合覆盖，但并不能覆盖程序中的每一条路径，例如路径 acd 就没有执行，因此，多条件覆盖标准仍然是不彻底。

16. 分支/条件覆盖

    - 针对上面的问题引出了另一种覆盖标准—“分支 ／条件覆盖”，它的含义是：执行足够的测试用例，使得分支中每个条件取到各种可能的值，并使每个分支取到各种可能的结果。

17. 路径测试 $C_{\infty}$

    - 路径测试就是设计足够多的测试用例，覆盖被测试对象中的所有可能路径。

18. 循环测试

19. 单循环测试

    - 假设循环次数为 N
    - a. 直接跳过循环
    - b. 循环次数为 1
    - c. 循环次数为 2
    - d. 循环次数为 M，M<N
    - e. 循环次数为 N-1，N，N+1

20. 嵌套循环测试

    - a. 先测试最内部循环，其它循环次数为 1
    - b. 测试第二层循环，其它循环次数为 1，
    - c. 直到最外部循环完成测试

21. 级连循环测试

    - 分别采用单循环测试方法进行测试

22. 不规则循环测试 无法测试 —— 需要重新设计

23. 小结

    - 无论哪种测试覆盖，即使其覆盖率达到百分之百， 都不能保证把所有隐藏的程序欠缺都揭露出来。
    - 提高结构的测试覆盖率只能增强我们对被测软件的 信心，但它绝不是万无一失的。

24. McCabe 圈数（基路径）

    - 基路径的概念与方法
    - 基：借鉴了向量空间的概念，向量空间的基是相互独立的一组向量，基“覆盖”整个向量空间。使得该空间中的任何其它向量都可以用基向量表示。
    - 基路径：程序图中相互独立的一组路径，使得该程序中的所有路径都可以用基路径表示。（类似空间向量的概念）

25. 圈复杂度

    - 是一种为程序逻辑复杂性提供定量测度的软件度量，将该度量用于计算程序的基本的 基本路径数目。

26. 基本路径必须从起始点到终止点的路径。

    - 包含一条其他基本路径不曾用到的边。或至少引入一个新处理语句或者新判断的程序通路。
    - 对于循环而言，基本路径应包含不执行循环和执行一次循环的路径

27. McCabe 圈数（基本路径圈复杂度找法） V（G）计算方法：

    - V（G）=e-n+2p
    - e：边数；
    - n：节点数
    - p：连接区域数
    - 任何路径都可以看作是上述的所有基本路径的组合形成的。
    - 其中，加法是一条路径后接一条路径；乘法是路径的重复，而减法则只有数学上去除边的含义，而缺少实际意义。

28. 参考课本说明强连接有向图的计算公式(不满足单入口、单出口条件)。

    - 强连通图是 V（G）=e-n+p？

29. 如何寻找 McCabe 路径？

    - 图的搜索与遍历算法！
    - 深度优先算法
    - 广度优先算法

30. 好处：就是只需要测试基本路径、就相当于能够测试所有的路径

31. 基本复杂度

    - McCabe 在圈复杂度上的工作,在一定意义上,对程序设计的改进要大于对测试的改进。
    - 对于结构化程序设计的程序，可以将 if-thenelse 构造压缩为一个节点。
    - 则三角形程序最终可以压缩为只有一条路径的图！
    - 而对于非结构化程序，必然增加 McCabe 圈的数量。

    - 一般的，一个单元模块的最大复杂度 V（G）<10。

32. 有一个基于路径的测试讨论的分类讨论，ppt38 页（可达/不可达）

## 3.17 结构性测试

1. 数据流测试

   - 数据流测试是从关注程序中数据及其使用的角度，来设计测试用例的。类似一种路径测试覆盖，但关心的是数据变量而不是程序结构。

2. 定义-使用（def-use）测试

   - 定义-使用测试是一种数据流测试，它关注的是程序中变量的定义和使用之间的关系。
   - 定义语句：输入语句、赋值语句、循环控制语句和过程调用语句，即：向内存地址写入值的语句。
   - 使用语句：输出语句、赋值语句、条件语句、循环控制语句和过程调用语句，都是可能的使用语句。但它们不改变变量的值。即：从内存地址读取值的语句。
   - 谓词使用（记做 P-use）：是一个使用语句，它的结果是一个布尔值。（使用节点是一个谓词使用）
   - 计算使用（记做 C-use）：是一个使用语句，它的结果是一个数值。
   - 定义-使用路径（记做 du-path）：是一个从定义语句到使用语句的路径，其中没有其他定义语句。（具有起始和终止节点，使得该路径中没有其它节点是 v 的定义节点。）
   - 定义-清除路径（记做 dc-path）：是一个从定义语句到使用语句的路径，其中没有其他定义语句。（具有起始和终止节点，使得该路径中没有其它节点是 v 的定义节点。）
   - ppt 上有一个例题

3. 定义-使用路径测试覆盖指标

   - 全定义准则：每个定义节点到一个使用的定义清除路径。
   - 全使用准则：每个定义节点到所有使用节点以及后续节点的定义清除路径。
   - 全谓词使用/部分计算使用准则：每个定义节点到所有谓词使用的定义清除路径，若无谓词使用，至少有一个计算使用的定义清除路径。
   - 全计算使用/部分谓词使用准则：每个定义节点到所有计算使用的定义清除路径，若无计算使用，至少有一个谓词使用的定义清除路径。
   - 全定义-使用路径准则：每个定义节点到所有使用节点以及后续节点的定义清除路径。包括有一次环路和或无环路的路径。

4. 基于程序片的测试

   - 定义：给定一个程序 P 和 P 中的一个变量集合 V，变量集合 V 在语句 n 上的一个片，记做 S（V，n），是 P 中对 V 中的变量值作出贡献的所有语句（编号）的集合。
   - USE（使用）的形式有：谓词使用、计算使用、输出使用、定位使用、迭代使用
   - DEF（定义）的形式有：输入定义、赋值定义
   - 程序片的方法，将程序进行了分段划分。就如佣金问题的 commission 是最终结果，它的计算依赖于 sales 的计算；而 sales 的计算，又依赖于 lockSales、stockSales、barrelSales 的计算；而 lockSales、stockSales、barrelSales 的计算又分别依赖于 totalLocks、totalStocks、totalbarrels 的计算等等。
   - 如果所有变量的定义和使用是正确的，当然程序就是正确的！

5. 测试的效率

   1. 当时间用完时——缺少标准
   2. 当继续测试没有产生新失效时
   3. 当继续测试没有发现新缺陷时
   4. 当无法考虑新测试用例时—原因？
   5. 当回报很小时—基于分析的方法
   6. 当达到所要求的覆盖时—结构化测试的指标
   7. 当所有缺陷都已经清除时—难以实现

6. 漏洞与冗余

   - 如果采用最坏情况测试，测试用例为 53=125 个，能够覆盖全部 11 条路径，但是冗余很多！

7. 用于方法评估的指标

   - 假设功能性测试技术 M 生成 m 个测试用例,并且根据标识被测单元中的 s 个元素的结构性测试指标 S 来跟踪这些测试用例.当执行 m 个测试用例时,会经过 n 个结构性测试单元。
   - 定义：方法 M 关于指标 S 的覆盖是:n 与 s 的比值,记做 C(M,S)。
   - 定义：方法 M 关于指标 S 的冗余是 m 与 s 的比值，记做 R(M,S)
   - 定义：方法 M 关于指标 S 的净冗余是 m 与 n 的比值，记做 NR(M,S)。

## 3.24 集成测试与系统测试

1. 考试时间：第 16 周随堂考，开卷

2. 集成测试 vs 系统测试

   - 从前面的介绍,我们知道集成测试针对的是模块之间的关系（白盒）;而系统测试针对的是整个系统的功能。
   - 集成测试需要了解程序的结构，是一种结构化的测试方法，有路径覆盖的含义。
   - 系统测试不需要了解程序的结构，是一种黑盒的测试方法，是功能覆盖的意义。
   - 集成测试是由软件开发人员完成的；而系统测试往往是需要用户的参与的。

3. 集成测试的方法

   - 自顶向下集成 从主程序(顶层)开始,所有下层程序都以“桩程序”出现。完成顶层测试后，以真实程序代替“桩程序”，向下进行下一层测试。“桩程序”(stub)：模拟被调用程序的代码。一般以表格形式存在。
   - 自底向上集成 从程序的最下层节点（叶子）开始，通过编写“驱动器”完成测试，然后以真实程序代替“驱动器”，向上进行上一层测试。“驱动器”：模拟对测试节点的调用驱动。
   - 三明治集成 是自顶向下和自底向上测试的组合，即可以同时从顶和底向中间层集成，可以减少桩程序和驱动的数量。
   - 大爆炸测试 不分层次，将所有单元放在一起编译，并进行一次性测试。
   - 对于 SATM 系统，我们知道需要开发（节点-1）个桩程序；需要开发（非叶子节点）个驱动器。

4. 基于调用图的集成

   - 成对集成：

     为减少桩程序和驱动器的开发,可采用调用对的测试方法。SATM 的成对测试集，就是调用图中边的数量。

   - 相邻集成：

     为减少测试的数量，以相邻节点为集合，进行测试。相邻节点：包括所有直接前驱和所有直接后继节点。对于 SATM，显然就是除去叶子节点的所有节点的相邻集合

5. 基于路径的集成

   - 在面向结构的测试中,我们经常采用路径覆盖的方法,在集成测试中,我们也有类似的概念。
   - 定义：程序中的源节点是程序开始或重新开始处的语句片段。
   - 汇节点是程序执行结束处的语句片断。
   - 模块执行路径是以源节点开始，以汇节点结束的一系列语句，中间没有插入汇节点。
   - 消息是一种程序设计语言机制，通过它，一个单元将控制转移给另一个单元。
   - MM-路径是穿插出现模块执行路径和消息的序列。

6. MM-路径

   - 定义:给定一组单元,其 MM-路径是一种有向图,其中的节点表示模块执行路径,边表示消息和单元之间的返回。
   - 实线箭头表示消息，返回由虚线箭头表示。
   - DD-路径：模块内的程序执行路径；
   - MM-路径：模块间的模块执行路径序列。
   - 其中，UML 序列图是 MM-路径图的表示方式，因此，UML 序列图可以作为集成测试的路径覆盖标准

7. 集成测试策略比较

| 策略     | 对接口的测试能力   | 对交互功能的测试能力 | 故障分离辨别力                 |
| -------- | ------------------ | -------------------- | ------------------------------ |
| 功能分解 | 满意但有可能不可靠 | 有限单元对           | 好，尤其是有故障单元           |
| 调用图   | 满意               | 有限单元对           | 好，尤其是有故障单元           |
| MM 路径  | 优秀               | 全部单元             | 优秀，尤其对有故障单元执行路径 |

8. MM-路径复杂度

   - 圈复杂度的计算：V（G）=e-n+2p
   - 其中，e 为边数，n 为节点数。
   - 大家很容易得到 P168 页对图 13-13 的计算结果。
   - 双向箭头表示 2 条边。

9. 从前面的介绍我们知道有：

   - 单元测试：白盒(侧重)、详细设计文档；
   - 集成测试：白盒、概要设计文档；
   - 系统测试：从外部特性对软件进行测试，功能测试。
   - 标准：需求规格说明

10. 线索(thread)

    - 线索有不同的层次,单元级线索被理解为指令执行路径,或 DD-路径;集成测试线索是 MM-路径,即模块执行和消息交替序列。那么系统级线索，就是原子系统功能序列。
    - 这样的定义并不令人满意，换个角度，单元测试的线索是模块内的路径执行序列（有意义的最小单元）；集成测试的线索是模块间的路径执行序列（是小于系统级的意义单元）；系统级的线索，是系统输入到输出的路径（是功能的最小单元）。
    - 定义：原子系统功能（ASF）：是一种在系统层可以观察得到的端口输入和输出事件的行动。
    - ASF 具有事件静止特性，ASF 开始于一个端口输入事件，遍历一个或多个 MM 路径，以一个端口输出事件结束。
    - ASF 具有事件序列原子化（不愿再细分）特性。

11. 我们总是希望有图形化的方法，来描述系统需求。因此，我们就需要有能够描述系统功能的图。

    - 定义：给定通过原子系统功能描述的系统，系统的 ASF 图是一种有向图，其中的节点表示 ASF，边表示串行流。
    - 定义：源 ASF 是一种原子系统功能，在系统 ASF 图中作为源节点出现。汇 ASF 也是一种原子系统功能，在系统 ASF 图中作为汇节点出现
    - 定义：系统线索在系统的 ASF 图中，是从源 ASF 到汇 ASF 的路径。

12. 建立系统的 ASF 图，是软件建模的方式之一。换 言之，是建立需求规格的形式化方法之一。

    - 有限状态机（FSM）是研究系统功能级线索的有效手段。换言之，有限状态机恰是我们前面定义的 ASF 图。
    - FSM：节点=ASF 边=事件和行动
    - 在获得系统状态图之后,如何确定测试用例呢?
    - 既然已经有系统的有限状态图,当然测试用例的选择就是考虑对路径的覆盖了。

13. 基于用例的线索

    - 用例的层次
    - 高级用例（非常类似于一个敏捷开发故事）
    - 基本用例
    - 基本扩展用例

14. 系统测试指导方针

    - 伪结构系统测试

    - 伪结构是系统的行为模型，是系统实际情况的近似模型。
    - 决策表、状态图、Petri 网是系统功能性测试的常见选择。

    - 运行剖面

    - 齐夫定理（Zipf’s Law）在大多数情况下都成立。即 80%的活动发生在 20%的空间里（二八定理）。
    - 因此，确定各种线索的执行频率，对事件发生频率高的线索执行测试，可以大大提高测试的效率。

## 4.21 回归测试

1. 软件迭代开发过程中，软件的功能和结构都在不断变化。

   - 回归测试是为了验证软件的修改没有引入新的错误。
   - 最直接的是直接跑一遍原来的测试用例，看看是否有新的错误。
   - 但是优化的方法是：只跑那些受影响的测试用例。
   - 受影响的测试用例是指：修改的代码所影响的测试用例，可以降低测试的成本。

2. 测试用例库：

   - 主要是为了存储测试用例，便于后续的回归测试。

3. 回归测试应该兼顾效率和有效性。

   - 再测试全部用例
   - 基于风险选择测试
   - 基于操作面向选择测试

4. 回归测试的步骤

5. 回归测试用例的选择方法步骤

   - 分析执行轨迹
   - 提取测试用例（test vectors）（上个版本留下来的测试用例）
   - 构造语法树
   - 遍历 CFG 图，决定哪些测试用例需要执行（CFG 图是控制流图）
   - 选择和修改部分相关的测试用例

6. test vector 就是以向量的形式表示、每一个测试用例在每一个函数中的的执行轨迹。

7. 回归测试的本质是测试用例的选择、而不是生成新的测试用例

   - 核心的思路：哪里修改了、就选择哪里相关的测试用例。

8. 测试最小化（test minimization）（必考题）

   - 提出了功能覆盖的要求定义
   - 首先需要辨别可测试的实体类型
   - 然后再选择测试用例
   - 也可以根据测试优先级去选择

## 4.27 变异测试（是考试的一道题）

0. 变异测试：进行测试充分性的加强

1. 如何说明测试的充分性？

   - 覆盖率（分支覆盖等）

1. 测试充分性问题说明：考虑为满足功能需求集 R 编写的程序 P，记为(P, R)，R 包含 n 个需求 R1-Rn。构造含 k 个测试的集合 T 测试 P 是否满足 R 中所有需求，P 对 T 中每个测试执行正确。问题是 T 是否足够好，即 P 是否被充分测试，或 T 是否充分。

1. 测试充分性核心问题：

   - T 是否足够好？
   - P 是否被充分测试？
   - T 是否充分？

1. 测试充分性判断依据：

   - T 是否覆盖 R 中所有需求（每个 R1-Rn 是否被验证）。
   - 即使 P 通过 T，仍可能存在未覆盖需求或潜在缺陷。

1. 测试充分性关键点：

   - 需求覆盖（是否所有 R1-Rn 被测试）。
   - 测试质量（是否包含边界条件、异常情况等）。
   - 正确性验证（P 在 T 中所有测试是否表现正确）。

1. 程序突变的定义：

   - 对已通过测试集 T 的程序 P 进行修改得到 P'
   - 观察 P'在 T 中的测试行为

1. 突变相关概念：

   - P'称为 P 的突变体
   - 若存在测试 t∈T 使 P(t)≠P'(t)，则 t 杀死 P'
   - 若无此 t，则 P'在测试过程中存活

1. 等价突变体：

   - 若输入域中不存在能区分 P 和 P'的测试用例，则 P'等价于 P
   - 等价突变体无法被任何测试发现

1. 测试充分性判断：

   - 若 P'不等价于 P 但 T 无法区分，则 T 不充分
   - 非等价且存活的突变体可用于增强 T

1. 突变测试价值：

   - 通过生成新测试用例杀死存活突变体来改进 T
   - 突变测试是评估测试集充分性的有效方法

1. 突变测试充分性评估流程：

   - 给定程序 P 及其测试集 T，需满足需求 R
   - 通过创建 P 的突变体来评估 T 的充分性

1. 突变测试步骤：

   - 步骤 1：创建 P 的突变体集合 M={M1...Mk}，共 k 个突变体
   - 步骤 2：对每个突变体 Mi，检查 T 中是否存在 t 使 Mi(t)≠P(t)
     - 若存在，Mi 被杀死并从集合中移除
   - 步骤 3：统计 k1 个被杀死的突变体，(k-k1)个存活的突变体

1. 充分性判定标准：

   - 情况 1：若(k-k1)=0，T 对突变是充分的
   - 情况 2：若(k-k1)>0，计算突变得分 MS=k1/(k-e)
     - 其中 e 为等价突变体数量，且 e≤(k-k1)

1. 关键概念说明：

   - 突变体：程序 P 的修改版本
   - 被杀死的突变体：被测试集 T 发现的突变体
   - 存活的突变体：未被 T 发现的突变体
   - 等价突变体：与 P 行为完全相同的突变体

1. 测试增强流程概述：

   - 在评估测试集 T 的充分性后，有机会增强 T
   - 通过变异测试技术实现测试增强

1. 变异得分(MS)为 1 时的处理：

   - 需要使用其他技术或不同的变异体集来增强 T

1. 变异得分(MS)小于 1 时的处理步骤：

   - 步骤 1：识别存活且不等价于 P 的变异体
   - 步骤 2：为每个存活变异体设计新测试 t 以区分其与 P
   - 步骤 3：若 t 未能区分目标变异体 m，需重新设计测试
   - 步骤 4：成功的 t 可能同时区分多个存活变异体

1. 测试集更新与迭代：

   - 将成功区分变异体的新测试 t 加入 T
   - 重新计算变异得分(MS)
   - 重复整个增强过程

1. 关键概念说明：

   - 变异得分(MS)：被杀死的变异体比例
   - 存活变异体：未被当前测试集发现的变异体
   - 等价变异体：与 P 行为完全相同的变异体

1. **正确性取决于生成变异体的时候变异体是什么**

   - 也和变异体的数量和质量有关
   - 变异测试是已经通过了什么黑盒白盒测试之后、还需要进行进一步测试的时候进行测试

1. **变异体生成要模拟熟练程序员经常会犯的错误**

   - 如果变异体能存活、那么说明测试用例不充分、那么就需要增加测试用例
   - 测试用例都是为了找错误

1. 错误揭示变体定义：

   - 程序 P 的变体 P'满足：对于任意测试 t，若 P'(t)≠P(t)且 P(t)≠ 预期响应 R(t)，则 P'是错误揭示变体
   - 其中 R(t)是基于需求对 P 的预期响应

1. 错误揭示变体特性：

   - 能区分 P'和 P 的测试 t 必然会导致 P 失败（P(t)≠R(t)）
   - 揭示了 P 中存在的实际错误

1. 应用价值：

   - 错误揭示变体可帮助识别测试集不足
   - 发现这类变体有助于改进测试用例设计

1. 区分变异体的三个必要条件：

   - 条件 1（可达性）：测试用例 t 必须执行到变异语句 s
   - 条件 2（传染性）：执行变异语句 s 后，P 和 m 的程序状态不一致
   - 条件 3（传播性）：状态不一致最终导致 P 和 m 的输出不同

1. 等价变异体判定问题：

   - 判断变异体是否与父程序等价是不可判定的问题
   - 无法完全自动化检测等价变异体

1. 等价变异体数量特征：

   - 不同程序中等价变异体数量不同
   - 实证研究表明约 5%的生成变异体可能等价于父程序

1. 等价变异体识别过程：

   - 通常需要手动识别
   - 是一个耗时且令人沮丧的过程

1. 典型等价变异体示例：

   - 程序 p 使用"for(int i=0;i<10;i++)"
   - 变异体 p'使用"for(int i=0;i=10;i+=1)"
   - 两者功能完全等效

1. 变异体生成方法：

   - 变量的替换（或者通过 0 去替换）、操作符的替换

1. First order and higher order（一阶和高阶）

   - 一般只用一阶变异体（用的最多的）
   - 一阶变异体：只考虑单个语句的变异
   - 高阶变异体：考虑多个语句的组合变异

1. 程序员经常犯小错误、最后的错误经常由小错误的耦合而产生

1. 变异体的好与坏在于是否能够发现其中的错误

1. 不同的语言也有不同的变异体生成策略

1. Competent programmer hypothesis (CPH)（熟练能力假设）

   - 假设程序员在编写程序时会犯错误，但不会故意编写错误的代码。
   - 变异体生成的基础假设是程序员在编写代码时会犯错误，但不会故意编写错误的代码。

1. Coupling effect（耦合效应）

   - 由一阶变异体的组合而产生的错误。
   - 耦合效应是指多个小错误的组合可能导致更大的错误。

1. 变异测试适用的阶段：

   - 变异测试经常适用于单元测试阶段，用于增强测试用例。（小单元、对测试用例的要求高的情况下做）
   - 变异测试的充分与否与生成的变异体的数量和质量有关。

## 4.28 面向对象测试

1. 单元的定义:

   - 可以编译和执行的最小软件组件。
   - 是不会指派给多个设计人员开发的软件组件。
   - 在结构化程序设计中，单元就是程序的一个函数或过程！
   - 在面向对象程序设计中，类具有封装性，是单元的一种选择；但有时类会很大，具有许多的变量和方法，此时，类中的方法似乎更接近单元的特性。

2. 合成与封装的涵义

   - 合成是面向对象软件开发的核心策略。将具有高耦合度的数据和操作封装在一起，就是类的概念，而对外是松散耦合的关系（类与类之间）。
   - 如果在类的设计中，将高耦合度的关联设计到了类与类之间，那么即使通过了非常好的单元（类）测试，集成测试的复杂度会大大增高！
   - 1 和 3 差不多、2 不太好

3. 继承的涵义

   - 类作为测试的单元时，如果存在类的继承性问题，就变成为类间测试问题，解决的方法是：“扁平类”，即对有继承性的类进行扩充，以包含全部所继承的属性和操作。
   - 存在的问题，经过扁平化的测试类不是交付程序，可能导致测试的不真实性。

4. 以方法为单元或者以类为单元
   - 以类为单元进行测试，重点在于类的消息序列（或事件组合）

## 5.26 嵌入式软件测试

1. 首先讲了上次小测的问题解答、可以复习的时候看

2. 测试和硬件和操作系统的环境有关

3. 测时间是变化很大的，需要统计意义上的最差时间满足要求（比如自动驾驶汽车的刹车） Worst-case execution time (WCET) estimation 和 BCET = Best-Case Execution Time 等都可以是对应指标

   - 难点：知道它的规律
   - 一般是做白盒测试

4. 影响因素

   - 循环次数
   - 路径影响

5. 全数字模拟测试

   - 采用数学平台的方法，将嵌入式软件从系统中剥离出来，通过开发 CPU 指令、常用芯片、I/O、中断、时钟等模拟器在 HOST 上实现嵌入式软件的测试
   - 主要特点
     - 与嵌入式硬件平台脱钩
     - 操作简单，可以借鉴常规的软件测试方法
     - 适用于功能测试
     - 有局限性

6. 全数字模拟测试的局限性

   - 通用性差，使用不同语言编写的嵌入式软件，需要不同的仿真程序来执行
   - 实时性与准确性难以反映出嵌入式软件的真实情况，测试出与时序有关的故障价值不大。
   - 维护统一、精确的系统时钟，理顺时序关系相当困难，特别是当并发的事件要求一定的同步关系时。
   - 开发成本高。设计出一个能进行系统测试的的环境代价太大
   - 只能作为嵌入式软件测试的辅助手段

7. 交叉测试（Host/Target 测试）

   - 与目标环境无关的部分在 PC 机上完成
     - 充分利用高级语言的可移植性
     - 借鉴常规的软件测试方法
     - 与模拟测试不同
   - 与硬件密切相关的部分在 Target 上完成
     - 需要调试环境支持
     - 测试工具需要支持目标环境
   - 最后在目标环境中确认

8. 静态分析很重要，动态测试不可少，白盒黑盒相辅成，单元集成两步走

9. 然后讲了对应的测试策略

10. 好像最后讲了考点，但是听不太清

    - 5 道题，要把例子看一下、和上次小测例子差不多
    - 白盒测试 2 道题，路径
    - 还有一个什么测试有 2 道题，好像是数据流测试，程序切片
    - 变异测试（前面好像还有一个）
    - 一定要熟悉一下这个定义、不然做不完，基本上的东西能推导，不要现场学
    - 性能测试什么好像都不考，就是作业做的
