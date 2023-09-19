
import { json, type RequestHandler } from "@sveltejs/kit";
import { getMap } from "$lib/server/store";

export const GET : RequestHandler= (async (event) => {
    // console.log('---groupMap---')
    // console.log(groupMap)
    // console.log('---docMap---')
    // console.log(docMap)
    // console.log('---docFileMap---')
    // console.log(docFileMap)
    // console.log(dataMap)
    return json(await getMap());
}) ;