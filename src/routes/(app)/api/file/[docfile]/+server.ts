import { type RequestHandler, json } from "@sveltejs/kit";
import { Md5 } from "ts-md5";
import fs from 'fs/promises';
import path from 'path' //node
import storer from "tes/src/lib/server/cacheFirst";
import moment from "moment";

function fileResponse(file: Blob) {
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

export const GET: RequestHandler = async (event) => {
	console.log('Get docfile --- (file)');
	const id = Number(event.params.docfile);
	const docFile = Object.values(await storer.docFile.read({ id }))[0];
	const fileName = `docfile-${Md5.hashStr(docFile.id.toString())}`;
	const filePath = path.resolve(
		'./files/' + fileName
	);
	const fileBuffer = await fs.readFile(filePath).catch(() => {
		return null;
	});
	if (!fileBuffer) return new Response();
	const file = new Blob([fileBuffer.buffer], { type: docFile.fileType as string });
console.log(docFile.id);
	console.log(file);
	return fileResponse(file);
};

export const POST: RequestHandler = async (event) => {
	console.log('uploaded file--- (params,file)');
	console.log(event.params)
	const file = await event.request.blob();
	if (file.size < Number(event.request.headers.get('content-length'))) {
		console.log('aborted');
		return json({});
	}
	// console.log(event.request.headers);
	const id = Number(event.params.docfile);
	const docFile = Object.values(await storer.docFile.read({id}))?.[0];
	if (!docFile) throw 'docfile doesn\'t exist';
	
	const fileName = `docfile-${Md5.hashStr(docFile.id.toString())}`;
	// const file : File = new File([(await event.request.blob())],docFile.fileName);
	console.log(docFile.id);
	console.log(file);
	// const fileExtension = '.'+docFile.fileType?.split('/')[1];
	const filePath = path.resolve(
		'./files/' + fileName
	);
	console.log(filePath);
	// const imgArrayBuffer = await imgBlob.arrayBuffer();
	// const imgArrayBuffer = await imgBlob.arrayBuffer();
	// const imgBuffer = Buffer.from(imgArrayBuffer);
	let ret;
	try {
		const buf = Buffer.from(await file.arrayBuffer());
		const imgBinary = await fs.writeFile(filePath, buf);
		ret = await storer.docFile.update({id,fileType:file.type,dateCreated: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")});
		// const newImgBinary = fs.readFileSync(filePath);
	} catch (error) {
		console.log('error saving file file---' + error);
		return json({status:400});
		// await ky.deleteDocFile(docFile.id);
		// return undefined;
	}

	// console.log(file);
	return json(ret);

	// const result = await addDocFile(data,file);
	// return json(result);
	// if(result)
};