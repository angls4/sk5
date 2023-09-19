// const t 
import type * as db from "../db/types";
import type { RemoveGenerics } from "./storeType";
import type { Group, Doc, DocFile, DataStyles, _DataCrudStyle } from "./xmemCachedd"


type MergeRecursively<A, B> = A extends object
  ? B extends object
    ? {
        [K in keyof A | keyof B]: K extends keyof A
          ? K extends keyof B
            ? MergeRecursively<A[K], B[K]>
            : A[K]
          : K extends keyof B
          ? B[K]
          : never;
      }
    : B
  : B;


export interface myCrudStyle extends _DataCrudStyle {
    group:{
        index: {
            id:Group['id'],     
        },
        pathIndex:{
            group?:Group['parentId'],
        }|undefined,
        input:Expand<RemoveGenerics<Partial<db.Group>&Omit<db.Group, 'id'|'parentId'>>>,
        output:Group,
        inputs:Expand<DataStyles.Group._Sets<myCrudStyle['group']['input']>>,
        outputs:Expand<DataStyles.Group._Sets<myCrudStyle['group']['output']>>,
    },
    doc:{
        index: {
            id:Doc['id'],     
        },
        pathIndex:{
            group:Doc['groupId'],
        }|undefined,
        input:Expand<RemoveGenerics<Partial<db.Doc>&Omit<db.Doc, 'id'>>>,
        output:Doc,
        inputs:Expand<DataStyles.Doc._Sets<myCrudStyle['doc']['input']>>,
        outputs:Expand<DataStyles.Doc._Sets<myCrudStyle['doc']['output']>>,
    },
    docFile:{
        index: {
            id:DocFile['id'],     
        },
        pathIndex:{
            group:DocFile['docId'],
        }|undefined,
        input:Expand<RemoveGenerics<Partial<db.Docfile>&Omit<db.Docfile, 'id' | 'dateCreated' | 'fileType'>>>,
        output:DocFile,
        inputs:Expand<DataStyles.DocFile._Sets<myCrudStyle['docFile']['input']>>,
        outputs:Expand<DataStyles.DocFile._Sets<myCrudStyle['docFile']['output']>>,
    },
}
/*
export type _myCrudStyle = DataCrudStyle & {
    group:{
        index: {
            id:Group['id'],     
        },
        input:Expand<RemoveGenerics<Partial<db.Group>&Omit<db.Group, 'id'|'parentId'>>>,

    },
    doc:{
        index: {
            id:Doc['id'],     
        },
        input:Expand<RemoveGenerics<Partial<db.Doc>&Omit<db.Doc, 'id'>>>,

    },
    docFile:{
        index: {
            id:DocFile['id'],     
        },
        input:Expand<RemoveGenerics<Partial<db.Docfile>&Omit<db.Docfile, 'id' | 'dateCreated' | 'fileType'>>>,

    }
}

export type myCrudStyle = ExpandRecursively< _myCrudStyle & {
    group:{
        inputs:Expand<DataStyles.Group._Sets<_myCrudStyle['group']['input']>>,
        outputs:Expand<DataStyles.Group._Sets<_myCrudStyle['group']['output']>>,
    },
    doc:{
        inputs:Expand<DataStyles.Doc._Sets<_myCrudStyle['doc']['input']>>,
        outputs:Expand<DataStyles.Doc._Sets<_myCrudStyle['doc']['output']>>,
    },
    docFile:{
        inputs:Expand<DataStyles.DocFile._Sets<_myCrudStyle['docFile']['input']>>,
        outputs:Expand<DataStyles.DocFile._Sets<_myCrudStyle['docFile']['output']>>,
    }
}>
*/

// type a = myCrudStyle['']

// const aa :myCrudStyle = {
//     group:{index:{
//         kol:2,
//     }}
// }
