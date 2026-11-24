// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const {themes} = require('prism-react-renderer');
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;
const {onlineOrigins} = require('./hasor-tech/routes');
const projectVars = require('./plugins/projectVars.js');
const remarkProjectVars = require('./plugins/remark-project-vars.js');

/** @type {import('@docusaurus/types').Config} */
const config = require('./hasor-tech/config')({
    title: 'dbVisitor - Java 数据库开发工具',
    tagline: 'dbVisitor Java 数据库开发工具',
    url: process.env.DOCS_URL || onlineOrigins.dbvisitor,
    baseUrl: process.env.DOCS_BASE_URL || '/',
    onBrokenLinks: 'throw',
    markdown: {
        preprocessor: ({fileContent}) => remarkProjectVars.replaceVariables(fileContent, projectVars),
        parseFrontMatter: ({filePath, fileContent, defaultParseFrontMatter}) => defaultParseFrontMatter({
            filePath,
            fileContent: remarkProjectVars.replaceVariables(fileContent, projectVars),
        }),
    },
    favicon: 'img/favicon/crab.ico',
    organizationName: 'HasorTech', // Usually your GitHub org/user name.
    projectName: 'dbVisitor',   // Usually your repo name.
    i18n: {
        defaultLocale: 'zh-cn',
        locales: ['zh-cn', 'en'],
    },
    presets: [
        [
            'classic',
            /** @type {import('@docusaurus/preset-classic').Options} */
            {
                docs: {
                    path: 'docs/cn/docusaurus-plugin-content-docs/current',
                    remarkPlugins: [[remarkProjectVars, projectVars]],
                    sidebarPath: require.resolve('./sidebars.js'),
                    async sidebarItemsGenerator({defaultSidebarItemsGenerator, ...args}) {
                        const items = await defaultSidebarItemsGenerator(args);
                        // The overview is the landing page of the differences category.
                        return args.item.dirName === 'features'
                            ? items.filter(item => !(item.type === 'doc' && item.id === 'features/overview'))
                            : items;
                    },
                    editLocalizedFiles: true,
                    editUrl: 'https://gitee.com/hasortech/dbvisitor/blob/main/dbvisitor-doc/',
                },
                blog: false,
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            }
        ],
    ],
    themeConfig: /** @type {import('@docusaurus/preset-classic').ThemeConfig} */ {
        metadata: [
            {
                name: 'keywords',
                content: 'orm,mybatis,mybatis plus,dbvisitor,jooq,spring,springboot,spring框架,jdbc,jdbctemplate,spring orm,开源,开源软件,java开源,开源项目,开源代码'
            },
            {
                name: 'description',
                content: 'dbVisitor 是一个轻量小巧的数据库 ORM 工具，提供ORM、丰富的TypeHandler、动态SQL、存储过程、 内置分页方言20+、支持嵌套事务、多数据源、条件构造器、INSERT 策略、多语句/多结果。兼容 Spring 及 MyBatis 用法。'
            }
        ],
        colorMode: {
            disableSwitch: true,
        },
        prism: {
            theme: lightCodeTheme,
            darkTheme: darkCodeTheme,
            additionalLanguages: ['java']
        },
        footer: {
            style: 'dark',
            copyright: `Copyright © ${new Date().getFullYear()} dbVisitor. Built with Docusaurus.`,
        },
    },
    plugins: [
        [
            require.resolve('./plugins/llms.js'),
            {
                siteTitle: 'dbVisitor',
                overview: 'guides/overview.mdx',
                descriptions: {
                    'zh-cn': `dbVisitor ${projectVars.docsVersion} 文档：Java 数据库 API、数据源特性、JDBC 驱动和实战教程。开发版本在版本说明中单独标注。`,
                    en: `dbVisitor ${projectVars.docsVersion} documentation: Java database APIs, data source capabilities, JDBC drivers, and tutorials. Development releases are marked separately.`,
                },
                depth: 2,
                onRouteError: 'throw',
                content: {
                    enableMarkdownFiles: false,
                    enableLlmsFullTxt: false,
                    includeDocs: true,
                    includeBlog: false,
                    includePages: false,
                    includeGeneratedIndex: false,
                    excludeRoutes: [
                        '**/tags{,/**}', '**/search', '**/404.html',
                    ],
                    contentSelectors: ['.theme-doc-markdown', 'article'],
                },
            },
        ],
    ],
    themes: [
        // ... Your other themes.
        [
            require.resolve("@easyops-cn/docusaurus-search-local"),
            /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
            ({
                // ... Your options.
                // `hashed` is recommended as long-term-cache of index file is possible.
                hashed: true,
                indexBlog: false,
                // For Docs using Chinese, The `language` is recommended to set to:
                language: ["en", "zh"],
            }),
        ],
    ]
}, 'dbvisitor');

module.exports = config;
