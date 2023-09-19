<script lang="ts">
	import { FileButton, FileDropzone } from "@skeletonlabs/skeleton";
	import mimes from "../../../mime";
	import { onMount } from "svelte";

    const regexPattern = /data:([^;]+);base64,/;

    let previewUrl = ''; 
    let previewType = '';
    let object : HTMLElement;
    let progress = ''
    // let windowHandle : Window;
    type Handles = {
        window : Window | undefined,
        root : FileSystemDirectoryHandle | undefined,
        file : FileSystemFileHandle | undefined,
    }
    const handles : Handles = {window:undefined,root:undefined,file:undefined};

    const convertBase64 = (file: File) : string | any => {
		return new Promise((resolve, reject) => {
			const fileReader = new FileReader();
			fileReader.readAsDataURL(file);

			fileReader.onload = () => {
				resolve(fileReader.result);
			};

			fileReader.onerror = (error) => {
				reject(error);
			};
		});
	}
    const changePreview = async (file : File | null= null) => {
        // previewUrl = await convertBase64(fileList[0]);
        // previewType = previewUrl.match(regexPattern)?.[1] ?? '';
        file??= fileList[0]; 
        previewUrl = URL.createObjectURL(file);
        previewType = file.type;
        // previewUrl = "https://voyager.postman.com/illustration/vs-code-postman-illustration.svg";
        // object.setAttribute('type',previewType)
        console.log(previewUrl.substring(0,30));
        console.log(previewType);
        console.log(object);
        // console.log(object.getAttribute('data'));
    }
    let fileList : FileList;
    


    const getFile = async ()=>{
        // const target = event.target as HTMLFormElement;
        // console.log(event);
        console.log('get file');

        const xhr = new XMLHttpRequest;
        // xhr.
        xhr.responseType = 'blob';
        xhr.upload.onprogress = (pe) => {
            // console.log("uploading vvv")
            progress = (`uploaded : ${pe.loaded} / ${pe.total}`)
        }
        xhr.onprogress = (pe) =>{
            progress = (`downloaded : ${pe.loaded} / ${pe.total}`)
        }
        xhr.onloadend = (pe) => {
            console.log('onloadend vvv');
            console.log(xhr.response);
            const res = xhr.response as File;
            previewUrl = URL.createObjectURL(res);
            previewType = res.type;
        //   invalidate('data:docfile');
        // applyAction(xhr.response);
        }
        xhr.open("GET",'/test');
        // console.log('testXHR');
        // const arbuf = await fileList[0].arrayBuffer();
        xhr.send();
        console.log('upload sent');
        // data.docFiles = data.docFiles;   
        return xhr;
    }

    const uploadFile = async (event:SubmitEvent)=>{
        const target = event.target as HTMLFormElement;
        // console.log(event);
        console.log('submit file');

        const xhr = new XMLHttpRequest;
        // xhr. 
        xhr.responseType = 'json';
        xhr.upload.onprogress = (pe) => {
            // console.log("uploading vvv")
            progress = (`uploaded : ${pe.loaded} / ${pe.total}`)
        }
        xhr.onprogress = (pe) =>{
            progress = (`downloaded : ${pe.loaded} / ${pe.total}`)
        }
        xhr.onloadend = (pe) => {
            console.log('onloadend vvv');
            console.log(xhr.response);

        //   invalidate('data:docfile');
        // applyAction(xhr.response);
        }
        xhr.open(target.method,target.action);
        // console.log('testXHR');
        const arbuf = await fileList[0].arrayBuffer();
        xhr.send(new FormData(target));
        console.log('upload sent');
        // data.docFiles = data.docFiles;   
        return xhr;
    }
    const getFileExtension = (file : File)=>{
        return file.name.split('.').pop() as string;
    }
    const saveType = (file : File)=>{
        return handles.window?.localStorage.setItem('testType',getFileExtension(file));
    }
    const getSavedType = ()=>{
        return handles.window?.localStorage.getItem('testType');
    }

    const saveToStorage = async ()=>{
        console.log('saveTostorage');
        saveType(fileList[0]);
        handles.root ??= await (handles.window as Window).navigator.storage.getDirectory();
        handles.file = await handles.root.getFileHandle('test.'+getSavedType(),{create:true}) ?? undefined;
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
        handles.file = await handles.root.getFileHandle('test.'+getSavedType()) ?? undefined;
        if(handles.file){
            const file = await handles.file.getFile();
            console.log('file vvv');
            console.log(file);
            console.log(file.type);
            saveType(file);
            changePreview(file);
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
<!-- <h1>Welcome to SvelteKit {tesonmount}</h1> -->
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<span>{progress}</span>
<form action="/test" method="POST" on:submit|preventDefault={uploadFile}>
    
    <FileButton name="file" bind:files={fileList} tw- button="bg-slate-50 text-black">🗃️</FileButton>
    <object data="{previewUrl}" bind:this={object} ></object>
    <!-- <img  src="{previewUrl}" alt=""> -->
    <a href="{previewUrl}"  target="_blank">OPEN IN NEWTAB</a>
    <a href="{previewUrl}" download="{`testDownload.${previewType.split('/')[1]}`}" target="_blank">Download</a>
    <button type="submit" class="btn variant-filled bg-slate-50">
        <span>🚟</span>
        <!-- <span>Button</span> -->
    </button>


</form>
<button type="button" on:click={getFile} class="btn variant-filled text-black bg-slate-50">
    <span>DOWNLOAD🔽</span>
</button>
<button type="button" on:click={async (ev)=>{ev.currentTarget.innerHTML="usage: "+(await window.navigator.storage.estimate()).usage;}} class="btn variant-filled bg-slate-50 text-black">
    <span>check usage</span>
</button>
<button type="button" on:click={saveToStorage} class="btn variant-filled bg-slate-50 text-black">
    <span>save uploaded</span>
</button>
<button type="button" on:click={getFromStorage} class="btn variant-filled bg-slate-50 text-black">
    <span>preview saved</span>
</button>
<button type="button" on:click={()=>{console.log(fileList[0])}} class="btn variant-filled bg-slate-50 text-black">
    <span>uploaded</span>
</button>

<slot />
