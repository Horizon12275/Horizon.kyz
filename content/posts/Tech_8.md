---
type: "post"
title: "GitHub Action CICD 笔记"
author: "horizon"
category: "Tech"
date: "2024-10-13"
slug: "/Tech_8"
postImage: "./img/Tech_8.png"
metaDescription: "通过GitHub Action + docker的方法自动化部署 SpringCloud 后端项目。归档记录了 GitHub Action CICD 的笔记，其中包括 GitHub Action 的配置、GitHub Action 的使用、GitHub Action 的流程、GitHub Action 的示例等。"
---

## GitHub Action CICD 笔记

- 主要参考文章：

  1. https://juejin.cn/post/7011669659032387591
  2. https://github.com/Electronic-Waste/cicd_tutorial
  3. https://www.github-zh.com/getting-started/hello-github-actions
  4. （自己测试用的 repo，下面的例子就是里面取的）https://github.com/Horizon12275/ActionTest

- 服务器 ssh 配置如下：

- ssh-keygen

- cd .ssh

- cat id_rsa.pub >> authorized_keys

- 遇到的小问题：Error: buildx failed with: ERROR: invalid tag "\*\*\*/ActionTest:latest": repository name must be lowercase
- 解决方法：将 ActionTest 改为 actiontest 即可

- 貌似 dockerhub 上有些镜像已经被 deprecated 了，可能会报错

- alpine 版本镜像的大小只有 5MB，适合用来做镜像的基础镜像

- 这里要把华为云的安全组 22 ssh 端口设置为都能访问、因为这个 ssh 请求是从 github action 的服务器发出的

- 遇到的一个小问题：就是在 github action 用 ssh 登录的时候、环境变量里存的私钥直接 ctrl + a 复制就可以了 因为需要保留最上面的 -----BEGIN OPENSSH PRIVATE KEY----- 和最下面的 -----END OPENSSH PRIVATE KEY----- 两行。。

### 示例流程

1. 对应的仓库里面创建一个 .github/workflows 文件夹，里面创建一个 yaml 文件，比如 test.yaml

2. 为了持续部署后端 springboot 程序到服务器 我们需要写一个如下的 yaml 文件，其中逐行有 解释

```yaml
# 名称，可以随便取
name: Deploy with docker

# 触发条件，这里是 push 和 pull request，即当有 push 或者 pull request 时触发
on:
  push:
    # 分支，这里是 main 分支，即只有 main 分支 push或者 pull_request 到 main 时触发
    branches:
      - main
  pull_request:
    branches:
      - main

# 工作流程，这里是编译、打包、构建镜像、推送镜像、ssh连接服务器执行脚本
jobs:
  # 编译，这里是一个 job，可以有多个 job
  compile:
    # 运行环境，这里是 ubuntu-latest，这里貌似和我们华为云的服务器的环境无关，和 github action 的服务器有关，因为这段代码是在 github action 的服务器上运行的
    runs-on: ubuntu-latest
    # 步骤，这里是一个步骤，可以有多个步骤
    steps:
      # 检出checkout代码，这里是检出代码到 github action 的服务器上
      - uses: actions/checkout@v2
      # 设置 JDK 17，这里是设置 JDK 17
      - name: Set up JDK 17
        uses: actions/setup-java@v2
        with:
          java-version: "17"
          distribution: "adopt"
      # 设置maven缓存，不加的话每次都会去重新拉取，会影响速度
      - name: Dependies Cache
        uses: actions/cache@v2
        with:
          path: ~/.m2/repository
          key: ${{ runner.os }}-maven-${{ hashFiles('**/pom.xml') }}
          restore-keys: |
            ${{ runner.os }}-maven-
      # 编译打包
      - name: Build with Maven
        run: mvn package -Dmaven.test.skip=true
      # 登录Docker Hub，因为我们要把镜像推送到自己的Docker Hub上，然后再从Docker Hub上拉取到华为云服务器上，还有一个方法是直接构建镜像然后推送到华为云的镜像仓库上，这里是第一种方法
      # 同时、这里的用户名和密码是在 github 仓库的 settings -> secrets 里面设置的、相当于github action的环境变量
      - name: Login to Docker Hub
        uses: docker/login-action@v1
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKER_HUB_ACCESS_TOKEN }}
      # 设置 Docker Buildx，这里是设置 Docker Buildx。Docker Buildx 是 Docker 的一个扩展工具，用于构建多平台镜像。
      - name: Set up Docker Buildx
        id: buildx
        uses: docker/setup-buildx-action@v1
      # build 镜像并push到自己的Docker Hub上
      - name: Build and push
        id: docker_build
        uses: docker/build-push-action@v2
        with:
          context: ./
          file: ./Dockerfile
          push: true
          tags: ${{ secrets.DOCKER_HUB_USERNAME }}/action-test:latest # 这里是镜像的tag，action-test:latest里面的action-test是镜像的名字，latest是tag，都可以自己设置，不过这里记得要对应到dockerfile里面的镜像名字
      # push后，用ssh连接服务器执行脚本，这里的start.sh是服务器上的脚本，用来拉取镜像并运行，我这里放在了root目录下，同样、这里的HOST、USER、PRIVATE_KEY是在 github 仓库的 settings -> secrets 里面设置的、相当于github action的环境变量
      # 这里uses了一个第三方的action，这个action是用来ssh连接服务器的，链接完之后的command是链接之后要执行的命令
      - name: SSH
        uses: fifsky/ssh-action@master
        with:
          command: |
            sh start.sh
          host: ${{ secrets.HOST }}
          user: ${{ secrets.USER }}
          key: ${{ secrets.PRIVATE_KEY}}
          # 添加args参数，可以看到更多的报错信息
          args: "-tt -vvv"
```

3. Dockerfile 文件的编写：因为这里是用 Dockerfile 来构建镜像的，所以需要在 springboot 项目的根目录下创建一个 Dockerfile 文件，这里是一个简单的 Dockerfile 文件

```dockerfile

# 该镜像需要依赖的基础镜像，使用 OpenJDK 17 基础镜像，可以在dockerhub上进行搜索eclipse-temurin查询对应的用法 https://hub.docker.com/
FROM eclipse-temurin:17
# 调整时区 确保容器内的时间与主机系统或预期的时区一致，方便日志记录和调试
RUN rm -f /etc/localtime \
&& ln -sv /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
&& echo "Asia/Shanghai" > /etc/timezone
# 设置工作目录，这个相当于是在docker容器中的一个目录，这里是/app
WORKDIR /app
# 将当前目录下的jar包复制到docker容器的/目录下，这里的/目录是指docker容器的根目录，这里的jar包是在target中build出来的jar包，名字和build出来的jar包名字一致
ADD target/helloworld-0.0.1-SNAPSHOT.jar /app/
# 指定docker容器启动时运行jar包，这里的jar包名字要和上面的jar包名字一致，即你build出来target中的jar包名字
ENTRYPOINT ["java", "-jar","helloworld-0.0.1-SNAPSHOT.jar"]

```

4. start.sh 脚本的编写：这个脚本是用来在华为云服务器上拉取镜像并运行的，这里是一个简单的 start.sh 脚本，放在华为云服务器的 root 目录下（因为是用 root 登录的、默认会切换到这个根目录、应该放在其他目录也行、就是 ssh 之后要再 cd 进入目录一下）

```shell
# 拉取镜像，这里是从自己的Docker Hub上拉取镜像，然后运行，horizon12275是我的Docker Hub的用户名，action-test是镜像的名字，latest是tag，注意和你上面build镜像的时候的tag对应和名字对应就行
docker pull horizon12275/action-test:latest
# 停止容器，这里是停止容器，TG-test是容器的名字，这个名字是自己设置的，可以自己设置，不过要和同一行里后面的的docker run的--name名字对应，然后是端口映射、最后是指定镜像运行容器
docker rm -f TG-test||true&&docker run  --name=TG-test -d -p 8082:8082 horizon12275/action-test:latest
# 查看容器，并强制删除所有未被任何容器使用的 Docker 镜像，而无需用户确认，这里是为了清理一下镜像，因为每次都会拉取新的镜像，这样会占用很多空间
docker image prune -af
```

### 具体操作流程（微服务）

- 大体流程和上面差不多，就是有几个细节要改一下

- 其中在 dockerfile 和 workflow 的 yaml 文件中、有很多关于文件路径的参数、只要时刻记得、当前路径就是在 github repository 的根目录下，就不会搞错，然后目录就跟着文件结构填、具体可以参考其中的 dockerfile 已经 workflow 的 yaml 文件中的编写（因为在自己的 ActionTest 中、springboot 项目是默认在根目录下的，这里的项目分布在交错复杂的文件结构中）

- 如果要用 github action 运行脚本的话，需要提前给这个 sh 文件权限，如下所示（不过这里没有用到脚本运行）

```shell
      # 让接下来要运行的脚本文件具有执行权限
    - name: Make the script files executable
      run: chmod +x ./.github/scripts/set_env.sh
    # 运行提前准备好的脚本、设置环境变量
    - name: Set up environment variables
      run: |
        ./.github/scripts/set_env.sh
```

- 文件夹中的路径名有时可能会错误、要注意是中折线-还是下划线\_

- 查看 docker 容器的日志 去/var/lib/docker/containers/ 或者

```shell
docker logs -f user-service
docker logs -f event-service
```

- 会报一个 no main manifest attribute, in target/user-service-0.0.1-SNAPSHOT.jar 的错误，导致打包出来的 jar 包很小（20KB），原因是 springcloud 项目中打包的时候、没有指定主类，需要在各模块的 pom.xml 中添加如下配置，repackage（貌似还需要删掉父模块里 build 中的内容）

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <executions>
                <execution>
                    <goals>
                        <goal>repackage</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
    <resources>
        <resource>
            <directory>src/main/resources</directory>
            <filtering>true</filtering>
        </resource>
    </resources>
</build>
```

- 在 github action 中，如果要用到环境变量，也可以这么设置、不过最后没用到。。。

```yaml
# 设置环境变量
- name: Set up environment variables
  run: |
    echo "DB1_URL=${{secrets.DB1_URL}}" >> $GITHUB_ENV
    echo "DB1_USERNAME=${{secrets.DB1_USERNAME}}" >> $GITHUB_ENV
    echo "DB1_PASSWORD=${{secrets.DB1_PASSWORD}}" >> $GITHUB_ENV
    echo "DB2_URL=${{secrets.DB2_URL}}" >> $GITHUB_ENV
    echo "DB2_USERNAME=${{secrets.DB2_USERNAME}}" >> $GITHUB_ENV
    echo "DB2_PASSWORD=${{secrets.DB2_PASSWORD}}" >> $GITHUB_ENV
    echo "NACOS_SERVER_ADDR=${{secrets.NACOS_SERVER_ADDR}}" >> $GITHUB_ENV
    echo "USER_SERVICE_PORT=${{secrets.USER_SERVICE_PORT}}" >> $GITHUB_ENV
    echo "EVENT_SERVICE_PORT=${{secrets.EVENT_SERVICE_PORT}}" >> $GITHUB_ENV
    echo "USER_SERVER_IP=${{secrets.USER_SERVER_IP}}" >> $GITHUB_ENV
# 打印环境变量，检查是否设置成功
- name: Debug environment variables
  run: |
    echo "EVENT_SERVICE_PORT: $EVENT_SERVICE_PORT"
    echo "USER_SERVICE_PORT: $USER_SERVICE_PORT"
```

- 注入环境变量到配置文件的方法如下，这里是使用 maven 命令行后 -D 的方式

```yaml
# 编译打包，传入环境变量参数
- name: Build with Maven
  run: |
    cd ./code/backend
    mvn package \
        -Dmaven.test.skip=true \
        -DDB1_URL=${{ secrets.DB1_URL }} \
        -DDB1_USERNAME=${{ secrets.DB1_USERNAME }} \
        -DDB1_PASSWORD=${{ secrets.DB1_PASSWORD }} \
        -DDB2_URL=${{ secrets.DB2_URL }} \
        -DDB2_USERNAME=${{ secrets.DB2_USERNAME }} \
        -DDB2_PASSWORD=${{ secrets.DB2_PASSWORD }} \
        -DNACOS_SERVER_ADDR=${{ secrets.NACOS_SERVER_ADDR }} \
        -DUSER_SERVICE_PORT=${{ secrets.USER_SERVICE_PORT }} \
        -DEVENT_SERVICE_PORT=${{ secrets.EVENT_SERVICE_PORT }} \
        -DUSER_SERVER_IP=${{ secrets.USER_SERVER_IP }}
```

- 要开放服务器的 nacos 的 9848 端口，否则无法注册服务，这里选择在安全组里配置一下

- 要设置为 nacos 中显示的内网 ip,因为这个是服务之间的调用，不需要外网 ip

```yaml
spring.cloud.nacos.discovery.ip = 192.168.0.118
spring.cloud.nacos.discovery.port = 9000
```
