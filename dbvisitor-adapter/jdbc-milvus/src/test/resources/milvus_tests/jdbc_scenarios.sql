-- 强制限制返回 5 条记录，跳过前 10 条
/*+ overwrite_find_limit=5, overwrite_find_skip=10 */
SELECT * FROM table_name WHERE status = 1;

-- 使用 Hint 获取匹配条件的记录总数 (等同于 count from ... where ...)
/*+ overwrite_find_as_count=true */
SELECT * FROM table_name WHERE age > 20;
-- next scenario
SELECT id, title FROM books WHERE id IN (?, ?) LIMIT ?;
UPDATE books SET title = ? WHERE id = ?;
-- next scenario
CREATE TABLE array_docs (
    id INT64 PRIMARY KEY, v FLOAT_VECTOR(2),
    numbers ARRAY<INT64>(16), tags ARRAY<VARCHAR(30)>(8) NULL
);
INSERT INTO array_docs (id,v,numbers,tags) VALUES (?, ?, ?, ?);
-- next scenario
CREATE TABLE types_demo (
    id INT64 PRIMARY KEY AUTO_ID,
    tags ARRAY<VARCHAR(30)>(8) NULL,
    flags ARRAY<BOOL>(8),
    bits BINARY_VECTOR(16),
    half FLOAT16_VECTOR(2),
    brain BFLOAT16_VECTOR(2),
    sparse SPARSE_FLOAT_VECTOR
);
INSERT INTO types_demo (tags,flags,bits,half,brain,sparse) VALUES (?, ?, ?, ?, ?, ?);
SELECT id,bits FROM types_demo ORDER BY bits ~= ? LIMIT 10;
SELECT id,score FROM types_demo WHERE bits <%> ? < 0.5 LIMIT 10;
SELECT id,half FROM types_demo ORDER BY half <=> ? LIMIT 10;
SELECT id,brain FROM types_demo ORDER BY brain <-> ? LIMIT 10;
SELECT id,sparse FROM types_demo ORDER BY sparse <#> ? LIMIT 10;
SELECT id,tags FROM types_demo WHERE tags IS NOT NULL LIMIT 10;
-- next scenario
CREATE TABLE json_docs (id INT64 PRIMARY KEY, v FLOAT_VECTOR(2), payload JSON NULL);
INSERT INTO json_docs (id,v,payload) VALUES (?, ?, ?);
-- next scenario
-- 查询全表总数
count from table_name;
SELECT COUNT(*) FROM table_name;

-- 查询指定分区的总数
COUNT FROM table_name PARTITION partition_name;

-- 带条件过滤的总数 (支持标量过滤)
count from table_name where age > 18;
-- next scenario
SELECT id,score FROM docs WHERE id > ? ORDER BY HYBRID (
    dense <-> ? LIMIT 20 WITH (nprobe=10),
    sparse <?> ? LIMIT 30
) LIMIT 10 OFFSET 2 WITH (reranker='rrf',k=60);

SELECT id,score FROM docs ORDER BY HYBRID (
    dense <=> ? LIMIT 20,
    sparse <#> ? LIMIT 30
) LIMIT 10 WITH (reranker='weighted',weights='[0.7,0.3]');
-- next scenario
SELECT id,score FROM docs WHERE tenant_id = ? ORDER BY HYBRID (
    dense <-> ? WHERE category = ? OR category = ? LIMIT 20 WITH(timezone='UTC',nprobe=10),
    sparse <?> ? WHERE publish_year >= ? LIMIT 30 WITH(timezone=?)
) LIMIT 10 WITH(reranker='rrf',k=60,round_decimal=3);
-- next scenario
SELECT 'keep alive';
SELECT 1;
SELECT ?;
-- next scenario
-- 查询所有字段
SELECT * FROM table_name;

-- 带条件过滤
SELECT * FROM table_name WHERE age > 20 AND status = 1;

-- 指定返回字段与分页
SELECT id, name FROM table_name LIMIT 10 OFFSET 0;

-- 查询指定分区
SELECT * FROM table_name PARTITION partition_name WHERE tag = 'A';
-- next scenario
SELECT id FROM books WHERE id > ? LIMIT ? WITH(ignore_growing=?,timezone=?);
SELECT COUNT(*) FROM books WHERE id > ? WITH(ignore_growing=?,timezone=?);
COUNT FROM books WITH(ignore_growing=false,timezone='UTC');
-- next scenario
-- 基本搜索 (KNN, 默认参数)
SELECT * FROM table_name ORDER BY vector_col <-> [0.1, 0.2] LIMIT 10;

-- 带前置过滤的搜索
SELECT * FROM table_name WHERE category = 'book' ORDER BY vector_col <-> [0.1, 0.2] LIMIT 5;

-- 范围搜索/距离过滤 (Range Search)
-- 方式1：使用 vector_range 函数 (推荐)
SELECT * FROM table_name WHERE vector_range(vector_col, [0.1, 0.2], 0.8) LIMIT 5;

-- 方式2：使用比较表达式 (WHERE vector_col <-> [vector] < distance_threshold)
SELECT * FROM table_name WHERE vector_col <-> [0.1, 0.2] < 0.8 LIMIT 5;
-- next scenario
SELECT id, score FROM table_name
WHERE age > ?
ORDER BY vector_col <=> ?
LIMIT ? OFFSET ?
WITH (metric_type='COSINE', nprobe=?);
-- next scenario
SELECT id, category, score FROM books ORDER BY vector_col <-> ?
WITH (group_by_field='category', group_limit=3, group_size=2, strict_group_size=true);

SELECT id, category FROM books ORDER BY vector_col <-> ? LIMIT 3 OFFSET 1
WITH (group_by_field='category', group_limit=2, group_offset=1, group_size=2, strict_group_size=true);
-- next scenario
SELECT id,category,score FROM books ORDER BY HYBRID (
    vector_col <-> ? LIMIT 20,
    other_vector <-> ? LIMIT 20
) WITH (reranker='rrf',group_by_field='category',group_limit=3,group_size=2,strict_group_size=true);
-- next scenario
-- 删除全部记录，保留集合及其 schema、索引
DELETE FROM table_name;

-- 最多删除 1000 条；不指定排序时不保证具体选中哪些记录
DELETE FROM table_name LIMIT 1000;

-- 仅删除指定分区的全部记录
DELETE FROM table_name PARTITION partition_name;

-- 按主键删除
DELETE FROM table_name WHERE id = 1;
DELETE FROM table_name WHERE id IN [1, 2, 3];

-- 按标量条件删除 (无 LIMIT 时直接调用服务端过滤删除)
DELETE FROM table_name WHERE age > 18 AND status = 'inactive';

-- 指定分区删除
DELETE FROM table_name PARTITION partition_name WHERE age > 10;
-- next scenario
-- 删除距离 [0.1, 0.2] 最近的 100 条记录
DELETE FROM table_name ORDER BY vector_col <-> [0.1, 0.2] LIMIT 100;

-- 结合标量过滤：删除 category='book' 且最相似的 10 条
DELETE FROM table_name WHERE category = 'book' ORDER BY vector_col <-> [0.1, 0.2] LIMIT 10;
-- next scenario
-- 使用 vector_range 函数 (推荐)
DELETE FROM table_name WHERE vector_range(vector_col, [0.1, 0.2], 0.5);

-- 使用比较表达式：删除所有距离 [0.1, 0.2] 小于 0.5 的记录
DELETE FROM table_name WHERE vector_col <-> [0.1, 0.2] < 0.5;

-- 结合 LIMIT 进行保护 (最多删除符合条件的 1000 条)
DELETE FROM table_name WHERE vector_range(vector_col, [0.1, 0.2], 0.5) LIMIT 1000;
-- next scenario
-- 文件必须预先放入 Milvus 可访问的对象存储
IMPORT FROM 'prepared/1.parquet' INTO TABLE table_name;
IMPORT FROM 'prepared/1.json' INTO TABLE table_name PARTITION partition_name;

-- 等待导入任务完成，最多等待 60 秒
/*+ timeout=60000 */ IMPORT FROM 'prepared/1.json' INTO TABLE table_name;

-- 仅提交导入任务，不等待完成
/*+ sync=false */ IMPORT FROM 'prepared/1.json' INTO TABLE table_name;
-- next scenario
/*+ sync=false */ IMPORT FROM [['prepared/a.parquet'],['prepared/b.parquet']]
    INTO docs WITH (timeout='2h') RETURNING JOB_ID;
/*+ sync=false */ IMPORT FROM [['prepared/id.npy','prepared/dense.npy']]
    INTO docs RETURNING JOB_ID;
-- next scenario
-- 插入到默认分区
INSERT INTO table_name (id, vector, age) VALUES (1, [0.1, 0.2], 10);

-- 插入到指定分区
INSERT INTO table_name PARTITION partition_name (id, vector) VALUES (2, [0.3, 0.4]);
-- next scenario
INSERT INTO docs (id,body,dense) VALUES (1,'first',[1,2]),(2,'second',[3,4]);
UPSERT INTO docs (id,body,dense) VALUES (1,'changed',[1,2]),(3,'third',[3,4]);
INSERT INTO docs (id,body,dense) VALUES ?;
UPSERT INTO docs VALUES ?;
-- next scenario
-- 按主键更新
UPDATE table_name SET age = 20 WHERE id = 1;

-- 按标量条件选取主键，再提交 Partial Update
UPDATE table_name SET status = 'active' WHERE age > 18;
-- next scenario
-- 将距离 [0.1, 0.2] 最近的 1 条记录的 status 更新为 1
UPDATE table_name SET status = 1 ORDER BY vector_col <-> [0.1, 0.2] LIMIT 1;
-- next scenario
-- 使用 vector_range 函数 (推荐)
-- 语法: vector_range(vector_field, target_vector, radius)
UPDATE table_name SET tag = 'A' WHERE vector_range(vector_col, [0.1, 0.2], 0.5);

-- 使用比较表达式
UPDATE table_name SET tag = 'A' WHERE vector_col <-> [0.1, 0.2] < 0.5;
-- next scenario
-- 插入或覆盖到默认分区
UPSERT INTO table_name (id, vector, age) VALUES (1, [0.1, 0.2], 10);

-- 插入或覆盖到指定分区
UPSERT INTO table_name PARTITION partition_name (id, vector) VALUES (2, [0.3, 0.4]);

-- 原生部分更新：已有主键只修改 age，新主键按服务端插入规则处理
/*+ partial_update=true */ UPSERT INTO table_name (id, age) VALUES (?, ?);
-- next scenario
ALTER TABLE online_docs ADD FUNCTION embed USING TEXTEMBEDDING (body) INTO (dense)
    DESCRIPTION 'Document embedding'
    WITH (provider='openai',model_name='text-embedding-3-small');
ALTER TABLE online_docs ALTER FUNCTION embed USING TEXTEMBEDDING (body) INTO (dense)
    DESCRIPTION 'Updated description'
    WITH (provider='openai',model_name='text-embedding-3-small');
ALTER TABLE online_docs DROP FUNCTION embed;
-- next scenario
ALTER INDEX title_idx ON books SET PROPERTIES ('mmap.enabled'=true);
ALTER INDEX title_idx ON books DROP PROPERTIES ('mmap.enabled');
-- next scenario
ALTER TABLE books RENAME TO archived_books IN DATABASE archive;
-- next scenario
ALTER TABLE books ADD COLUMN priority INT64 NULL DEFAULT 7;
ALTER TABLE books ALTER COLUMN title SET PROPERTIES (max_length=1024);
ALTER TABLE books SET PROPERTIES ('collection.ttl.seconds'=3600);
ALTER TABLE books DROP PROPERTIES ('collection.ttl.seconds');
-- next scenario
CREATE INDEX index_name ON TABLE table_name (vector_col) USING 'IVF_FLAT' WITH (nlist = 1024, metric_type = 'L2');
-- next scenario
CREATE TABLE example_vectors (
    id INT64 PRIMARY KEY,
    vector_col FLOAT_VECTOR(2),
    age INT32 DEFAULT 0
) WITH (
    consistency_level = "Strong"
);
-- next scenario
CREATE TABLE tenant_books (
    id INT64 PRIMARY KEY,
    tenant VARCHAR(64) PARTITION KEY,
    age INT32 CLUSTERING KEY,
    v FLOAT_VECTOR(2)
) WITH (num_partitions=4, num_shards=1, consistency_level=Strong);
-- next scenario
CREATE TABLE docs (
    id INT64 PRIMARY KEY,
    body VARCHAR(2000) WITH (enable_analyzer=true, analyzer_params='{"type":"standard"}'),
    dense FLOAT_VECTOR(2), sparse SPARSE_FLOAT_VECTOR,
    FUNCTION bm25_fn USING BM25 (body) INTO (sparse)
);
CREATE INDEX bm25_idx ON docs(sparse) USING SPARSE_INVERTED_INDEX
    WITH (metric_type=BM25,bm25_k1=1.2,bm25_b=0.75);
SELECT id,score FROM docs ORDER BY sparse <?> 'hybrid search' LIMIT 10;

CREATE TABLE embedded_docs (
    id INT64 PRIMARY KEY, body VARCHAR(2000), dense FLOAT_VECTOR(1536),
    FUNCTION embed USING TEXTEMBEDDING (body) INTO (dense)
        WITH (provider='openai',model_name='text-embedding-3-small')
);
SELECT id,score FROM embedded_docs ORDER BY dense <=> 'search text' LIMIT 10;
-- next scenario
TRUNCATE TABLE books;
TRUNCATE TABLE books IN DATABASE archive_db;
-- next scenario
SHOW COMPACTION ?;
SHOW COMPACTION PLANS ?;
-- next scenario
SHOW DATABASES;
SHOW DATABASE db_name;
-- next scenario
SHOW FLUSH ALL ? IN DATABASE archive;
-- next scenario
SHOW HEALTH;
-- next scenario
SHOW IMPORT ?;
SHOW PROGRESS OF IMPORT ?;
SHOW IMPORTS FROM docs WITH (page_size=20,current_page=1);
-- next scenario
SHOW INDEXES FROM table_name;
SHOW INDEX index_name ON TABLE table_name;
SHOW PROGRESS OF INDEX ON TABLE table_name;
SHOW PROGRESS OF INDEX index_name ON TABLE table_name;
-- next scenario
SHOW PERSISTENT SEGMENTS FROM TABLE books;
-- next scenario
SHOW PROGRESS OF LOADING ON TABLE table_name;
SHOW PROGRESS OF LOADING ON TABLE table_name PARTITION partition_name;
-- next scenario
SHOW PROGRESS OF INDEX ON TABLE table_name;
SHOW PROGRESS OF INDEX index_name ON TABLE table_name;
-- next scenario
SHOW QUERY SEGMENTS FROM TABLE books;
-- next scenario
SHOW REPLICAS FROM TABLE books;
SHOW REPLICAS FROM books;
-- next scenario
SHOW RESOURCE GROUPS;
SHOW RESOURCE GROUP __default_resource_group;
-- next scenario
SHOW STATS FROM table_name;
SHOW STATS FROM table_name PARTITION partition_name;
-- next scenario
SHOW TABLES;                        -- 列出所有表
SHOW TABLE table_name;              -- 查看字段信息
SHOW CREATE TABLE table_name;       -- 查看建表详细语句
-- next scenario
SHOW VERSION;
-- next scenario
ANALYZE 'hello world' WITH (analyzer_params='{"tokenizer":"standard"}');
ANALYZE ['hello world', '', 'milvus'] WITH (with_detail=true, with_hash=true);
ANALYZE ? WITH (analyzer_params=?, with_detail=true);
-- 使用集合字段上下文
ANALYZE ? ON TABLE books(body) WITH (analyzer_names=?);
-- next scenario
COMPACT TABLE table_name;
COMPACT table_name WITH (is_clustering=false, is_l0=false, target_size=512);
-- next scenario
FLUSH table_name;
FLUSH first_table, second_table IN DATABASE archive WITH (wait_flushed_timeout_ms=60000);
FLUSH ALL TABLES;
FLUSH ALL TABLES IN DATABASE archive WITH (wait_flushed_timeout_ms=?);
-- next scenario
GRANT ROLE role_name TO username;
REVOKE ROLE role_name FROM username;

GRANT Search ON Collection table_name TO ROLE role_name;
REVOKE Search ON Collection table_name FROM ROLE role_name;
GRANT Query ON Collection * TO ROLE role_name;
-- next scenario
GRANT PRIVILEGE Search ON DATABASE app_db TABLE books TO ROLE reader;
REVOKE PRIVILEGE Search ON DATABASE app_db TABLE books FROM ROLE reader;
-- 明确授权 app_db 下的所有集合；权限组由服务端解释
GRANT PRIVILEGE CollectionReadOnly ON DATABASE app_db TABLE * TO ROLE reader;
REVOKE PRIVILEGE CollectionReadOnly ON DATABASE app_db TABLE * FROM ROLE reader;
-- next scenario
LOAD TABLE books WITH (num_replicas=1, load_fields=['id','book_intro'], skip_load_dynamic_field=true);
/*+ timeout=30000 */ LOAD TABLE books WITH (refresh=true);
/*+ sync=false */ LOAD TABLE books PARTITION p WITH (resource_groups=['query_group']);
-- next scenario
CREATE PRIVILEGE GROUP app_query;
ALTER PRIVILEGE GROUP app_query ADD (Search, Query);
ALTER PRIVILEGE GROUP app_query DROP (Query);
DROP PRIVILEGE GROUP app_query;
-- next scenario
CREATE RESOURCE GROUP rg_demo CONFIG '{"requests":{"nodeNum":0},"limits":{"nodeNum":0}}';
ALTER RESOURCE GROUP rg_demo CONFIG ?;
ALTER RESOURCE GROUPS CONFIG ?;
DROP RESOURCE GROUP rg_demo;
-- next scenario
TRANSFER NODES 1 FROM RESOURCE GROUP source_group TO RESOURCE GROUP target_group;
TRANSFER REPLICAS 1 OF TABLE table_name FROM RESOURCE GROUP source_group TO RESOURCE GROUP target_group;
-- next scenario
CREATE USER app_user PASSWORD ? WITH (description=?);
CREATE ROLE reader WITH (description=?);
-- next scenario
ALTER USER app_user WITH (description='应用查询账号');
ALTER ROLE reader WITH (description='只读访问角色');
ALTER USER app_user WITH (description=?);
-- next scenario
CREATE TABLE book_vectors (
    book_id INT64 PRIMARY KEY,
    title VARCHAR(256),
    word_count INT32,
    book_intro FLOAT_VECTOR(2)
) WITH (consistency_level='Strong');
CREATE INDEX idx_intro ON book_vectors (book_intro)
USING "AUTOINDEX" WITH (metric_type="L2");
LOAD TABLE book_vectors;
-- next scenario
CREATE TABLE auto_books (
    id INT64 PRIMARY KEY AUTO_ID,
    title VARCHAR(256),
    book_intro FLOAT_VECTOR(2)
);
-- next scenario
-- Force limit return to 5 records, skip first 10
/*+ overwrite_find_limit=5, overwrite_find_skip=10 */
SELECT * FROM table_name WHERE status = 1;

-- Use Hint to get total number of records matching conditions (Equivalent to count from ... where ...)
/*+ overwrite_find_as_count=true */
SELECT * FROM table_name WHERE age > 20;
-- next scenario
-- Query total count of full table
count from table_name;
SELECT COUNT(*) FROM table_name;

-- Query total count of specific partition
COUNT FROM table_name PARTITION partition_name;

-- Count with conditional filtering (supports scalar filtering)
count from table_name where age > 18;
-- next scenario
-- Query all fields
SELECT * FROM table_name;

-- With conditional filtering
SELECT * FROM table_name WHERE age > 20 AND status = 1;

-- Specify return fields and pagination
SELECT id, name FROM table_name LIMIT 10 OFFSET 0;

-- Query specific partition
SELECT * FROM table_name PARTITION partition_name WHERE tag = 'A';
-- next scenario
-- Basic Search (KNN, default params)
SELECT * FROM table_name ORDER BY vector_col <-> [0.1, 0.2] LIMIT 10;

-- Search with pre-filtering
SELECT * FROM table_name WHERE category = 'book' ORDER BY vector_col <-> [0.1, 0.2] LIMIT 5;

-- Range Search / Distance Filtering
-- Method 1: Using vector_range function (Recommended)
SELECT * FROM table_name WHERE vector_range(vector_col, [0.1, 0.2], 0.8) LIMIT 5;

-- Method 2: Using comparison expression (WHERE vector_col <-> [vector] < distance_threshold)
SELECT * FROM table_name WHERE vector_col <-> [0.1, 0.2] < 0.8 LIMIT 5;
-- next scenario
-- Delete all records while preserving the collection, schema, and indexes
DELETE FROM table_name;

-- Delete at most 1000 records; without ordering, the selected records are unspecified
DELETE FROM table_name LIMIT 1000;

-- Delete all records only from the specified partition
DELETE FROM table_name PARTITION partition_name;

-- Delete by Primary Key
DELETE FROM table_name WHERE id = 1;
DELETE FROM table_name WHERE id IN [1, 2, 3];

-- Delete by scalar condition (direct server-side filter deletion without LIMIT)
DELETE FROM table_name WHERE age > 18 AND status = 'inactive';

-- Delete from specific partition
DELETE FROM table_name PARTITION partition_name WHERE age > 10;
-- next scenario
-- Delete 100 records closest to [0.1, 0.2]
DELETE FROM table_name ORDER BY vector_col <-> [0.1, 0.2] LIMIT 100;

-- Combined with scalar filtering: Delete 10 most similar records where category='book'
DELETE FROM table_name WHERE category = 'book' ORDER BY vector_col <-> [0.1, 0.2] LIMIT 10;
-- next scenario
-- Using vector_range function (Recommended)
DELETE FROM table_name WHERE vector_range(vector_col, [0.1, 0.2], 0.5);

-- Using comparison expression: Delete all records with distance < 0.5 from [0.1, 0.2]
DELETE FROM table_name WHERE vector_col <-> [0.1, 0.2] < 0.5;

-- Combined with LIMIT for protection (Delete at most 1000 matching records)
DELETE FROM table_name WHERE vector_range(vector_col, [0.1, 0.2], 0.5) LIMIT 1000;
-- next scenario
-- Files must already be in object storage accessible to Milvus
IMPORT FROM 'prepared/1.parquet' INTO TABLE table_name;
IMPORT FROM 'prepared/1.json' INTO TABLE table_name PARTITION partition_name;

-- Wait for the import task to finish, up to 60 seconds
/*+ timeout=60000 */ IMPORT FROM 'prepared/1.json' INTO TABLE table_name;

-- Submit the import task without waiting
/*+ sync=false */ IMPORT FROM 'prepared/1.json' INTO TABLE table_name;
-- next scenario
-- Insert into default partition
INSERT INTO table_name (id, vector, age) VALUES (1, [0.1, 0.2], 10);

-- Insert into specific partition
INSERT INTO table_name PARTITION partition_name (id, vector) VALUES (2, [0.3, 0.4]);
-- next scenario
-- Update by Primary Key
UPDATE table_name SET age = 20 WHERE id = 1;

-- Select primary keys by scalar condition, then submit partial updates
UPDATE table_name SET status = 'active' WHERE age > 18;
-- next scenario
-- Update status to 1 for the 1 record closest to [0.1, 0.2]
UPDATE table_name SET status = 1 ORDER BY vector_col <-> [0.1, 0.2] LIMIT 1;
-- next scenario
-- Using vector_range function (Recommended)
-- Syntax: vector_range(vector_field, target_vector, radius)
UPDATE table_name SET tag = 'A' WHERE vector_range(vector_col, [0.1, 0.2], 0.5);

-- Using comparison expression
UPDATE table_name SET tag = 'A' WHERE vector_col <-> [0.1, 0.2] < 0.5;
-- next scenario
-- Upsert into default partition
UPSERT INTO table_name (id, vector, age) VALUES (1, [0.1, 0.2], 10);

-- Upsert into specific partition
UPSERT INTO table_name PARTITION partition_name (id, vector) VALUES (2, [0.3, 0.4]);

-- Native partial update: change only age for existing keys; new keys follow server insert rules
/*+ partial_update=true */ UPSERT INTO table_name (id, age) VALUES (?, ?);
-- next scenario
SHOW TABLES;                        -- List all tables
SHOW TABLE table_name;              -- Inspect fields
SHOW CREATE TABLE table_name;       -- View detailed create table statement
-- next scenario
ANALYZE 'hello world' WITH (analyzer_params='{"tokenizer":"standard"}');
ANALYZE ['hello world', '', 'milvus'] WITH (with_detail=true, with_hash=true);
ANALYZE ? WITH (analyzer_params=?, with_detail=true);
-- Use collection field context
ANALYZE ? ON TABLE books(body) WITH (analyzer_names=?);
-- next scenario
GRANT PRIVILEGE Search ON DATABASE app_db TABLE books TO ROLE reader;
REVOKE PRIVILEGE Search ON DATABASE app_db TABLE books FROM ROLE reader;
-- Explicitly grant access to all collections in app_db; the server interprets the privilege group
GRANT PRIVILEGE CollectionReadOnly ON DATABASE app_db TABLE * TO ROLE reader;
REVOKE PRIVILEGE CollectionReadOnly ON DATABASE app_db TABLE * FROM ROLE reader;
-- next scenario
ALTER USER app_user WITH (description='Application query account');
ALTER ROLE reader WITH (description='Read-only access role');
ALTER USER app_user WITH (description=?);
