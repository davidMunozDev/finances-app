import type { QueryResult, QueryResultRow } from "pg";

// Para PostgreSQL, las rows ya son del tipo T directamente
export type DBRow<T> = T;

// QueryResult incluye rows, rowCount, command, etc.
export type DBResult<T extends QueryResultRow = any> = QueryResult<T>;
