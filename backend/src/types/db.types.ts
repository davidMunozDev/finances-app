import type { ResultSetHeader, RowDataPacket } from "mysql2";

export type DBRow<T> = RowDataPacket & T;
export type DBResult = ResultSetHeader;
