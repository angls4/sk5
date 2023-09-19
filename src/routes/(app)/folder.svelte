<script lang="ts" defer>
	import { TreeView } from '@skeletonlabs/skeleton';
	import TreeViewItem from './tvitem.svelte';
	import storer from 'tes/src/lib/client/cacheFirst';
	import { gMap, dMap } from 'tes/src/lib/client/localCache';
	import cache from 'tes/src/lib/client/localCache';
	import type { DataStyles, Doc, Group } from 'tes/src/lib/xmemCachedd';
	import { goto } from '$app/navigation';
	import { gotoDoc, gotoGroup, refreshGroup, selecteds, showAccordion } from 'tes/src/lib/client/store';

	export let parent: number;	
	$: groups = [] as Group[];
	$: docs = [] as Doc[];

	async function get() {
		// if(!$gMap[parent]) return
		groups = Object.values(await storer.group.read({group:parent}));
		docs = Object.values(await storer.doc.read({group:parent}));
		// console.log('GROUOPS---'+parent)
		// console.log(groups) 
	}
	$:{
		if($gMap) get();
	}
	get();

	async function logServerMap(e: MouseEvent) {
		const res = await cache.custom.getMap();
		console.log(res);
	}
	async function handleCaretClick(group: Group) {
		if ($gMap[group.id]?.opened) {
			$gMap[group.id].opened = false;
		} else {
			$gMap[group.id].opened = true;
			refreshGroup(group);
		}
	}
    $: checkOpened = (id:number)=> {
        // console.log('ss -- '+id	)
        // console.log($gMap[id])
		const group = $gMap?.[id]?.data;
		if(!group )return false
		
        if($gMap[group.id]?.opened !== undefined) return true
        $gMap[group.id] ??= {docs:{},groups:{},data:group} ;
        $gMap[group.id].opened ??= false;
		return true
        // const ret =  $gMap?.[id]?.opened !== undefined?true:false;
		// console.log(ret)
		// return ret
    }

	//TODO : Object.keys jadikan Object values
</script>

<TreeView >
	{#each groups as group}
		{#if checkOpened(group.id)}
			<TreeViewItem
				onCaretClick={() => handleCaretClick(group)}
				onClick={()=>gotoGroup(group.id)}
				bind:open={$gMap[group.id]['opened']}
				tw-
				regionSymbol=""
				regionSummary="h-4"
				selected={$selecteds?.group == group.id}
			>
				<svelte:fragment slot="lead">
					{$gMap?.[group.id]?.['opened'] ?? false ? '📂' : '📁'}
				</svelte:fragment>
				<div class="max-w-fit overflow-x-hidden">
					{group.name}
				</div>
				<svelte:fragment slot="children">
					<svelte:self parent={group.id} />
					<!-- {#each Object.values($gMap?.[group.id]?.groups) as docName}
                        {/each} -->
				</svelte:fragment>
			</TreeViewItem>	
		{/if}
	{/each}
	<!-- {#if $gMap?.[parent]?.['opened']} -->
		{#each docs as doc}
			<TreeViewItem regionSummary="h-4 {$selecteds?.doc == doc.id ? "bg-gray-300" : ""}" selected={$selecteds?.doc == doc.id} onClick={()=>{gotoDoc(doc.id)?.then(()=>$showAccordion=true);$showAccordion=false}}>
				{doc?.name}
			</TreeViewItem>
		{/each}
	<!-- {/if} -->
	
</TreeView>
