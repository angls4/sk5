<script lang="ts">
import { getContext } from "svelte";
export let group: any;
export let name: string;
export let value: any;
export let title = "";
export let controls = "";
export let regionTab = "";
export let active = getContext("active");
export let hover = getContext("hover");
export let flex = getContext("flex");
export let padding = getContext("padding");
export let rounded = getContext("rounded");
export let spacing = getContext("spacing");
export let id:string;
// export let handleSwap:(a:number,b:number)=>void;
const cBase = "text-center cursor-pointer transition-colors duration-100";
const cInterface = "";
let elemInput: any;
function onKeyDown(event:any) {
  if (["Enter", "Space"].includes(event.code)) {
    event.preventDefault();
    elemInput.click();
  } else if (event.code === "ArrowRight") {
    const tabList = elemInput.closest(".tab-list");
    if (!tabList)
      return;
    const tabs = Array.from(tabList.querySelectorAll(".tab"));
    const currTab = elemInput.closest(".tab");
    if (!currTab)
      return;
    const currIndex = tabs.indexOf(currTab);
    const nextIndex = currIndex + 1 >= tabs.length ? 0 : currIndex + 1;
    const nextTab:any = tabs[nextIndex];
    const nextTabInput = nextTab?.querySelector("input");
    if (nextTab && nextTabInput) {
      nextTabInput.click();
      nextTab.focus();
    }
  } else if (event.code === "ArrowLeft") {
    const tabList = elemInput.closest(".tab-list");
    if (!tabList)
      return;
    const tabs = Array.from(tabList.querySelectorAll(".tab"));
    const currTab = elemInput.closest(".tab");
    if (!currTab)
      return;
    const currIndex = tabs.indexOf(currTab);
    const nextIndex = currIndex - 1 < 0 ? tabs.length - 1 : currIndex - 1;
    const nextTab:any = tabs[nextIndex];
    const nextTabInput = nextTab?.querySelector("input");
    if (nextTab && nextTabInput) {
      nextTabInput.click();
      nextTab.focus();
    }
  }
}
$:
  selected = value === group;
$:
  classesActive = selected ? active : hover;
$:
  classesBase = `${cBase} ${flex} ${padding} ${rounded} ${classesActive} ${$$props.class ?? ""}`;
$:
  classesInterface = `${cInterface} ${spacing}`;
$:
  classesTab = `${regionTab}`;

export let dragged:boolean;
function prunedRestProps() {
  delete $$restProps.class;
  return $$restProps;
}

function dragStart(ev:DragEvent) {
  dragged = true;
  console.log(id)
  // ev.dataTransfer?.setData('id', id);
  ev.dataTransfer?.setData('id', id); //tabid
}

function dragEnd(ev:DragEvent) {
  console.log(id)
  dragged = false;
  
}

// function allowDrop(ev:DragEvent) {
//     ev.preventDefault();
//   }
// 	function drop(ev:DragEvent) {
//         ev.preventDefault();
// 		const draggedId = Number(ev.dataTransfer?.getData('id').split('dfitem-')?.[1] ?? 0);
// 		const thisId = Number(id.split('dfitem-')?.[1] ?? 0);
//         console.log(`dropped ${draggedId} on ${thisId}`)
// 		// if(draggedId && thisId){
// 		// 	handleSwap(draggedId,thisId)
// 		// }
// 	}
</script>

<label id={id} draggable="true" on:dragstart={dragStart} on:dragover on:dragend={dragEnd} on:drop class={classesBase} {title}>
	<!-- A11y attributes are not allowed on <label> -->
	<div
		class="tab wsTab relative {classesTab}"
		data-testid="tab"
		role="tab"
		aria-controls={controls}
		aria-selected={selected}
		tabindex={selected ? 0 : -1}
		on:keydown={onKeyDown}
		on:keydown
		on:keyup
		on:keypress
	>
		<!-- NOTE: Don't use `hidden` as it prevents `required` from operating -->
		<div class="h-0 w-0 overflow-hidden">
			<input bind:this={elemInput} type="radio" bind:group {name} {value} {...prunedRestProps()} tabindex="-1" on:click on:change />
		</div>
		<!-- Interface -->
    <slot />
		<div class="tab-interface{classesInterface}">
      <!-- ❌ -->
			{#if $$slots.lead}<div class="tab-lead"><slot name="lead" /></div>{/if}
			<div class="tab-label"></div>
		</div>
	</div>
</label>


