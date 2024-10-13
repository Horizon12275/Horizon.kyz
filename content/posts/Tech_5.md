---
type: "post"
title: "RobotFramework 自动化测试"
author: "horizon"
category: "Tech"
date: "2024-10-13"
slug: "/Tech_5"
postImage: "./img/Tech_5.jpg"
metaDescription: "归档记录了 RobotFramework 自动化测试的过程，其中包括 RobotFramework 的安装、RobotFramework 的使用、RobotFramework 的关键字、RobotFramework 的自动化测试库等。"
---

### 前情提要

- 以下内容只需要进行安装即可、不需要使用 ride idle 工具，可以通过 pycharm+intellibot 插件进行操作，如下：

  - 配置过程：https://www.cnblogs.com/emma-lucas/p/11231722.html

### RobotFramework

- 基于 python，使用关键字驱动的自动化测试框架，建议使用 3.7 版本

  - 数据驱动：测试用例中的数据可以从外部文件中读取 excel、csv、txt 等
  - 关键字驱动：把业务逻辑封装成关键字，提高代码的复用性，组合成测试用例

- 特点：
  - 格式可以是.txt 或者.robot，多格式
  - 自动生成测试报告
  - 支持很多类库和扩展库
  - 自定义关键字（业务）

### 环境（python3.7）

0. pip install attrdict -i https://pypi.tuna.tsinghua.edu.cn/simple

1. pip install -U wxPython==4.0.6 -i https://pypi.tuna.tsinghua.edu.cn/simple

1. pip install robotframework==3.1 robotframework-ride -i https://pypi.tuna.tsinghua.edu.cn/simple

### 使用 ride 工具（可以不使用 ride 工具、转而使用下面的 pycharm 中的 intellibot 插件）

1. 进入 conda 的 script 目录：D:\anaconda3\envs\RobotFramework\Scripts

2. 运行 ride：python ride.py

3. 设置桌面快捷方式：进入 ride 界面中上方的 tools 标签栏，点开之后最下面有一个 create desktop shortcut，点击即可

4. 解决报错：command: "no pybot" -A C:\Users\Horiz\AppData\Local\Temp\RIDEjlw36mu1.d\argfile.txt --listener D:\anaconda3\envs\RobotFramework\lib\site-packages\robotide\contrib\testrunner\TestRunnerAgent.py:61365:False D:\Horizon\Projects\Ongoing\RFTest\RobotFramework\Ride_Test

- 解决方法：https://blog.csdn.net/qq_39184753/article/details/107619878

### 使用 pycharm + intellibot（推荐）

1. 安装 intellibot 插件

2. 配置过程：https://www.cnblogs.com/emma-lucas/p/11231722.html

3. 根据上面文档配置好之后运行，右键.txt 文件选里面的 external tools 运行

### 自动化测试库

1. 分类：(这里的安装路径都是在 conda 的 site-packages 目录下，需要手动通过 ride GUI 添加)
   - web 自动化测试库：SeleniumLibrary
   ```bash
    pip install robotframework-seleniumlibrary -i https://pypi.tuna.tsinghua.edu.cn/simple
   ```
   - 接口自动化测试库：RequestsLibrary
   ```bash
    pip install robotframework-requests -i https://pypi.tuna.tsinghua.edu.cn/simple
   ```
   - app 自动化测试库：AppiumLibrary
   ```bash
    pip install robotframework-appiumlibrary -i https://pypi.tuna.tsinghua.edu.cn/simple
   ```

### 具体操作

1. 新建项目：注意要在右侧选取 directory 的 type，而不是 file 的 type

2. 新建模块：new 一个 directory （模块还可以有子模块、即模块嵌套）

3. 新建测试套件：new 一个 suite，是 .robot 文件

4. 新建用例：在 suite 中 new 一个 test case

### 用例编写

1. Log：输出日志

2. 定义变量：\${变量名} Set Variable 值

3. 获得系统时间：\${时间} Get Time

4. 字符串拼接：\${字符串} Catenate 字符串 1 字符串 2

5. 创建列表：@{列表} Create List 1 2 3 （通过 log Many 打印）（适合做循环、也可以用\$）

6. 字典关键字：\${字典} Create Dictionary key1 value1 key2 value2 （通过 log Many 打印）（这里需要导入 library：Collections）（没有提示就是没有导入包）

7. 通过 key 获取 value：\${value} Get From Dictionary &{字典} key

8. 执行 python 代码：（生成随机数的例子） \${随机数} Evaluate random.randint(1, 100) module=random

9. 执行 py 文件里的方法：

   - 导入库：Import Library 你的文件名.py
   - 调用方法：\${result} 你的方法名 参数 1 参数 2

10. if 语句：

```bash
    Run Keyword If ${变量} == 1 Log 1
    ... Else If ${变量} == 2 Log 2
    ... Else Log 3
```

11. for 循环：

```bash
    FOR ${i} IN @{列表}
    Log ${i}
    END
```

```bash
    FOR ${i} IN RANGE 1 10
    Run Keyword If ${i} == 5 Exit For Loop
    Log ${i}
    END
```

12. 截图（需要导入库：Screenshot）：

```bash
    Take Screenshot
```

### web 自动化测试

0. 注意：这里编写的脚本文件需要在一开始的**_settings_**中手动导入 SeleniumLibrary 库，否则会报错

1. 安装谷歌浏览器驱动：https://googlechromelabs.github.io/chrome-for-testing/known-good-versions-with-downloads.json 用搜索功能自选、用 url 下载对应版本的 chromedriver，然后注意要把下载完的驱动路径添加到环境变量中

1. 将 SeleniumLibrary 导入到测试套件中

#### 常用关键字

1. 打开浏览器：Open Browser https://www.baidu.com chrome

2. 设置隐式等待时间：Set Selenium Implicit Wait 10

3. 设置浏览器大小：Set Browser Size 1920 1080

4. 设置浏览器最大化：Maximize Browser Window

5. 获得浏览器的宽度和高度：${width} ${height} Get Window Size

6. 前进：Go To https://www.baidu.com

7. 后退：Back

8. 刷新：Reload Page

9. 获得标题：\${title} Get Title

10. 获得 url：\${url} Get Location

11. 输入文本：Input Text id=kw robotframework

12. 关闭浏览器：Close Browser

#### 元素定位

- 前提：元素或者属性是唯一的

- 八种定位方式：

  - id：id=id
  - name：name=name
  - class：class=class
  - tag：tag=tag
  - link：link=link
  - partial link：partial link=partial link
  - css：css=css
  - xpath：xpath=xpath

1. id 定位：（例子：输入框+按钮）

```bash
    Input Text id=kw robotframework
    Click Button id=su
```

2. name 定位：（例子：输入框+按钮）

```bash
    Input Text name=wd robotframework
    Click Button id=su
```

3. link 定位：（例子：百度首页的新闻）

```bash
    Click Element link=新闻
```

4. partial link 定位：（例子：百度首页的新闻）

```bash
    Click Element partial link=新
```

5. xpath 定位：（可以在检视中右键复制 xpath 或者 full xpath）（当上面几种方法没法用的时候可以用）

   - 绝对路径：/html/body （从网页的根节点开始查询元素）
   - 相对路径：//input[@id='kw'] （从任意标签位置开始查询元素）（和其他定位方式一起使用）

   1. 相对路径+索引：//input[@id='kw'][1] （索引从 1 开始）
   2. 相对路径+属性：//input[@id='kw' and @name='wd'] （多属性用 and 连接）
   3. 相对路径+部分属性：
      - 包含：//input[contains(@id, 'kw')] （部分属性用 contains 函数）
      - 以什么开头：//input[starts-with(@id, 'kw')]
      - 以什么结尾：//input[ends-with(@id, 'kw')]
   4. 相对路径+通配符：//\*[@id='kw' and contains(@name, 'wd')]（不建议：性能低，有些元素是动态的，复制的 xpath 复杂）
   5. 相对路径+文本定位：//a[text()='新闻']

6. css 定位：（可以在检视中右键复制 css 选择器）（和 xpath 一样，可以和其他定位方式一起使用）

- 没听、等要用就用 gpt 生成

```bash
    Click Element css=input#kw
```

#### 操作元素的关键字套件

1. 输入数据：Input Text id=kw robotframework

2. 点击按钮：Click Button id=su

3. 清空文本：Clear Element Text id=kw

4. 获得元素的文本信息：\${text} Get Text xpath=//a[text()='新闻']

5. 获得元素的属性值：\${value} Get Element Attribute id=kw value

#### 鼠标和键盘关键字套件

1. 双击：Double Click Element id=kw

2. （键盘事件）按键输入：Press Keys id=kw robotframework

#### 断言关键字套件

1. 系统断言

   - 判断是否为空：Should Be Empty \${text}
   - 判断是否相等：Should Be Equal \${text} robotframework ignore_case=True
   - 判断是否为真：Should Be True \${text}
   - 判断是否包含：Should Contain \${text} robotframework ignore_case=True
   - 判断是否以什么开头：Should Start With \${text} robotframework ignore_case=True
   - 判断是否以什么结尾：Should End With \${text} robotframework ignore_case=True
   - 判断长度：Length Should Be \${text} 12

2. Selenium 断言

   - 判断页面中是否有某个文本：Page Should Contain Text robotframework
   - 判断页面中是否有某个元素：Page Should Contain Element id=kw

#### 元素等待关键字套件

1. 隐式等待，针对当前浏览器：Set Browser Implicit Wait 10

2. 隐式等待，针对所有浏览器：Set Selenium Implicit Wait 10

3. 等待包含元素：Wait Until Page Contains Element id=kw timeout=10

4. 等待元素可用：Wait Until Element Is Enabled id=kw timeout=10

5. 等待元素可见：Wait Until Element Is Visible id=kw timeout=10

6. 等待页面包含指定文本：Wait Until Page Contains robotframework timeout=10
