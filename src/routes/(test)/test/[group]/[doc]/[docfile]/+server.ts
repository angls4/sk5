import { deleteDoc, deleteDocFile, docFileMap, docMap, updateDocFiles } from "$lib/server/store";
import { type RequestHandler, json } from "@sveltejs/kit";
import fs from 'fs/promises'
import path from 'path'
import { db } from "tes/src/db/database";
import { Md5 } from "ts-md5";

function fileResponse(file:Blob) {
	const headers = new Headers();
	// if (!headers.has('content-length')) {
    // }
    
	// if (!headers.has('content-type')) {
    // }
    headers.set('content-length', file.size.toString());
    headers.set('content-type', file.type);
    
	return new Response(file, {
		headers
	});
}

export const GET:RequestHandler = (async (event) => {
    console.log("Get docfile --- (file)")
    const groupname = String(event.params.group);
    const docname = String(event.params.doc);
    const docfilename = String(event.params.docfile);
    const docId = docMap[groupname][docname].id;
    const res = docFileMap[docId][docfilename];
    // const fileExtension = '.'+res?.fileType?.split('/')[1];
    const filePath = path.resolve("./files/"+`docfile-${res.docId}-${+res.id}-${Md5.hashStr(res.dateCreated.toString())}`)
    const fileBuffer = (await fs.readFile(filePath).catch(()=>{return null})) 
    if(!fileBuffer) return new Response(); 
    const file = 
      new Blob([fileBuffer.buffer],{type:res.fileType as string})
    
    console.log(file);
    return fileResponse(file);
});

export const POST:RequestHandler = (async (event) => {
    console.log('uploaded file--- (,file)');
    const file = await event.request.blob();
    if(file.size < Number(event.request.headers.get('content-length'))) {
        console.log('aborted');
        return json({success:false})
    }
    // console.log(event.request.headers);
    const groupname = String(event.params.group);
    const docname = String(event.params.doc);
    const docfilename = String(event.params.docfile);
    const docId = docMap?.[groupname]?.[docname]?.id;
    const res = docFileMap?.[docId]?.[docfilename];
    if(!res) return json({success:false});
    // const file : File = new File([(await event.request.blob())],res.fileName);
    console.log(file);
    // const fileExtension = '.'+res.fileType?.split('/')[1];
    const filePath = path.resolve("./files/"+`docfile-${res.docId}-${+res.id}-${Md5.hashStr(res.dateCreated.toString())}`);
    console.log(filePath)
    // const imgArrayBuffer = await imgBlob.arrayBuffer();
    // const imgArrayBuffer = await imgBlob.arrayBuffer();
    // const imgBuffer = Buffer.from(imgArrayBuffer);
    try {
        const buf = Buffer.from((await file.arrayBuffer()));
        const imgBinary = await fs.writeFile(filePath,buf);
        await db.updateTable('Docfile').set({fileType:file.type}).where('Docfile.id','=',res.id).execute();
        docFileMap[res.docId][res.fileName].fileType = file.type
        // const newImgBinary = fs.readFileSync(filePath);
        
        
    } catch (error) {
        console.log("cant create file deleting in db ---"+error );
        return json({success: false})
        // await ky.deleteDocFile(res.id);
        // return undefined;

    }

    // console.log(file);
    return json({success: true})
    
    // const result = await addDocFile(data,file);
    // return json(result);
    // if(result)
});

export const DELETE:RequestHandler = (async (event) => {
    console.log('DELETE docfile --- (data,result)');
    // const request = event.request;
    
    const groupname = String(event.params.group);
    const docname = String(event.params.doc);
    const docfilename = String(event.params.docfile);
    

    const result = await deleteDocFile(groupname,docname,docfilename);
    // ret.inserted = Number(result?.inserted);
    console.log(result);
    // updateDocFiles(groupname,docname);
    return json(result);
}) ;