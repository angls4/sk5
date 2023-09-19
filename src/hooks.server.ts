import { init as initCacheFirst } from './lib/server/cacheFirst';

import type { Handle } from '@sveltejs/kit';

const init = {
	server: false
};

export const handle = (async ({ event, resolve }) => {
	if (!init.server) {
		// await initRequester();
		await initCacheFirst();
		init.server = true;
	}
	const response = await resolve(event);
	return response;
}) satisfies Handle;
