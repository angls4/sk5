// See https://kit.svelte.dev/docs/types#app


// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface PageData {}
		// interface Platform {}
		interface Locals {
			auth: import("lucia").AuthRequest;
			docid: number;
		}
	}
}

/// <reference types="lucia" />
declare global {
	namespace Lucia {
		type Auth = import("$lib/server/lucia").Auth;
		type DatabaseUserAttributes  = {
			phone_number: string
			name: string
		};
	}
}


export {};

export const ssr = false;
