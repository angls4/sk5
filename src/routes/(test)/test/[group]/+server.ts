import { json, type RequestHandler } from "@sveltejs/kit";
import { storer } from "tes/src/lib/server/store";
import type { DataCrudStyle } from "tes/src/lib/xmemCachedd";


export const GET:RequestHandler = (async (event) => {
    console.log('GET docs --- (event.params)');
    console.log(event.params);
    const group = Number(event.params?.group);
    // console.log(json(docMap[event.params.group as string]));
    // console.log(docMap);
    return json({
		// groups: await storer.group.read({ group }),
        docs: await storer.doc.read({group}),
	});
});

export const DELETE:RequestHandler = (async (event) => {
    console.log('DEL group --- (event.params,groupmap)');
    console.log(event.params)
    const group = Number(event.params?.group);

    const res = await storer.group.delete({group:group});
    // console.log(groupMap);
    return json(res);
});

export const POST: RequestHandler = async (event) => {
	console.log('POST group --- (data,result)');
	const request = event.request;
	const formData = await request.formData();

	const name = String(formData.get('name'));
	const _parentId = formData.get('parentId');
	// const groupId = Number(_parentId);
	const groupId = Number(event.params?.group);
	const data: DataCrudStyle['doc']['inputs'] = {
		[name]: {
			name,
			groupId
		}
	};
	console.log(data);

	const result = await storer.doc.insert(data);
	return json(result);
};