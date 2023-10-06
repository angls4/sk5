<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { DocFile } from 'tes/src/db/types';
	import storer from 'tes/src/lib/client/cacheFirst';
	import { gMap } from 'tes/src/lib/client/localCache';
	import {
		gotoGroup,
		openGroupRecursively,
		refreshGroup,
		selecteds
	} from 'tes/src/lib/client/store';
	import type { DataCrudStyle, Doc, Group } from 'tes/src/lib/xmemCachedd';
	import type Mimes from 'tes/src/mime';

	// delete $selecteds['doc'];

	$: paramsId = Number($page.params.group);
	let group: Group;

	$: {
		group = $gMap?.[paramsId]?.data;
		if ($selecteds['group'] != paramsId || !group) {
			$selecteds = { group: paramsId };
			if (group) {
				// storer.group.custom.refresh(group);
				openGroupRecursively(group.parentId);
			} else {
				// goto(`/`);
				$selecteds = {}
			}
		}
		// console.log("selected " + id)
		// console.log("selected " + $selecteds['group']?.groupId)
	}
	// let group: String;
	// if($page.form)
	// const login: SubmitFunction = () => {

	function handleSubmit(f: any) {
		return (event: SubmitEvent) => {
			console.log('submit');
			const target = event.target as HTMLFormElement;
			const formData = new FormData(target);
			const json = formDatatoJson(formData);
			console.log(json);
			f(json as any);
		};
	}
	function formDatatoJson(formData: FormData) {
		return Object.fromEntries(formData.entries());
	}
	const submitDoc = async (input: DataCrudStyle['doc']['input'] & {docType?:string}) => {
		let docType = '';
		// Format
		if(input?.docType){
			docType = input.docType;
			delete input.docType;
		} 
		const inputs: DataCrudStyle['doc']['inputs'] = {};
		inputs[input?.id ?? 1] = input;
		const res = await storer.doc.insert(inputs);
		if(docType == 'well' && res){
			const docId = Object.values(res)[0].id
			console.log(await storer.docFile.insert(wellData(docId)));
		}
		console.log('submit doc responed');
		console.log(res);
	};
	const submitGroup = async (input: DataCrudStyle['group']['input']) => {
		// Format
		const inputs: DataCrudStyle['group']['inputs'] = {};
		inputs[input?.id ?? 1] = input;
		const res = await storer.group.insert(inputs);
		console.log('submit group responed');
		console.log(res);
	};
	const handleDeleteGroup = (e: MouseEvent) => {
		if (group) deleteGroup(group);
	};
	const deleteGroup = async (group: Group) => {
		console.log('delete group');
		console.log(group);
		const res = await storer.group.delete({ id: group.id });
		if (res?.[group.id]) {
			gotoGroup(group.parentId);
			$selecteds['group'] = undefined;
		} else {
			refreshGroup(group.parentId);
		}
		console.log('delete group responed');
		console.log(res);
	};
	// if(!$page.form?.groupname)
	// groupname = data.group;
	// $:groupname = $page.form?.groupname ? $page.form.groupname : data.group;
	// // export let form: A ctionData;
	// $:{console.log('formdata:::');console.log($page.form);}
	const wellData = (docId:Doc['id'])=>{return{
		1: {
			name: 'Report',
			userId: '1',
			fileType: 'text/plain' as Mimes,
			docId,
		},
		2: {
			name: 'Mud Log',
			userId: '1',
			fileType: 'application/pdf' as Mimes,
			docId,
		},
		3: {
			name: 'Korelasi',
			userId: '1',
			fileType: 'application/pdf' as Mimes,
			docId,
		},
		4: {
			name: 'ASCI',
			userId: '1',
			fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' as Mimes,
			docId,
		},
		5: {
			name: 'Trajectory',
			userId: '1',
			// fileType:',
			docId,
		},
		6: {
			name: 'LAS',
			userId: '1',
			// fileType:',
			docId,
		},
		7: {
			name: 'Prognosis',
			userId: '1',
			fileType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' as Mimes,
			docId,
		}
	}as DataCrudStyle['docFile']['inputs'] };
</script>
{#if $gMap?.[paramsId]?.markedForDelete}
<div class="bg-red-600">MOVED OR DELETED</div>
{/if}
<div class="w-72">
<div>Tambah Sumur</div>
{#if group}
{#if group.id != 0}
	<div><button on:click={handleDeleteGroup}>Del</button></div>
	<div>SUBMIT DOC on {group?.name}</div>
	params: {$page.params.group}
{/if}
	<!-- <button on:click={()=>updatecDocs(group)}>REFRESH</button> -->
	<form action={`/api`} method="POST" on:submit|preventDefault={handleSubmit(submitDoc)}>
		<input type="number" id="groupId" name="groupId" hidden value={group?.id ?? 0} />
		<div>
			<label for="doc_name">Name :</label>
			<input autocomplete="off" type="text" id="doc_name" name="name" required/>
		</div>
		<label for="docType">Preset :</label>
		<select  class="select w-full" size="1" name="docType">
			<option selected value="well">Well</option>
			<option value="empty">Empty</option>
		</select>
		<br />
		<br />
		<button type="submit" class="btn variant-filled">
			<div>Tambah Sumur</div>
		</button>
	</form>

	<div>Tambah Grup</div>
	<!-- <div>SUBMIT GROUP on {group?.name}</div>
	params:
	{$page.params.group} -->
	<!-- <button on:click={()=>updatecDocs(group)}>REFRESH</button> -->
	<form action={`/api`} method="POST" on:submit|preventDefault={handleSubmit(submitGroup)}>
		<label for="group_name">Name:</label>
		<input autocomplete="off" type="text" required id="group_name" name="name" />
		<input type="number" id="parentId" name="parentId" hidden value={group?.id ?? 0} />
		<!-- <input type="text" id="group" name="group" value=}> -->

		<!-- <input type="text" id="group" name="group" value={groupname} > -->
		<!-- <label for="group">Group:</label>
    <select class="select" name="group" id="group" required>
    {#each $page.data.groups as group}
      <option value="{group.name}">{group.name}</option>
    {/each} 
  </select> -->

		<br />
		<br />
		<button type="submit" class="btn variant-filled">
			<div>Create Group📁</div>
		</button>
	</form>
	{:else}
	NO GROUP
	{/if}
</div>
