import { json, type RequestHandler } from "@sveltejs/kit";


let serverFile : File;


export const GET:RequestHandler = (async () => {
    return new Response(serverFile);
});

export const POST:RequestHandler = (async (event) => {
    console.log('test--- (event.params,file)');
    console.log(await event.request.json());
    return json({oke:1})
    // console.log(event.params);
    // const formData = await event.request.formData();
    // const file = formData.get('file') as File;
    // const groupname = String(event.params.group);
    // const docname = String(event.params.doc);
    // const docId =docMap[groupname][docname].id;

    // const data : DocFileInput = {
    //     docId: docId,
    //     fileName: String(formData.get('filename')),
    //     userId: '1',
    //     fileType: file.type,
    // }

    // const result = await addDocFile(data,file);
    // // result
    // serverFile = file;
    // console.log(file);
    // return json({success: true})
});

// export const POST:RequestHandler = (async (event) => {
//     console.log('POST file --- (data,result)');

// }) ;