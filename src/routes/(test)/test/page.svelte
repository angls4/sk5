<script lang="ts">
	import { FileButton } from "@skeletonlabs/skeleton";
	import { onMount } from "svelte";
	import type { DocFileMapData } from "tes/src/lib/storeType";

    let fileList : FileList;
    let submitFile : File;
    let file : File;
    let blobUrl :string;
    let progress = '(progress)';
    let ongoingXHR: XMLHttpRequest;

    let docFile : DocFileMapData;

    $:fileExtension =  `${(docFile.fileType as string).split('/')[1]}`;

    type Handles = {
        window : Window | undefined,
        root : FileSystemDirectoryHandle | undefined,
        file : FileSystemFileHandle | undefined,
    }
    const handles : Handles = {window:undefined,root:undefined,file:undefined};

    // const getFileExtension = ()=>{
    //     return `${(docFile.fileType as string).split('/')[1]}`;
    // }
    const getFile = ()=>{
        ongoingXHR?.abort()
        console.log('get file');
        const xhr = new XMLHttpRequest;
        xhr.responseType = 'blob';
        xhr.onprogress = (pe) =>{
            progress = (`downloaded : ${pe.loaded} / ${pe.total}`)
        }
        xhr.onloadend = (pe) => {
            console.log('onloadend vvv');
            console.log(xhr.response);
            file = xhr.response as File;
            if(file){
                // file.type = docFile.fileType;
                blobUrl = URL.createObjectURL(file);
                // previewType = res.type;
            }
        }
        xhr.open("GET",'/test');
        xhr.send();
        console.log('getfile sent');
        return xhr;
    }
    const uploadFile = (event:SubmitEvent)=>{
        ongoingXHR?.abort()
        const target = event.target as HTMLFormElement;
        console.log('submit file');

        const xhr = new XMLHttpRequest;
        xhr.responseType = 'json';
        xhr.upload.onprogress = (pe) => {
            progress = (`uploaded : ${pe.loaded} / ${pe.total}`)
        }
        xhr.onloadend = (pe) => {
            console.log('onloadend vvv');
            console.log(xhr.response);
            const res = xhr.response;
            if(res?.success){
                file = submitFile;
                blobUrl = URL.createObjectURL(file);
            }
        }
        xhr.open(target.method,target.action);
        xhr.send(new FormData(target));
        console.log('upload sent'); 
        return xhr;
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
        console.log('omount '+ handles.window);
        handles.window ??= window;
    })

</script>

<form action="/test" method="POST" on:submit|preventDefault={(a)=>ongoingXHR=uploadFile(a)}>
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
</form>
    <span>
        <button type="button" on:click={getFile} class="btn variant-filled bg-slate-50">
            <span>📩</span>
        </button>
        <button type="button" on:click={ongoingXHR.abort} class="btn variant-filled bg-slate-50">
            <span>✖️</span>
        </button>
    </span>
    <span>
        <a href="{blobUrl}" target="_blank">{blobUrl? '↗️' : '📵'}</a>
        <a href="{blobUrl}" download="{`testDownload.${fileExtension}`}" target="_blank">{blobUrl? '⬇️' : '📵'}</a>
    </span>

