
import type { ExpandRecursively, Requester, Storer } from '../interfaces';
import { makeXhr, type xhrOption } from '../xhrType';
import type { DataCrudStyle, DataStyles, customCrudStyle } from '../xmemCachedd';
// import _storer from './localCache';

const opts: xhrOption = {
	name: 'requester',
	target: `/api`,
	responseType: 'json',
	contentType: 'application/json',
	method: 'POST'
};


export type RecursivePartial<T> = {
	[P in keyof T]?: T[P] extends object ? RecursivePartial<T[P]> : T[P];
};


export type fType = (a: keyof Storer, b: keyof Storer[typeof a]) => Storer[typeof a][typeof b];

const f: fType = (a, b) => {
	const requester = async (inputs: Requester['data']) => {
		// const req: Requester = {
		// 	[a]: {
		// 		[b]: inputs
		// 	}
		// };
		const req: Requester[] = [{
			table:a,
			action:b,
			data:inputs,
		}];
		const payload = JSON.stringify(req);
		// console.log(JSON.parse(payload));
		const xhr = makeXhr(opts).send(payload);
		const res = (await xhr).response[0];
		// console.log(Response)
		// throw 'adnan'
		// const res = await ky[a][b](inputs);
		// await pause(1000)
		return res;
	};
	return requester as Storer[typeof a][typeof b];
};

export const traverseStorer = async <T>(
	storer: T,
	fa?: <A extends keyof T>(currentstorer: T[A], a: A) => void | Promise<void>,
	fb?: <A extends keyof T, B extends keyof T[keyof T]>(
		currentstorer: T[A][B],
		a: A,
		b: B
	) => void | Promise<void>
) => {
	const template = emptyStorer as T;
	for (const _a in template) {
		const a = _a as keyof T;
		if (storer?.[a] === undefined) continue;
		const ta = storer[a] as T[typeof a];
		if (fa) await fa(ta as typeof ta, a);
		for (const _b in template[a]) {
			const b = _b as keyof typeof ta;
			if (ta?.[b] === undefined) continue;
			if (fb) await fb(ta[b] as (typeof ta)[typeof b], a, b);
		}
	}
};

// export const traverseStoreAwait = async <T>(
// 	storer: T,
// 	f: <A extends keyof T, B extends keyof T[A]>(currentstorer: T[A][B], a: A, b: B) => Promise<void>
// ) => {
//     traverseStorer(storer,async (curr,a,b)=>{await f(curr,a,b)})
// }
export const setStore = <C extends customCrudStyle, A extends Storer & C>(f: fType, custom?:C) => {
	const temp: A = structuredClone(emptyStorer) as A;
    if(custom?.custom)
    temp['custom'] = custom.custom;
	traverseStorer<Storer>(temp, (curr,a)=>{
		if (custom?.[a]?.['custom'])
		temp[a]['custom'] = custom[a]?.['custom'];
	}, (curr, a, b) => {
		temp[a][b] = f(a,b) as any
		// console.log(curr)
	});
	// console.log(temp);
	return temp;
};

export const emptyStorer: Storer = {
	group: {
		insert: 1 as unknown as any,
		read: 1 as unknown as any,
		update: 1 as unknown as any,
		delete: 1 as unknown as any
	},
	doc: {
		insert: 1 as unknown as any,
		read: 1 as unknown as any,
		update: 1 as unknown as any,
		delete: 1 as unknown as any
	},
	docFile: {
		insert: 1 as unknown as any,
		read: 1 as unknown as any,
		update: 1 as unknown as any,
		delete: 1 as unknown as any
	}
};
const storer = setStore(f);

export const init = async () => {
	console.log('initializing requester');
	// storer;
};
export default storer;
