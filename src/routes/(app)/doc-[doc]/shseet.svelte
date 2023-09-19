<script lang="ts">
  import { Sheet, Toolbar } from "svelte-sheets";
	import type { Config } from "svelte-sheets/defaultconfig";
  import example from './_example.json'
  import XLSX from 'xlsx'
	import { convert } from "tes/src/lib/convert";
	import { onMount } from "svelte";

  export let tableId;
  let sheetNames:any = [];
  let sheets = [example];
  let active:any = 0;
  let data:any;
  let columns:any = ['','',''];
  let mergeCells:any;
  let style:any;
  const cb: [string,string]= ['','']
  const options = {
    rowDrag:false,
    rowResize:false,
    columnDrag:false,
    columnResize:false,
    // tableHeight:'90vh',
    // tableWidth:'100%',
    // minDimensions:[5,5],
    // defaultColWidth:50,
    // tableHeight:'100%',
  } as Config;
  

  // declare all possible table object
  export let file: File = undefined;
let loaded = false;
let processed = false;


  async function initSheet() {
    console.log(file)
    console.log(`init sheet`)
    sheets = [];
    const wb = XLSX.read(new Uint8Array(await file.arrayBuffer()), {
      type: "array",
      cellFormula: true,
      cellStyles: true,
    });
    sheets = convert(wb);
    sheetNames = sheets.map((s) => s.sheetName);
    console.log('init sheet completed')
  }

  onMount(()=>{
    initSheet().then(()=>{loaded = true;});
  })


  $: {
      console.log(active)
      console.log(loaded)
      console.log(sheets?.[active])
      if(active != undefined && sheets?.[active] != undefined){
        console.log('init sheet 2')
        data = sheets[active]?.data;
        columns = sheets[active].columns;
        mergeCells = sheets[active].mergeCells;
        style = sheets[active].style;
        processed = true;
        loaded=false;
    }
  }
</script>
{#if processed}
  
<Toolbar bind:sheetNames bind:sheets bind:active />
<Sheet tableId={tableId} classes={" h-full"} classes2={"bg-red-600"} jexcelStyles="max-height:100%; max-width:100%;" onInputChange={()=>{}} clipboard={cb} options={options} style={style} mergeCells={mergeCells} columns={columns} data={data} />
  {/if}