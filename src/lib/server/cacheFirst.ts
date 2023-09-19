import type { Requester, Storer } from "../interfaces";
import ky from "./kysely"
import cache from "$lib/server/memCache"
import {cache as _cache} from "$lib/server/memCache"
import type { DataCrudStyle } from "../xmemCachedd";
import type { Maps } from "../cache";
import type { fType } from "../client/requester";
import { setStore } from "../client/requester";
// TODO INI MASIH BOILERPLATE


type RecursivePartial<T> = {
	[P in keyof T]?: T[P] extends (infer U)[]
		? RecursivePartial<U>[]
		: T[P] extends object | undefined
		? RecursivePartial<T[P]>
		: T[P];
};

// type Custom = {
// 	group: {
// 		custom: {
// 			refresh(): Promise<DataCrudStyle['group']['inputs'] | undefined>;
// 		};
// 	};
// 	doc: {
// 		custom: {
// 			refresh(): Promise<DataCrudStyle['doc']['inputs'] | undefined>;
// 		};
// 	};
// 	docFile: {
// 		custom: {
// 			refresh(): Promise<DataCrudStyle['docFile']['inputs'] | undefined>;
// 		};
// 	};
// 	custom: {
// 		getMap(): Maps;
// 		refresh(): Promise<void>;
// 	};
// };

const f: fType = (a, b) => {
    let f:any;
    // console.log(b)
    if (b == 'read') {
        f = async (inputs: any) => {
            console.log('read');
			return await cache[a][b](inputs);
		};
	}
    else{
        f = async (inputs: any) => {
            const res = await ky[a][b](inputs);
			console.log(res);
            if (Object.keys(res ?? {}).length === 0) return;
			const ret = await cache[a][b](b == 'delete' ? inputs : res);
			return ret;
		};
    }
	const cacheFirst = async (inputs: Requester['data']) => {
        if (getRefreshing()) return { refreshing: true } as any;
        let error;
        // console.log(inputs)
		console.log(`CACHEFIRST | ${String(b)} ${String(a)}`);
        const ret = await f(inputs);
		// console.log(ret);
		console.log(`CACHEFIRST | OK ${String(b)} ${String(a)}} --- ${error}`);
		return ret;
	};
	return cacheFirst as Storer[typeof a][typeof b];
};
function getRefreshing() {
    console.log('refreshing'+refreshing);
    return refreshing
}
let refreshing = true;
const custom = {
    custom: {
        getMap() {
            return cache.custom.getMap();
        },
        async refresh(){(async ()=>{
            refreshing = true;
            cache.custom.reset();
            // console.log(cache.custom.getMap().docFile);
            let temp = _cache.callStack.storage;
            _cache.open();
            (await custom.group.custom.refresh());
            temp = [...temp,..._cache.callStack.storage];
            _cache.callStack.storage = [];
            (await custom.doc.custom.refresh());
            temp = [...temp,..._cache.callStack.storage];
            _cache.callStack.storage = [];
            // (storer.doc.custom.refresh());
            (await custom.docFile.custom.refresh());
            _cache.callStack.storage = temp;
            _cache.open();
            refreshing=false;
        })()}
    },
    group:{

        custom : {
            async refresh () {
                console.log("CACHEFIRST | refresh groups");
                try {
                    const res = await ky.group.read();
                    console.log(res)
                    await cache.group.insert(res);
                    console.log("CACHEFIRST | refresh groups OK");
                    return res;
                    // return cache.custom.getMap().data;
                } catch (error) {
                    console.log("CACHEFIRST | FAILED refresh groups ");
                    console.log(error);
                }
                return {};
            }
        }
    },
    doc:{

        custom : {
            async refresh () {
                console.log("CACHEFIRST | refresh docs");
                try {
                    const res = await ky.doc.read();
                    await cache.doc.insert(res);
                    return res;
                    // return cache.custom.getMap().data;
                } catch (error) {
                    console.log("CACHEFIRST | FAILED refresh docs ");
                    console.log(error);
                }
            }
        }
    },
    docFile:{

        custom : {
            async refresh () {
                console.log("CACHEFIRST | refresh docFiles");
                try {
                    const res = await ky.docFile.read();
                    // console.log(res)
                    cache.docFile.insert(res);
                    // console.log(cache.custom.getMap().docFile)
                    return res;
                    // return cache.custom.getMap().docFile;
                } catch (error) {
                    console.log("CACHEFIRST | FAILED refresh docFiles ");
                    console.log(error);
                }
            }
        }
    },
}

const storer = setStore(f, custom);
// await storer.custom.refresh()
export const init = async () => {
	console.log('initializing cacheFirst');
    await storer.custom.refresh();
	// storer;
};

export default storer;