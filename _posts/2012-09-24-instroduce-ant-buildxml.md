---
layout: page
title: "ANT build.xml文件详解"
category: Ant
tags: [ant]
description: "build.xml文件详解"
---

本文转载自[李长春个人博客](http://my.oschina.net/willSoft/blog/29314)

# 1. Ant的优点
跨平台性。Ant是用Java语言编写的，所示具有很好的跨平台性。

操作简单。Ant是由一个内置任务和可选任务组成的。

Ant运行时需要一个XML文件(构建文件)。

Ant通过调用target，就可以执行各种task。每个task实现了特定接口对象。

# 2. Ant开发
## 2.1 Ant的构建文件
Ant构建文件默认命名为build.xml，也可以取其他的名字。只不过在运行的时候把这个命名当作参数传给Ant。构建文件可以放在任何的位置。一般做法是放在项目顶层目录中，这样可以保持项目的简洁和清晰。

下面是一个典型的项目层次结构：

* (1) src存放文件。
* (2) class存放编译后的文件。
* (3) lib存放第三方JAR包。
* (4) dist存放打包，发布以后的代码。

每个构建文件定义一个唯一的项目(Project元素)。

每个项目下可以定义很多目标(target元素)，这些目标之间可以有依赖关系。当执行这类目标时，需要执行他们所依赖的目标。

每个目标中可以定义多个任务，目标中还定义了所要执行的任务序列。

Ant在构建目标时必须调用所定义的任务。任务定义了Ant实际执行的命令。

Ant中的任务可以为3类:

* (1) 核心任务。核心任务是Ant自带的任务。
* (2) 可选任务。可选任务是来自第三方的任务，因此需要一个附加的JAR文件。
* (3) 用户自定义的任务。用户自定义的任务实用户自己开发的任务。

## 2.2 Build.XML中的标签
### 2.2.1. &lt;project>标签
每个构建文件对应一个项目。&lt;project>标签是构建文件的根标签。它可以有多个内在属性，
就如代码中所示，其各个属性的含义分别如下:

* (1) default表示默认的运行目标，这个属性是必须的。
* (2) basedir表示项目的基准目录。
* (3) name表示项目名。
* (4) description表示项目的描述。

每个构建文件都对应于一个项目，但是大型项目经常包含大量的子项目，每一个子项目都可以有自己的构建文件。
### 2.2.2. &lt;target>标签
一个项目标签下可以有一个或多个target标签。一个target标签可以依赖其他的target标签。例如，有一个target用于编译程序，另一个target用于声称可执行文件。在生成可执行文件之前必须先编译该文件，因此可执行文件的target依赖于编译程序的target。

Target的所有属性如下：

* (1) name表示目标名，这个属性是必须的。
* (2) depends表示依赖的目标名。
* (3) if表示仅当属性设置时才执行。
* (4) unless表示当属性没有设置时才执行。
* (5) description表示项目的描述。

Ant的depends属性指定了target的执行顺序。Ant会依照depends属性中target出现顺序依次执行每个target。在执行之前，首先需要执行它所依赖的target。程序中的名为run的target的depends属性compile，而名为compile的target的depends属性是prepare，所以这几个target执行的顺序是prepare->compile->run。
一个target只能被执行一次，即使有多个target依赖于它。如果没有if或unless属性，target总会被执行。

### 2.2.3. &lt;mkdir>标签
该标签用于创建一个目录，它有一个属性dir用来指定所创建的目录名，其代码如下：
{% highlight javascript%}
<mkdir dir="${class.root}"/>
{% endhighlight %}

通过以上代码就创建了一个目录，这个目录已经被前面的property标签所指定。
### 2.2.4. &lt;jar>标签
该标签用来生成一个JAR文件，其属性如下:

* (1) destfile表示JAR文件名。
* (2) basedir表示被归档的文件名。
* (3) includes表示被归档的文件模式。
* (4) exchudes表示被排除的文件模式。

### 2.2.5. &lt;javac标签>
该标签用于编译一个或一组java文件，其属性如下:

* (1) srcdir表示源程序的目录。
* (2) destdir表示class文件的输出目录。
* (3) include表示被编译的文件的模式。
* (4) excludes表示被排除的文件的模式。
* (5) classpath表示所使用的类路径。
* (6) debug表示包含的调试信息。
* (7) optimize表示是否使用优化。
* (8) verbose表示提供详细的输出信息。
* (9) fileonerror表示当碰到错误就自动停止。

### 2.2.6. &lt;java>标签
该标签用来执行编译生成的.class文件，其属性如下:

* (1) classname表示将执行的类名。
* (2) jar表示包含该类的JAR文件名。
* (3) classpath所用到的类路径。
* (4) fork表示在一个新的虚拟机中运行该类。
* (5) failonerror表示当出现错误时自动停止。
* (6) output表示输出文件。
* (7) append表示追加或者覆盖默认文件。

### 2.2.7. &lt;delete>标签
该标签用于删除一个文件或一组文件，属性如下：

* (1) file表示要删除的文件。
* (2) dir表示要删除的目录。
* (3) includeEmptyDirs表示指定是否要删除空目录，默认值是删除。
* (4) failonerror表示指定当碰到错误是否停止，默认值是自动停止。
* (5) verbose表示指定是否列出所删除的文件，默认值为不列出。

### 2.2.8. &lt;copy>标签
该标签用于文件或文件集的拷贝，其属性如下：

* (1) file表示源文件。
* (2) tofile表示目标文件。
* (3) todir表示目标目录。
* (4) overwrite表示指定是否覆盖目标文件，默认值是不覆盖。
* (5) includeEmptyDirs表示制定是否拷贝空目录，默认值为拷贝。
* (6) failonerror表示指定如目标没有发现是否自动停止，默认值是停止。
* (7) verbose表示制定是否显示详细信息，默认值不显示。

## 2.3 Ant的数据类型
数据类型包含在org.apache.tool.ant.types包中。

### 2.3.1. argument 类型
由Ant构建文件调用的程序，可以通过&lt;arg>元素向其传递命令行参数，如apply,exec和java任务均可接受嵌套&lt;arg>元素，可以为各自的过程调用指定参数。以下是&lt;arg>的所有属性：

* (1) values是一个命令参数。如果参数种有空格，但又想将它作为单独一个值，则使用此属性。
* (2) file表示一个参数的文件名。在构建文件中，此文件名相对于当前的工作目录。
* (3) line表示用空格分隔的多个参数列表。
* (4) path表示路径。

### 2.3.2. ervironment类型
由Ant构建文件调用的外部命令或程序，&lt;env>元素制定了哪些环境变量要传递给正在执行的系统命令，&lt;env>元素可以接受以下属性：

* (1) file表示环境变量值的文件名。此文件名要被转换位一个绝对路径。
* (2) path表示环境变量的路径。Ant会将它转换为一个本地约定。
* (3) value表示环境变量的值。
* (4) key表示环境变量名。

注意：file、path或value只能取一个。

### 2.3.3. filelist类型
filelist是一个支持命名的文件列表的数据类型，包含在一个filelist类型中的文件不一定是存在的文件。以下是其所有的属性：

* (1) dir是文件绝对路径所在目录。
* (2) files是用逗号分隔的文件名列表。
* (3) refid是对某处定义的一个&lt;filelist>的引用。

注意 dir和files都是必要的，除非指定了refid(这种情况下，dir和files都不允许使用)。

### 2.3.4. fileset类型
fileset数据类型定义了一组文件，并通常表示为&lt;fileset>元素。不过，许多ant任务构建成了隐式的fileset,这说明他们支持所有的fileset属性和嵌套元素。以下为fileset的属性列表：

* (1) dir表示fileset的基目录。
* (2) casesensitive的值如果为false，那么匹配文件名时，fileset不是区分大小写的，其默认值为true.
* (3) defaultexcludes用来确定是否使用默认的排除模式，默认为true。
* (4) excludes是用逗号分隔的需要派出的文件模式列表。
* (5) excludesfile表示每行包含一个排除模式的文件的文件名。
* (6) includes是用逗号分隔的，需要包含的文件模式列表。
* (7) includesfile表示每行包括一个包含模式的文件名。

### 2.3.5. patternset类型
fileset是对文件的分组，而patternset是对模式的分组，他们是紧密相关的概念。
&lt;patternset>支持4个属性：includes excludex includexfile 和excludesfile,与fileset相同。patternset还允许以下嵌套元素：include,exclude,includefile和excludesfile.

### 2.3.6. filterset类型
filterset定义了一组过滤器，这些过滤器将在文件移动或复制时完成文件的文本替换。主要属性如下：

* (1) begintoken表示嵌套过滤器所搜索的记号，这是标识其开始的字符串。
* (2) endtoken表示嵌套过滤器所搜索的记号这是标识其结束的字符串。
* (3) id是过滤器的唯一标志符。
* (4) refid是对构建文件中某处定义一个过滤器的引用。

### 2.3.7. Path类型
Path元素用来表示一个类路径，或其他的路径，路经中的各项用分号或冒号隔开。在构建的时候，此分隔符将代替当前平台中所有的路径分隔符，其拥有的属性如下。

* (1) location表示一个文件或目录。Ant在内部将此扩展为一个绝对路径。
* (2) refid是对当前构建文件中某处定义的一个path的引用。
* (3) path表示一个文件或路径名列表。

### 2.3.8. mapper类型
Mapper类型定义了一组输入文件和一组输出文件间的关系，其属性如下:

* (1) classname表示实现mapper类的类名。当内置mapper不满足要求时，用于创建定制mapper。
* (2) classpath表示查找一个定制mapper时所用的类型路径。
* (3) classpathref是对某处定义的一个类路径的引用。
* (4) from属性的含义取决于所用的mapper。
* (5) to属性的含义取决于所用的mapper。
* (6) type属性的取值为identity，flatten glob merge regexp 其中之一，它定义了要是用的内置mapper的类型。

# 3. Ant的运行
安装好Ant并且配置好路径之后，在命令行中切换到构建文件的目录，输入Ant命令就可以运行Ant。若没有指定任何参数，Ant会在当前目录下查询build.xml文件。如果找到了就用该文件作为构建文件。如果使用了 –find 选项，Ant就会在上级目录中找构建文件，直至到达文件系统得跟目录。如果构建文件的名字不是build.xml，则Ant运行的时候就可以使用 –buildfile file ,这里file指定了要使用的构建文件的名称，示例如下：

Ant如下说明了表示当前目录的构建文件为build.xml运行ant执行默认的目标：

Ant –buildfile test.xml

使用当前目录下的test.xml文件运行Ant ,执行默认的目标

1.目标:满足基本Java项目的全面构建和部署需求。

2.参照NetBeans的build.xml设计，结构如图：

build.xml代码：
{% highlight xml%}
<?xml version="1.0" encoding="UTF-8"?>
<project name="Project Name" default="default" basedir=".">
<description>Builds, tests, and runs the project.</description>
<!-- 引入资源和定义资源 -->
<!--引入资源-->
<property file="build.properties"/>
<property environment="env"/>
<!--定义源程序文件夹-->
<property name="src.dir" location="src/java"/>
<property name="test.dir" location="test"/>
<property name="web.dir" location="web"/>
<!--定义目标程序文件夹-->
<property name="build.dir" location="build"/>
<property name="build.classes.dir" location="${build.dir}/classes"/>
<property name="build.test.dir" location="${build.dir}/test"/>
<property name="dist.dir" location="dist"/>
<!--定义其他文件夹-->
<property name="lib.dir" location="lib"/>
<property name="doc.dir" location="doc"/>
<property name="index.dir" location="index"/>
<property name="deploy.dir" location="${env.CATALINA_HOME}"/>
<property name="deploy.lib.dir" location="${deploy.dir}/lib"/>
<!--定义其他文件-->
<property name="dist.jar" location="${dist.dir}/WEB-INF/lib/
	${project.name}-${project.version}.jar"/>
<property name="deploy.war" location="${deploy.dir}/webapps/
	${project.name}.war"/>
<!--定义其他属性-->
<available file="${dist.dir}/enduser.agreement" 
	property="final.version"/>
<!-- 设置path -->
<path id="project.classpath">
<pathelement location="${java.home}/jre/lib/rt.jar"/>
<pathelement location="${build.classes.dir}"/>
<pathelement location="${build.test.dir}"/>
<fileset dir="${deploy.lib.dir}">
<include name="**/*.jar"/>
</fileset>
<fileset dir="${lib.dir}">
<include name="**/*.jar"/>
</fileset>
</path>
<target name="init" description="信息:显示项目基本信息.">
<tstamp>
<format property="now" pattern="yyyy-MM-dd HH:mm"/>
</tstamp>
<echo> ==================================================
||
||   显示项目基本信息.
||
||   项目名称: ${project.name}
||   项目版本: ${project.version}
||   　作者　: ${author}
||   　时戳　: ${DSTAMP}-${TSTAMP}
||
||   用法:
||      ant -buildfile build.xml compile 或
||      ant compile 或
||      ant 甚至
||      ant clean dist
||   帮助:
||      ant -projecthelp
||
==================================================</echo>
</target>
<target name="prepare" depends="init" description="准备:创建各种文件夹.">
<echo> ==================================================
||
||   创建各种文件夹.
||
================================================== </echo>
<!--  创建源程序文件夹  -->
<mkdir dir="${src.dir}"/>
<mkdir dir="${test.dir}"/>
<mkdir dir="${web.dir}"/>
<mkdir dir="${web.dir}/WEB-INF"/>
<!--  创建目标程序文件夹  -->
<mkdir dir="${build.dir}"/>
<mkdir dir="${build.classes.dir}"/>
<mkdir dir="${build.test.dir}"/>
<mkdir dir="${dist.dir}"/>
<mkdir dir="${dist.dir}/WEB-INF"/>
<mkdir dir="${dist.dir}/WEB-INF/lib"/>
<!--  创建其他文件夹  -->
<mkdir dir="${lib.dir}"/>
<mkdir dir="${doc.dir}"/>
<mkdir dir="${index.dir}"/>
</target>
<target name="javadoc" depends="prepare" description="生成文档: 生成帮助文档.">
<echo> ==================================================
||
||   生成帮助文档.
||
==================================================</echo>
<javadoc packagenames="*.*" sourcepath="${src.dir}" destdir="${doc.dir}" 
	author="true" version="true" use="true" encoding="UTF-8">
<classpath refid="project.classpath"/>
</javadoc>
</target>
<target name="compile" depends="prepare" 
	description="编译:编译所有源程序." unless="final.version">
<echo> ==================================================
||
||   编译所有源程序.
||
==================================================</echo>
<javac srcdir="${src.dir}" destdir="${build.classes.dir}" 
	debug="on" deprecation="on" encoding="UTF-8">
<compilerarg value="-Xlint:unchecked"/>
<classpath refid="project.classpath"/>
</javac>
<javac srcdir="${test.dir}" destdir="${build.test.dir}" encoding="UTF-8">
<compilerarg value="-Xlint:unchecked"/>
<classpath refid="project.classpath"/>
</javac>
</target>
<target name="test" depends="compile" description="测试:运行所有测试程序.">
<echo> ==================================================
||
||   运行所有测试程序.
||
==================================================</echo>
<junit haltonfailure="true">
<classpath refid="project.classpath"/>
<formatter type="brief" usefile="false"/>
<batchtest>
<fileset dir="${build.test.dir}" includes="**/*Test.class"/>
</batchtest>
<sysproperty key="doc.dir" value="${doc.dir}"/>
<sysproperty key="index.dir" value="${index.dir}"/>
</junit>
</target>
<target name="dist" depends="compile" description="分发:生成分发文件.">
<echo> ==================================================
||
||   生成分发文件:
||      ${dist.jar}
||
==================================================</echo>
<!-- 从打包文件排除单元测试 -->
<jar destfile="${dist.jar}" basedir="${build.classes.dir}" 
	includes="**/*.*" excludes="**/*Test.class">
<!-- manifest="MANIFEST.MF" > -->
<manifest>
<attribute name="Author" value="${author}"/>
</manifest>
</jar>
</target>
<!-- 用于调试-->
<target name="debug" depends="dist" description="调试"/>
<!-- 用于效验 -->
<target name="verify" depends="dist" description="效验"/>
<target name="run-deploy" depends="dist" description="部署:把文件部署到指定位置.">
<echo> ==================================================
||
||   把文件部署到指定位置:
||      ${deploy.war}
||
==================================================</echo>
<copy todir="${dist.dir}/WEB-INF/lib">
<fileset dir="${lib.dir}" includes="*.jar"/>
</copy>
<copy todir="${dist.dir}">
<fileset dir="${web.dir}" includes="**/*.*"/>
</copy>
<jar destfile="${deploy.war}" basedir="${dist.dir}" 
	includes="**/*.*" excludes="**/*Test.class">
<!-- manifest="MANIFEST.MF" > -->
{% endhighlight %}

