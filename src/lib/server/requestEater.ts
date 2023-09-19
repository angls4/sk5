// import { traverseStorer } from "../client/requester"
import type { Requester, Storer } from "../interfaces"
// import requester from '../client/requester'

// import storer from "../client/localCache";
import storer from "../server/cacheFirst";
// import storer from "./kysely";

if((storer as any)?.custom?.refresh)
(storer as any).custom.refresh();

export const eat = async (requests:Requester[])=>{
    console.log(requests)
    const ret = [];
    // console.log(storer)
    for (const request of requests) {
        try {
            ret.push(await storer[request.table][request.action](request.data as any));
            
        } catch (error) {
            console.log(error)
        }
    }
    // await traverseStorer(request,undefined,async (curr,a,b)=>{
    //     try {
    //         console.log(`xx ${String(a)} ${String(b)}`);
    //         console.log(request[a][b]);
    //         ret = await storer[a][b](request[a][b]);
    //     } catch (error) {
    //         console.log(error)
    //     }
    // })
    // return ret;
    // return storer.custom.getMap()
    return ret
}

// export const eat2 = async (_request: Requester) => {
// 	const request = _request as unknown as Storer;
// 	let ret;
// 	await traverseStorer(request, undefined, async (curr, a, b) => {
// 		console.log('xx');
// 		console.log(storer[a][b]);
// 		ret = await storer[a][b](request[a][b]);
// 	});
// 	return ret;
// };