import type { DB } from './types' // this is the Database interface we defined earlier
import { createPool } from 'mysql2' // do not use 'mysql2/promises'!
import { Kysely, MysqlDialect } from 'kysely'

const dialect = new MysqlDialect({
  pool: createPool({
    database: 'ta2',
	host: 'localhost',
	user: 'root',
	// password: '',
	port: 3306,
	connectionLimit: 10,
  })
})

export const db = new Kysely<DB>({
  dialect,
})