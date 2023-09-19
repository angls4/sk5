<script lang="ts">
	import { invalidateAll } from "$app/navigation";
	import { page } from "$app/stores";
	import { AccordionItem, FileButton, ProgressRadial } from "@skeletonlabs/skeleton";
	import { json } from "@sveltejs/kit";
	import { onMount } from "svelte";
	import { docFileMap, updateDocFiles } from "tes/src/lib/client/store";
	import type { DocFileMapData } from "tes/src/lib/storeType";
	import { makeXhr, XHRPromise, type xhrOption } from "tes/src/lib/xhrType";

    let fileList : FileList //| undefined;
    let submitFile : File //| undefined;
    let file : File //| undefined;
    let blobUrl :string;
    // let progress = '(progress)';
    let progress = 0;
    let ongoingXHR: XMLHttpRequest | XHRPromise | undefined;
    
    export let docFile : DocFileMapData;
    $: route = `/api/${$page.params.group}/${$page.params.doc}/${docFile.fileName}`;

    $:fileExtension =  `${(docFile?.fileType ?? '' as string).split('/')[1]}`;

    type Handles = {
        window : Window | undefined,
        root : FileSystemDirectoryHandle | undefined,
        file : FileSystemFileHandle | undefined,
    }
    const handles : Handles = {window:undefined,root:undefined,file:undefined};

    let optUpload:xhrOption;
    let optDelete:xhrOption;
    let optGet:xhrOption;

    $: {
        blobUrl = '';
        progress = 0;
        optUpload = {
            name: 'Upload',
            target : route,
            responseType : 'json',
            method : 'POST',
            onUpload(pe) {
                progress = Math.round(pe.loaded / pe.total * 100);
            },
            onUploadAbort(pe) {
                console.log('aborted '+name);
            },
            onResponse(pe) {
                console.log('upload responed vvv');
                console.log(this.response);
            },
        }
        optDelete = {
            name: 'Delete',
            target : route,
            responseType : 'json',
            method : 'DELETE',
        }
        optGet = {
            name: 'Get',
            target : route,
            responseType : 'blob',
            method : 'GET',
            onDownload(pe) {
                // console.log(pe.lengthComputable)
                progress = Math.round(pe.loaded / pe.total * 100);
            },
            onDownloadAbort(pe) {
                console.log('aborted '+name);
            },
        }
    }

    const getFile = async ()=>{
        console.log('getfile '+docFile.fileName);
        ongoingXHR?.abort();
        ongoingXHR = makeXhr(optGet).send();
        const res = (await ongoingXHR).response;
        // if((res as File)?.type == docFile.fileType){
        if((res as File)?.size > 2){
            console.log('downloaded')
            file = res;
            $docFileMap[docFile.docId][docFile.fileName]['fileType']=file.type;
            blobUrl = URL.createObjectURL(file)
        }
        if((await ongoingXHR)?.readyState == 4)
        ongoingXHR = undefined;
    }

    const uploadFile = async (filename:string)=>{
        console.log('upload file '+route);
        if((submitFile?.size ?? 0)<1){
            console.log('file size 0 --- cancelled');
            return;
        }
        ongoingXHR?.abort();

        const opt : xhrOption= {
            ...optUpload,
            contentType:submitFile.type,
            payload:submitFile,
        };
        // cons
        ongoingXHR = makeXhr(opt).send();
        // const xhrPromise = makeXhr(opt);
        if((await ongoingXHR).response?.success){
             $docFileMap[docFile?.docId][filename].fileType = submitFile.type;
            file = submitFile;
            updateDocFiles($page.params.group as string, $page.params.doc as string)
        }
        if((await ongoingXHR)?.readyState == 4)
        ongoingXHR = undefined;
    }

    const deleteDocFile = async (filename:string)=>{
        console.log('delete docfile ' + filename);
        ongoingXHR?.abort();
        if((await makeXhr(optDelete).send()).status == 200){
            delete $docFileMap[docFile.docId][docFile.fileName];
            $docFileMap = $docFileMap;
        }
    }

    const saveToStorage = async ()=>{
        console.log('saveTostorage');
        handles.root ??= await (handles.window as Window).navigator.storage.getDirectory();
        handles.file = await handles.root.getFileHandle(docFile.fileName,{create:true}) ?? undefined;
        if(handles.file){
            const writable = await handles.file.createWritable();
            if(fileList.length>0){
                await writable.write(fileList[0]);
                console.log('saved to file ');
                await writable.close();
            }
        }
        else{
            console.log('error saveTostorage');
        }
    }
    const getFromStorage = async ()=>{
        console.log('getfromstorage');
        handles.root ??= await (handles.window as Window).navigator.storage.getDirectory();
        handles.file = await handles.root.getFileHandle(docFile.fileName) ?? undefined;
        if(handles.file){
            const file = await handles.file.getFile();
            console.log('file vvv');
            console.log(file);
            console.log(file.type);
            // saveType(file);
            // changePreview(file);
        }
        else{
            console.log('error getfromstorage');
        }
    }

    onMount(()=>{
        handles.window ??= window;
        console.log('omount '+ handles.window);
    })
</script>

<AccordionItem>
    <svelte:fragment slot="lead"><div on:click={()=>deleteDocFile(docFile.fileName)}>❌</div></svelte:fragment>
    <svelte:fragment slot="summary">{docFile.fileName}</svelte:fragment>
    <svelte:fragment slot="content">
	
        <!-- <span class="bg-slate-700 text-white">
            
        </span> -->
        <span>
            <ProgressRadial value={progress}>{progress}%</ProgressRadial>
            <button type="button" on:click={()=>{getFile()}} class="btn variant-filled bg-slate-50">
                <span>📩</span>
            </button>
            <button type="button" on:click={()=>{console.log(ongoingXHR);ongoingXHR?.abort();}} class="btn variant-filled bg-slate-50">
                <span>✖️</span>
            </button>
        </span>
        <span>
            <a href="{blobUrl}" target="_blank">{blobUrl? '↗️' : '📵'}</a>
            <a href="{blobUrl}" download="{`testDownload.${fileExtension}`}" target="_blank">{blobUrl? '⬇️' : '📵'}</a>
        </span>
        <FileButton name="file" bind:files={fileList} on:change={()=>submitFile = fileList?.[0]} tw- button="bg-slate-50 text-black">🗃️</FileButton>
        <button type="button" on:click={()=>{uploadFile(docFile.fileName)}} class="btn variant-filled bg-slate-50">
            <span>🚟</span>
        </button>
        <button type="button" on:click={()=>{console.log(ongoingXHR);ongoingXHR?.abort()}} class="btn variant-filled bg-slate-50">
            <span>✖️</span>
        </button>
        <!-- <form action="/test" method="POST" on:submit|preventDefault={(a)=>ongoingXHR=uploadFile(a)}>
            <label for="filename">File Name:</label>
            <input type="text" id="filename" name="filename" required>
            <FileButton name="file" bind:files={fileList} on:change={()=>submitFile = fileList?.[0]} tw- button="bg-slate-50 text-black">🗃️</FileButton>
            <span>{progress}</span>
            <span>
                <button type="submit" class="btn variant-filled bg-slate-50">
                    <span>🚟</span>
                </button>
                <button type="button" on:click={ongoingXHR.abort} class="btn variant-filled bg-slate-50">
                    <span>✖️</span>
                </button>
            </span>
        </form> -->
    </svelte:fragment>
</AccordionItem>
