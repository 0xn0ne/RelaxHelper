# Relax Helper

简体中文 | [English](./README_EN.md)

使用 Vue + Bootstrap 开发的 Goby 插件，目前拥有以下功能：

+ 导出 Goby 扫描任务的数据
+ 使用 AWVS 扫描 WEB 系统
+ 导出 AWVS 扫描任务的漏洞数据
+ 使用 FOFA 信息收集（需VIP）
+ 将 FOFA 收集到的 IP 添加至 Goby 新建扫描任务中

**注意：**

+ 导出数据默认导出至插件文件夹的 datadir 目录下

## 快速开始

1. 通过扩展商店安装
2. （可跳过）配置好 AWVS 或 FOFA 的设置
3. 右侧工具栏处点击图标打开 Relax 控制面板
4. 开始操作

### 手动安装

#### 依赖

+ nodejs v16+

#### 操作步骤

1. 下载本插件文件
2. 将文件复制到 Goby 的 extensions 插件目录
3. 进入到本插件目录下，使用 `npm install` 命令安装插件依赖
4. 重启 Goby 即可

+ Windows 插件目录：C:\Users\当前用户名\goby\extensions\
+ Mac 插件目录：/Users/当前用户名/goby/extensions/

### 使用说明

+ 做操作的时候没有弹出提示可能说明连接失败之类的情况，检查一下 AWVS 或 FOFA 的配置是否正确或者能正常连接
+ 很久不碰代码了，写得有点乱，我自己看着都头疼，目前还没有弄其他功能打算
+ 这是 1 个月赶出来的东西，不要抱太大期望
+ 如果有 BUG 请提 Issues

## 操作演示

![操作演示](./src/assets/images/demo.gif)
