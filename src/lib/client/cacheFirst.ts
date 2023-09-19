import * as maps from './localCache';
import cache from './localCache';
import requester, { setStore, type fType } from './requester';
import type { Storer, Requester } from '../interfaces';
import type { DataCrudStyle, DataStyles, Doc, Group } from '../xmemCachedd';
// import { pause } from '../cache';
import { XHRPromise, makeXhr } from '../xhrType';
import { pause } from '../cache';
import { refreshGroup, showAccordion } from './store';


const f: fType = (a, b) => {
    let f:any;
    if (b == 'read') {
		// f = async (inputs: any) => {
		// 	console.log('read');
		// 	(async () => {
		// 		const res = await requester[a]['read'](inputs);
		// 		if(res !== undefined){
		// 			// cache.
		// 			await cache[a]['delete'](inputs);
		// 			cache[a]['insert'](res as any);
		// 		}
		// 	})();
		// 	return await cache[a][b](inputs);
		// };
		f = async (inputs: any) => {
			const ret = await cache[a]['read'](inputs);
			return ret;
		};
	} else {
		f = async (inputs: any) => {
			const res = await requester[a][b](inputs);
			if (Object.keys(res ?? {}).length === 0) return;
			const ret = await cache[a][b]( b=='delete' ? inputs : res);
			return ret;
		};
	}
	const cacheFirst = async (
		inputs:
			| DataCrudStyle[keyof DataCrudStyle]['inputs']
			| DataCrudStyle[keyof DataCrudStyle]['index']
	) => {
		// console.log(a, b);
		const ret = await f(inputs);
		return ret;
		// return await cache[a][b](res);
	};
	return cacheFirst as Storer[typeof a][typeof b];
};

const gQueue:any = {};
const dQueue:any = {};

function convertToNameRecord<T>(inputs:Record<number,T>) {
	const ret :any = {}
	for (const input of Object.values(inputs as any)) {
		ret[(input as any).name] = (input as any).id;
	}
	return ret as {[name:string]:number};
}

const custom = {
	custom:{
		async getMap() {
			return (await makeXhr({
				target: '/api',
				responseType: 'json'
			}).send()).response;
		},
	},
	group: {
		custom: {
			async refresh(group:Group, force=false) {
				if (gQueue?.[group.parentId]?.[group.id] && force==false) throw `ngantri bos group ${group.parentId}/${group.id}`;
				gQueue[group.parentId] ??= {};
				gQueue[group.parentId][group.id] = true;
				await pause(300);
				let ret: { groups?: DataStyles.Group.Sets; docs?: DataStyles.Doc.Sets } = {};
				console.log('CACHEFIRST | refresh group');
				console.log(`group.id = ${group.id} group.parentId = ${group.parentId}`);
				try {
					const groups = await requester.group.read({ group: group.id });
					// const groupIds = convertToNameRecord(groups);
					// console.log(groups)
					const docs = await requester.doc.read({ group: group.id });
					ret = {groups,docs};
					console.log(ret)
					if((ret as any)?.groups?.refreshing == true || (ret as any)?.docs?.refreshing == true || !ret.groups || !ret.docs){
						console.log('cant get root data from server');
						console.log('retry refresh')
						await pause(1000);
						return await custom.group.custom.refresh(group,true);
					}
					// const docIds = convertToNameRecord(docs);
					maps.gMap.update((gmap) => {
						// const oldgIds = Object.values(gmap?.[group.id]?.groups ?? {});
						// const olddIds = Object.values(gmap?.[group.id]?.docs ?? {});
						const marked = Object.values(gmap?.[group.id]?.groups ?? {})
						gmap[group.id] ??= { groups: {}, docs: {},opened:false,data:group};
						gmap[group.id]['groups'] = {};
						for (const child of Object.values(groups)) {
							gmap[child.parentId]['groups'][child.id] = child.id;
							gmap[child.id] ??= { groups: {}, docs: {},opened:false,data:child};
							gmap[child.id]['data'] = child;
							gmap[child.id]['markedForDelete'] = false;
						}
						for (const id of marked) {
							const parent = gmap[id].data.parentId;
							const parentChilds = Object.values(gmap[parent].groups)
							if (parentChilds.indexOf(id) == -1) gmap[id]['markedForDelete'] = true;
							// if (parentChilds.indexOf(id) == -1) cache.group.delete({id});
						}
						maps.dMap.update((dmap)=>{
							const marked = Object.values(gmap?.[group.id]?.docs ?? {})
							gmap[group.id]['docs'] 	= {};
							for (const child of Object.values(docs)) {
								gmap[group.id]['docs'][child.id] = child.id;
								dmap[child.id] ??= { docFiles: {},data:child};
								dmap[child.id]['data'] = child;
								dmap[child.id]['markedForDelete'] = false;
							}
							for (const id of marked) {
								const parent = dmap[id].data.groupId;
								const parentChilds = Object.values(gmap[parent].docs);
								if (parentChilds.indexOf(id) == -1) dmap[id]['markedForDelete'] = true;
								// if (parentChilds.indexOf(id) == -1) cache.doc.delete({ id });
							}
							return dmap;
						})
						return gmap;
					});
					// return cache.custom.getMap().data;
				} catch (error) {
					console.log('CACHEFIRST | FAILED refresh group ');
					console.log(error);
				}
				delete gQueue[group.parentId][group.id];
				return ret;
			}
		}
	},
	doc: {
		custom: {
			
			async refresh(doc:Doc) {
				if (dQueue?.[doc.groupId]?.[doc.id]) throw `ngantri bos doc ${doc.groupId}/${doc.id}`;
				dQueue[doc.groupId] ??= {};
				dQueue[doc.groupId][doc.id] = true;
				await pause(300);
				console.log('CACHEFIRST | refresh doc');
				console.log(`doc.id = ${doc.id} parent = ${doc.groupId}`);
				try {
					const docFiles = await requester.docFile.read({ doc: doc.id });
					// const docFilesIds = convertToNameRecord(docFiles);
					console.log(docFiles)
					maps.dMap.update((dmap) => {
						dmap[doc.id] ??= { docFiles: {}, data: doc };
						dmap[doc.id]['data'] = doc;
						// marked.reduce()
						maps.dfMap.update((dfmap) => {
							const marked = Object.values(dmap?.[doc.id]?.docFiles ?? {});
							dmap[doc.id]['docFiles'] = {};
							for (const df of Object.values(docFiles ?? {})) {
								dmap[df.docId]['docFiles'][df.id]= df.id;
								dfmap[df.id] ??= { data: df };
								const type = dfmap?.[df.id]?.data?.fileType;
								dfmap[df.id].data = df;
								dfmap[df.id].data['fileType'] = type;
								dfmap[df.id]['markedForDelete'] = false;
							}
							for (const id of marked) {
								const parent = dfmap[id].data.docId;
								const parentChilds = Object.values(dmap[parent].docFiles);
								if (parentChilds.indexOf(id) == -1) dfmap[id]['markedForDelete'] = true;
								// if (parentChilds.indexOf(id) == -1) cache.docFile.delete({ id });
							}
							return dfmap;
							});
							// const marked = {};
						return dmap;
					});
					// console.log(docFiles)
					// return cache.custom.getMap().data;
				} catch (error) {
					console.log('CACHEFIRST | FAILED refresh doc ');
					console.log(error);
				}
				// showAccordion.set(false);
				delete dQueue[doc.groupId][doc.id];
			}
		}
	}
};

export const init = async () => {
	console.log('initializing cacheFirst');
	maps.init();
	// storer;
};

const storer = setStore(f,custom);

export default storer