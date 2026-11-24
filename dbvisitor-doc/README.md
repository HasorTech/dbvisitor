# dbVisitor 文档

在线文档：https://www.hasor.net/dbvisitor/

- 中文使用指南：`docs/cn/docusaurus-plugin-content-docs/current/guides/`
- JDBC 驱动手册：`docs/cn/docusaurus-plugin-content-docs/current/drivers/`
- 数据源特性：`docs/cn/docusaurus-plugin-content-docs/current/features/`
- 版本说明：`docs/cn/docusaurus-plugin-content-docs/current/releases/`
- 英文文档：`docs/en/docusaurus-plugin-content-docs/current/`

## 本地预览

在此目录安装依赖并启动 Docusaurus。Node.js 版本须满足所安装 Docusaurus 的要求。

```sh
npm install
npm run start:alone
```

构建中英文静态站点：

```sh
npm run build
```

本目录用于构建文档站，不是 dbVisitor Java 模块的构建入口。

## AI 文档索引

`npm run build` 通过 `@signalwire/docusaurus-plugin-llms-txt` 收集现有文档页面，再由 `plugins/llms.js` 整理项目介绍和目录。每种语言只生成一个入口：门户构建输出中的 `build/cn/dbvisitor/llms.txt` 和 `build/en/dbvisitor/llms.txt`；文档构建与本地开发只需要 Node.js 依赖环境。

索引先说明项目定位、架构、能力选择和第一次调用流程，再列出使用指南、驱动和数据源能力等文档。版本说明位于 `Optional` 部分，链接直接指向相应语言的现有网页。页面的 `rel="describedby"` 指向当前语言的 `llms.txt`。

入口介绍复用中英文概览正文。`docusaurus.config.js` 中的 `overview` 指定每种语言文档目录下的 `guides/overview.mdx`；插件读取对应语言文件中 `{/* llms:start */}` 与 `{/* llms:end */}` 之间的普通 Markdown。维护项目定位、架构与起步流程时修改这段正文即可，文档页面和 AI 入口会一起更新。

摘要中的链接使用实际发布地址，可写成相对于概览的路径；插件会移除 `.md`、`.mdx` 扩展名并补齐站点地址与语言前缀。文档版本来自 `plugins/projectVars.js`，使用前应核对项目依赖版本。

可以向编程助手提供以下指引：

> 先读取本项目的 `/llms.txt`，理解核心理念与适用场景，选择对应的使用指南。核对项目依赖版本，再参考文档中的调用方式与示例编写代码并编译验证。

索引随静态站点发布，不手工修改或提交生成文件。`npm run start:alone` 用于开发文档页面；查看完整索引使用构建后的站点：

```bash
npm run build
npm run serve -- --host 127.0.0.1 --port 3000
```

## 博客

博客源码与配图由门户工程 `www` 维护。阅读入口为 [中文博客](https://www.hasor.net/cn/blog/dbvisitor/) 和 [English blog](https://www.hasor.net/en/blog/dbvisitor/)。配套可运行示例由本仓库的 `dbvisitor-example/` 提供。

## 文档版本变量

`plugins/projectVars.js` 统一维护版本：`docsVersion` 用于使用指南及通用依赖示例，`jdbcDriverVersion` 用于四个非关系型 JDBC 驱动的依赖示例和 `alone` 下载链接，`developmentVersion` 用于开发版本入口，`lastReleaseVer`、`lastReleaseTime` 用于最新发布信息。首页也从此文件读取版本。

Markdown/MDX 正文、行内代码、代码块和链接可使用 `@project.docsVersion@`、`@project.jdbcDriverVersion@`、`@project.lastReleaseVer@`、`@project.lastReleaseTime@`。构建后显示和复制的内容均为实际值；变量名拼错会使构建失败。

```xml
<version>@project.docsVersion@</version>
```

修改后重新构建，本地预览需重启。历史版本、兼容性最低版本及第三方依赖版本保持固定，不随当前版本变化。此配置不修改 Java 工程或文档站 package.json 的版本。

## 部署到 OSS 并刷新 CDN

两站点使用同一配置结构和发布流程，但各自的 `deploy_site.py` 固定绑定 `dbvisitor` 或 `hasor`，不会按工作目录猜测目标，也不会选择配置中的第一个站点。

### 配置

在 `~/.hasor-docs-deploy.json` 中配置发布目标，字段见 `oss-config.sample.json`。门户使用 `sites.portal`，独立站使用 `sites.dbvisitor`。

- `credentials`：按名称管理 AccessKey。站点通过 `credential` 引用，可共享凭据，也可使用不同凭据。
- `sites.<站点>.endpoint`、`bucketName`：OSS 上传目标。
- `prefix`：Bucket 内的目录，空字符串表示根目录；例如 `docs/hasor/`。上传保留该前缀下的中英文相对路径。
- `cdnUrl`：该站点要刷新的完整目录地址；可选 `cdnRegionId` 默认 `cn-hangzhou`。

需要显式指定其他配置文件时，设置环境变量，不存在或无效时直接报错，不回退：

```bash
HASOR_DOCS_DEPLOY_CONFIG=/absolute/path/docs-deploy.json ./deploy.sh
```

旧的 `~/.dbvisitor-oss-config.json`、`~/.hasor-oss-config.json` 和工程内 `oss-config.json` 不再自动读取。请把旧配置中的凭据迁入 `credentials`，上传目标及 CDN 地址迁入对应 `sites` 节点。脚本不会自动迁移或删除旧文件。配置含密钥，不要提交到 Git；建议设置 `chmod 600 ~/.hasor-docs-deploy.json`。

### 目标隔离

门户模式使用共享目标，在发布前缀下写入 `cn/dbvisitor/`、`en/dbvisitor/` 和自动选语言的 `dbvisitor/` 入口。独立模式在本项目配置的前缀下写入 `cn/`、`en/` 与根入口。门户可以复用完全相同的 Hasor 目标配置，其他重叠目标会被校验拒绝。

### 执行发布

需要 Node.js 20+、npm、Python 3（含 venv 和 pip），支持 Linux/macOS。首次使用或前端依赖更新后，在本目录执行 `npm ci`，随后执行：

```bash
./deploy.sh --mode portal --dry-run
```

脚本通过 `.deploy-venv` 安装 Python 依赖，然后构建中英文站点。`--dry-run` 只验证产物和发布清单。实际发布使用相同模式并去掉该参数后，脚本会上传构建产物并提交 CDN 刷新。任一步失败即返回非零状态；构建或上传失败不会继续刷新 CDN。一次完整发布只读取一次配置，上传和刷新使用同一份目标信息。

发布锁覆盖构建、上传和刷新，锁文件在 `~/.cache/hasor-docs-deploy/`。同一台机器、同一用户下，相同站点跨工作副本也不能同时发布；门户模式和 Hasor 共享目标锁。锁在退出时释放，不要删除使用中的锁文件。多机器或不同系统用户的并发发布需要在 CI 中另行串行化。

上传覆盖目标前缀下的同名文件，不删除远端旧文件，不是原子发布。部分上传成功后失败，需修复原因并重新执行；CDN 刷新请求被接受也不代表所有节点已完成刷新。凭据需具有目标上传及 CDN 刷新权限。

脚本可从任意工作目录调用。虚拟环境准备好后，也可以在本目录单独执行：

```bash
# 只构建和上传
.deploy-venv/bin/python deploy_to_oss.py

# 只刷新当前站点 CDN
.deploy-venv/bin/python refresh_website_cdn.py
```

两个独立入口同样使用配置校验和站点锁。`npm run deploy:docusaurus` 是 Docusaurus 自带的部署命令，不等同于 OSS/CDN 的 `./deploy.sh`。
