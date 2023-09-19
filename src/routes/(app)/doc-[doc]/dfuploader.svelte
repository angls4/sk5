<script lang="ts">
	import { FileButton } from '@skeletonlabs/skeleton';
	import { json } from '@sveltejs/kit';
	import storer from 'tes/src/lib/client/localCache';
	import { XHRPromise, makeXhr } from 'tes/src/lib/xhrType';
	import type { DocFile } from 'tes/src/lib/xmemCachedd';
	import type Mimes from 'tes/src/mime';

	export let route:string | URL;
	let fileList: FileList;
	let file: File;
	export let handleProgress:(progress:number)=>void;
	let progress = 0;
	let ongoingXHR: XHRPromise | undefined;

	$: handleProgress(progress);
	$:name = `upload to ${route}`;

	const uploadFile = () => {
		ongoingXHR =  makeXhr({
			name,
            contentType:file.type as Mimes,
            target:route,
            method:'POST',
            responseType:'json',
            onUploadAbort(){
                console.log('aborted '+name);     
            },
            onUpload(pe) {
                progress = Math.round(pe.loaded / pe.total * 100);
            },
            onResponse(pe) {
				console.log('onloadend vvv');
				console.log(this.response);
				console.log(file.name);
				if(this.status == 200){
					const res = this.response as DocFile;
					(async ()=>console.log(await storer.docFile.update(res)))();
				}
            },
        }).send(file) as XHRPromise;
	};
</script>

<!-- <span>{progress}</span> -->
<FileButton
	name="file"
	bind:files={fileList}
	on:change={() => (file = fileList?.[0])}
	tw-
	button="bg-slate-50 text-black"
	>🗃️
</FileButton>
<button
	type="button"
	on:click={() => {
        uploadFile();
	}}
	class="btn variant-filled bg-slate-50"
>
	<span>🚄</span>
</button>
<button
	type="button"
	on:click={() => {
        console.log('ongoing = ' + ongoingXHR?.toString);
        if(ongoingXHR?.abort)
		ongoingXHR?.abort();
	}}
	class="btn variant-filled bg-slate-50"
>
	<span>❌</span>
</button>

