import type { HttpMethod } from "@sveltejs/kit"
import type { Omit } from "./xmemCachedd";
import type Mimes from "../mime";

export class XHRPromise extends Promise<XMLHttpRequest> {
	constructor(
		executor?: (
			resolve: (value: XMLHttpRequest | PromiseLike<XMLHttpRequest>) => void,
			reject: (reason?: any) => void
		) => void,
		_xhr?: XMLHttpRequest,
		_opts?: Partial<xhrOption>
	) {
		const xhr: XMLHttpRequest = _xhr ?? new XMLHttpRequest();
		const opts: xhrOption = {...{
			// name:'',
			method: 'GET',
			target: ''
		},..._opts};
		executor ??= function (resolve, reject) {
			// console.log(`xhr ${opts.name}`);
			if (opts?.pre) opts.pre(xhr);
			if (opts.responseType) xhr.responseType = opts.responseType;
			xhr.onprogress = opts?.onDownload ?? null;
			xhr.onabort = (pe) => {
				if (opts?.onDownloadAbort) opts.onDownloadAbort.call(xhr, pe);
				resolve(xhr);
			};
			xhr.upload.onprogress = opts?.onUpload ?? null;
			xhr.upload.onabort = (pe): any => {
				if (opts?.onUploadAbort) opts.onUploadAbort.call(xhr, pe);
				resolve(xhr);
			};
			xhr.onloadend = (pe) => {
				if (opts?.onResponse) opts.onResponse.call(xhr, pe);
				resolve(xhr);
			};
			xhr.onerror = (pe) => {
				if (opts?.onError) opts.onError.call(xhr, pe);
				reject(xhr);
			};
			xhr.ontimeout = (pe) => {
				reject(xhr);
			};
			xhr.upload.ontimeout = (pe) => {
				reject(xhr);
			};
			xhr.open(opts.method, opts.target);
			if (opts?.contentType) xhr.setRequestHeader('content-type', opts.contentType);
			// xhr.send(opts?.payload ?? null)
			// console.log(`xhr ${opts.name} sent`);
			if (opts?.post) opts.post(xhr);
		};
		super(executor);

		this.xhr = xhr;
		this.opts = opts;

		this.mergeOpts = function (opts) {
			this.opts = { ...this.opts, ...opts };
			return this;
		};
		this.abort = function () {
			this.xhr?.abort();
			return this;
		};
		this.set = function (key, value) {
			this.opts[key] = value;
			return this;
		};

		// this.set = (key:keyof xhrOption,value:xhrOption[key])
		// this.opts = null;
	}
	xhr: XMLHttpRequest;
	opts: xhrOption;
	mergeOpts: (opts: Partial<xhrOption>) => XHRPromise;
	send = (payload: xhrOption['payload'] = this.opts?.payload) =>{
		if (this?.xhr) if (!this?.xhr?.OPENED) this.open();
		this.xhr?.send(payload);
		const ret = this as Omit<XHRPromise, 'send' | 'open'>;
		return ret;
	};
  open = (method = this.opts.method, target = this.opts.target)=>{
			this.xhr?.open(method, target);
			this.open = () => this;
			const ret = this as Omit<XHRPromise, 'open'>;
			return ret;
		};
	abort: () => XHRPromise;
	// send: (payload?:xhrOption['payload'])=>XHRPromise;
	set: <K extends keyof xhrOption>(key: K, value: xhrOption[K]) => XHRPromise;
	// open: (method?:xhrOption['method'],target?:xhrOption['target'])=>XHRPromise;
	// abort: () => void;
}


export type xhrOption = {
    name?: string,
    payload?:Document|XMLHttpRequestBodyInit|null|undefined,
    method: HttpMethod,
    responseType?: XMLHttpRequestResponseType,
    contentType?: Mimes,
    target:string | URL,
    pre?: (xhr:XMLHttpRequest)=>any,
    post?: (xhr:XMLHttpRequest)=>any,
    onUpload?: (this:XMLHttpRequest,pe:ProgressEvent)=>any,
    onUploadAbort?: (this:XMLHttpRequest,pe:ProgressEvent)=>any,
    onDownload?: (this:XMLHttpRequest,pe:ProgressEvent)=>any,
    onDownloadAbort?: (this:XMLHttpRequest,pe:ProgressEvent)=>any,
    onResponse?:(this:XMLHttpRequest,pe:ProgressEvent)=>any,
    onError?:(this:XMLHttpRequest,pe:ProgressEvent)=>any,
    // xhr?: XMLHttpRequest,
};

export const makeXhr = (opts?:Partial<xhrOption>)=>{
    const ret =  new XHRPromise(undefined,undefined,opts);
    return ret;
}