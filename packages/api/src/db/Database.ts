import fs from 'fs'
import path from 'path'
import sqlite3 from 'sqlite3'
import { Db } from './types'

export default class Database implements Db {
    private db: sqlite3.Database
    private ready: Promise<void>

    public constructor(dbPath: string) {
        const dir = path.dirname(dbPath)
        fs.mkdirSync(dir, { recursive: true })

        this.db = new sqlite3.Database(dbPath)
        this.ready = this.execSchema()
    }

    public async exec(sql: string): Promise<void> {
        await this.ready
        return this.runWithoutResult((callback) => this.db.exec(sql, callback))
    }

    public async run(sql: string, params: unknown[] = []): Promise<void> {
        await this.ready
        return this.runWithoutResult((callback) =>
            this.db.run(sql, params, callback)
        )
    }

    public async get<T>(
        sql: string,
        params: unknown[] = []
    ): Promise<T | undefined> {
        await this.ready
        return this.runWithResult<T | undefined>((callback) =>
            this.db.get(sql, params, callback)
        )
    }

    public async all<T>(sql: string, params: unknown[] = []): Promise<T[]> {
        await this.ready
        return this.runWithResult((callback) =>
            this.db.all(sql, params, callback)
        )
    }

    private execSchema(): Promise<void> {
        return this.runWithoutResult((callback) =>
            this.db.exec(
                `
                CREATE TABLE IF NOT EXISTS invites (
                    token_hash TEXT PRIMARY KEY,
                    project_name TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    used_at TEXT,
                    revoked_at TEXT,
                    note TEXT
                );
                CREATE INDEX IF NOT EXISTS invites_project_name ON invites(project_name);
                `,
                callback
            )
        )
    }

    private runWithoutResult(
        fn: (callback: (err: SqliteError | null) => void) => void
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fn((err) => (err ? reject(err) : resolve()))
        })
    }

    private runWithResult<T>(
        fn: (callback: (err: SqliteError | null, result: T) => void) => void
    ): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            fn((err, result) => (err ? reject(err) : resolve(result)))
        })
    }
}

type SqliteError = Error
