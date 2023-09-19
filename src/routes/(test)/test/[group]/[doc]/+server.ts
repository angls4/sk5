import type { DocFileInput } from "$lib/server/kysely";
import { addDocFile, dataMap, deleteDoc, getDocId } from "$lib/server/store";
import { type RequestHandler, json } from "@sveltejs/kit";

export const GET:RequestHandler = (async (event) => {
    console.log('GET docfiles --- (event.params,)');
    console.log(event.params);
    const group = event.params?.group as string;
    const doc = event.params?.doc as string;

    return json(dataMap?.[group]?.docs?.[doc]?.docFiles);
});

export const DELETE:RequestHandler = (async (event) => {
    console.log('DEL doc --- (event.params,docmap)');
    console.log(event.params)
    const group = event.params?.group as string;
    const doc = event.params?.doc as string;

    const res = await deleteDoc(group,doc);
    // console.log(docMap);
    return json(res);
});

export const POST:RequestHandler = (async (event) => {
    console.log('post docfile--- (event.params,file)');
    // console.log(event.request.headers);
    // let file : File;
    let formData : FormData;
    try {
        formData = await event.request.formData().catch((a)=>console.log('form ERROR --- '+a) )as FormData;
        // file = formData.get('file') as File;
    } catch (error) {
        console.log("file corrupted or upload aborted --- "+error);
        return json({success: false});
    }
    const groupname = String(event.params.group);
    const docname = String(event.params.doc);
    const docId = getDocId(groupname,docname);

    const data : DocFileInput = {
        docId: docId,
        fileName: String(formData.get('filename')),
        userId: '1',
        fileType: null,
    }

    // console.log(file);
    
    const result = await addDocFile(data);
    return json(result);
    if(result)
    return json({success: true})
    return json({success: false})
});

// export const POST:RequestHandler = (async (event) => {
//     console.log('POST docfile --- (data,result)');
//     const request = event.request;
//     // console.log(event.url)
//     const formData = await request.formData();
        
//     // const groupname = String(formData.get('groupName'));
//     // const docname = String(formData.get('docName'));
//     const groupname = String(event.params.group);
//     const docname = String(event.params.doc);
//     const docId =docMap[groupname][docname].id;

//     const data:DocFileInput = {
//         // name : String(formData.get('name')),
//         fileName : groupname+docname+String(formData.get('fileName')),
//         // TODO : filetype
//         fileType: null,
//         // user : String(formData.get('user')),
//         // groupName : groupname,
//         docId : docId,
//         // docId : (await prisma.doc.findUnique({where:{name_groupName: {name:docname,groupName:groupname}}}))?.id,
//         userId : '1',
//     }
//     console.log(data);
//     // const keys = Object.keys(data);
//     // keys.forEach(key => {
//     //     if (!data[key]) {
//     //         return fail(400, { data, missing: true })
//     //     }
//     // });

//     // await sleep(2000)
//     // TODO : ini masih boilerplate
//     // const ret = {inserted:0};
//     const result = await addDocFile(data);
//     // ret.inserted = Number(result?.inserted);
//     console.log(result);
//     // updateDocFiles(groupname,docname);
//     return json(result);
// }) ;

