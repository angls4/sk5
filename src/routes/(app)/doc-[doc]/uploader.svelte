<script lang="ts">
	import storer from 'tes/src/lib/client/cacheFirst';
	import { dMap } from 'tes/src/lib/client/localCache';
	import { selecteds } from 'tes/src/lib/client/store';
	import type { DataCrudStyle } from 'tes/src/lib/xmemCachedd';
	import MimeSelect from './edit/mimeSelect.svelte';


	// export let docFile:DocFile = {docId:1,userId:1};
	export let docId :number;
	let progress = '(progress)';
  let fileType = '';

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
<form action="{`/api`}" method="POST" on:submit|preventDefault={handleSubmit(submitDocFile) }>
  <label for="name">File Name:</label>
  <input type="text" id="name" name="name" required>
	<input type="number" id="docId" name ="docId" hidden value="{docId ?? 0}">
	<input type="number" id="userId" name ="userId" hidden value="{1}">
  
	<span>{progress}</span>
	<span>
    <MimeSelect id={"mimeselectUploader"+docId} bind:fileType={fileType}></MimeSelect>
		<button type="submit" class="btn variant-filled bg-slate-50">
			<span>🚟</span>
		</button>
</span>
</form>
