import type { DataDataMap, DataMap, DFMap, DMap } from '$lib/storeType';
import type { Writable } from 'svelte/store';
import { setStore } from './client/requester';
import type { Storer } from './interfaces';
import { Queue } from './queue';
import type { Group, DataStyles, Doc, DocFile, DataCrudStyle } from './xmemCachedd';

// const _dataMap : _DataMap = {groups:{}};

export interface MapCache<T> extends Writable<T> {
	// modify: <A,B,C,T extends (A extends number?(B extends number?(C extends number?DocFileDataMap[number]:DocDataMap[number]):GroupDataMap[number]):DataMap)>(value:T,index:{group:A,doc:B,docFile:C})=>T;
	update(a: (a: T) => T): void;
	get(): T;
	set(value: T): void;
}
export const getDefaultRootData: () => Group = () => {
	return { ...{ id: 0, name: '_root', parentId: -1 } };
};
export const getDefaultRoot: () => DataDataMap = () => {
	return { ...{ opened: true, docs: {}, groups: {}, data: getDefaultRootData() } };
};

// function get<T>(a: T): T {
// 	return a;
// }

export type Maps = {
	data: DataMap;
	doc: DMap;
	docFile: DFMap;
};

export function pause(ms: number) {
	return new Promise((resolve) => {
		setTimeout(() => {
			// console.log('bla bla');
			resolve(undefined);
		}, ms);
	});
}

type Custom = {
		custom: {
		getMap(): Maps;
		reset(): void;
	};
	group: Storer['group'] & {
		custom: {
			currId: number;
			getId(): number;
		};
	};
	doc: Storer['doc'] & {
		custom: {
			currId: number;
			getId(): number;
		};
	};
	docFile: Storer['docFile'] & {
		custom: {
			currId: number;
			getId(): number;
		};
	};
};

type Janji = Promise<unknown>;
type Calls = {
	suruhan: () => Janji;
	titipan: (...val: any[]) => void;
	rej: (...val: any[]) => void;
};
// const ix =

export class WCache {
	constructor(gCache: MapCache<DataMap>, dCache: MapCache<DMap>, dfCache: MapCache<DFMap>) {
		// this.dataMap = dataMap;
		// this.dfMap = dfMap;
		this.gCache = gCache;
		this.dCache = dCache;
		this.dfCache = dfCache;
		this.storer = setStore((a, b) => {
			if (b == 'read') return this._storer[a][b];
			const cacheFirst = async (
				inputs:
					| DataCrudStyle[keyof DataCrudStyle]['inputs']
					| DataCrudStyle[keyof DataCrudStyle]['index']
			) => {
				// console.log(a, b);
				const func = (this._storer[a][b] as (a: typeof inputs) => Promise<unknown>).bind(
					this,
					inputs
				);
				return this.stack(func);
				// return await cache[a][b](res);
			};
			return cacheFirst as Storer[typeof a][typeof b];
		}, this._storer);
		// console.log(store)
	}
	// dataMap;
	// dfMap;
	private isOpened = false;
	open(){
		console.log('cache opened')
		this.isOpened = true;
		this.recur();
	}
	private gCache: MapCache<DataMap>;
	private dCache: MapCache<DMap>;
	private dfCache: MapCache<DFMap>;
	private recur = () => {
		console.log(this.callStack.storage)
		if (this.callStack.size() > 0) {
			const call = this.callStack.dequeue() as Calls;
			const func = <T>(f: (a: T) => T, a: T) => {
				this.calling = undefined;
				f(a);
				this.recur();
			};
			// console.log(call.suruhan)
			this.calling = call
				.suruhan()
				.then((a) => {
					func(call.titipan, a);
				})
				.catch((a) => {
					func(call.rej, a);
				});
		}
	};
	private calling?: Janji;
	callStack = new Queue<Calls>();
	stack = <T>(func: () => Promise<T>,first=false) => {
		const janji: Calls = {
			suruhan: func,
			titipan: () => {
				0;
			},
			rej: () => {
				0;
			}
		};
		const promise = new Promise<T>((res, rej) => {
			janji.titipan = res;
			janji.rej = rej;
			if(first) this.callStack.storage.splice(0,0,janji)
			else this.callStack.enqueue(janji); 
		});
		if (!this?.calling && this.isOpened) this.recur();
		// console.log('----------callsttack');
		// console.log(this.callStack.storage);
		return promise;
	};
	// callStack:((...args:any[])=>Promise<any>)[]=[];
	private _storer: Storer & Custom = {
		custom: {
			getMap: () => {
				return {
					data: this.gCache.get(),
					doc: this.dCache.get(),
					docFile: this.dfCache.get()
				};
			},
			reset: () => {
				const _reset = async () => {
					this.gCache.set({ 0: getDefaultRoot() });
					// Object.assign(dfMap, getobj());
					this.dCache.set({});
					this.dfCache.set({});
				};
				const func = _reset.bind(this);
				return this.stack(func);
			}
		},
		group: {
			insert: async (inputs) => {
				// await pause(2000);
				for (const _key of Object.keys(inputs)) {
					const key = Number(_key);
					const input = inputs[key];
					input['parentId'] ??= 0;
					const i = input as Group;
					// console.log(i)
					await this.gCache.update((dataMap) => {
						//check if already exist or parent doesnt exist
						if (
							dataMap?.[i.parentId]?.groups?.[i.id] ||
							(!dataMap?.[i.parentId] && !inputs[i.parentId])
						) {
							delete inputs[key];
							return dataMap;
						}
						for (const id of Object.values(dataMap?.[i.parentId]?.groups ?? {})) {
							if (dataMap?.[id]?.data?.name == input.name) {
								delete inputs[key];
								return dataMap;
							}
						}
						//add incremental id
						i['id'] ??= this._storer.group.custom.getId();
						dataMap[i.parentId] ??= { groups: {}, docs: {}, data: {} as any };
						dataMap[i.parentId]['groups'] ??= {};
						dataMap[i.parentId].groups[i.id] = i.id;
						dataMap[i.id] ??= { groups: {}, docs: {}, data: i };
						dataMap[i.id]['data'] = i;
						// inputs[i.name] ??= { ...i };
						// delete inputs[i.id];
						return dataMap;
					});
				}
				// console.log(inputs)
				return inputs as DataStyles.Group.Sets;
				// return dataMap?.[i.parentId]?.groups?.[i.name];
			},
			read: async (index) => {
				// await pause(2000);
				const ret: DataStyles.Group.Sets = {};
				// console.log('cache-group-read ');
				// console.log(index)
				if (!index) {
					// return all groups
					for (const child of Object.values(this.gCache.get())) {
						// TODO refresh if missing data value
						// if(!child?.data?.id) refresh
						ret[child.data.id] = child.data;
					}
					return ret;
				}
				// if id is specified
				if (index?.id) return { [index.id]: this.gCache.get()?.[index?.id]?.data };
				// if only parent or {} is specified
				const groups = this.gCache.get()?.[index?.group ?? 0]?.groups;
				for (const id of Object.values(groups ?? {})) {
					try {
						ret[id] = this.gCache.get()[id].data;
					} catch (error) {
						console.log(id);
						console.log(this.gCache.get()[id]);
					}
				}
				return ret;
			},
			update: async (input) => {
				console.log('update group cache');
				console.log(input);
				let ret;
				if (!input?.id) throw 'identifier id not valid';
				this.gCache.update((map) => {
					const i = map[input.id];
					console.log(i);
					if (!i) throw 'gCache data not exist';
					i.data = { ...i.data, ...input };
					// this.gCache.update((pmap) => {
					// 	// delete pmap[i.data.parentId].groups[i.data.name];
					// 	// pmap[i.data.parentId].groups[i.data.name] = i.data.id;
					// 	return pmap;
					// });
					ret = i.data;
					return map;
				});
				return ret;
			},
			delete: async (index) => {
				// await pause(2000);
				let ret: DataStyles.Group.Sets = {};
				//if Id is specified
				if (index?.id) {
					console.log('delgroup id');
					console.log(index);
					const i = this.gCache.get()?.[index?.id]?.data;
					if (!i) return ret;
					ret = {
						[i.id]: i
					};
					//delete children recursively
					ret = { ...ret, ...(await this._storer.group.delete({ group: i.id })) };
					//delete self and id in parent
					this.gCache.update((dataMap) => {
						// if (dataMap[index?.group ?? 0]?.groups)
						delete dataMap[i.id];
						delete dataMap[i.parentId].groups[i.id];
						return dataMap;
					});
					return ret;
				}
				//if group or {} or nothing is specified
				index = { group: index?.group ?? 0 };
				const parent = this.gCache.get()?.[index.group ?? 0];
				const groups = parent?.groups;
				if (!groups) return ret;
				//TODO refresh if group not found?
				await this._storer.doc.delete({ group: index.group });

				for (const id of Object.values(groups)) {
					// delete grandchildren recursively , separate so dont get returned
					await this._storer.doc.delete({ group: id });
					// delete children and add to return
					ret = {
						...ret,
						...(await this._storer.group.delete({
							id
						}))
					};
				}
				//empty children reference
				this.gCache.update((dataMap) => {
					parent.groups = {};
					return dataMap;
				});
				return ret;
			},
			custom: {
				currId: 1,
				getId() {
					return this.currId++;
				}
			}
		},
		doc: {
			insert: async (inputs) => {
				for (const _key of Object.keys(inputs)) {
					const key = Number(_key);
					const input = inputs[key];
					input['groupId'] ??= 0;
					const i = input as Doc;
					this.gCache.update((dataMap) => {
						//check if already exist or parent doesnt exist
						if (
							dataMap?.[i.groupId]?.docs?.[i.id] ||
							(!dataMap?.[i.groupId] && !inputs[i.groupId])
						) {
							delete inputs[key];
							return dataMap;
						}
						for (const id of Object.values(dataMap?.[i.groupId]?.docs ?? {})) {
							if (dataMap?.[id]?.data?.name == input.name) {
								delete inputs[key];
								return dataMap;
							}
						}
						//add incremental id
						i['id'] ??= this._storer.doc.custom.getId();
						dataMap[i.groupId] ??= { groups: {}, docs: {}, data: {} as any };
						dataMap[i.groupId]['docs'] ??= {};
						dataMap[i.groupId].docs[i.id] = i.id;
						this.dCache.update((datamap) => {
							datamap[i.id] ??= { docFiles: {}, data: i };
							datamap[i.id]['data'] = i;
							return datamap;
						});
						// inputs[i.name] ??= { ...i };
						// delete inputs[i.id];
						return dataMap;
					});
				}
				return inputs as DataStyles.Doc.Sets;
			},
			read: async (index) => {
				// console.log(`read doc ${index?.group}/${index?.id}`)
				// await pause(2000);
				const ret: DataStyles.Doc.Sets = {};
				if (!index) {
					// return all docs
					for (const child of Object.values(this.dCache.get())) {
						ret[child.data.id] = child.data;
					}
					return ret;
				}
				if (index?.id) return { [index.id]: this.dCache.get()?.[index.id].data };
				const docs = this.gCache.get()?.[index?.group ?? 0]?.docs;
				for (const id of Object.values(docs ?? {})) {
					try {
						ret[id] = this.dCache.get()[id].data;
					} catch (error) {
						console.log(id);
						console.log(this.dCache.get()[id]);
					}
				}
				return ret;
			},
			update: async (input) => {
				console.log('update doc cache');
				console.log(input);
				let ret;
				if (!input?.id) throw 'identifier id not valid';
				this.dCache.update((map) => {
					const i = map[input.id];
					console.log(i);
					if (!i) throw 'dCache data not exist';
					i.data = { ...i.data, ...input };
					// this.gCache.update((pmap) => {
					// 	// delete pmap[i.data.groupId].docs[i.data.name];
					// 	// pmap[i.data.groupId].docs[i.data.name] = i.data.id;
					// 	return pmap;
					// });
					ret = i.data;
					return map;
				});
				return ret;
			},
			delete: async (index) => {
				let ret: DataStyles.Doc.Sets = {};
				// console.log(index)
				if (index?.id) {
					const i = this.dCache.get()?.[index.id]?.data;
					// const i = this.gCache.get()?.[index?.group ?? 0]?.docs?.[index.id];
					// console.log(i)
					if (!i) return ret;
					ret = {
						[index.id]: i
					};
					await this._storer.docFile.delete({ doc: i.id });
					this.gCache.update((dataMap) => {
						if (dataMap[i.groupId]?.docs) delete dataMap[i.groupId].docs[i.id];
						return dataMap;
					});
					this.dCache.update((dataMap) => {
						delete dataMap[i.id];
						return dataMap;
					});
					return ret;
				}
				index = { group: index?.group ?? 0 };
				const parent = this.gCache.get()?.[index.group ?? 0];
				const docs = parent?.docs;
				if (!docs) return ret;
				for (const id of Object.values(docs)) {
					ret = {
						...ret,
						...(await this._storer.doc.delete({
							id
						}))
					};
				}
				this.gCache.update((dataMap) => {
					parent.docs = {};
					return dataMap;
				});
				return ret;
			},
			custom: {
				currId: 1,
				getId() {
					return this.currId++;
				}
			}
		},
		docFile: {
			insert: async (inputs) => {
				// console.log('cacheinsert doc');
				// console.log(inputs);
				// console.log(inputs)
				for (const _key of Object.keys(inputs)) {
					const key = Number(_key);
					const input = inputs[key];
					const i = input as DocFile;
					this.dCache.update((dataMap) => {
						// console.log(dataMap);
						if (
							!input?.docId ||
							dataMap?.[i?.docId ?? 0]?.docFiles?.[i.id] ||
							(!dataMap?.[i.docId] && !inputs[i.docId])
						) {
							delete inputs[key];
							return dataMap;
						}
						for (const id of Object.values(dataMap?.[i.docId]?.docFiles ?? {})) {
							if (dataMap?.[id]?.data?.name == input.name) {
								delete inputs[key];
								return dataMap;
							}
						}
						i['id'] ??= this._storer.docFile.custom.getId();
						i['isActive'] ??= 1;
						// dataMap[i.docId] ??= {};
						dataMap[i.docId] ??= { docFiles: {}, data: {} as any };
						dataMap[i.docId].docFiles ??= {};
						dataMap[i.docId].docFiles[i.id] = i.id;
						this.dfCache.update((dfmap) => {
							dfmap[i.id] = { data: i };
							// dfmap[i.id]['data'] = i;
							return dfmap;
						});
						return dataMap;
					});
				}
				return inputs as DataStyles.DocFile.Sets;
			},
			read: async (index) => {
				// TODO all reaad, cache = this.dfCache.get()
				const ret: DataStyles.DocFile.Sets = {};
				if (!index) {
					for (const child of Object.values(this.dfCache.get())) {
						ret[child.data.id] = child.data;
					}
					return ret;
				}
				if (index?.id) {
					return { [index.id]: this.dfCache.get()?.[index.id].data };
				}
				if (index?.doc) {
					const docFiles = this.dCache.get()?.[index?.doc ?? 0]?.docFiles;
					for (const id of Object.values(docFiles ?? {})) {
						ret[id] = this.dfCache.get()[id].data;
					}
					return ret;
				}
				return {};
			},
			update: async (input) => {
				console.log('update docFile cache');
				console.log(input);
				let ret;
				if (!input?.id) throw 'identifier id not valid';
				this.dfCache.update((map) => {
					const i = map[input.id];
					console.log(i);
					if (!i) throw 'dfCache data not exist';
					i.data = { ...i.data, ...input };
					// this.dCache.update((pmap)=>{
					// 	// delete pmap[i.data.docId].docFiles[i.data.name];
					// 	// pmap[i.data.docId].docFiles[i.data.name] = i.data.id;
					// 	return pmap;
					// })
					ret = i.data;
					return map;
				});
				return ret;
			},
			delete: async (index) => {
				console.log('deldocfile');
				console.log(index);
				let ret: DataStyles.DocFile.Sets = {};
				if (index?.id) {
					const i = this.dfCache.get()[index.id].data;
					if (!i) return ret;
					ret = {
						[index.id]: i
					};
					this.dCache.update((dataMap) => {
						if (dataMap?.[i.docId]?.docFiles?.[i.id])
							delete dataMap[i.docId].docFiles[i.id];
						return dataMap;
					});
					this.dfCache.update((dataMap) => {
						delete dataMap[i.id];
						return dataMap;
					});
					return ret;
				}
				if (index?.doc) {
					console.log('deldocfile bulk');
					const parent = this.dCache.get()?.[index.doc];
					const docFiles = parent?.docFiles;
					if (!docFiles) return ret;
					for (const id of Object.values(docFiles)) {
						ret = {
							...ret,
							...(await this._storer.docFile.delete({
								id
							}))
						};
					}
					this.dCache.update((dataMap) => {
						if (parent) parent.docFiles = {};
						// delete dataMap[index.doc];
						return dataMap;
					});
					return ret;
				}
				for (const id of Object.keys(this.dfCache.get())) {
					ret = {
						...ret,
						...(await this._storer.docFile.delete({ id: Number(id) }))
					};
				}
				return ret;
			},
			custom: {
				currId: 1,
				getId() {
					return this.currId++;
				}
			}
		}
	};
	//TODO boiler plate
	// _storer=this.storer;
	storer: Storer & Custom;
}

// const ddataMap: Writable<DataMap> = localStorageStore('dataMap', {0:{groups:{},docs:{}}} as DataMap);
// const dataMap = new MapCache<Writable<DataMap>>();
// dataMap.setWritable(ddataMap);
// const ddfMap: Writable<DfMap> = localStorageStore('dfMap', {} as DfMap);
// const dfMap = new MapCache();
// dfMap.setWritable(ddfMap);

export default WCache;
