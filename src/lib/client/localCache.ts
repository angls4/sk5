import type { MapCache } from '../cache';
import type { DataMap, DFMap, DMap } from '../storeType';
import {getDefaultRoot, WCache} from '../cache';
import { localStorageStore } from '@skeletonlabs/skeleton';
import { get, type Writable } from 'svelte/store';

 const _gMap: Writable<DataMap> = localStorageStore('dataMap', {0:getDefaultRoot()} as DataMap);
 const _dMap: Writable<DMap> = localStorageStore('dMap', {} as DMap);
 const _dfMap: Writable<DFMap> = localStorageStore('dfMap', {} as DFMap);


export const gMap : MapCache<DataMap> = {
    ..._gMap,
    get() {
        return get(_gMap);
    },
};
export const dMap: MapCache<DMap> = {
	..._dMap,
	get() {
		return get(_dMap);
	}
};
export const dfMap: MapCache<DFMap> = {
	..._dfMap,
	get() {
		return get(_dfMap);
	}
};

_gMap.update((map) => {
	return map;
});
_gMap.update((map) => {
	return map;
});
_gMap.update((map) => {
	return map;
});

console.log(WCache)
export const cache = new WCache(gMap, dMap,dfMap);
cache.open();
const storer = cache.storer;

export const init = async () => {
	console.log('initializing localcache');
	
	// storer;
};


export default storer;
