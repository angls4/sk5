import type { DataStyles, Doc, DocFile, Group } from './xmemCachedd';

// export type DocInput = Expand<Omit<db.Doc, 'id'>>;
// export type DocFileInput = Expand<Omit<db.Docfile, 'id' | 'dateCreated' | 'isActive'>>;
// export type GroupInput = Expand<Omit<db.Group, 'id'>>;

// export type GroupInput = Expand<RemoveGenerics<Partial<db.Group>&Omit<db.Group, 'id'|'parentId'>>>;
// export type DocInput = Expand<RemoveGenerics<Partial<db.Doc>&Omit<db.Doc, 'id'>>>;
// export type DocFileInput = Expand<RemoveGenerics<Partial<db.DocFile>&Omit<db.DocFile, 'id' | 'dateCreated' | 'isActive'>>>;

// export type DocInput = Expand<Partial<RemoveGenerics<db.Doc>>>;
// export type DocFileInput = Expand<Partial<RemoveGenerics<db.Docfile>>>;
// export type GroupInput = Expand<Partial<RemoveGenerics<db.Group>>>;

// TODO : granulasi => skrg delete,update,create bakal replace docmap seluruhnya, jadi groupmap, docmap, docfilemap harus terpisah. bagusnya delete bakal delete ya delete, update ya update, create ya create.
// TODO : granulasi => butuh pembaruan storetype, id gak adayang disimpen di client. ATAU untuk kirim data Map ke client dijadikan fungsi biar gacuma bisa dipake di endpoint

// export type dataMap = Record<string, Record<string, DocMapData>

// DEPRECATED nongranural approach
// export type _RemoveGenerics<T> = T extends Generated<infer U> ? U : T;
// export type RemoveGenerics<T> = a<{
//   [K in keyof T]: _RemoveGenerics<T[K]>;
// }>
// export type Export<T> = {
//   [doc in keyof T]: T[doc] extends { data: DocMapData; docFiles: DocFileDataMap }
//     ? T[doc]
//     : never;
// };
// export type IdTypes = {
//   group:RemoveGenerics<db.Group>['id'],
//   doc:RemoveGenerics<db.Doc>['id'],
//   docFile:RemoveGenerics<db.DocFile>['id'],
// }

export type _types = {
	type: unknown;
	input: unknown;
	output: unknown;
	index: unknown;
	pathIndex: unknown;
	data: unknown;
};

export interface Root extends _types {
	type: DataMap;
	// input:GroupInput,
	index: undefined;
	// data:GroupDataMap,
}
// export type Group = {
//   type:GroupMapData,
//   input:GroupInput,
//   output:Expand<RemoveGenerics<db.Group>>,
//   index:Group['pathIndex'] & {
//     id?:IdTypes['group'],
//     group:IdTypes['group'],
//   },
//   pathIndex:{
//     parent?:RemoveGenerics<db.Group>['parentId'],
//   }|undefined,
//   data:GroupDataMap,
// };
// export type Doc = {
//   type:DocMapData,
//   input:DocInput,
//   output:Expand<RemoveGenerics<db.Doc>>,
//   index:Doc['pathIndex'] & {
//     id?:IdTypes['doc'],
//     doc:IdTypes['doc'],
//   },
//   pathIndex:{
//     group:IdTypes['group'],
//   },
//   data:DocDataMap,
// }
// export type DocFile = {
//   type:DocFileMapData,
//   input:DocFileInput,
//   output:Expand<RemoveGenerics<db.DocFile>>,
//   index:DocFile['pathIndex'] & {
//     id?:IdTypes['docFile'],
//     docFile:IdTypes['docFile'],
//   },
//   pathIndex:{
//     doc:IdTypes['doc'],
//   },
//   data:DocFileDataMap,
// }

// TODO groupmapdata = Group from db/type.ts ???
// export type GroupMapData = Expand<RemoveGenerics<db.Group>>;
// export type DocMapData = Expand<RemoveGenerics<db.Doc>>; // {docname : {id,name,...}}
// export type DocFileMapData =  Expand<RemoveGenerics<db.Docfile>>; //
export type GroupMapData = DataStyles.Group.single;
export type DocMapData = DataStyles.Doc.single; // {docname : {id,name,...}}
export type DocFileMapData = DataStyles.DocFile.single; //
// export type GroupMapData =  boolean;
// export type DocFileMapData = Pick<_DocFileMapData, Exclude<keyof _DocFileMapData, 'dateCreated'>> & { dateCreated: Date };

// DEPRECATED
// export type GroupMap = Record<string, GroupMapData>; //{groupname:{opened}}
// export type DocMap = Record<string,Record<string,DocMapData>>; //{groupname:docmapdata}
// export type DocFileMap = Record<number, Record<string,DocFileMapData>>; //{docid:{docfile1:{...},docfile2:{...}}}

// GRANULASI COOOY
// export type DocDataMap = {
//   [doc:string]:{
//     data:DocMapData,
//     docFiles:DocFileDataMap,
//   }
// }
// export type DocFileDataMap = {
//   [docfile:string]:DocFileMapData,
// }
// export type GroupDataMap = {
//   [group:string]:{
//     data:GroupMapData,
//     docs:DocDataMap,
//   }
// }
// export type DataMap = {
//   groups:GroupDataMap,
// }
type a<T> = T;
export type GroupDataMap = a<{ [name: Group['id']]: Group['id'] }>;
export type DocDataMap = a<{ [name: Doc['id']]: Doc['id'] }>;
export type DocFileDataMap = a<{ [name: DocFile['id']]: DocFile['id'] }>;
export type DMap = a<{
	[doc: Doc['id']]: {
		markedForDelete?: boolean;
		data: Doc;
		docFiles: DocFileDataMap;
	};
}>;
export type DFMap = {
	[docfile: DocFile['id']]: { data: DocFile; dateDownloaded?: string; markedForDelete?: boolean };
};
export type DataDataMap = a<{
	markedForDelete?: boolean;
	opened?: boolean;
	data: Group;
	groups: GroupDataMap;
	docs: DocDataMap;
}>;
export type DataMap = a<{
	0: DataDataMap;
	[parent: Group['id']]: DataDataMap;
}>;

// export type DataMap = {
//   groups:GroupDataMap,
// }

// CLIENT ONLY
export type UIGroupMap = {
	0: boolean;
	[group: number]: boolean;
};

// export type inferKey<T,X extends string | number> = T extends {[x:infer X]:any}?X:T;
