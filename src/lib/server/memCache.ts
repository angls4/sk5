import type { MapCache } from '../cache';
import type { DataMap, DFMap, DMap } from '../storeType';
import {getDefaultRoot, WCache} from '../cache';

export const _dataMap: DataMap = { 0: getDefaultRoot() };
export const _dMap: DMap = {};
export const _dfMap: DFMap = {};

const m = <T>(map: T) => {
	const ret: MapCache<T> = {
		get() {
			return map;
		},
		set(value) {
			map = value;
		},
		update(a) {
			a(map);
		}
	} as MapCache<T>;
	return ret;
};

const dataMap = m(_dataMap);
const dMap = m(_dMap);
const dfMap = m(_dfMap);

export const cache = new WCache(dataMap, dMap, dfMap);

const storer = cache.storer;

export default storer;

// type a = {
// 	a?:number,
// 	b:number
// }
// type b = {
// 	b:number
// }

// let a:a = {
// 	a:1,
// 	b:2
// };
// let b: b = {
// 	b: 2
// };

// a = b;
