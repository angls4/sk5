import { type RequestHandler, json } from "@sveltejs/kit";
import storer from "tes/src/lib/server/memCache";
import { eat } from "tes/src/lib/server/requestEater";

export const GET:RequestHandler = (async (event) => {
    console.log('GET memcache data');
    // console.log(await event.request.json());
    return json(await storer.custom.getMap());
    // return json(await getRoot());
});


export const POST: RequestHandler = async (event) => {
	console.log('POST test');
    const reqJson = await event.request.json();
    // console.log(reqJson);
	const req = await eat(reqJson);
    // const req = await storer.group.read({})
    console.log(req)
	return json(req);
};

// export const POST:RequestHandler = (async (event) => {
//     console.log('POST group --- (data,result)');
//     const request = event.request;
//     const formData = await request.formData();
    
//     const name = String(formData.get('name'));
//     const _parentId = formData.get('parentId');
//     const parentId = Number(_parentId);
//     const data: DataCrudStyle['group']['inputs'] = {
// 		[name]: {
//             name,
//             parentId
//         }
// 	};
//     console.log(data);
    
//     const result = await storer.group.insert(data);
//     return json(result);
// }) ;