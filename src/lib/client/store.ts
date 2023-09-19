// import storer from "./cacheFirst";
// import { gMap, dMap } from 'tes/src/lib/client/localCache';

import { localStorageStore } from "@skeletonlabs/skeleton";
import type { Doc, DocFile, Group } from "../xmemCachedd";
import { writable, type Writable } from "svelte/store";
import { dMap, dfMap, gMap } from "./localCache";
import cache from './localCache';
import { getDefaultRootData } from "../cache";
import storer from "./cacheFirst";
import { goto } from "$app/navigation";


// export async function refreshGroup(id = 0, parent = -1) {
// 	const groups = await storer.group.custom.refresh(id, parent);
// 	storer.doc.custom.refresh(id, parent);
// 	for (const group of Object.values(groups)) {
// 		if (gMap..[group.id]?.opened) refreshGroup(group.id, group.parentId);
// 	}
// }
export function gotoGroup(id?:unknown){
    if((Number(id)+1))
    goto(`/group-${Number(id)}`);
}
export function gotoDoc(id?:unknown){
    if(Number(id)){

        return goto(`/doc-${Number(id)}`);
    }
}

export function cleanGarbage(){
    for (const { data } of Object.values(gMap.get())) {
        if(data.id == 0) continue;
		const parentChilds = Object.values(gMap.get()?.[data.parentId]?.groups ?? {});
		if (parentChilds.indexOf(data.id) == -1) cache.group.delete({ id: data.id });
        else gMap.update((map)=>{
            map[data.id]['markedForDelete'] = false;
            return map;
        })
	}
    for (const { data } of Object.values(dMap.get())) {
		const parentChilds = Object.values(gMap.get()?.[data.groupId]?.docs ?? {});
		if (parentChilds.indexOf(data.id) == -1) cache.doc.delete({ id: data.id });
        else dMap.update((map)=>{
            map[data.id]['markedForDelete'] = false;
            return map;
        })
	}
    for (const {data,markedForDelete} of Object.values(dfMap.get())) {
        try {
            
            const parentChilds = Object.values(dMap.get()?.[data.docId]?.docFiles ?? {});
            if (markedForDelete)
				if (parentChilds.indexOf(data.id) == -1)
					cache.docFile.delete({ id: data.id }).catch();
				else
					dfMap.update((map) => {
						map[data.id]['markedForDelete'] = false;
						return map;
					});
        } catch (error) {
            console.log('error cleaning garbage dofile' + error)
        }
	}
}

export async function refreshGroup(group?: Group|number,forceAll=false,updateDoc=false) {
    group ??= getDefaultRootData();
    if(typeof group == 'number') group = gMap.get()[group].data;
	const {groups,docs} = await storer.group.custom.refresh(group);
    const promises = [];
	// storer.doc.custom.refresh(id, parent);
	for (const group of Object.values(groups)) {
		if (gMap.get()?.[group.id]?.opened || forceAll) promises.push(refreshGroup(group,forceAll,updateDoc));
	}
    if(updateDoc){
        for (const doc of Object.values(docs)) {
            if (gMap.get()?.[group.id]?.opened || forceAll) promises.push(storer.doc.custom.refresh(doc));
        }
	}
    
    await Promise.allSettled(promises);
    return true;
}

export type Selecteds = {
    group?:Group['id'],
    doc?:Doc['id'],
    docFile?:DocFile['id'],
    type?:'group'|'doc'|'docFile',
}

export function openGroupRecursively(id?:number){
    if(id === undefined) return;
    if(id <= 0) return;
    gMap.update((map)=>{
        if(map[id]) map[id]['opened'] = true;
        return map;
    })
    openGroupRecursively(gMap.get()?.[id]?.data.parentId);
    console.log(`opened ${id}`)
}

export type workSpace = {
    tabs:number[],
    active:number
}


export const selecteds= localStorageStore('selecteds', {} as Selecteds);
export const showAccordion = writable(false);
export const dfOrder = localStorageStore('dfOrder', {} as { [x: DocFile['id']]: number });
export const cardOrder = localStorageStore('cardOrder', {} as { [x: number]: number });
export const dfSizes = localStorageStore('dfSizes', [] as number[]);
export const mainSplitSizes = localStorageStore('mainSplitSizes', [] as number[]);
export const workSpaces = localStorageStore('workSpaces', [{tabs:[],active:0}]);
// export const docTabs = localStorageStore('docTabs', [] as number[]);

// {#each docFiles as id}
// 					{#await getDivId() then divId}
// 						<div id={`dfcard-${divId}`} class="h-full overflow-x-hidden overflow">
// 							{#if $showAccordion}
// 								<!-- <div id={`dfdata-${id}`}> -->
// 									<DfItem
// 										handleMount={() => {
// 											renderedDf += 1;
// 											console.log('rendered to ' + renderedDf);
// 											if (splitIds.length + renderedDf >= docFiles.length)
// 												handleAllRendered();
// 										}}
// 										docFile={$dfMap[
                                            
//                                         ].data}
// 									/>
// 								<!-- </div> -->
// 							{/if}
// 						</div>
// 					{/await}
// 				{/each}



//                 {#each docFiles as id}
// 				<TabItem
// 					id={`dfitem-${id}`}
// 					{handleSwap}
// 					bind:group={tabSet}
// 					name={`tab-${id}`}
// 					value={id}
// 				>
// 					<div>
// 						{id}
// 						<!-- <div class="select-none" on:click={(a) => handleReorderLeft(id, divId)}>left</div>
// 					<div class="select-none" on:click={(a) => handleReorderRight(id, divId)}>right</div> -->
// 					</div>
// 				</TabItem>
// 			{/each}