<script lang="ts">
	import { Accordion, AccordionItem, ProgressRadial } from '@skeletonlabs/skeleton';
	import FileButton from './fileButton.svelte';
	import { onMount } from 'svelte';
	import storer from 'tes/src/lib/client/cacheFirst';
	import cache, { dfMap } from 'tes/src/lib/client/localCache';
	import type { DocFileMapData } from 'tes/src/lib/storeType';
	import { makeXhr, XHRPromise, type xhrOption } from 'tes/src/lib/xhrType';
	import Dfuploader from './dfuploader.svelte';
	import type Mimes from 'tes/src/mime';
	import type { DocFile } from 'tes/src/lib/xmemCachedd';
	import { mimesExt } from 'tes/src/mime';
	import moment from 'moment';
	import { dfOrder } from 'tes/src/lib/client/store';
	import { pause } from 'tes/src/lib/cache';
	import { Md5 } from 'ts-md5';
	import Shseet from './shseet.svelte';
	import Imgdisplay from './imgdisplay.svelte';

	let file: File; //| undefined;
	let submitFile: File; //| undefined;
	let blobUrl: string = '';
	let fileList: FileList;
	// let progress = '(progress)';
	let progress = 0;
	let ongoingXHR: XHRPromise | undefined;
	let needUpdate: boolean = true;
	let fileType;
	// export let divId :string;
	export let docFile: DocFile;
	// storer.docFile.read({id:docFile.id})
	export let handleMount: () => void;
	$: route = `/api/file/${docFile.id}`;
	// $:{console.log(docFile)}

	// $: fileExtension = `.${(docFile?.fileType ?? ('' as string)).split('/')[1]}`;
	$: fileExtension = `.${mimesExt[docFile.fileType as string]}`;

	type Handles = {
		window: Window | undefined;
		root: FileSystemDirectoryHandle | undefined;
		file: FileSystemFileHandle | undefined;
	};
	const handles: Handles = { window: undefined, root: undefined, file: undefined };

	let optUpload: xhrOption;
	let optDelete: xhrOption;
	let optGet: xhrOption;

	$: {
		optUpload = {
			name: 'Upload file',
			target: route,
			responseType: 'json',
			method: 'POST',
			onUpload(pe) {
				progress = Math.round((pe.loaded / pe.total) * 100);
			},
			onUploadAbort(pe) {
				console.log('aborted ' + optUpload.name);
			},
			onResponse(pe) {
				console.log('upload responed vvv');
				console.log(this.response);
			}
		};
		optDelete = {
			name: 'Delete docFile',
			target: route,
			responseType: 'json',
			method: 'DELETE'
		};
		optGet = {
			name: 'Download file',
			target: route,
			responseType: 'blob',
			method: 'GET',
			onDownload(pe) {
				// console.log(pe.lengthComputable)
				progress = Math.round((pe.loaded / pe.total) * 100);
			},
			onDownloadAbort(pe) {
				console.log('aborted ' + optGet.name);
			}
		};
	}

	const getFile = async () => {
		console.log('getfile ' + docFile.name);
		if (ongoingXHR?.abort) ongoingXHR?.abort();
		ongoingXHR = makeXhr(optGet).send() as XHRPromise;
		const finished = await ongoingXHR;
		const res = finished.response;
		// if((res as File)?.type == docFile.fileType){
		if ((res as File)?.size > 2) {
			console.log('downloaded');
			file = res;
			blobUrl = URL.createObjectURL(file);
			fileType = file.type;
			saveToStorage();
			const newdf = await cache.docFile.update({ id: docFile.id, fileType: file.type });
			$dfMap[docFile.id]['dateDownloaded'] = String(newdf?.dateCreated);
		}
		if ((await ongoingXHR)?.readyState == 4)
			//aborted
			ongoingXHR = undefined;
	};
	const handleDeleteDocFile = (e: MouseEvent) => {
		e.stopPropagation();
		if (docFile) deleteDocFile(docFile);
	};
	const deleteDocFile = async (docFile: DocFile) => {
		console.log('delete docfile ' + docFile.id);
		console.log(await storer.docFile.delete({ id: docFile.id }));
	};

	const saveToStorage = async () => {
		console.log('saveTostorage ' + Md5.hashStr('' + docFile.id));
		handles.root ??= await (handles.window as Window).navigator.storage.getDirectory();
		try {
			handles.file =
				(await handles.root.getFileHandle(Md5.hashStr('' + docFile.id), {
					create: true
				})) ?? undefined;
			const writable = await handles.file.createWritable();
			if (file) {
				await writable.write(file);
				console.log('saved to file ');
				await writable.close();
			}
		} catch (error) {
			console.log('error saveTostorage ' + error);
		}
	};
	const getFromStorage = async (a?: any) => {
		if (!$dfMap?.[docFile.id]?.dateDownloaded) return;
		// await pause(120)
		handles.window ??= window;
		// if(blobUrl != '') return;
		console.log('getfromstorage ' + Md5.hashStr('' + docFile.id));
		try {
			handles.root ??= await handles.window.navigator.storage.getDirectory();
			handles.file =
				(await handles.root.getFileHandle(Md5.hashStr('' + docFile.id))) ?? undefined;
			const _file = new File([await handles.file.getFile()], docFile.name, {
				type: docFile?.fileType ?? ''
			});
			console.log('file vvv');
			if (_file) {
				console.log();
				// file = new File(_file,docFile.name,{type:docFile.fileType});
				file = _file;
				blobUrl = URL.createObjectURL(file);
				fileType = file.type;
			}
			// saveType(file);
			// changePreview(file);
		} catch (error) {
			console.log('error getfromstorage ' + error);
			blobUrl = '';
		}
	};

	const uploadFile = () => {
		ongoingXHR = makeXhr({
			name: `upload to ${route}`,
			contentType: submitFile.type as Mimes,
			target: route,
			method: 'POST',
			responseType: 'json',
			onUploadAbort() {
				console.log('aborted ' + name);
			},
			onUpload(pe) {
				progress = Math.round((pe.loaded / pe.total) * 100);
			},
			onResponse(pe) {
				console.log('onloadend vvv');
				console.log(this.response);
				console.log(submitFile.name);
				if (this.status == 200) {
					const res = this.response as DocFile;
					file = submitFile;
					(async () =>
						console.log(
							await storer.docFile.update(res).then((res) => {
								$dfMap[docFile.id]['dateDownloaded'] = String(res?.dateCreated);
								needUpdate = false;
							})
						))();
					blobUrl = URL.createObjectURL(file);
					saveToStorage();
				}
			}
		}).send(submitFile) as XHRPromise;
	};
	onMount(() => {
		handleMount();
		const tableElement = document.querySelector('.sheet_container .jexcel_content table');
		handles.window ??= window;

		console.log('omount ' + handles.window);
		console.log(tableElement);
	});
	async function wait1ms(...args: any[]) {
		await pause(100);
	}
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
	let zoomScale = 100;

	function onWheel(ev: WheelEvent) {
		console.log('wheel');
		if (ev.ctrlKey) {
			ev.preventDefault();
			zoomScale += ev.deltaY * 0.1 * zoomScale;
			if (zoomScale < 0.001) zoomScale = 0.001;
			// setZoom(zoomScale,document.getElementById(`table-${docFile.id}`))
		}
	}
	$: {
		const downloadDate = moment($dfMap[docFile.id].dateDownloaded);
		const newDate = moment(docFile.dateCreated);
		if (downloadDate.diff(newDate) === 0) needUpdate = false;
		else needUpdate = true;
	}
</script>

		<AccordionItem transitionInParams={[]} transitionOutParams={[]} class="flex-shrink flex-grow-0 overflow-hidden " regionControl="h-[5%]  {needUpdate ? "bg-yellow-400" : ""}">
			<svelte:fragment slot="summary"><div class="text-center no-wrap whitespace-nowrap" >Update Data</div></svelte:fragment>
			<svelte:fragment slot="content">
				
				<!-- <div >{docFile.id} - {docFile.name}</div> -->
				<span>
					
					<!-- {#if needUpdate}
						<div class="bg-yellow-400">need update</div>
					{/if} -->
					<button
						type="button"
						on:click={() => {
							getFile();
						}}
						class="btn variant-filled bg-slate-50"
					>
						<span class="text-black">Update 📩</span>
					</button>
				</span>
				<span>
					<a href={blobUrl} target="_blank">{blobUrl ? '↗️' : '📵'}</a>
					<a href={blobUrl} download={`testDownload${fileExtension}`} target="_blank"
						>{blobUrl ? '⬇️' : '📵'}</a
					>
				</span>
				<FileButton
					name="file"
					accepted="{docFile.fileType}"
					bind:files={fileList}
					on:change={() => (submitFile = fileList?.[0])}
					tw-
					button="bg-slate-50 text-black"
					>Pilih File 🗃️
				</FileButton>
				{#if submitFile?.type && docFile?.fileType != 'null' && submitFile?.type != docFile.fileType}
				<div class="bg-yellow-300">Tipe File (<span class="text-red-500">.{mimesExt[submitFile?.type]}</span>) Tidak Sesuai Dengan (<span class="text-green-700">.{mimesExt[docFile?.fileType]}</span>). Lanjut?</div>
				{/if}
				{#if submitFile?.type}
				<span>
					<button
					type="button"
					on:click={() => {
							uploadFile();
						}}
						class="btn bg-slate-50"
						>
						<span>Upload</span>
					</button>
					{#if ongoingXHR?.abort}
						<ProgressRadial value={progress}>{progress}%</ProgressRadial>
					<button
					type="button"
					on:click={() => {
						console.log('ongoing = ' + ongoingXHR?.toString);
						if (ongoingXHR?.abort) ongoingXHR?.abort();
					}}
						class="btn bg-slate-50"
						>
						<span>cancel ❌</span>
					</button>
					{/if}
				</span>
				{/if}
			</svelte:fragment>
		</AccordionItem>
		<div class="h-[97%] w-full">
				{#await getFromStorage()}
					getting from storage
				{:then a}
					<!-- {blobUrl} -- {file?.type} -->

					{#if blobUrl && file}
						{#await wait1ms(blobUrl, file)}
							<div>...</div>
						{:then a}
							
							<!-- <div class="h-full max-w-full overflow-y-scroll flex-grow overflow-x-scroll" >
		<Shseet file={file} tableId={`table-${docFile.id}`}/> 
		</div> -->
							<!-- <iframe src={blobUrl} typeof={docFile.fileType} frameborder="0" class="h-full w-full"></iframe> -->
							<!-- <embed src={blob
		Url} type={docFile.fileType} class="h-full w-full"> -->
							<Imgdisplay {blobUrl} {file} />
							<!-- <div on:wheel={onWheel} class="w-full h-full overflow-scroll">
		<object  class="h-full w-full " data={blobUrl} style={`pointer-events:none; width: ${zoomScale}px;height: ${zoomScale}px;font-size: ${zoomScale}px;`} id={`table-${docFile.id}`} type={docFile.fileType}></object>

		</div> -->
						{/await}
					{/if}
				{/await}
				</div>