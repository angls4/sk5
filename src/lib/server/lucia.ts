import { sveltekit } from "lucia/middleware";
// import prisma from "@lucia-auth/adapter-prisma";
// import { PrismaClient } from "@prisma/client";
import { dev } from "$app/environment";
// import { poolConnection } from "$lib/server/mysql";
import {mysql2} from "@lucia-auth/adapter-mysql"

import {createPool} from 'mysql2/promise'
import {lucia} from "lucia";
// import * as env from "$env/static/private";

const poolConnection = createPool({
	database: 'ta2',
	host: 'localhost',
	user: 'root',
	// password: '',
	port: 3306,
	connectionLimit: 10,
})


export const auth = lucia({
	adapter: mysql2(poolConnection,{
		user: 'auth_user',
		key: 'user_key',
		session: 'user_session',
	}),
	env: dev ? "DEV" : "PROD",
	middleware: sveltekit(),
	getUserAttributes : (userData) => {
		return {
			phone_number: userData.phone_number,
			name: userData.name,
		}
	}
});

export type Auth = typeof auth;