<script lang="ts">
	import { text } from "@sveltejs/kit";
	import Shseet from "./shseet.svelte";

	export let file: File;
	export let blobUrl: string;

	let originalHeight = 21;
	let originalWidth = 14;
    let originalFontSize = 14;

	function setZoom(zoom, el: HTMLElement) {
		const transformOrigin = [0, 0];
		// el = el;
		var p = ['webkit', 'moz', 'ms', 'o'],
			s = 'scale(' + zoom + ')',
			oString = transformOrigin[0] * 100 + '% ' + transformOrigin[1] * 100 + '%';

		for (var i = 0; i < p.length; i++) {
			el.style[p[i] + 'Transform'] = s;
			el.style[p[i] + 'TransformOrigin'] = oString;
		}

		el.style['transform'] = s;
		el.style['transformOrigin'] = oString;
		console.log(zoom + ' - ' + s);
	}

	//setZoom(5,document.getElementsByClassName('container')[0]);
	let zoomScale = 1;
    function showVal(a: Event) {
		const val = (a.target as HTMLInputElement).value;
		zoomScale = Number(val) / 10;
	}
	function onWheel(ev: WheelEvent) {
		// console.log(originalHeight);
		// console.log(originalWidth);
		if (!originalHeight || !originalWidth) return;
		console.log('wheel');
		if (ev.ctrlKey) {
			ev.preventDefault();
			zoomScale -= ev.deltaY * 0.001 * Math.sqrt(zoomScale);
			if (zoomScale < 0.1) zoomScale = 0.1;
			// setZoom(zoomScale,document.getElementById(`table-${docFile.id}`))
		}
	}
    let wordWarp;
</script>

{#if file.type.split('/')[0] == 'image'}
<input id="test" min="1" max="10" value={zoomScale*10} step="1"  type="range" on:input={showVal}/>

<div on:wheel={onWheel} class="w-full h-[calc(97%)] mb-0 overflow-scroll">
	<div class="w-max h-max">
        <img
        class="block"
        src={blobUrl}
        alt="failed loading image"
        bind:naturalHeight={originalHeight}
        bind:naturalWidth={originalWidth}
        style={`width: ${zoomScale * originalWidth}px;height: ${zoomScale * originalHeight}px;`}
		/>
	</div>
</div>
{:else if file.type == 'application/pdf'}

<object class="w-full h-full" data={blobUrl} type={file.type}></object>
{:else if file.type.split('/')[0] == 'text'}
{#await file.text()}
loading text...
{:then text} 
<span>
<input id="test" min="1" max="10" value={zoomScale*10} step="1" class="w-[calc(100%-60px)]" type="range" on:input={showVal}/>
<input type="checkbox" bind:checked={wordWarp} on:change={()=>console.log(wordWarp)} id="cb-{blobUrl}">
<label class="w-min inline-block" for="cb-{blobUrl}">wrap</label>
</span>
<!-- <pre on:wheel={onWheel} class="h-[97%] overflow-scroll" style="font-size: {zoomScale * originalWidth}px; line-height:{zoomScale * originalHeight}px;">{text}</pre>
<input id="test" class="h-[1%]" min="1" max="10" value={zoomScale*10} step="1"  type="range" on:input={showVal}/> -->

<div on:wheel={onWheel} class="w-full h-[calc(97%)] mb-0 overflow-scroll pl-5">
	<pre style="font-size: {zoomScale * originalWidth}px; line-height:{zoomScale * originalHeight}px; {wordWarp ? 'white-space: pre-wrap; word-wrap: break-word; width:100%; height:100%;' : ''}" class="w-max h-max">
        {text}
	</pre>
</div>
{/await}
{:else if file.type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
	<Shseet file={file} tableId={`table-${blobUrl}`}/> 
{/if}
