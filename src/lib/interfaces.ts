import type { RecursivePartial } from './client/requester';
import type { CrudStyle, DataCrudStyle, _DataCrudStyle } from './xmemCachedd';

// type _datas = DocMapData | GroupMapData | DocFileMapData | DataMap;

export type Expand<T> = T extends (...args: infer A) => infer R
	? (...args: Expand<A>) => Expand<R>
	: T extends infer O
	? { [K in keyof O]: O[K] }
	: never;
export type ExpandRecursively<T> = T extends (...args: infer A) => infer R
	? (...args: ExpandRecursively<A>) => ExpandRecursively<R>
	: T extends object
	? T extends infer O
		? { [K in keyof O]: ExpandRecursively<O[K]> }
		: never
	: T;

// interface adnan {
//   b: number,
// }
// interface kon extends adnan {
//   b:string,
// }
// const a : kon = {b:''};

interface CRUDer<T extends CrudStyle> {
	// create:(<B extends T['pathIndex'],A extends (B extends T['pathIndex']?T['data']:(C extends undefined?T['input']:T['input']&C))>(input:A,index?:B)=>Promise<T['type']>),
	insert: (inputs: T['inputs']) => Promise<T['outputs'] >;
	// insertMany:(input:T['inputs'],index?:T['pathIndex'])=>Promise<T['outputs']>,
	// ((input:T['type'],index:T['pathIndex'])=>Promise<T['type']>)
	// | T['type'],
	read: (index?: T['index']) => Promise<T['outputs'] >;
	// readMany:(index?:T['pathIndex'])=>Promise<T['outputs']>,// | T['type'][],
	update: (inputs: Partial<T['input']>&{id:number}) => Promise<T['output'] >; // | T['type'],
	delete: (index?: T['index']) => Promise<T['outputs'] >; // | T['type'],
	// create:(...a:any)=>Promise<T['type']>// | T['type'],
	// read:(...a:any)=>Promise<T['type'][]>// | T['type'][],
	// update:(...a:any)=>Promise<T['type']>// | T['type'],
	// delete:(...a:any)=>Promise<T['type']>// | T['type'],
	// custom?: unknown;
}

export interface Storer<C extends _DataCrudStyle = DataCrudStyle> {
	group: CRUDer<C['group']>;
	doc: CRUDer<C['doc']>;
	docFile: CRUDer<C['docFile']>;
	// custom?: unknown;
}

export interface Requester<T = Storer>{
	table: keyof T;
	action: keyof T[keyof T];
	data: DataCrudStyle[keyof DataCrudStyle]['inputs']|DataCrudStyle[keyof DataCrudStyle]['index']|undefined
}

// export interface Filer<C extends _DataCrudStyle = DataCrudStyle> {
// 	group: CRUDer<C['group']>;
// 	doc: CRUDer<C['doc']>;
// 	docFile: CRUDer<C['docFile']>;
// 	custom?: unknown;
// }
