---
type: "post"
title: "应用体系架构AEA各类中间件部署方式整理"
author: "horizon"
category: "Tech"
date: "2025-01-01"
slug: "/Tech_10"
postImage: "./img/Tech_10.jpg"
metaDescription: "归档记录了各类中间件的部署方式，其中包括 Kafka、Redis、Api Docs、MongoDB、Neo4j、InfluxDB、Nginx、Mysql、Graphql、Docker、Frontend、Spark 等。"
---

## Kafka

0. docker-compose up -d

1. docker pull apache/kafka:3.7.0

1. docker run -d --name kafka_3.7.0 -p 9092:9092 apache/kafka:3.7.0

1. 查看 windows 所有端口： netstat -ano

1. docker exec -it kafka_3.7.0 /bin/bash

1. 进入 docker 里 kafka 的安装路径：cd /opt/kafka/bin

1. 创建一个 topic：

```bash
./kafka-topics.sh --create --topic OrderTopic --bootstrap-server localhost:9092
./kafka-topics.sh --create --topic OrderResultTopic --bootstrap-server localhost:9092
```

7. 创建 topic 的时候可以指定分区数和副本数：./kafka-topics.sh --create --topic test2 --partitions 3 --replication-factor
   2 --bootstrap-server localhost:9092

   - --bootstrap-server 提供了初始的 broker 列表
   - --partitions 指定了 topic 的分区数
   - --replication-factor 指定了每个分区的副本数

8. 删除一个 topic：

```bash
./kafka-topics.sh --delete --topic OrderTopic --bootstrap-server localhost:9092
./kafka-topics.sh --delete --topic OrderResultTopic --bootstrap-server localhost:9092
```

9. 查看所有 topic 的情况：./kafka-topics.sh --bootstrap-server localhost:9092 --describe

```shell
Topic: test     TopicId: 63FyL5rWRFi2OM5e8vh5XA PartitionCount: 1       ReplicationFactor: 1    Configs: segment.bytes=1073741824
        Topic: test     Partition: 0    Leader: 1       Replicas: 1     Isr: 1
Topic: test2    TopicId: hQSoaHT5TCyCUpIID-2uqQ PartitionCount: 3       ReplicationFactor: 1    Configs: segment.bytes=1073741824
        Topic: test2    Partition: 0    Leader: 1       Replicas: 1     Isr: 1
        Topic: test2    Partition: 1    Leader: 1       Replicas: 1     Isr: 1
        Topic: test2    Partition: 2    Leader: 1       Replicas: 1     Isr: 1
```

    - Leader 是当前分区的 leader broker。Leader: 1指领导者副本的broker ID 是 1
    - Replicas 是当前分区的所有副本数
    - Isr 是当前分区的所有同步副本。Isr: 1指当前只有一个同步副本

10. docker stop kafka_3.7.0

11. docker rm kafka_3.7.0

12. docker logs kafka_3.7.0

13. 查看容器 ip: docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' kafka_3.7.0

## Redis

1. docker run --name redis_7.4 -p 6379:6379 -d redis:7.4

## Api Docs

1. http://localhost:8081/v3/api-docs

2. http://localhost:8081/swagger-ui.html

## MongoDB

1. docker run --name mongoDB -p 27017:27017 -d bitnami/mongodb:latest

2. 可以不进入容器、直接在 compass 里面打开命令行也是可以操作容器中的 mongodb 的

3. 如果直接使用 navicat 将 mysql 里面的 book 表中的 id 和对应的 description 导出、导出之后再用 mongoDB compass 通过 json 文件导入 mongoDB 的话、会导致直接导入一个 book 的列表。但是每本 book 应该是对应于一个 document 的，其中在这个 document 里面有他的 book id 和 book description，然后这些 document 组成了一个 book info 的 collection，然后如果有很多个 collection 的话、这些 collection 会组成一个 database。这个貌似主要是因为生成的 json 文件默认带有最外层的一个 RECORD 标记。而且因为这里 mongodb 会把一个 json 文件默认看成是一个 document、所以会直接导入。

```bash
use ebookstore
# 这里的db.是对当前的数据库的一个引用,bookinfo指定了对应的collection的名称
db.bookinfo.insertOne(
   {
      "id": 1,
      "description": "This book provides a comprehensive introduction to the field of computer science. It covers topics such as algorithms, data structures, programming languages, and computer architecture. The book is suitable for beginners and does not require any prior knowledge of programming."
   }
  );
# 下面的命令行指定了对应的主键、上面的是自动生成主键，使用下面的可以根据主键在插入删除的时候，自动保证一致性
db.bookinfo.insertOne(
   {
      "_id": 1,
      "description": "This book provides a comprehensive introduction to the field of computer science. It covers topics such as algorithms, data structures, programming languages, and computer architecture. The book is suitable for beginners and does not require any prior knowledge of programming."
   }
  );

db.collection.find({ "_id": 1 })
```

## Neo4j

0. 默认密码是 neo4j，第一次登录需要修改密码 docker pull neo4j:4.4

1. 启动容器：

```bash
docker run --name neo4j --publish=7474:7474 --publish=7687:7687 -d neo4j:4.4
```

2. 访问控制台：http://localhost:7474/browser/

3. 密码 12345678

4. 常用操作：

```cypher
//查看所有节点类型和数量
MATCH (n) RETURN DISTINCT labels(n), COUNT(n) AS node_count;

//查看所有关系类型和数量
MATCH ()-[r]->() RETURN DISTINCT type(r), COUNT(r) AS relationship_count;

//查看所有节点的属性
MATCH (n) RETURN DISTINCT keys(n);

//删除所有节点和关系
MATCH (n)
DETACH DELETE n;

//查看所有节点和关系
MATCH (n)
RETURN n;
```

5. 有点奇怪、就算我倒过来存、一次性用 java 操作存储的话、也会出现奇怪的情况、就是这个 SE 和 Education 成环了

6. 貌似是因为 spring data neo4j 默认用的是 4.4 版本的 neo4j，然后尝试使用一下 4.4 版本的镜像

```bash
docker run --name neo4j_4.4 --publish=7474:7474 --publish=7687:7687 -d neo4j:4.4
```

7. 居然还有一个问题，就是在 TagNeo 中我一开始使用了下面这个作为初始化函数、它会报一个错

```java
    public TagNeo(String education) {
        this.name = education;
    }
```

```bash
Caused by: java.lang.IllegalStateException: Required property education not found for class com.example.backend.entity.TagNeo
```

把这个构造函数改成下面这个就可以了，因为 education 不是属性字段、name 是属性字段。这个函数参数变量里的命名居然也要和这个类里的属性字段一样

```java
    public TagNeo(String name) {
        this.name = name;
    }
```

8. 最后还是用了 4.4 版本的 neo4j 镜像、因为这样就不会有很多 warning 了

9. 需要显式地指定这个 Param("name")，不然会报错 Caused by: org.neo4j.driver.exceptions.ClientException: Expected parameter(s): name

```java
    @Query("MATCH (t:Tag)-[:CONTAIN*0..2]->(related:Tag) WHERE t.name = $name RETURN related")
    Set<TagNeo> findRelatedTagsByTagName(@Param("name") String name);
```

10. 这里如果让 sql 根据一个很长的 list 去做查询、会报错、所以需要限制这个 list 的大小。但是这个貌似是因为用了分页功能所以报的错、所以最后采取了不用分页、用了先找 List 然后再返回 Page 对象的策略

## influxDB

1. docker run -d --name influxdb -p 8086:8086 influxdb:latest

2. ebookstore 目录中的 docker-compose 在启动的时候、可以在.env 文件中设置用户名、密码和 token、对应地写到 telegraf 的配置文件./telegraf.conf 中即可直接在宿主机上运行 telegraph

3. admin 12345678

4. 下载文件 wget https://dl.influxdata.com/telegraf/releases/telegraf-1.32.3_windows_amd64.zip -UseBasicParsing -OutFile telegraf-1.32.3_windows_amd64.zip

5. export INFLUX_TOKEN=mAAY8wVvIj5SG6aGrz7OJGZkvifmkiToC_4RNgFuJ0Bvl_R8NrKhFN-v-n2ih9mpsiypFoUm4CTpYerBt8731w==（不需要）

6. telegraf --config http://localhost:8086/api/v2/telegrafs/0e06cef648841000 （不需要）

7. 最终只需要直接运行：telegraf -config "./telegraf.conf"

## Nginx

1. docker run --name my-nginx -v D:/Horizon/Projects/Ongoing/e-bookstore/nginx/nginx.conf:/etc/nginx/nginx.conf:ro -p 8000:8000 -d nginx:stable-perl

## Mysql

1. docker pull mysql:8.0.37

2. docker run --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=123456 -d mysql:8.0.37

3. docker exec -it mysql bash

4. mysql -u root -p

5. CREATE USER 'root'@'202.120.8.%' IDENTIFIED BY '123456';

6. GRANT ALL PRIVILEGES ON \*.\* TO 'root'@'202.120.8.%';

7. FLUSH PRIVILEGES;

## Graphql

1. 首先需要在 resource 目录下创建一个 graphql 文件夹、然后在这个文件夹下创建一个 schema.graphql 文件，才能进行 graphql 的操作

2. spring.graphql.graphiql.enabled=true 打开这个配置可以在 http://localhost:8081/graphiql 访问到 graphql 的测试页面

3. 他里面好像做测试的时候、类名可以和这个 schema 里面的名字解耦、比如我 java 类是 BookTest、然后 schema 里面是 Book、还是可以正常运行

4. 好像就算加了@RequestMapping("/api/test")这种、还是通过 http://localhost:8081/graphql 发送 graphql query，然后通过 http://localhost:8081/graphiql 有 ui 界面，因为貌似前面这个是 restful 的注解，所以就算把这个 graphql 的代码加到原来的 controller 里也可以直接运行、但是这里为了清晰还是新建了一个 graphql 的 controller

5. 这里在 gateway 里面又加了一下把 graphql 的请求转发到了后端的 graphql 服务上，统一用 8080（gateway）端口访问

6. 这里的 @QueryMapping 的函数名需要和 schema 里面的 query 名字一样，不然会报错

7. 如果 schema 里面没定义对应的字段、但是在对应的 @QueryMapping 里面返回了这个字段、会报错（这时 query 里也包含了这个字段）

```
{
    "errors": [
        {
            "message": "Validation error (FieldUndefined@[bookById/name]) : Field 'name' in type 'Book' is undefined",
            "locations": [
                {
                    "line": 4,
                    "column": 5
                }
            ],
            "extensions": {
                "classification": "ValidationError"
            }
        }
    ]
}
```

8. 相反，如果 schema 里面定义了一个 name 字段、但是对应的函数里没返回这个字段、在对应的 query result 里面这个字段只会设置为 null

9. 在调试的时候、总是没有 author 结果、推测可能是因为测试时用的 java 类型名和 schema 里面的名字不一样导致的。（因为测试的时候 java 类后面带了个 Test，但是 schema 里面没有）（类型兼容性：确保 BookTest 类与 GraphQL Book 类型兼容，或者直接返回 GraphQL 期望的类型。）（但是没有实际去测试到底是不是这个原因导致 @SchemaMapping 没有被触发）

10. 在 GraphQL schema 中，感叹号 (!) 表示该字段是非空的，也就是说，在查询或响应中，这个字段必须有值，不能是 null。这对于强制执行数据完整性是非常重要的。

## Docker

1. 命令行登录貌似需要用到之前存的 token，但是好像不需要 push、所以就本地构建好直接启动吧

2. 在根目录下，你应该有一个 Dockerfile。你可以使用 docker build 命令构建一个镜像。假设当前目录包含你的 Dockerfile，你可以在命令行中执行以下命令：

```bash

docker build -t ebookstore:latest .
docker build -t eureka:latest .
docker build -t gateway:latest .
docker build -t ebookstore-frontend:latest .

```

3. 使用 docker-compose 文件启动很多容器

4. 这里遇到了一个问题、就 kafka 的 advertise listner 的配置、见 stackoverflow 和对应链接、原因主要是 kafka 的 raft 模式启动下、需要 controller 和 broker 来共同工作

5. 最后因为只要求了后端和 mysql 所以把 kafka 的部分删掉了

## Frontend

1. docker run -d -p 5173:80 --name ebookstore-frontend ebookstore-frontend:latest

## Spark

1. 启动官方给的 docker compose 文件之后、然后在 localhost:8080 上可以看到 spark 的 web ui

2. docker exec -it hw12-spark-1 bash

3. 然后用 script 里面的指令输进去就好了、这里挂载了对应的 hw12 目录到容器里

## Notice

1. 删掉 maven 里的包之后、要重新 clean 然后 refresh 一下，不然还是会用之前的包（比如 spring security）

2. spring-kafka 和 kafka-clients 是两个不同的库，spring-kafka 是对 kafka-clients 的封装。kafka-clients 是底层库，开发者可以完全控制 Kafka 的各种配置和行为。
