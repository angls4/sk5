// import { db } from "../../db/database";
import { db } from '../../db/database';
// import type {Doc,Docfile,Group} from "../../db/types"
import type { Storer } from '../interfaces';
import type { DataStyles } from '../xmemCachedd';

const storer: Storer = {
	group: {
		insert: async function createGroup(inputs) {
			// console.log('ky insert ')
			// console.log(inputs)
			for (const input of Object.values(inputs)) {
				input.parentId ??= 0;
			}
			const query = db.insertInto('Group').values(Object.values(inputs)).returningAll();

			const cquery = query.compile();
			const rows = (await db.executeQuery(cquery)).rows;
			const ret: DataStyles.Group.Sets = {};
			for (const row of rows) {
				ret[row.id] = row;
			}
			return ret;
		},
		read: async (index) => {
			let query = db.selectFrom('Group').selectAll().where('Group.id', '!=', 0);
			if (index) {
				if (index?.id) query = query.where('Group.id', '=', index.id);
				else query = query.where('Group.parentId', '=', index?.group ?? 0);
			}

			const cquery = query.compile();
			const rows = (await db.executeQuery(cquery)).rows;
			const ret: DataStyles.Group.Sets = {};
			for (const row of rows) {
				// if(row.id != 0)
				ret[row.id] = row;
			}
			// console.log(ret)
			return ret;
		},
		update: async (input) => {
			if (!input?.id) throw 'identifier id not valid';
			const updated = await db
				.updateTable('Group')
				.set(input)
				.where('id', '=', input?.id)
				.executeTakeFirst();
			if (!updated) throw 'not updated';
			const res = await db
				.selectFrom('Group')
				.selectAll()
				.where('id', '=', input?.id)
				.executeTakeFirst();
			// if (res) ret[id] =  res;
			return res;
		},
		delete: async function deleteGroup(index) {
			let query = db.deleteFrom('Group').returningAll().where('Group.id', '!=', 0);
			if (index) {
				if (index?.id) query = query.where('Group.id', '=', index.id);
				else query = query.where('Group.parentId', '=', index?.group ?? 0);
			};
			const cquery = query.compile();
			const rows = (await db.executeQuery(cquery)).rows;
			const ret: DataStyles.Group.Sets = {};
			for (const row of rows) {
				ret[row.id] = row;
			}
			return ret;
		}
	},
	doc: {
		insert: async function createGroup(inputs) {
			const query = db.insertInto('Doc').values(Object.values(inputs)).returningAll();

			const cquery = query.compile();
			const rows = (await db.executeQuery(cquery)).rows;
			const ret: DataStyles.Doc.Sets = {};
			for (const row of rows) {
				ret[row.id] = row;
			}

			return ret;
		},
		read: async (index) => {
			let query = db.selectFrom('Doc').selectAll();
			if (index) {
				if (index?.id) query = query.where('Doc.id', '=', index.id);
				else query = query.where('Doc.groupId', '=', index?.group ?? 0);
			}

			const cquery = query.compile();
			const rows = (await db.executeQuery(cquery)).rows;
			const ret: DataStyles.Doc.Sets = {};
			for (const row of rows) {
				ret[row.id] = row;
			}
			return ret;
		},
		update: async (input) => {
			if (!input?.id) throw 'identifier id not valid';
			const updated = await db
				.updateTable('Doc')
				.set(input)
				.where('id', '=', input?.id)
				.executeTakeFirst();
			if (!updated) throw 'not updated';
			const res = await db
				.selectFrom('Doc')
				.selectAll()
				.where('id', '=', input?.id)
				.executeTakeFirst();
			// if (res) ret[id] =  res;
			return res;
		},
		delete: async function deleteDoc(index) {
			// console.log('ky deldoc')
			// console.log(index)
			let query = db.deleteFrom('Doc').returningAll();
			if (index) {
				if (index?.id) query = query.where('Doc.id', '=', index.id);
				else query = query.where('Doc.groupId', '=', index?.group ?? 0);
			}

			const cquery = query.compile();
			const rows = (await db.executeQuery(cquery)).rows;
			const ret: DataStyles.Doc.Sets = {};
			for (const row of rows) {
				ret[row.id] = row;
			}
			console.log('KY delet doc')
			console.log(ret)
			return ret;
		}
	},
	docFile: {
		insert: async function createGroup(inputs) {
			const query = db.insertInto('DocFile').values(Object.values(inputs)).returningAll();

			const cquery = query.compile();
			const rows = (await db.executeQuery(cquery)).rows;
			const ret: DataStyles.DocFile.Sets = {};
			for (const row of rows) {
				ret[row.id] = row;
			}
			return ret;
		},
		read: async (index) => {
			let query = db.selectFrom('DocFile').selectAll();
			if (index?.id) query = query.where('DocFile.id', '=', index.id);
			else if (index?.doc) query = query.where('DocFile.docId', '=', index.doc);

			const cquery = query.compile();
			const rows = (await db.executeQuery(cquery)).rows;
			const ret: DataStyles.DocFile.Sets = {};
			for (const row of rows) {
				ret[row.id] = row;
			}
			return ret;
		},
		update: async (input) => {
			if (!input?.id) throw 'identifier id not valid';
			const updated = await db
				.updateTable('DocFile')
				.set(input)
				.where('id', '=', input?.id)
				.executeTakeFirst();
			if (!updated) throw 'not updated';
			const res = await db
				.selectFrom('DocFile')
				.selectAll()
				.where('id', '=', input?.id)
				.executeTakeFirst();
			// if (res) ret[id] =  res;
			return res;
		},
		delete: async function deleteDocFile(index) {
			console.log('deldocfile ky');
			console.log(index);
			let query = db.deleteFrom('DocFile').returningAll();
			if (index?.id) query = query.where('DocFile.id', '=', index.id);
			else if (index?.doc) query = query.where('DocFile.docId', '=', index.doc);
			const cquery = query.compile();
			console.log(cquery);
			const rows = (await db.executeQuery(cquery)).rows;
			const ret: DataStyles.DocFile.Sets = {};
			for (const row of rows) {
				ret[row.id] = row;
			}
			return ret;
		}
	}
};

export default storer;
/*
export async function createDoc(doc: DocInput) {
  const query = await db.insertInto('Doc')
    .values(doc)
    .returningAll()
    .compile()
      
  const cquery = query.compile()
    return (await db.executeQuery(cquery)).rows[0];
}

// export async function deleteDoc(groupname: string, docname: string) {
//   const docId = docMap[groupname][docname].id;
//   const query = db.deleteFrom("Doc")
//     .where('Doc.id','=',docId)
//     .returningAll()
/;
      
//   return (await db.executeQuery(query)).rows[0];
// }
export async function deleteDoc(id:number) {
  const query = db.deleteFrom("Doc")
    .where('Doc.id','=',id)
    .returningAll();
      
  return (await db.executeQuery(query)).rows[0];
}

export async function createDocFile(docfile: DocFileInput) {
  const query = await db.insertInto("Docfile")
    .values(docfile)
    .returningAll()
    .compile()
      
  return (await db.executeQuery(query)).rows[0];
}

// export async function deleteDocFile(groupName:string,docName:string,docfilename:string) {

//   const query = db.deleteFrom("Docfile")
//     .where('Docfile.id', '=', id)
//     .returningAll()
/;
      
//   return (await db.executeQuery(query)).rows[0];
// }
export async function deleteDocFile(id:number) {
  const query = db.deleteFrom("Docfile")
    .where('Docfile.id', '=', id)
    .returningAll();
      
  return (await db.executeQuery(query)).rows[0];
}

export async function createGroup(group: GroupInput) {
  const query = await db.insertInto('Group')
    .values(group)
    .returningAll()
    .compile()
      
  return (await db.executeQuery(query)).rows[0];
}

export async function deleteGroup(groupname: string) {
  const query= db.deleteFrom('Group')
   .where('Group.id', '=', groupname)
   .returningAll();

  return (await db.executeQuery(query)).rows[0];
}
// export async function deleteGroup(id: number) {
//   const query= db.deleteFrom('Group')
//    .where('Group.id', '=', id)
//    .returningAll()
/;

//   return (await db.executeQuery(query)).rows[0];
// }

export async function getGroups() {
  const query= db.selectFrom('Group').selectAl;
  return (await db.executeQuery(query)).rows;
}

export async function getDocs(groupName?:string) {
  let query = db.selectFrom('Doc').selectAll();
  if(groupName)
  query = query.where('Doc.groupId','=',groupName);
  const cquery =;
  return (await db.executeQuery(cquery)).rows;
}

export async function getDocFiles(groupName:string,docName:string) {
  const docId = getDocId(groupName,docName);
  if(!docId){
      // console.log(`STORE | FAILED getting docId ${groupName}/${docName}`);
      throw `STORE | FAILED getting docId ${groupName}/${docName}`;
  }
  let query = db.selectFrom('Docfile').selectAll();
  if(docId)
  query = query.where('Docfile.docId','=',docId)
  const cquery =;
  return (await db.executeQuery(cquery)).rows;
}
export async function getDocById(docId:number) {
  return db.selectFrom('Doc').where('Doc.id','=',docId).selectAll().executeTakeFirst();
}
*/
