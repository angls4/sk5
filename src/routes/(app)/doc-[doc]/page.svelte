<script lang="ts">
	import { applyAction } from '$app/forms';
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { docFileMap,docMap, updateDocFiles } from '$lib/client/store';
	import { onMount } from 'svelte';
	// import { testXHR,updateGroups } from '../../fungsi';
  import type { PageData } from './$types'
	import type { DocFileMapData, DocMapData } from '$lib/storeType';
	import type { DocInput } from '$lib/server/kysely';
	import { Accordion, AccordionItem, FileButton } from '@skeletonlabs/skeleton';
	import DfItem from './dfItem.svelte';


  export let data : PageData;
  let fileList : FileList;
  let submitFile : File;
  let file : File;
  let blobUrl :string;
  let progress = '(progress)';
  let ongoingXHR: XMLHttpRequest | undefined;


//   $:docFiles = ;
  $:path = '/' + $page.params.group + '/' + $page.params.doc;
  $:{updateDocFiles($page.params.group,$page.params.doc);}
  $:docId = $docMap?.[$page.params.group]?.[$page.params.doc]?.id ?? goto(`/${$page.params.group}`);

  // const login = (input:Event) => {
  //   console.log(input);

  //   const result: ActionResult = deserialize(await response.text());

  //   if (result.type === 'success') {
  //       // rerun all `load` functions, following the successful update
  //       await invalidateAll();
  //   }

  //   applyAction(result);
  // }
    const delDoc = ()=>{
      // const target = event.target as HTMLFormElement;
      // console.log(event);
      console.log('del Doc ');

      const xhr = new XMLHttpRequest;
      // xhr.
      xhr.responseType = 'json';
      xhr.upload.onprogress = (pe) => {
        console.log("uploading vvv")
          console.log(`uploaded : ${pe.loaded} / ${pe.total}`)
      }
      xhr.onloadend = (pe) => {
        console.log('onloadend vvv');
        console.log(xhr.response);
        const res = xhr.response as DocMapData;
        if(res){

          // const temp : any = {...$docMap};
          delete $docMap[res.groupName][res.name];
          delete $docFileMap[res.id];
          // ($groupMap[res.name+'1'] as any) = true;
          // ($groupMap[res.name+'1'] as any) = undefined;
          $docMap = $docMap;
          // $groupMap = $groupMap;
        }
      }
      xhr.open('DELETE',`/api/${$page.params.group}/${$page.params.doc}`);
      // console.log('testXHR');
      xhr.send();
      console.log('upload sent');
      // data.docFiles = data.docFiles;
      return xhr;
    }
  const submitDocFile = (event:SubmitEvent)=>{
    const target = event.target as HTMLFormElement;
    // console.log(event);
    console.log('submit docfile');

    const xhr = new XMLHttpRequest;
    const formData = (new FormData(target));
    formData.delete("file")
    // xhr.
    xhr.responseType = 'json';
    // xhr.upload.onprogress = (pe) => {
    //   console.log("uploading vvv")
    //     console.log(`uploaded : ${pe.loaded} / ${pe.total}`)
    // }
    xhr.onloadend = (pe) => {
      console.log('onloadend vvv');
      console.log(xhr.response);
      if(xhr.response){

        ongoingXHR = uploadFile(target.action+`/${formData.get("filename")}`,formData.get('filename') as string);
        // const res = xhr.response as DocFileMapData;
        updateDocFiles($page.params.group,$page.params.doc);
        //   invalidate('data:docfile');
          // applyAction(xhr.response);
      }
    }
    xhr.open(target.method,target.action);
    // console.log('testXHR');
    xhr.send(formData);
    console.log('submitdocfile sent');
    // data.docFiles = data.docFiles;   
    return xhr;
  }
  
  const uploadFile = (target:string,filename:string)=>{
        console.log('upload file '+target);
        // console.log(submitFile.size ?? 0);
        if((submitFile?.size ?? 0)<1) return;
        ongoingXHR?.abort()
        // const target = event.target as HTMLFormElement;

        
        const xhr = new XMLHttpRequest;
        // const abrt = xhr.abort;
        xhr.upload.onabort = ()=>{
          // abrt;
          console.log('aborted '+xhr.readyState);
          progress = "aborted";          
        }
        xhr.responseType = 'json';
        xhr.upload.onprogress = (pe) => {
            progress = (`uploaded : ${pe.loaded} / ${pe.total}`)
        }
        xhr.onloadend = (pe) => {
          console.log('onloadend vvv');
          console.log(xhr.response);
          const res = xhr.response;
          if(res?.success){
            $docFileMap[docId][filename].fileType = submitFile.type;
            file = submitFile;
            // blobUrl = URL.createObjectURL(file);
            // updateDocFiles($page.params.group as string, $page.params.doc as string)
          }
        }
        xhr.open('POST',target);
        xhr.setRequestHeader('content-type',submitFile.type);
        // xhr.setRequestHeader('adnan',submitFile.size.toString());
        xhr.send(submitFile);
        console.log('upload sent'); 
        return xhr;
    }
//   $docFileMap[docId] = [];
//   let docFiles: DocFileMapData = [];
  $: docFiles = $docFileMap?.[docId] ? Object.values($docFileMap[docId]) : [];
    
</script>
path:
{path}
<button on:click={()=>console.log($page)}>PAGEDATA</button>
<button on:click={delDoc}>DEL</button>
<button on:click={()=>updateDocFiles($page.params.group,$page.params.doc)}>updateDocFiles</button>

<Accordion>
{#each (docFiles) as docFile}
    <!-- <span on:click={()=>deleteDocFile(docFile.fileName)}>❌</span>
    <span class="flex-auto">{docFile.fileName}</span> -->
    <DfItem docFile={docFile}></DfItem>

{/each}
</Accordion>
<!-- <button on:click={()=>testXHR(path)}>testXHR</button> -->
<!-- <button on:click={updateGroups}>updateGroups</button> -->
<!-- <a href="../">aaa</a> -->
<form action="{`/api/${$page.params.group}/${$page.params.doc}`}" method="POST" on:submit|preventDefault={submitDocFile }>
     <label for="filename">File Name:</label>
    <input type="text" id="filename" name="filename" required>
    <FileButton name="file" bind:files={fileList} on:change={()=>submitFile = fileList?.[0]} tw- button="bg-slate-50 text-black">🗃️</FileButton>
    <span>{progress}</span>
    <span>
        <button type="submit" class="btn variant-filled bg-slate-50">
            <span>🚟</span>
        </button>
        <button type="button" on:click={()=>{console.log('ongoing = '+ongoingXHR?.toString);ongoingXHR?.abort()}} class="btn variant-filled bg-slate-50">
            <span>✖️</span>
        </button>
    </span>
</form>
