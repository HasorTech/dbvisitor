/*
 * Copyright 2015-2022 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0.
 * See the LICENSE.txt file for the full license.
 * https://www.apache.org/licenses/LICENSE-2.0
 */
package net.hasor.dbvisitor.adapter.milvus.commands;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.sql.*;
import java.util.*;
import io.milvus.grpc.*;
import io.milvus.orm.iterator.QueryIterator;
import io.milvus.response.QueryResultsWrapper.RowRecord;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.ConsistencyLevel;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.response.GetLoadStateResp;
import io.milvus.v2.service.index.request.CreateIndexReq;
import io.milvus.v2.service.vector.request.InsertReq;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.UpsertReq;
import io.milvus.v2.service.vector.response.*;
import io.milvus.v2.service.rbac.request.UpdatePasswordReq;
import net.hasor.dbvisitor.adapter.milvus.MilvusCommandInterceptor;
import net.hasor.dbvisitor.adapter.milvus.MilvusConnFactory;
import net.hasor.dbvisitor.adapter.milvus.MilvusCustomClient;
import net.hasor.dbvisitor.adapter.milvus.MilvusKeys;
import net.hasor.dbvisitor.adapter.milvus.parser.MilvusLexer;
import net.hasor.dbvisitor.adapter.milvus.parser.MilvusParser;
import net.hasor.dbvisitor.driver.JdbcDriver;
import org.antlr.v4.runtime.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import static net.hasor.dbvisitor.adapter.milvus.MilvusTestResponses.v2Response;
import static org.junit.jupiter.api.Assertions.*;

public class MilvusJdbcScenariosTest {
    private final List<Object>    requests  = new ArrayList<>();
    private       int             insertions;
    private       int             partialUpdates;
    private       int             deletions;

    @BeforeEach
    public void install() throws Exception {
        Class.forName(JdbcDriver.class.getName());
        MilvusCommandInterceptor.resetInterceptor();
        CollectionSchema schema = CollectionSchema.newBuilder().setName("books_demo").addFields(FieldSchema.newBuilder().setName("book_id").setDataType(DataType.Int64).setIsPrimaryKey(true)).addFields(FieldSchema.newBuilder().setName("title").setDataType(DataType.VarChar)).addFields(FieldSchema.newBuilder().setName("word_count").setDataType(DataType.Int32)).addFields(FieldSchema.newBuilder().setName("book_intro").setDataType(DataType.FloatVector)).build();
        MilvusCommandInterceptor.addInterceptor(MilvusClientV2.class, (proxy, method, args) -> {
            if (args.length > 0) {
                requests.add(args[0]);
            }
            switch (method.getName()) {
                case "getServerVersion":
                    return "v2.6.2";
                case "describeCollection":
                    return v2Response(method.getName(), DescribeCollectionResponse.newBuilder().setSchema(schema).build());
                case "createCollection":
                case "updatePassword":
                case "createIndex":
                case "loadCollection":
                    return null;
                case "getLoadStateV2":
                    return GetLoadStateResp.builder().state(LoadState.LoadStateLoaded).progress(100L).build();
                case "insert":
                    insertions++;
                    InsertReq insert = (InsertReq) args[0];
                    assertEquals("books_demo", insert.getCollectionName());
                    assertEquals(2, insert.getData().get(0).getAsJsonArray("book_intro").size());
                    return InsertResp.builder().InsertCnt(1).build();
                case "upsert":
                    UpsertReq upsert = (UpsertReq) args[0];
                    if (upsert.isPartialUpdate()) {
                        partialUpdates++;
                        assertEquals(new HashSet<>(Arrays.asList("book_id", "word_count")), upsert.getData().get(0).keySet());
                    }
                    return UpsertResp.builder().upsertCnt(upsert.getData().size()).build();
                case "delete":
                    deletions++;
                    return DeleteResp.builder().deleteCnt(1).build();
                case "search":
                    SearchReq search = (SearchReq) args[0];
                    assertEquals(ConsistencyLevel.STRONG, search.getConsistencyLevel());
                    assertEquals(Arrays.asList("book_id", "title"), search.getOutputFields());
                    assertEquals(Arrays.asList(0.1F, 0.2F), search.getData().get(0).getData());
                    SearchResp.SearchResult hit = SearchResp.SearchResult.builder().primaryKey("book_id").id(1L).score(0F).entity(row().getFieldValues()).build();
                    return SearchResp.builder().searchResults(Collections.singletonList(Collections.singletonList(hit))).build();
                case "query":
                    QueryReq query = (QueryReq) args[0];
                    Map<String, Object> entity = query.getOutputFields().contains("count(*)") ? Collections.singletonMap("count(*)", 1L) : row().getFieldValues();
                    return QueryResp.builder().queryResults(Collections.singletonList(QueryResp.QueryResult.builder().entity(entity).build())).build();
                case "queryIterator":
                    QueryIterator iterator = Mockito.mock(QueryIterator.class);
                    Mockito.when(iterator.next()).thenReturn(Collections.singletonList(row()), Collections.emptyList());
                    return iterator;
                default:
                    throw new AssertionError("Unexpected SDK call in JDBC scenario: " + method.getName());
            }
        });
    }

    @AfterEach
    public void cleanup() {
        MilvusCommandInterceptor.resetInterceptor();
    }

    private static RowRecord row() {
        RowRecord row = new RowRecord();
        row.put("book_id", 1L);
        row.put("title", "A book");
        row.put("word_count", 1000);
        row.put("book_intro", Arrays.asList(0.1F, 0.2F));
        return row;
    }

    private String interceptedUrl() {
        return "jdbc:dbvisitor:milvus://mock:19530/default?" + MilvusKeys.CUSTOM_MILVUS + "=" + MilvusCustomClient.class.getName() + "&" + MilvusKeys.INTERCEPTOR + "=" + MilvusCommandInterceptor.class.getName();
    }

    @Test
    public void createCollectionAndSearchInsertedVector() throws Exception {
        Properties props = new Properties();
        props.setProperty(MilvusKeys.CONSISTENCY_LEVEL, "Strong");
        try (Connection conn = DriverManager.getConnection(interceptedUrl(), props); Statement stmt = conn.createStatement()) {
            stmt.executeUpdate("CREATE TABLE books_demo (book_id INT64 PRIMARY KEY, title VARCHAR(200), " +
                    "word_count INT32 DEFAULT 0, book_intro FLOAT_VECTOR(2))");
            stmt.executeUpdate("CREATE INDEX idx_intro ON books_demo (book_intro) USING 'FLAT' WITH (metric_type='L2')");
            stmt.executeUpdate("LOAD TABLE books_demo");
            try (PreparedStatement ps = conn.prepareStatement("INSERT INTO books_demo " +
                    "(book_id, title, word_count, book_intro) VALUES (?, ?, ?, ?)")) {
                ps.setLong(1, 1L);
                ps.setString(2, "A book");
                ps.setInt(3, 1000);
                ps.setObject(4, new float[] {0.1F, 0.2F});
                assertEquals(1, ps.executeUpdate());
            }

            try (PreparedStatement ps = conn.prepareStatement("SELECT book_id, title, score FROM books_demo " +
                    "WHERE word_count >= ? ORDER BY book_intro <-> ? LIMIT ?")) {
                ps.setInt(1, 100);
                ps.setObject(2, new float[] {0.1F, 0.2F});
                ps.setInt(3, 5);
                ps.setFetchSize(128);
                ps.setQueryTimeout(30);
                try (ResultSet rs = ps.executeQuery()) {
                    assertTrue(rs.next());
                    assertEquals(1L, rs.getLong("book_id"));
                    assertEquals("A book", rs.getString("title"));
                    assertEquals(0.0F, rs.getFloat("score"));
                    assertFalse(rs.next());
                }
            }
        }
        assertEquals(1, insertions);
        CreateCollectionReq collection = requests.stream().filter(CreateCollectionReq.class::isInstance)
                .map(CreateCollectionReq.class::cast).findFirst().orElseThrow();
        assertEquals("books_demo", collection.getCollectionName());
        CreateIndexReq index = requests.stream().filter(CreateIndexReq.class::isInstance)
                .map(CreateIndexReq.class::cast).findFirst().orElseThrow();
        assertEquals("L2", index.getIndexParams().get(0).getMetricType().name());
    }

    @Test
    public void writePagingAndMultipleResultsThroughJdbc() throws Exception {
        Properties props = new Properties();
        props.setProperty(MilvusKeys.CONSISTENCY_LEVEL, "Strong");
        try (Connection conn = DriverManager.getConnection(interceptedUrl(), props)) {
            try (PreparedStatement ps = conn.prepareStatement("UPSERT INTO books_demo " +
                    "(book_id, title, word_count, book_intro) VALUES (?, ?, ?, ?)")) {
                ps.setLong(1, 1L);
                ps.setString(2, "Revised book");
                ps.setInt(3, 1200);
                ps.setObject(4, new double[] {0.1, 0.2});
                assertEquals(1, ps.executeUpdate());
            }
            try (PreparedStatement ps = conn.prepareStatement("UPDATE books_demo SET word_count = ? WHERE book_id = ? LIMIT ?")) {
                ps.setInt(1, 1500);
                ps.setLong(2, 1L);
                ps.setInt(3, 1);
                ps.setFetchSize(128);
                assertEquals(1L, ps.executeLargeUpdate());
            }
            try (PreparedStatement ps = conn.prepareStatement("DELETE FROM books_demo WHERE book_id = ? LIMIT ?")) {
                ps.setLong(1, 1L);
                ps.setInt(2, 1);
                assertEquals(1L, ps.executeLargeUpdate());
            }
            try (PreparedStatement ps = conn.prepareStatement("SELECT book_id, title FROM books_demo WHERE word_count >= ?")) {
                ps.setInt(1, 100);
                ps.setFetchSize(256);
                ps.setMaxRows(1000);
                ps.setQueryTimeout(30);
                try (ResultSet rs = ps.executeQuery()) {
                    assertTrue(rs.next());
                    assertEquals(1L, rs.getLong("book_id"));
                    assertEquals("A book", rs.getString("title"));
                }
            }
            try (PreparedStatement ps = conn.prepareStatement("ALTER USER app_user PASSWORD ? REPLACE ?")) {
                ps.setString(1, "test-new-password");
                ps.setString(2, "test-old-password");
                ps.executeUpdate();
            }
            String sql = "SELECT book_id FROM books_demo LIMIT 2; " +
                    "UPDATE books_demo SET word_count = ? WHERE book_id = ? LIMIT 1; COUNT FROM books_demo";
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setInt(1, 2000);
                ps.setLong(2, 1L);
                assertTrue(ps.execute());
                try (ResultSet rs = ps.getResultSet()) {
                    assertTrue(rs.next());
                    assertEquals(1L, rs.getLong("book_id"));
                }
                assertFalse(ps.getMoreResults(Statement.CLOSE_CURRENT_RESULT));
                assertEquals(1L, ps.getLargeUpdateCount());
                assertTrue(ps.getMoreResults(Statement.CLOSE_CURRENT_RESULT));
                try (ResultSet rs = ps.getResultSet()) {
                    assertTrue(rs.next());
                    assertEquals(1L, rs.getLong("COUNT"));
                }
                assertFalse(ps.getMoreResults(Statement.CLOSE_CURRENT_RESULT));
                assertEquals(-1L, ps.getLargeUpdateCount());
            }
        }
        assertEquals(2, partialUpdates);
        assertEquals(1, deletions);
        UpdatePasswordReq password = requests.stream().filter(UpdatePasswordReq.class::isInstance)
                .map(UpdatePasswordReq.class::cast).findFirst().orElseThrow();
        assertEquals("app_user", password.getUserName());
        assertEquals("test-old-password", password.getPassword());
        assertEquals("test-new-password", password.getNewPassword());
    }

    @Test
    public void sqlScenariosParseWithoutRecovery() throws Exception {
        String corpus;
        try (InputStream input = getClass().getResourceAsStream("/milvus_tests/jdbc_scenarios.sql")) {
            assertNotNull(input, "Missing Milvus SQL scenarios");
            corpus = new String(input.readAllBytes(), StandardCharsets.UTF_8);
        }
        BaseErrorListener strict = new BaseErrorListener() {
            @Override
            public void syntaxError(Recognizer<?, ?> recognizer, Object symbol, int line, int position, String message, RecognitionException e) {
                throw new AssertionError("SQL scenario at " + line + ":" + position + ": " + message, e);
            }
        };
        for (String sql : corpus.split("\\R-- next scenario\\R")) {
            MilvusLexer lexer = new MilvusLexer(CharStreams.fromString(sql));
            lexer.removeErrorListeners();
            lexer.addErrorListener(strict);
            MilvusParser parser = new MilvusParser(new CommonTokenStream(lexer));
            parser.removeErrorListeners();
            parser.addErrorListener(strict);
            assertFalse(parser.root().hintCommand().isEmpty(), sql);
        }
    }

    @Test
    public void countUsesPartitionFilterAndConnectionHints() throws Exception {
        Properties props = new Properties();
        props.setProperty(MilvusKeys.CONSISTENCY_LEVEL, "Strong");
        try (Connection conn = DriverManager.getConnection(interceptedUrl(), props); PreparedStatement ps = conn.prepareStatement("COUNT FROM books_demo PARTITION p WHERE word_count > ?")) {
            ps.setInt(1, 100);
            try (ResultSet result = ps.executeQuery()) {
                assertTrue(result.next());
                assertEquals(1L, result.getLong("COUNT"));
            }
            QueryReq count = (QueryReq) requests.stream().filter(QueryReq.class::isInstance).findFirst().get();
            assertEquals(Collections.singletonList("p"), count.getPartitionNames());
            assertEquals(ConsistencyLevel.STRONG, count.getConsistencyLevel());
            assertEquals("word_count > {arg1}", count.getFilter());
            assertEquals(Collections.singletonMap("arg1", 100), count.getFilterTemplateValues());
            try (Statement statement = conn.createStatement(); ResultSet result = statement.executeQuery("/*+ overwrite_find_as_count=false */ SELECT book_id FROM books_demo")) {
                assertTrue(result.next());
                assertEquals("COUNT", result.getMetaData().getColumnName(1));
            }
        }
    }

    @Test
    public void registersExpectedConnectionProperties() {
        Set<String> expected = Set.of("database", "token", "user", "password", "secure",
                "caPemPath", "serverPemPath", "clientPemPath", "clientKeyPath", "serverName",
                "consistencyLevel", "connectTimeout", "rpcDeadline", "keepAliveTime",
                "keepAliveTimeout", "idleTimeout", "keepAliveWithoutCalls", "maxRetry",
                "customMilvus", "interceptor", "adapterName", "server", "timeZone");
        assertEquals(expected, new HashSet<>(Arrays.asList(new MilvusConnFactory().getPropertyNames())));
    }
}
