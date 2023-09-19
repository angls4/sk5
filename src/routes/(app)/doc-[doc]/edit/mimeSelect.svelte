<script lang="ts">
	import { type AutocompleteOption, Autocomplete } from "@skeletonlabs/skeleton";
	import { pause } from "tes/src/lib/cache";
	import { extMimes, mimesExt } from "tes/src/mime";

    export let fileType;
    export let id;

      let fileTypeOptions:AutocompleteOption[] = Object.entries(extMimes).map((x)=>{return {label:'.'+x[0],value:x[1],keywords:x[1]}})
      fileTypeOptions = [{label:'ANY FILE',value:'null'},...fileTypeOptions]
//   let fileType;
  let inputPopup;
  $:{
    console.log(fileType)
    inputPopup = mimesExt?.[fileType] ? '.'+mimesExt?.[fileType] : '' ;
  }
  
const handleSearchFocus = (e)=>{
  document.getElementById(id).style.display = 'block'
}
let blur = true;
const handleSearchUnfocus = async (e)=>{
    blur= true;
await pause(100);
if(blur)
  document.getElementById(id).style.display = 'none'
}
const handlePopupSelect = (e)=>{
  fileType = e.detail.value;
  document.getElementById(id).style.display = 'none';
//   inputPopup = e.detail.label;
}
</script>
<div >
<input class="py-2 px-2 input" on:blur={handleSearchUnfocus} autocomplete="off" type="search" name="fileType" bind:value={inputPopup} placeholder="Tipe File..." on:focus={handleSearchFocus} />
<div class="relative">
<div on:blur={handleSearchUnfocus} id={id} style="display: none;" class="card w-full max-w-sm max-h-48 p-1 text-sm overflow-y-auto absolute top-0" tabindex="-1" on:focus={()=>blur=false}>
	<Autocomplete bind:input={inputPopup} options={fileTypeOptions} on:selection={handlePopupSelect} />
</div>
</div>
</div>
