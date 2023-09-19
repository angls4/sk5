<script lang="ts">
	import { page } from '$app/stores';
	import { dMap, dfMap } from 'tes/src/lib/client/localCache';
	import Uploader from '../uploader.svelte';
	import MimeSelect from './mimeSelect.svelte';
	import type { DataCrudStyle, Doc, DocFile } from 'tes/src/lib/xmemCachedd';
	import storer from 'tes/src/lib/client/cacheFirst';
	import { gotoGroup, refreshGroup, selecteds } from 'tes/src/lib/client/store';
	$: docId = Number($page.params?.doc);
	$: doc = $dMap?.[docId]?.data;
	$: docFiles = Object.values($dMap?.[docId]?.docFiles ?? {});
    $: docFile = $dfMap?.[selectedDf]?.data;
	let selectedDf;
    let fileType = '';
    let dfName;
    $:{
        if(selectedDf){
            // fileType =  $dfMap?.[selectedDf]?.data?.fileType.split('/')[1];
            fileType =  getFileType();
        }
    }
    function getFileType() {
       return  docFile?.fileType
    }
    const handleDeleteDocFile = (e: MouseEvent) => {
		e.stopPropagation();
		if (docFile) deleteDocFile(docFile);
	};
	const deleteDocFile = async (docFile: DocFile) => {
		console.log('delete docfile ' + docFile.id);
		console.log(await storer.docFile.delete({ id: docFile.id }));
	};
    const handleUpdateDocFile = (e: MouseEvent) => {
		e.stopPropagation();
		if (docFile) updateDocFile(docFile);
	};
	const updateDocFile = async (docFile: DocFile) => {
		console.log('update docfile ' + docFile.id);
		console.log(await storer.docFile.update({ id: docFile.id ,name:dfName,fileType}));
	};
    	const handleDeleteDoc = (e: MouseEvent) => {
		if (doc) deleteDoc(doc);
	};
	const deleteDoc = async (doc: Doc) => {
		console.log('delete doc');
		console.log(doc);
		const res = await storer.doc.delete({ id: doc.id });
		if (res?.[doc.id]) {
			gotoGroup(doc.groupId);
			$selecteds = {group:doc.groupId};
		} else {
			refreshGroup(doc.groupId);
		}
		console.log('delete doc responed');
		console.log(res);
	};
    function handleSubmit(f:any) {
      return (event:SubmitEvent)=>{
        console.log('submit')
        const target = event.target as HTMLFormElement;
        const formData = new FormData(target);
        const json = formDatatoJson(formData);
        console.log(json);
        f(json as any);
      }
    }
	function formDatatoJson(formData:FormData) {
      return Object.fromEntries(formData.entries());
    }
	const submitDocFile = async (input:DataCrudStyle['docFile']['input'])=>{
		// Format
    // input['fileType'] = fileType;
      const inputs : DataCrudStyle['docFile']['inputs'] = {};
      inputs[input?.id ?? 1] = input;
      const res = await storer.docFile.insert(inputs);
	//   if(res?.[input.name].id) uploadFile(`/${formData.get("filename")}`)
      console.log('subconstmit docFile responed')
      console.log(res);
	}

</script>
<div class="w-72">
{#if $dMap?.[docId]?.markedForDelete}
	<div class="bg-red-600">MOVED OR DELETED</div>
{/if}
{#if doc?.id}
	{#key doc.id}
  <button
						type="button"
						on:click={handleDeleteDoc}
						class="btn variant-filled bg-red-400"
					>
						<span class="text-black">Hapus Sumur</span>
					</button>
    <!-- <button on:click={handleDeleteDoc}>Hapus Sumur</button> -->
    
		<select class="select" size="5" name="docType" bind:value={selectedDf}
			>\
			{#each docFiles as dfId}
				<option value={dfId}>{$dfMap[dfId].data.name}</option>
                {/each}
				<option value={-1} class="text-center border-y-2 border-gray-400">➕</option>
		</select>
        <br>
        
        {#if selectedDf || selectedDf == -1}
        <button disabled={selectedDf == -1} on:click={handleDeleteDocFile}>Hapus Data</button>
        <form action="{`/api`}" method="POST" on:submit|preventDefault={handleSubmit(selectedDf == -1 ? submitDocFile : updateDocFile) }>
        <input type="number" id="docId" name ="docId" hidden value="{docId ?? 0}">
	    <input type="number" id="userId" name ="userId" hidden value="{1}">
        <label for="name">Nama :</label>
        <input
        type="text"
        required
        autocomplete="off"
        value={$dfMap?.[selectedDf]?.data?.name ?? ''}
        placeholder={selectedDf == -1 ? 'Nama data' : "Pilih data untuk di-edit"}
        disabled={!selectedDf && selectedDf != -1}
        on:input={(e)=>dfName = e.target['value']}
        name="name"
        />
        <label for="fileType">Tipe file :</label>
        <MimeSelect id="mimeSelectDf" bind:fileType={fileType}></MimeSelect>
        <!-- <button
						type="button"
						on:click={handleUpdateDocFile}
						class="btn variant-filled bg-slate-50"
					>
						<span class="text-black">{selectedDf == -1 ? 'Tambah Data' : 'Submit Edit'}</span>
					</button> -->
        <button on:click={handleUpdateDocFile}>{selectedDf == -1 ? 'Tambah Data' : 'Submit Edit'}</button>
        </form>
        {:else}
        <div>PILIH DATA UNTUK DI-EDIT</div>
        {/if}
        {/key}
{/if}
</div>