import { type Docfile, type Timestamp } from "../db/types";
import type { DataMap } from "./storeType";
import type { Storer } from "./interfaces";
import type Mimes from "../mime";

export class Group {
	id: number;
	name: string;
	parentId: number ;
}
export class Doc {
	id: number;
	name: string;
	groupId: number;
}
export class DocFile  {
    id: number;
    dateCreated: Date | string;
    docId: number;
    name: string;
    userId: string;
    isActive: number;
    fileType?: string | null | Mimes;
}

// declare global{
export namespace DataStyles{
    export namespace Group{
        export type single = Group;
        export type setIndex = single['id'];
        export type _Sets<T> = Expand<{
			[group: setIndex]: T;
		}>;
        export type Sets = _Sets<single>;
    }
    export namespace Doc{
        export type single = Doc;
        export type setIndex = single['id'];
		export type _Sets<T> = Expand<{
			[doc: setIndex]: T;
		}>;
        export type Sets = _Sets<single>;
    }
    export namespace DocFile{
        export type single = DocFile;
        export type setIndex = single['id'];
		export type _Sets<T> = Expand<{
			[docFile: setIndex]: T;
		}>;
        export type Sets = _Sets<single>;
    }
}
// }

interface DataStyle{
    group:unknown,
    doc:unknown,
    docFile:unknown,
} 

interface CrudStyle {
    input:unknown,
    output:unknown,
    index:unknown,
    pathIndex:unknown,
    inputs:unknown,
    outputs:unknown,
}


type MapProperties<T, U> = {
  [K in keyof T]: U;
};

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type makeOptional<T,K extends keyof T>= Expand<Partial<T>&Omit<T,K>>;

export type DataDump = {
    group?:DataStyles.Group.Sets,
    doc?:DataStyles.Doc.Sets,
    docFile?:DataStyles.DocFile.Sets,
}
export type _DataCrudStyle = MapProperties<DataStyle,CrudStyle>;

export interface DataCrudStyle extends _DataCrudStyle {
	group: {
		index: {
			// id?: DataStyles.Group.setIndex;
			id?: Group['id'];
		} & DataCrudStyle['group']['pathIndex'];
		pathIndex: {
			group?: Group['parentId'];
		};
		input: makeOptional<Group, 'id'>;
		output: Group | undefined;
		inputs: DataStyles.Group._Sets<DataCrudStyle['group']['input']>;
		// inputs: DataCrudStyle['group']['input'][];
		outputs: DataStyles.Group.Sets;
	};
	doc: {
		index: {
			// id?: DataStyles.Doc.setIndex;
			id?: Doc['id'];
		} & DataCrudStyle['doc']['pathIndex'];
		pathIndex: DataCrudStyle['group']['pathIndex'];
		input: makeOptional<Doc, 'id'>;
		output: Doc | undefined;
		inputs: DataStyles.Doc._Sets<DataCrudStyle['doc']['input']>;
		// inputs: DataCrudStyle['doc']['input'][];
		outputs: DataStyles.Doc.Sets;
	};
	docFile: {
		index: {
			// id?: DataStyles.DocFile.setIndex;
			id?: DocFile['id'];
		} & DataCrudStyle['docFile']['pathIndex'];
		pathIndex: {
			doc?: DocFile['docId'];
		};
		input: makeOptional<DocFile, 'dateCreated' | 'id' | 'isActive'>;
		output: DocFile | undefined;
		inputs: DataStyles.DocFile._Sets<DataCrudStyle['docFile']['input']>;
		// inputs: DataCrudStyle['docFile']['input'][];
		outputs: DataStyles.DocFile.Sets;
	};
}

export interface customCrudStyle extends Storer {
	group?: {
		custom?: unknown;
	};
	doc?:  {
		custom?: unknown;
	};
	docFile?: {
		custom?: unknown;
	};
	custom?: unknown;
}