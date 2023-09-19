<script lang="ts" defer>
	import { AppShell, TabAnchor, TabGroup, TreeView } from '@skeletonlabs/skeleton';
	import Split from 'split.js';
	import TreeViewItem from './tvitem.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import storer, { init } from 'tes/src/lib/client/cacheFirst';
	import { gMap, dMap } from 'tes/src/lib/client/localCache';
	import cache from 'tes/src/lib/client/localCache';
	import type { Group } from 'tes/src/lib/xmemCachedd';
	import Folder from './folder.svelte';
	import {
		cleanGarbage,
		gotoDoc,
		gotoGroup,
		mainSplitSizes,
		refreshGroup,
		selecteds
	} from 'tes/src/lib/client/store';
	import { page } from '$app/stores';

	// $: groups = Object.values($gMap[0]['groups']);

	async function logServerMap(e: MouseEvent) {
		const res = await storer.custom.getMap();
		console.log(res);
	}

	onMount(() => {
		refreshGroup(undefined, true, true).then(cleanGarbage);
		gotoGroup($selecteds?.group);
		gotoDoc($selecteds?.doc);
		console.log('onmount');
		const split = Split(['#sidebar-left', '#page'], {
			onDragEnd(sizes) {
				mainSplitSizes.set(sizes);
			},
			minSize: 10
		});
		if ($mainSplitSizes) split.setSizes($mainSplitSizes);
		init();
	});
	//TODO : Object.keys jadikan Object values
</script>

<!-- <svelte:fragment slot="pageHeader">
	<TabGroup class="h-full" regionList="h-full">
		<TabAnchor href="/">	
			<svelte:fragment slot="lead">🏠</svelte:fragment>
			<span>Home</span>
		</TabAnchor>
		<TabAnchor href="/add">Add</TabAnchor>	
		<TabAnchor on:click={()=>refreshGroup()} >refresh</TabAnchor>	
		<TabAnchor on:click={gdatamap} >Datamap</TabAnchor>
		<TabAnchor on:click={logServerMap} >LogServerMap</TabAnchor>	
		<TabAnchor on:click={()=>goto('/test')} >test</TabAnchor>	
	</TabGroup>					
</svelte:fragment> -->
<AppShell
	tw-
	slotSidebarLeft="min-w-0 max-w-screen overflow-y-scroll overflow-x-scroll "
	slotHeader="h-[30px]"
	slotPageContent="h-[calc(100%-30px)]"
>
	<svelte:fragment slot="sidebarLeft">
		<div class="border-b-2 border-black">Well</div>
		<div class="border-b-[1px] border-black flex justify-end h-14">
			<!-- <div class="{$selecteds?.doc == undefined ? "hidden":''} border-l-2 border-black cursor-pointer select-none text-xs" on:click={()=>goto(`doc-${$selecteds.doc}/edit`)}>📰➕</div>
			<div class="border-l-2 border-black cursor-pointer select-none text-xs" on:click={()=>gotoGroup(0)}>📁➕</div> -->
			<div
				class="{!$selecteds?.group && !$selecteds?.doc ? "hidden" : ""} w-14 flex flex-col items-center justify-center border-l-2 border-black cursor-pointer  select-none"
				on:click={() => goto(`doc-${$selecteds.doc}/edit`)}
			>
				<div>✏️</div>
				<div class="text-sm">Edit</div>
			</div>
			<div
				class="w-14 flex flex-col items-center justify-center border-l-2 border-black cursor-pointer  select-none"
				on:click={() => gotoGroup(0)}
			>
				<div>➕</div>
				<div class="text-sm">New</div>
			</div>
		</div>
		<div class="min-w-max max-w-full">
			<Folder parent={0} />
		</div>
	</svelte:fragment>
	<!-- (sidebarRight) -->
	<!-- (pageHeader) -->
	<!-- Router Slot -->
	<!-- <div>
		<button on:click={()=>{console.log($gMap)}}>log groupMap</button>
		<button on:click={()=>{console.log($dMap)}}>log docMap</button>
	</div> -->

	<slot />

	<!-- ---- / ---- -->
	<!-- (pageFooter) -->
	<!-- (footer) -->
</AppShell>
