import Community from '@site/hasor-tech/Community';
import React, {useState} from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';
import useBaseUrl from '@docusaurus/useBaseUrl';
import DatabaseCodeIcon from '@site/static/img/api-styles/database-code.svg';
import AnnotationTagIcon from '@site/static/img/api-styles/tag.svg';
import TableOperationsIcon from '@site/static/img/api-styles/table-options.svg';
import FilterIcon from '@site/static/img/api-styles/filter.svg';
import CodeFileIcon from '@site/static/img/api-styles/file-code.svg';
import LicenseBadge from '@site/static/img/labels/license.svg';
import styles from './index.module.css';

/* ==================== Static Data ==================== */

const DatabaseGroups = [
    {
        id: 'relational',
        databases: [
            {name: 'MySQL', icon: 'mysql.svg', feature: 'mysql'},
            {name: 'MariaDB', icon: 'mariadb.svg'},
            {name: 'PostgreSQL', icon: 'postgresql.svg', feature: 'postgresql'},
            {name: 'Oracle', icon: 'oracle.svg', feature: 'oracle'},
            {name: 'SQL Server', icon: 'sqlserver.svg', feature: 'mssql'},
            {name: 'DB2', icon: 'ibmdb2.svg', feature: 'db2'},
            {name: 'DM', icon: 'dm.svg', feature: 'dm'},
            {name: 'Xugu', icon: 'xugu.svg'},
            {name: 'Informix', icon: 'informix.svg'},
            {name: 'TiDB', icon: 'tidb.svg'},
            {name: 'OceanBase', icon: 'oceanbase.svg'},
        ],
    },
    {
        id: 'embedded',
        databases: [
            {name: 'H2', icon: 'h2.svg', feature: 'h2'},
            {name: 'SQLite', icon: 'sqlite.svg'},
            {name: 'Derby', icon: 'derby.svg'},
            {name: 'HSQLDB', icon: 'hsqldb.svg'},
        ],
    },
    {
        id: 'analytics',
        databases: [
            {name: 'ClickHouse', icon: 'clickhouse.svg', feature: 'clickhouse'},
            {name: 'Greenplum', icon: 'greenplum.svg'},
            {name: 'SAP HANA', icon: 'hana.svg'},
            {name: 'Hive', icon: 'hive.svg'},
            {name: 'Impala', icon: 'impala.svg'},
            {name: 'StarRocks', icon: 'starrocks.svg'},
            {name: 'Doris', icon: 'doris.svg'},
        ],
    },
    {
        id: 'nosql',
        databases: [
            {name: 'Redis', icon: 'redis.svg', feature: 'redis'},
            {name: 'MongoDB', icon: 'mongodb.svg', feature: 'mongo'},
            {name: 'Elasticsearch', icon: 'elastic.svg', feature: 'elastic'},
            {name: 'Milvus', icon: 'milvus.svg', feature: 'milvus'},
        ],
    },
];

/* ==================== Hero Section ==================== */

function HeroSection() {
    const crab = useBaseUrl('/img/projects/dbvisitor.svg');
    return (
        <header className={styles.heroBanner}>
            <div className={clsx('container', styles.container, styles.heroLayout)}>
                <div>
                    <h1 className={styles.heroTitle}>dbVisitor</h1>
                    <p className={styles.heroSlogan}>One APIs Access Any DataBase</p>
                    <p className={styles.heroDesc}>
                        <Translate id="dbv.hero.desc">
                            承认差异、管理差异、而非消灭差异 —— 通过双层适配架构，通过统一 API 访问已支持的数据库。
                        </Translate>
                    </p>
                    <div className={styles.heroButtons}>
                        <Link className={clsx('button button--lg', styles.btnPrimary)}
                              to="/docs/guides/yourproject/with_java">
                            <Translate id="dbv.hero.getStarted">快速开始</Translate>
                        </Link>
                        <Link className={clsx('button button--lg', styles.btnSecondary)}
                              to="/docs/guides/overview">
                            <Translate id="dbv.hero.overview">认识 dbVisitor</Translate>
                        </Link>
                        <Link className={clsx('button button--lg', styles.btnSecondary)}
                              to="/docs/guides/search">
                            <Translate id="dbv.hero.docIndex">文档目录</Translate>
                        </Link>
                    </div>
                </div>
                <img className={styles.heroCrab} src={crab} alt="" width="216" height="216"/>
            </div>
        </header>
    );
}

/* ==================== Database Support Section ==================== */

function DatabaseItem({db}) {
    const iconUrl = useBaseUrl(`/img/ds_icons/${db.icon}`);
    const content = (
        <>
            <img src={iconUrl} className={styles.dbIcon} alt="" width="44" height="44"/>
            <span className={styles.dbLabel}>{db.name}</span>
        </>
    );

    if (db.feature) {
        return (
            <Link className={styles.dbItem} to={`/docs/features/${db.feature}/about`}>
                {content}
            </Link>
        );
    }
    return <div className={styles.dbItem}>{content}</div>;
}

function DatabaseSection() {
    return (
        <section className={styles.dbSection}>
            <div className={clsx('container', styles.container, styles.dbLayout)}>
                <div>
                    <h2 className={styles.sectionTitle}>
                        <Translate id="dbv.db.title">广泛的数据库支持</Translate>
                    </h2>
                    <p className={styles.sectionSubtitle}>
                        <Translate id="dbv.db.subtitle">
                            覆盖多种关系型数据库方言，并通过 JDBC 驱动适配器支持 NoSQL 和向量数据库
                        </Translate>
                    </p>
                </div>
                <div className={styles.dbGrid}>
                    {DatabaseGroups.map(group => (
                        <React.Fragment key={group.id}>
                            {group.databases.map(db => (
                                <DatabaseItem key={db.name} db={db}/>
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ==================== Architecture Section ==================== */

function ArchitectureSection() {
    const diagramUrl = useBaseUrl('/img/double.png');

    return (
        <section className={styles.archSection} aria-labelledby="dbv-architecture-title">
            <div className={clsx('container', styles.container)}>
                <h2 id="dbv-architecture-title" className={styles.sectionTitle}>
                    <Translate id="dbv.arch.title">双层适配架构</Translate>
                </h2>
                <figure className={styles.archDiagram}>
                    <img
                        src={diagramUrl}
                        alt="Dual-Layer Adapter Architecture"
                        className={styles.archImage}
                        loading="lazy"
                    />
                    <figcaption className={styles.archCaption}>
                        <div>
                            <strong><Translate id="dbv.arch.application.title">应用层</Translate></strong>
                            <span><Translate id="dbv.arch.application.desc">适配不同的查询方式。</Translate></span>
                        </div>
                        <div>
                            <strong><Translate id="dbv.arch.protocol.title">协议层</Translate></strong>
                            <span><Translate id="dbv.arch.protocol.desc">适配不同数据库的通信协议。</Translate></span>
                        </div>
                    </figcaption>
                </figure>
            </div>
        </section>
    );
}

/* ==================== 5 API Styles Section ==================== */

function CodeBlock({title, children}) {
    return (
        <div className={styles.codeBlock}>
            <div className={styles.codeHeader}>
                <span className={styles.codeTitle}>{title}</span>
            </div>
            <pre className={styles.codeContent}>{children}</pre>
        </div>
    );
}

function ApiStylesSection() {
    const [activeIdx, setActiveIdx] = useState(0);

    const apiStyles = [
        {
            Icon: DatabaseCodeIcon,
            name: 'JdbcTemplate',
            desc: translate({id: 'dbv.api.jdbc.desc', message: '原生 SQL 操作，最直接的数据库访问方式'}),
            docLink: '/docs/guides/api/jdbc',
            code: (s) => (<>
                <span className={s.codeType}>{'JdbcTemplate'}</span>{' jdbc = '}<span className={s.codeKeyword}>{'new'}</span>{' '}<span className={s.codeType}>{'JdbcTemplate'}</span>{'(dataSource);\n\n'}
                <span className={s.codeComment}>{translate({id: 'dbv.api.jdbc.c1', message: '// 查询映射到 Bean'}) + '\n'}</span>
                <span className={s.codeType}>{'List'}</span>{'<'}<span className={s.codeType}>{'User'}</span>{'>'}{' users = jdbc.'}<span className={s.codeMethod}>{'queryForList'}</span>{'(\n'}
                {'    '}<span className={s.codeString}>{'"select * from users where age > ?"'}</span>{',\n'}
                {'    '}<span className={s.codeKeyword}>{'new'}</span>{' '}<span className={s.codeType}>{'Object'}</span>{'[] { '}<span className={s.codeString}>{'18'}</span>{' },\n'}
                {'    '}<span className={s.codeType}>{'User'}</span>{'.class\n);\n\n'}
                <span className={s.codeComment}>{translate({id: 'dbv.api.jdbc.c2', message: '// 查询单值'}) + '\n'}</span>
                <span className={s.codeType}>{'Long'}</span>{' total = jdbc.'}<span className={s.codeMethod}>{'queryForObject'}</span>{'(\n'}
                {'    '}<span className={s.codeString}>{'"select count(*) from users"'}</span>{',\n'}
                {'    '}<span className={s.codeType}>{'Long'}</span>{'.class\n);\n'}
            </>),
        },
        {
            Icon: AnnotationTagIcon,
            name: translate({id: 'dbv.api.annotation.name', message: '声明式接口'}),
            desc: translate({id: 'dbv.api.annotation.desc', message: '声明式接口 + 注解，类似 MyBatis Mapper'}),
            docLink: '/docs/guides/api/mapper',
            code: (s) => (<>
                <span className={s.codeKeyword}>{'@SimpleMapper'}</span>{'\n'}
                <span className={s.codeKeyword}>{'public interface'}</span>{' '}<span className={s.codeType}>{'UserMapper'}</span>{' {\n'}
                {'    '}<span className={s.codeKeyword}>{'@Query'}</span>{'('}<span className={s.codeString}>{'"select * from users where id = #{id}"'}</span>{')\n'}
                {'    '}<span className={s.codeType}>{'User'}</span>{' '}<span className={s.codeMethod}>{'selectById'}</span>{'('}<span className={s.codeKeyword}>{'@Param'}</span>{'('}<span className={s.codeString}>{'"id"'}</span>{') '}<span className={s.codeType}>{'int'}</span>{' id);\n\n'}
                {'    '}<span className={s.codeKeyword}>{'@Insert'}</span>{'('}<span className={s.codeString}>{'"insert into users (name, age) values (#{name}, #{age})"'}</span>{')\n'}
                {'    '}<span className={s.codeType}>{'int'}</span>{' '}<span className={s.codeMethod}>{'insertUser'}</span>{'('}
                            <span className={s.codeKeyword}>{'@Param'}</span>{'('}<span className={s.codeString}>{'"name"'}</span>{') '}<span className={s.codeType}>{'String'}</span>{' name, '}
                            <span className={s.codeKeyword}>{'@Param'}</span>{'('}<span className={s.codeString}>{'"age"'}</span>{')  '}<span className={s.codeType}>{'int'}</span>{' age);\n}\n'}
            </>),
        },
        {
            Icon: TableOperationsIcon,
            name: translate({id: 'dbv.api.base.name', message: '通用 Mapper'}),
            desc: translate({id: 'dbv.api.base.desc', message: '通用 CRUD 操作，零 SQL 快速开发'}),
            docLink: '/docs/guides/core/mapper/about',
            code: (s) => (<>
                <span className={s.codeType}>{'BaseMapper'}</span>{'<'}<span className={s.codeType}>{'User'}</span>{'>'}{' mapper = session.'}<span className={s.codeMethod}>{'createBaseMapper'}</span>{'('}<span className={s.codeType}>{'User'}</span>{'.class);\n\n'}
                <span className={s.codeComment}>{translate({id: 'dbv.api.base.c1', message: '// 主键查询'}) + '\n'}</span>
                <span className={s.codeType}>{'User'}</span>{' user = mapper.'}<span className={s.codeMethod}>{'selectById'}</span>{'('}<span className={s.codeString}>{'1'}</span>{');\n\n'}
                <span className={s.codeComment}>{translate({id: 'dbv.api.base.c2', message: '// 更新已存在的用户'}) + '\n'}</span>
                {'if (user != null) {\n    user.'}<span className={s.codeMethod}>{'setAge'}</span>{'('}<span className={s.codeString}>{'30'}</span>{');\n'}
                {'    mapper.'}<span className={s.codeMethod}>{'update'}</span>{'(user);\n}\n\n'}
                <span className={s.codeComment}>{translate({id: 'dbv.api.base.c3', message: '// 主键删除'}) + '\n'}</span>
                {'mapper.'}<span className={s.codeMethod}>{'deleteById'}</span>{'('}<span className={s.codeString}>{'1'}</span>{');\n'}
            </>),
        },
        {
            Icon: FilterIcon,
            name: translate({id: 'dbv.api.lambda.name', message: '条件构造器'}),
            desc: translate({id: 'dbv.api.lambda.desc', message: 'Lambda 表达式构建查询，类型安全'}),
            docLink: '/docs/guides/api/lambda',
            code: (s) => (<>
                <span className={s.codeType}>{'LambdaTemplate'}</span>{' lambda = '}<span className={s.codeKeyword}>{'new'}</span>{' '}<span className={s.codeType}>{'LambdaTemplate'}</span>{'(dataSource);\n\n'}
                <span className={s.codeComment}>{translate({id: 'dbv.api.lambda.c1', message: '// 类型安全的 Lambda 查询'}) + '\n'}</span>
                <span className={s.codeType}>{'List'}</span>{'<'}<span className={s.codeType}>{'User'}</span>{'>'}{' users = lambda.'}<span className={s.codeMethod}>{'query'}</span>{'('}<span className={s.codeType}>{'User'}</span>{'.class)\n'}
                {'                         .'}<span className={s.codeMethod}>{'eq'}</span>{'('}<span className={s.codeType}>{'User'}</span>{'::'}<span className={s.codeMethod}>{'getName'}</span>{', '}<span className={s.codeString}>{'"Alice"'}</span>{')\n'}
                {'                         .'}<span className={s.codeMethod}>{'ge'}</span>{'('}<span className={s.codeType}>{'User'}</span>{'::'}<span className={s.codeMethod}>{'getAge'}</span>{', '}<span className={s.codeString}>{'20'}</span>{')\n'}
                {'                         .'}<span className={s.codeMethod}>{'queryForList'}</span>{'();\n'}
            </>),
        },
        {
            Icon: CodeFileIcon,
            name: 'XML Mapper',
            desc: translate({id: 'dbv.api.xml.desc', message: 'XML 定义 SQL 映射，兼容 MyBatis 风格'}),
            docLink: '/docs/guides/api/file_mapper',
            code: (s) => (<>
                <span className={s.codeComment}>{translate({id: 'dbv.api.xml.c1', message: '// XML 定义（userMapper.xml）'}) + '\n'}</span>
                <span className={s.codeKeyword}>{'<select'}</span>{' '}<span className={s.codeType}>{'id'}</span>{'='}<span className={s.codeString}>{'"selectById"'}</span>{' '}<span className={s.codeType}>{'resultType'}</span>{'='}<span className={s.codeString}>{'"com.example.User"'}</span><span className={s.codeKeyword}>{'>'}</span>{'\n'}
                {'  '}<span className={s.codeString}>{'select * from users where id = #{id}'}</span>{'\n'}
                <span className={s.codeKeyword}>{'</select>'}</span>{'\n\n'}
                <span className={s.codeComment}>{translate({id: 'dbv.api.xml.c2', message: '// Java 接口'}) + '\n'}</span>
                <span className={s.codeKeyword}>{'@RefMapper'}</span>{'('}<span className={s.codeString}>{'"userMapper.xml"'}</span>{')\n'}
                <span className={s.codeKeyword}>{'public interface'}</span>{' '}<span className={s.codeType}>{'UserMapper'}</span>{' {\n'}
                {'    '}<span className={s.codeType}>{'User'}</span>{' '}<span className={s.codeMethod}>{'selectById'}</span>{'('}<span className={s.codeKeyword}>{'@Param'}</span>{'('}<span className={s.codeString}>{'"id"'}</span>{') '}<span className={s.codeType}>{'int'}</span>{' id);\n}\n'}
            </>),
        },
    ];

    const current = apiStyles[activeIdx];

    return (
        <section className={styles.apiSection}>
            <div className={clsx('container', styles.container)}>
                <h2 className={styles.sectionTitle}>
                    <Translate id="dbv.api.title">5 种 API 风格</Translate>
                </h2>
                <p className={styles.sectionSubtitle}>
                    <Translate id="dbv.api.subtitle">
                        选择最适合场景的 API，所有风格共享同一套底层运行机制。
                    </Translate>
                </p>

                {/* Tab buttons */}
                <div className={styles.apiTabs}>
                    {apiStyles.map((api, idx) => (
                        <button
                            key={api.docLink}
                            className={clsx(styles.apiTab, idx === activeIdx && styles.apiTabActive)}
                            type="button"
                            aria-pressed={idx === activeIdx}
                            aria-controls="api-example"
                            onClick={() => { setActiveIdx(idx); }}
                        >
                            <api.Icon className={styles.apiTabIcon} aria-hidden="true" focusable="false"/>
                            <span className={styles.apiTabName}>{api.name}</span>
                        </button>
                    ))}
                </div>

                {/* Content: description + code */}
                <div id="api-example" className={styles.apiShowcase}>
                    <div className={styles.apiInfo}>
                        <div className={styles.apiInfoHeading}>
                            <div className={styles.apiInfoIcon}>
                                <current.Icon aria-hidden="true" focusable="false"/>
                            </div>
                            <h3 className={styles.apiInfoTitle}>{current.name}</h3>
                        </div>
                        <p className={styles.apiInfoDesc}>{current.desc}</p>
                        <Link className="button button--primary button--sm" to={current.docLink}>
                            <Translate id="dbv.api.viewDoc">查看文档</Translate> →
                        </Link>
                    </div>
                    <div className={styles.apiCode}>
                        {apiStyles.map((api, idx) => (
                            <pre key={api.docLink} className={clsx(styles.codeBlock, styles.codeContent)}
                                 aria-hidden={idx !== activeIdx}>
                                <code>{api.code(styles)}</code>
                            </pre>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ==================== Code Example Section (One APIs, Any DB) ==================== */

function CodeExampleSection() {
    return (
        <section className={styles.codeSection}>
            <div className={clsx('container', styles.container)}>
                <h2 className={styles.sectionTitle}>
                    <Translate id="dbv.code.title">同一套 API，不同的数据库</Translate>
                </h2>
                <p className={styles.sectionSubtitle}>
                    <Translate id="dbv.code.subtitle">
                        在驱动支持的范围内复用 API，SQL、字段映射和事务能力仍取决于数据源
                    </Translate>
                </p>
                <div className={styles.codeContainer}>
                    <CodeBlock title="MySQL / PostgreSQL">
                        <span className={styles.codeComment}>{translate({id: 'dbv.code.comment.rdb', message: '// 连接关系型数据库'}) + '\n'}</span>
                        <span className={styles.codeType}>{'Configuration'}</span>{' config = '}<span className={styles.codeKeyword}>{'new'}</span>{' '}<span className={styles.codeType}>{'Configuration'}</span>{'();\n'}
                        <span className={styles.codeType}>{'LambdaTemplate'}</span>{' t = config.'}<span className={styles.codeMethod}>{'newLambda'}</span>{'(ds);\n\n'}
                        <span className={styles.codeComment}>{translate({id: 'dbv.code.comment.lambda', message: '// Lambda 查询'}) + '\n'}</span>
                        <span className={styles.codeType}>{'List'}</span>{'<'}<span className={styles.codeType}>{'User'}</span>{'>'}{' users = t.'}<span className={styles.codeMethod}>{'query'}</span>{'('}<span className={styles.codeType}>{'User'}</span>{'.class)\n'}
                        {'                    .'}<span className={styles.codeMethod}>{'eq'}</span>{'('}<span className={styles.codeType}>{'User'}</span>{'::'}<span className={styles.codeMethod}>{'getAge'}</span>{', '}<span className={styles.codeString}>{'18'}</span>{')\n'}
                        {'                    .'}<span className={styles.codeMethod}>{'queryForList'}</span>{'();\n'}
                    </CodeBlock>

                    <CodeBlock title="MongoDB / Elasticsearch">
                        <span className={styles.codeComment}>{translate({id: 'dbv.code.comment.nosql', message: '// 连接 NoSQL 数据库（同一套 API）'}) + '\n'}</span>
                        <span className={styles.codeType}>{'Configuration'}</span>{' config = '}<span className={styles.codeKeyword}>{'new'}</span>{' '}<span className={styles.codeType}>{'Configuration'}</span>{'();\n'}
                        <span className={styles.codeType}>{'LambdaTemplate'}</span>{' t = config.'}<span className={styles.codeMethod}>{'newLambda'}</span>{'(ds);\n\n'}
                        <span className={styles.codeComment}>{translate({id: 'dbv.code.comment.same', message: '// 完全相同的 Lambda 查询'}) + '\n'}</span>
                        <span className={styles.codeType}>{'List'}</span>{'<'}<span className={styles.codeType}>{'User'}</span>{'>'}{' users = t.'}<span className={styles.codeMethod}>{'query'}</span>{'('}<span className={styles.codeType}>{'User'}</span>{'.class)\n'}
                        {'                    .'}<span className={styles.codeMethod}>{'eq'}</span>{'('}<span className={styles.codeType}>{'User'}</span>{'::'}<span className={styles.codeMethod}>{'getAge'}</span>{', '}<span className={styles.codeString}>{'18'}</span>{')\n'}
                        {'                    .'}<span className={styles.codeMethod}>{'queryForList'}</span>{'();\n'}
                    </CodeBlock>
                </div>
            </div>
        </section>
    );
}

/* ==================== Bottom CTA Section ==================== */

function CtaSection() {
    return (
        <section className={styles.ctaSection} aria-labelledby="dbv-community-title">
            <div className={clsx('container', styles.container)}>
                <Community>
                    <div className={styles.ctaHeading}>
                        <h2 id="dbv-community-title" className={styles.ctaTitle}>
                            <Translate id="dbv.cta.title">加入社区</Translate>
                        </h2>
                        <a className={styles.licenseBadge} href="https://www.apache.org/licenses/LICENSE-2.0.html"
                           target="_blank" rel="noopener noreferrer" aria-label="Apache License 2.0">
                            <LicenseBadge aria-hidden="true" focusable="false"/>
                        </a>
                    </div>
                    <p className={styles.ctaDesc}>
                        <Translate id="dbv.cta.desc">交流使用经验、反馈问题，参与 dbVisitor 的改进。</Translate>
                    </p>
                </Community>
            </div>
        </section>
    );
}

/* ==================== Page Entry ==================== */

export default function Home() {
    return (
        <Layout>
            <HeroSection/>
            <main>
                <DatabaseSection/>
                <ApiStylesSection/>
                <CodeExampleSection/>
                <ArchitectureSection/>
            </main>
            <CtaSection/>
        </Layout>
    );
}
