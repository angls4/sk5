<script lang="ts">
	import { enhance } from "$app/forms";
	import { updateGroups,groupMap } from "$lib/client/store";
	import type { SubmitFunction } from "@sveltejs/kit";
	import type { PageData } from "../$types";
	import type { Group } from "../../db/types";
	import type { GroupInput } from "$lib/server/kysely";


  export let data : PageData;
  const login: SubmitFunction = () => {
        return async ({update,result}) => {
            // await applyAction(result)
            await update({reset:false});
            console.log(result);
            if(result.type == "success"){
              updateGroups();
            }
            // groupname = $page.form.groupname;   
            // $:{console.log('formdata::2222:');console.log($page.form);}    
        }
    }
    
    const submitGroup = (event:SubmitEvent)=>{
      const target = event.target as HTMLFormElement;
      // console.log(event);
      console.log('submit group');

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
        const res = (xhr.response as GroupInput);
        if(res)
        $groupMap[res.name] = false;
        // updateGroups();
        // applyAction(xhr.response);
      }
      xhr.open(target.method,target.action);
      // console.log('testXHR');
      xhr.send(new FormData(target));
      console.log('upload sent');
      // data.docFiles = data.docFiles;
      return xhr;
    }

</script>



<br>
<!-- Create Group Form -->
<form action="/api" method="POST" on:submit|preventDefault={submitGroup}>
  <label for="name">Group Name:</label>
  <input type="text" id="name" name="name" required>

  <br>
  <br>
   <button type="submit" class="btn variant-filled">
    <span>Create Group 🫂</span>
  </button>
</form>
<!--  -->
