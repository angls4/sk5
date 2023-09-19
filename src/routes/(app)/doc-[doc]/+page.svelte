<script lang="ts">
	import { goto } from '$app/navigation';
	import { Accordion, Tab, TabAnchor } from '@skeletonlabs/skeleton';
	import storer from 'tes/src/lib/client/cacheFirst';
	import {
		dfOrder,
		dfSizes,
		gotoGroup,
		openGroupRecursively,
		refreshGroup,
		selecteds,
		showAccordion,
		workSpaces
	} from 'tes/src/lib/client/store';
	import type { Group, Doc } from 'tes/src/lib/xmemCachedd';
	import { dMap, dfMap, gMap } from 'tes/src/lib/client/localCache';
	import Uploader from './uploader.svelte';
	import { page } from '$app/stores';
	import { onMount, tick } from 'svelte';
	import DfItem from './dfItem.svelte';
	import Split from 'split.js';
	import TabItem from './tabItem.svelte';
	import TabGroup from './tabgroup.svelte';

	// delete $selecteds['group'];
	$: paramsId = Number($page.params?.doc);
	let splitted: Split.Instance;
	let renderedDf = 0;
	let beo = 0;
	let doc: Doc;

	$: {
		console.log('tofott');
		if (!$showAccordion && !mount) $showAccordion = true;
		rerenderDf++;
		doc = $dMap?.[paramsId]?.data;
		if ($selecteds['doc'] != paramsId || !doc || !mount) {
			// beo = 0;
			// renderedDf = 0;
			console.log('selected ' + paramsId);
			// $selecteds['doc'] = paramsId;
			// $selecteds['type'] = 'doc';
			$selecteds = { doc: paramsId }
			// console.log("selected " + $selecteds['doc']?.groupId)
			if (doc) {
				storer.doc.custom.refresh(doc).then(() => {
					// $showAccordion = true;
					console.log('selected bala');
				});
				// openGroupRecursively(doc.groupId);
			} else {
				$selecteds = {};
				// $selecteds['type'] = undefined;
				// dQueue?.[paramsId]?.then(()=>$showAccordion = false)
			}
		}
	}
	// console.log($selecteds['doc'])

	// $: doc = $dMap?.[id]?.data;
	let mount = false;
	let docFiles: number[];
	$: {
		console.log('show acccord ' + $showAccordion);
		if ($showAccordion || true) {
			renderedDf = 0;
		}
	}
	function isWsCountChange() {
		return wsTabs.length != renderedWs;
	}
	let renderedWs = 0;
	let updateCount = 0;
	$: {
		(async () => {
			const uc = updateCount++;
			console.log('$ updated ' + uc);
			// beo=0;
			// renderedDf= renderedDf - docFiles?.length ?? 0;
			// if(docFiles?.length ?? 0 < renderedDf) renderedDf = docFiles?.length ?? 0;
			const _docFiles = Object.values($dMap[doc?.id as number]?.docFiles ?? {});
			handleOrdering(_docFiles);
			renderedWs = 0;
			destroySplit();
			await tick();
			console.log(`ticked - ${uc}`);

			// if ((docFiles?.length ?? 0) < beo) beo = docFiles?.length ?? 0;
			// if (isWsCountChange()) {
			makeSplit();
			// renderedDf = splitIds.length
			// handleAllRendered();
			// }

			// beo = splitIds.length
			// console.log('beo '+beo)
		})();
	}
	function destroySplit() {
		if (splitted?.destroy) {
			try {
				splitted.destroy();
				splitted = undefined;
				splitIds = [];
				console.log('split destroy');
			} catch (error) {
				console.log('split destroy error ' + error);
			}
		}
	}
	function makeSplit() {
		// splitIds = Object.values(docFiles).map((id) => `#dfitem-${id}`);
		if (splitted?.destroy) return;
		splitIds = [...Array($workSpaces.length).keys()].map((id) => `#ws-${id}`);
		// splitIds.push('#ws-end');
		console.log(splitIds);
		if (splitIds.length > 1) {
			try {
				console.log('splitting');
				splitted = Split(splitIds, {
					direction: 'horizontal',
					onDragEnd(sizes) {
						dfSizes.set(merge(sizes, $dfSizes));
					},
					// sizes:$dfSizes.slice(0, splitIds.length-1),
					minSize: 0
				});
				const _dfSizes = $dfSizes.slice(0, splitIds.length);
				const totalDfSizes = _dfSizes.reduce((partialSum, a) => partialSum + a, 0);
				console.log(_dfSizes);
				console.log(totalDfSizes);
				if (100 - totalDfSizes > 3) _dfSizes[_dfSizes.length - 1] += 100 - totalDfSizes;
				console.log(_dfSizes);
				splitted.setSizes(_dfSizes);
				// splitted.setSizes($dfSizes.slice(0, splitIds.length));
				// splitted.setSizes($dfSizes);
				dfSizes.set(merge(splitted.getSizes(), $dfSizes));
			} catch (error) {
				splitIds = [];
				console.log('split error ' + error);
			}
		}
	}
	let thisWs;
	function handleOrdering(_docFiles: number[]) {
		docFiles = [];
		for (const id of _docFiles) {
			$dfOrder[id] ??= docFiles.length;
			// console.log(`${id} order = ${$dfOrder[id]}`);
			// docFiles.splice($dfOrder[id], 1, id);
			if (docFiles[$dfOrder[id]] != undefined) {
				docFiles[docFiles.length] = docFiles[$dfOrder[id]];
			}
			docFiles[$dfOrder[id]] = id;
			// console.log(docFiles);
		}
		// docFiles = docFiles.filter(Number);
		// console.log(docFiles);
		let count = 0;
		for (const id of docFiles) {
			// console.log(id)
			count++;
			$dfOrder[id] = docFiles.indexOf(id);
		}
		if (_docFiles.length != count) docFiles = _docFiles; //handle rare case
		// const oldWsTabsLen = wsTabs.length;
		wsTabs = [];
		const absen = [];
		$workSpaces ??= [{ tabs: [], active: 0 }];
		for (const ws of $workSpaces) {
			let j = 0;
			for (const divId of ws.tabs) {
				if (docFiles[divId] != undefined) absen[divId] = 1;
				else if (absen[divId] == 1) {
					// console.log($workSpaces)
					// console.log(j)
					// // delete ws.tabs[tab]; //donest work
					ws.tabs.splice(j, 1);
					// console.log($workSpaces)
				}
				// todo kalo gada di docfiles
				j++;
			}
		}
		for (const id of docFiles) {
			if (absen[docFiles.indexOf(id)] != 1) {
				$workSpaces[0].tabs = [...($workSpaces?.[0]?.tabs ?? []), docFiles.indexOf(id)];
				// console.log(docFiles.indexOf(id));
			}
		}
		for (const ws of $workSpaces) {
			if (ws.active > ws.tabs.length - 1)
				ws.active = ws.tabs.length > 0 ? ws.tabs.length - 1 : 0;
		}
		// // const newWsTab = [];
		// // wsTabs[$docTabs[i]] = []
		// for (let i = 0; i < docFiles.length; i++) {
		// 	$docTabs[i] ??= 0;
		// 	wsTabs[$docTabs[i]] = [...(wsTabs[$docTabs[i]] ?? []), i];
		// }
		// console.log(wsTabs);
		// wsTabs = wsTabs.filter(Array);
		// console.log(wsTabs);
		// $workSpaces ??= [];
		// for (let i = 0; i < wsTabs.length; i++) {
		// 	$workSpaces[i] ??= 0;
		// 	if($workSpaces[i] >= wsTabs[i].length) $workSpaces[i] = 0;
		// }
	}


	function getDivId() {
		const ret = beo++;
		console.log('get beo ' + ret);
		return ret;
	}
	let splitIds: string[] = [];
	function merge<T>(a: Array<T>, b: Array<T>, i = 0) {
		return a.slice(0, a.length).concat(b.slice(a.length, b.length));
	}
	function handleAllRendered() {
		console.log('all rendered ' + renderedDf);
		console.log('beo ' + beo);
		console.log('splitl' + splitIds.length);
		// renderedDf = 0
		if (splitIds.length != beo) {
			if (splitted?.destroy) {
				try {
					splitted.destroy(true);
					splitIds = [];
					console.log('split destroy');
				} catch (error) {
					console.log('split destroy error ' + error);
				}
			}
			// splitIds = Object.values(docFiles).map((id) => `#dfitem-${id}`);
			splitIds = [...Array(docFiles.length).keys()].map((id) => `#ws-${id}`);
			splitIds.push('#ws-end');
			beo = splitIds.length;
			console.log('beo ' + beo);
			if (splitIds.length > 1) {
				try {
					console.log(splitIds);
					splitted = Split(splitIds, {
						direction: 'horizontal',
						onDragEnd(sizes) {
							dfSizes.set(merge(sizes, $dfSizes));
						},
						minSize: 0
					});
					splitted.setSizes($dfSizes.slice(0, beo));
					dfSizes.set(merge(splitted.getSizes(), $dfSizes));
				} catch (error) {
					splitIds = [];
					console.log('split error ' + error);
				}
			}
		}
		// renderedDf=0;
		// splitted = Split(ids,{direction:'horizontal'});
	}
	let tablist = { tl: undefined as HTMLElement };
	onMount(() => {
		// const ids = docFiles.map((id)=>`#dfitem-${id}`);
		// DoubleScroll('panelContainer');
		mount = true;
		console.log('mount');
	});

	function reorder(dragged: number, droppedOn: number) {
		handleSwap(dragged, droppedOn);
		// const aa = document
		// 	.getElementById(`dfitem-${divId}`)
		// 	?.firstElementChild?.id?.split('dfdata-')[1];
		// console.log('passed swap id ' + _id);
		// console.log(aa + ' swap ' + divId);
		// const id = Number(aa);
		// const temp = $dfOrder[id];
		// console.log(temp + params);
		// console.log(docFiles);
		// if (!docFiles?.[temp + params]) return;
		// $dfOrder[docFiles[temp + params]] = temp;
		// console.log($dfOrder[docFiles[temp + params]]);
		// $dfOrder[id] += params;
		// console.log($dfOrder[id]);
	}
	// function handleReorderRight(id: number, divId: number) {
	// 	reorder(id, 1, divId);
	// }
	// function handleReorderLeft(id: number, divId: number) {
	// 	reorder(id, -1, divId);
	// }
	function swapElements(obj1: Element, obj2: Element) {
		// save the location of obj2
		var parent2 = obj2?.parentNode;
		var next2 = obj2?.nextSibling;
		if (parent2)
			if (next2 === obj1) {
				// special case for obj1 is the next sibling of obj2
				// just put obj1 before obj2
				parent2.insertBefore(obj1, obj2);
			} else {
				// insert obj2 right before obj1
				if (obj1?.parentNode) obj1.parentNode.insertBefore(obj2, obj1);
				else return;

				// now insert obj1 where obj2 was
				if (next2) {
					// if there was an element after obj2, then insert obj1 right before that
					parent2.insertBefore(obj1, next2);
				} else {
					// otherwise, just append as last child
					parent2.appendChild(obj1);
				}
			}
	}
	function handleSwap(id1: number, id2: number) {
		console.log(`swapping ${id1} with ${id2}`);
		const tab1 = document.getElementById(`dfitem-${id1}`);
		const tab2 = document.getElementById(`dfitem-${id2}`);
		const item1 = document.getElementById(`dfdata-${id1}`);
		const item2 = document.getElementById(`dfdata-${id2}`);
		// let node2;
		// node2 = params > 0 ? node1?.nextElementSibling?.nextElementSibling : node1?.previousElementSibling?.previousElementSibling;
		// node2 = document.getElementById(`dfitem-${id1 + params}`)?.firstElementChild;
		// console.log(`swapping ${node1} with ${node2}`);
		if (!tab1 || !tab2 || !item1 || !item2) throw 'failed swap';
		const cardId1 = Number(item1.parentElement?.id.split('ws-')?.[1]);
		const cardId2 = Number(item2.parentElement?.id.split('ws-')?.[1]);
		if (cardId1 === undefined || cardId2 === undefined) throw 'failed swap getting card ids ';
		swapElements(tab1, tab2);
		swapElements(item1, item2);

		var temp = $dfSizes[cardId2];
		$dfSizes[cardId2] = $dfSizes[cardId1];
		$dfSizes[cardId1] = temp;
		splitted.setSizes($dfSizes.slice(0, beo));

		var temp = $dfOrder[id2];
		$dfOrder[id2] = $dfOrder[id1];
		$dfOrder[id1] = temp;

		// swapElements(node1.,node2)
	}

	let tabSet: number;

	let wsTabs: number[][] = [];

	function allowDrop(ev: DragEvent) {
		ev.preventDefault();
		ev.stopPropagation();
	}
	function drop(ev: DragEvent) {
		ev.stopPropagation();
		ev.preventDefault();
		// console.log(this)
		// const draggedId = Number(ev.dataTransfer?.getData('id').split('dfitem-')?.[1] ?? 0);
		const draggedId = ev.dataTransfer?.getData('id');
		const thisId = Number(this.id.split('ws-')?.[1] ?? 0);
		console.log(`dropped ${draggedId} on ${thisId}`);
		// if (draggedId && thisId) {
		// 	handleSwap(draggedId, thisId);
		// }
	}
	function dropOnEmptyWs(ev: DragEvent) {
		droppenOnWs(ev, $workSpaces.length);
	}
	async function droppenOnWs(ev: DragEvent, droppedWsId: number, droppedTabId?: number) {
		tabDragged = false;
		ev.stopPropagation();
		ev.preventDefault();
		const draggedIds = ev.dataTransfer?.getData('id')?.split('-')?.[1]?.split('/');
		// droppedWsId ??= Number((ev.target as HTMLElement).id.split('-')[1]);
		const tabId = Number(draggedIds[1]);
		const wsId = Number(draggedIds[0]);
		droppedTabId ??= $workSpaces?.[droppedWsId]?.tabs?.length ?? 1 - 1 ?? 0;
		console.log(`dropped on ws ${wsId}/${tabId} to ${droppedWsId}/${droppedTabId}`);
		if (droppedWsId == wsId && droppedTabId == tabId) return;
		if (
			tabId != undefined &&
			wsId != undefined &&
			droppedWsId != undefined &&
			droppedTabId != undefined
		) {
			const divId = $workSpaces[wsId].tabs[tabId];
			// const item = document.getElementById(`dfdata-${draggedId}`);
			// console.log(tabId);
			// $workSpaces[wsId].active = 0;
			$workSpaces[droppedWsId] ??= {
				tabs: [],
				active: 0
			};
			// go for the last tab instead of before it if droopped on last tab
			// $workSpaces[wsId].tabs.splice($workSpaces[wsId].tabs.indexOf(tabId), 1);
			$workSpaces[droppedWsId].active = droppedTabId;
			if (droppedTabId > tabId) droppedTabId++;
			// else droppedTabId -=  droppedTabId ? 1 : 0;
			console.log(`dropped on ws ${wsId}/${tabId} to ${droppedWsId}/${droppedTabId}`);
			$workSpaces[wsId].tabs[tabId] = -999; //mark for delete biar ga ngacoin index
			$workSpaces[droppedWsId].tabs.splice(droppedTabId, 0, divId);
			$workSpaces[wsId].tabs.splice($workSpaces[wsId].tabs.indexOf(-999), 1);
			if (tabId < $workSpaces[wsId].active) $workSpaces[wsId].active--;
			console.log(JSON.stringify($workSpaces));
			if ($workSpaces[wsId].tabs.length == 0) {
				closeWs(wsId);
				return;
			}
			handleOrdering(docFiles);
			destroySplit();
			await tick();
			makeSplit();
			const emptyWs = document.getElementById(`ws-end`);
		}
	}
	async function closeWs(wsid: number) {
		if (wsid == undefined) throw `close ws failed wsid = ${wsid}`;
		if ($workSpaces.length == 1) return; //return if wsid undefined or zero;
		console.log(`deleted ws ${wsid}}`);
		// const item = document.getElementById(`dfdata-${draggedId}`);
		$workSpaces.splice(wsid, 1);
		handleOrdering(docFiles);
		destroySplit();
		await tick();
		makeSplit();
	}
	console.log($workSpaces);
	// function truncDocTabs(x:number){
	// 	console.log('truncated '+ x)
	// 	for (let i = 0; i < $docTabs.length; i++) {
	// 		if($docTabs[i] > x) $docTabs[i]--;
	// 	}
	// }
	function getWsId() {
		const ret = renderedWs++;
		console.log('get wsId ' + ret);
		return ret;
	}
	// function tabGroupMouseEnter(e: MouseEvent) {
	// 	// console.log('enter')
	// 	// console.log(e.target)
	// 	tablist.tl = e.target as HTMLElement;
	// 	console.log(tablist);
	// }
	// function tabGroupMouseLeave(e: MouseEvent) {
	// 	// console.log(e.target)
	// 	// console.log('leave')
	// 	tablist.tl = undefined;
	// }
	// function tabGroupScroll(e:MouseEvent) {
	// 	console.log(e.target)
	// }
	let rerenderDf = 0;
	let tabDragged = false;
</script>

<!-- 
<div class="h-full flex flex-col"> -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- <div on:click={() => ($showAccordion = false)}>accord fa;se</div> -->
{#if $dMap?.[paramsId]?.markedForDelete}
	<div class="bg-red-600">MOVED OR DELETED</div>
{/if}
{#if doc}
	<!-- <div>{doc?.id} - {doc?.name}
	<button on:click={handleDeleteDoc}>Del</button>
	</div> -->

	<!-- <div id="panelContainer" class="w-full h-full overflow-hidden py-0"> -->
	<div class="split min-w-full h-full relative">
		{#each $workSpaces as ws, i}
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<div
				on:drop={(e) => droppenOnWs(e, i)}
				on:dragover={allowDrop}
				id={`ws-${i}`}
				class="w-full flex flex-col overflow-hidden"
			>
				<div class="h-min">
					{#if ws?.tabs?.length}
						<TabGroup
							regionList={`${tabDragged ? `bg-teal-500` : ''} h-min`}
							regionPanel=""
							class="relative "
						>
							{#each ws.tabs as divid, tab}
								{#if docFiles[divid]}
									<!-- <span on:click={() => ($workSpaces[i] = divid)}>
									{$dfMap?.[docFiles[divid]]?.data?.name}
								</span> -->
									<TabItem
										bind:dragged={tabDragged}
										id={`tab-${i}/${tab}`}
										bind:group={ws.active}
										name={`tab-${i}`}
										value={tab}
										class="!py-0 border-r-[1px] border-black {tab == ws.active ? "!border-l-slate-50 border-x-[3px]" : ""}"
										on:drop={(e) => droppenOnWs(e, i, tab)}
										on:dragover={allowDrop}
									>
										<div>
											{$dfMap?.[docFiles[divid]]?.data?.name}
										</div></TabItem
									>
								{/if}
							{/each}
							<!-- <div class="flex justify-center items-center cursor-pointer ml-auto" on:click={() => closeWs(i)}><div class="">❌</div></div> -->
							<div
								class="bg-slate-100 py-auto flex justify-center items-center cursor-pointer absolute right-0 top-0 select-none"
								on:click={() => closeWs(i)}
							>
								<div class="">❌</div>
							</div>
						</TabGroup>
					{:else}
					<div class="{tabDragged ? `bg-teal-500` : ''} h-full w-full"></div>
						EMPTY
					{/if}
				</div>
				<div id={`wsContent-${i}`} class=" h-[97%] w-full">
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- <div on:click={() => closeWs(i)}>CLOSE</div> -->
					{#each ws.tabs as divid, tab}
						{#if !$dfMap?.[docFiles?.[divid]]?.data && tab == ws.active}
							<div>docfile not exist</div>
						{:else if $dfMap?.[docFiles?.[divid]]?.data}
							<div class="h-full" style={tab != ws.active ? 'display:none;' : ''}>
								<!-- active docfile here -->
								{#key $dfMap?.[docFiles?.[divid]]?.data.id}
									{#key ws.tabs[tab]}
										<DfItem
											handleMount={() => {}}
											docFile={$dfMap[docFiles[divid]].data}
										/>
									{/key}
								{/key}
							</div>
						{/if}
					{/each}
				</div>
			</div>
		{/each}
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			id={`ws-end`}
			on:dragover={allowDrop}
			on:drop={dropOnEmptyWs}
			class="bg-teal-500 bg-opacity-50 absolute bottom-0 right-0 w-[15vw] h-[97%] {tabDragged
				? ''
				: 'hidden'}"
		/>
	</div>
	<!-- </div> -->
	<div class={`hidden`}>
		
	</div>
{:else}
	NO DOC
{/if}
