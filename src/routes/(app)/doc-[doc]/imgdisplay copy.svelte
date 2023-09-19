<script lang="ts">
	export let file: File;
	export let blobUrl: string;

	let originalHeight;
	let originalWidth;

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
		console.log(originalHeight);
		console.log(originalWidth);
		if (!originalHeight || !originalWidth) return;
		console.log('wheel');
		if (ev.ctrlKey) {
			ev.preventDefault();
			zoomScale -= ev.deltaY * 0.001 * Math.sqrt(zoomScale);
			if (zoomScale < 0.1) zoomScale = 0.1;
			// setZoom(zoomScale,document.getElementById(`table-${docFile.id}`))
		}
	}
</script>

<input id="test" min="1" max="10" value={zoomScale*10} step="1"  type="range" on:input={showVal}/>
<div on:wheel={onWheel} class="w-full h-[calc(100%)] overflow-scroll">
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
