<script>import { getContext, createEventDispatcher } from "svelte";
export let onCaretClick = ()=>{};
export let onClick = ()=>{};
export let open = false;
export let selected = false;
export let spacing = "space-x-4";
export let padding = getContext("padding");
export let indent = getContext("indent");
export let hover = getContext("hover");
export let rounded = getContext("rounded");
export let caretOpen = getContext("caretOpen");
export let caretClosed = getContext("caretClosed");
export let hyphenOpacity = getContext("hyphenOpacity");
export let regionSummary = "";
export let regionSymbol = getContext("regionSymbol");
export let regionChildren = getContext("regionChildren");
const dispatch = createEventDispatcher();
$:
  dispatch("toggle", { open });
const cBase = "";
const cSummary = "list-none flex items-center cursor-pointer";
const cSymbol = "fill-current w-3 text-center transition-transform duration-[200ms]";
const cChildren = "";
$:
  classesCaretState = open ? caretOpen : caretClosed;
$:
  classesBase = `${cBase} ${$$props.class ?? ""}`;
$:
  classesSummary = `${cSummary} ${spacing} ${rounded} ${padding} ${hover} ${regionSummary}`;
$:
  classesSymbol = `${cSymbol} ${classesCaret} ${regionSymbol}`;
$:
  classesCaret = `${classesCaretState}`;
$:
  classesHyphen = `${hyphenOpacity}`;
$:
  classesChildren = `${cChildren} ${indent} ${regionChildren}`;
</script>

<details bind:open class="tree-item {classesBase}" data-testid="tree-item">
	<summary
		class="tree-item-summary {classesSummary} "
		role="treeitem"
		aria-selected="{selected}"
		aria-expanded={$$slots.children ? open : undefined}
		on:click={(e)=>{e.preventDefault();onClick()}}
		on:keydown
		on:keyup
	>
		<!-- Symbol -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		
		<!-- Slot: Lead -->
		{#if $$slots.lead}
			<div class="tree-item-lead select-none"  on:click={(e)=>{e.preventDefault();e.stopPropagation();onCaretClick()}}>
				<slot name="lead" />
			</div>
		{/if}
		<!-- Slot: Content -->
		<div class="tree-item-content">
			<slot />
		</div>
	</summary>
	<div class="tree-item-children {classesChildren}" role="group">
		<slot name="children" />
	</div>
</details>
