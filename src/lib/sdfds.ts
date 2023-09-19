import type { DataMap, DFMap, DMap } from '$lib/storeType';
import type { Storer } from './interfaces';
import { Queue } from './queue';
import type { Group, DataStyles, Doc, DocFile } from './xmemCachedd';

// const _dataMap : _DataMap = {groups:{}};

export interface MapCache<T> {
	// modify: <A,B,C,T extends (A extends number?(B extends number?(C extends number?DocFileDataMap[number]:DocDataMap[number]):GroupDataMap[number]):DataMap)>(value:T,index:{group:A,doc:B,docFile:C})=>T;
	update(a: (a: T) => T): void;
	get(): T;
	set(value: T): void;
}

// function get<T>(a: T): T {
// 	return a;
// }

export type Maps = {
	data: DataMap;
	docFile: DMap;
};

export function pause(ms: number) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			console.log('bla bla');
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
	}
	// dataMap;
	// dfMap;
	private gCache;
	private dCache;
	private dfCache;
	private recur = () => {
		if (this.callStack.size() > 0) {
			const call = this.callStack.dequeue() as Calls;
			const func = <T>(f: (a: T) => T, a: T) => {
				this.calling = undefined;
				f(a);
				this.recur();
			};
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
	private callStack = new Queue<Calls>();
	private stack = <T>(func: () => Promise<T>) => {
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
			this.callStack.enqueue(janji);
		});
		if (!this?.calling) this.recur();
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
					docFile: this.dCache.get()
				};
			},
			reset: () => {
				this.gCache.set({ 0: { groups: {}, docs: {}, parent: -1 } });
				// Object.assign(dfMap, getobj());
				this.dCache.set({});
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
					await this.gCache.update((dataMap) => {
						if (dataMap?.[i.parentId]?.groups?.[i.name] || !dataMap?.[i.parentId]) {
							delete inputs[key];
							return dataMap;
						}
						i['id'] ??= this._storer.group.custom.getId();
						// dataMap[i.parentId] ??= { groups: {}, docs: {} };
						dataMap[i.id] ??= { groups: {}, docs: {}, parent: i.parentId };
						dataMap[i.parentId]['groups'] ??= {};
						dataMap[i.parentId].groups[i.name] = i;
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
				console.log('nogo');
				// console.log(index)
				if (!index) {
					//[string]:group
					for (const children of Object.values(this.gCache.get())) {
						for (const child of Object.values(children.groups)) ret[child.id] = child;
					}
					return ret;
				}
				if (index?.id)
					return { [index.id]: this.gCache.get()?.[index?.group ?? 0]?.groups[index.id] };
				return this.gCache.get()?.[index?.group ?? 0]?.groups;
			},
			update: async (input) => {
				input;
				return { 9999: { id: -1, name: '', parentId: -1 } };
			},
			delete: async (index) => {
				// await pause(2000);
				let ret: DataStyles.Group.Sets = {};
				if (index?.id) {
					// console.log('delgroup id')
					// console.log(index)
					const i = this.gCache.get()?.[index?.group ?? 0]?.groups?.[index.id];
					if (!i) return ret;
					ret = {
						[index.id]: i
					};
					ret = { ...ret, ...(await this._storer.group.delete({ group: i.id })) };
					this.gCache.update((dataMap) => {
						// if (dataMap[index?.group ?? 0]?.groups)
						delete dataMap[i.id];
						delete dataMap[i.parentId].groups[i.name];
						return dataMap;
					});
					return ret;
				}
				if (index?.group !== undefined) {
					// console.log('delgroup group');
					// console.log(index);
					if (!this.gCache.get()[index.group ?? 0]?.groups) return ret;
					await this._storer.doc.delete({ group: index.group });

					for (const children of Object.values(
						this.gCache.get()[index.group ?? 0].groups
					)) {
						await this._storer.doc.delete({ group: children.id });
						ret = {
							...ret,
							...(await this._storer.group.delete({
								id: children.name,
								group: children.parentId
							}))
						};
					}
					this.gCache.update((dataMap) => {
						dataMap[index.group ?? 0].groups = {};
						return dataMap;
					});
					return ret;
				}
				// console.log('delgroup root');
				// console.log(index);
				ret = { ...ret, ...(await this._storer.group.delete({ group: 0 })) };
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
						if (dataMap?.[i.groupId]?.docs?.[i.name] || !dataMap?.[i.groupId]) {
							delete inputs[key];
							return dataMap;
						}
						i['id'] ??= this._storer.doc.custom.getId();
						// dataMap[i.groupId] ??= { groups: {}, docs: {} };
						// dataMap[i.groupId] ??= { groups: {}, docs: {} };
						// dataMap[i.groupId]['groups'] ??= {};
						dataMap[i.groupId]['docs'] ??= {};
						dataMap[i.groupId].docs[i.name] = i;
						this.dCache.update((datamap) => {
							datamap[i.id] ??= { docFiles: {}, parent: i.id };
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
				// await pause(2000);
				if (!index) {
					let ret: DataStyles.Doc.Sets = {};
					for (const children of Object.values(this.gCache.get())) {
						ret = { ...ret, ...children.docs };
					}
					return ret;
				}
				if (index?.id)
					return { [index.id]: this.gCache.get()?.[index?.group ?? 0]?.docs[index.id] };
				return this.gCache.get()?.[index?.group ?? 0]?.docs;
			},
			update: async (input) => {
				input;
				return { 999: { id: -1, name: '', groupId: 1 } };
			},
			delete: async (index) => {
				let ret: DataStyles.Doc.Sets = {};
				if (index?.id) {
					const i = this.gCache.get()?.[index?.group ?? 0]?.docs?.[index.id];
					if (!i) return ret;
					ret = {
						[index.id]: i
					};
					await this._storer.docFile.delete({ doc: i.id });
					this.gCache.update((dataMap) => {
						if (dataMap[index?.group ?? 0]?.docs)
							delete dataMap[index?.group ?? 0].docs[i.name];
						return dataMap;
					});
					this.dCache.update((dataMap) => {
						delete dataMap[i.id];
						return dataMap;
					});
					return ret;
				}
				if (index?.group !== undefined) {
					if (!this.gCache.get()?.[index?.group ?? 0]?.docs) return ret;
					for (const children of Object.values(
						this.gCache.get()[index.group ?? 0].docs
					)) {
						ret = {
							...ret,
							...(await this._storer.doc.delete({
								id: children.name,
								group: children.groupId
							}))
						};
					}
					this.gCache.update((dataMap) => {
						dataMap[index.group ?? 0].docs = {};
						return dataMap;
					});
					return ret;
				}
				ret = { ...ret, ...(await this._storer.doc.delete({ group: 0 })) };
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
				for (const _key of Object.keys(inputs)) {
					const key = Number(_key);
					const input = inputs[key];
					const i = input as DocFile;
					this.dCache.update((dataMap) => {
						console.log(dataMap);
						if (
							!input?.docId ||
							dataMap?.[i?.docId ?? 0]?.docFiles?.[i.name] ||
							!dataMap?.[i.docId]
						) {
							delete inputs[key];
							return dataMap;
						}
						i['id'] ??= this._storer.docFile.custom.getId();
						i['isActive'] ??= 1;
						// dataMap[i.docId] ??= {};
						dataMap[i.docId].docFiles ??= {};
						dataMap[i.docId].docFiles[i.name] = i;
						// inputs[i.name] ??= { ...i };
						// delete inputs[i.id];
						return dataMap;
					});
					this.dfCache.update((datamap) => {
						datamap[i.id] = { parent: i.docId };
						return datamap;
					});
				}
				return inputs as DataStyles.DocFile.Sets;
			},
			read: async (index) => {
				if (!index) {
					let ret: DataStyles.DocFile.Sets = {};
					Object.values(this.dCache.get()).forEach((children) => {
						ret = { ...ret, ...(children?.docFiles ?? {}) };
					});
					return ret;
				}
				if (!index?.doc) return {};
				if (index?.id)
					return { [index.id]: this.dCache.get()?.[index.doc]?.docFiles?.[index.id] };
				return this.dCache.get()?.[index.doc]?.docFiles;
			},
			update: async (inputs) => {
				return {
					999: {
						dateCreated: '',
						docId: -1,
						id: -1,
						isActive: 0,
						name: '',
						userId: '0'
					}
				};
				// const ret: DataStyles.DocFile.Sets = {};
				// for (const [_id, input] of Object.entries(inputs)) {
				// 	const id = Number(_id);
				// 	if (!input?.docId) continue;
				// 	if (this.dCache.get()[input.docId].docFiles[id]) if (!updated) continue;
				// 	const res = await db
				// 		.selectFrom('DocFile')
				// 		.selectAll()
				// 		.where('id', '=', id)
				// 		.executeTakeFirst();
				// 	if (res) ret[id] = res;
				// }
				// return ret;
			},
			delete: async (index) => {
				console.log('deldocfile');
				console.log(index);
				let ret: DataStyles.DocFile.Sets = {};
				if (index && !index?.doc) return {};
				if (index?.id) {
					const i = this.dCache.get()?.[index.doc as number]?.docFiles?.[index.id];
					if (!i) return ret;
					ret = {
						[index.id]: i
					};
					this.dCache.update((dataMap) => {
						delete dataMap[i.docId].docFiles[i.name];
						return dataMap;
					});
					this.dfCache.update((dataMap) => {
						delete dataMap[i.id];
						return dataMap;
					});
					return ret;
				}
				if (index?.doc) {
					console.log('hey');
					if (!this.dCache.get()?.[index.doc]?.docFiles) return ret;
					for (const children of Object.values(this.dCache.get()[index.doc].docFiles)) {
						ret = {
							...ret,
							...(await this._storer.docFile.delete({
								id: children.name,
								doc: children.docId
							}))
						};
					}
					this.dCache.update((dataMap) => {
						dataMap[index.doc as number].docFiles = {};
						// delete dataMap[index.doc];
						return dataMap;
					});
					return ret;
				}
				for (const docId of Object.keys(this.dCache.get())) {
					ret = {
						...ret,
						...(await this._storer.docFile.delete({ doc: Number(docId) }))
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
	storer: Storer & Custom = {
		custom: this._storer.custom,
		group: {
			insert: (inputs) => {
				const func = this._storer.group.insert.bind(this, inputs);
				return this.stack(func);
			},
			read: this._storer.group.read,
			update: (inputs) => {
				const func = this._storer.group.update.bind(this, inputs, {});
				return func();
			},
			delete: (inputs) => {
				const func = this._storer.group.delete.bind(this, inputs);
				return this.stack(func);
			},
			custom: this._storer.group.custom
		},
		doc: {
			insert: (inputs) => {
				const func = this._storer.doc.insert.bind(this, inputs);
				return this.stack(func);
			},
			read: this._storer.doc.read,
			update: (inputs) => {
				const func = this._storer.doc.update.bind(this, inputs, {});
				return func();
			},
			delete: (inputs) => {
				const func = this._storer.doc.delete.bind(this, inputs);
				return this.stack(func);
			},
			custom: this._storer.doc.custom
		},
		docFile: {
			insert: (inputs) => {
				const func = this._storer.docFile.insert.bind(this, inputs);
				return this.stack(func);
			},
			read: this._storer.docFile.read,
			update: (inputs) => {
				const func = this._storer.docFile.update.bind(this, inputs, { doc: -1 });
				return func();
			},
			delete: (inputs) => {
				const func = this._storer.docFile.delete.bind(this, inputs);
				return this.stack(func);
			},
			custom: this._storer.docFile.custom
		}
	};
}

// const ddataMap: Writable<DataMap> = localStorageStore('dataMap', {0:{groups:{},docs:{}}} as DataMap);
// const dataMap = new MapCache<Writable<DataMap>>();
// dataMap.setWritable(ddataMap);
// const ddfMap: Writable<DfMap> = localStorageStore('dfMap', {} as DfMap);
// const dfMap = new MapCache();
// dfMap.setWritable(ddfMap);

export default WCache;
