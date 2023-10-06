<script lang="ts">
  import * as XLSX from "./xlsx-patch.mjs"
  import { convert } from "./convert";

  export let onload: (sheets: any[], sheetNames: any[], wb:any) => any;
  export let sheetNames;
  export let sheets = [];
  export let open: any;
  // let wb;

  // declare all possible table object
  let files: any;

  $: files && files[0] && reader && reader.readAsArrayBuffer(files[0]);

  let reader;
  if (typeof FileReader != "undefined") {
    reader = new FileReader();
    reader.onload = () => {
      sheets = [];
      const wb = XLSX.read(new Uint8Array(reader.result), {
        type: "array",
        cellFormula: true,
        cellStyles: true,
      });
      // console.log('wb')
      // console.log(wb)
      sheets = convert(wb,0);
      // sheetNames = sheets.map((s) => s.sheetName);
      sheetNames = wb.SheetNames;
      onload && onload(sheets, sheetNames, wb);
    };
  }
</script>

<input type="file" class="hidden" name="file" bind:this={open} bind:files />

<style>
  .hidden {
    height: 0;
    width: 0;
    opacity: 0;
  }
</style>
