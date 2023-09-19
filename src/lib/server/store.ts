// import _storer from "./memCache"
// import _storer from "./kysely";
// import storer from "../client/localCache";
import _storer from "./cacheFirst"
export const storer = _storer;

// await eatRequest()

// const a = new Promise<int>(((a)=>))

// await storer.custom.refresh()
// export async function getMap() {
//     try{
//         await storer.custom.refresh();
//         console.log(storer.custom.getMap())
//         await storer.group.delete();
//         const ret = storer.custom.getMap();
//         return ret;
//     }
//     catch(err){
//         console.log(err)
//     }
// }
export async function getMap() {
    try{
        // await storer.custom.refresh();
        return await storer.custom.getMap();
        // return await storer.group.read();
    }
    catch(err){
        console.log(err)
    }
}
async function pre() {
    try {
        // await storer.custom.refresh();
    } catch (error) {
        ;
    }
}

export async function getRoot() {
    await pre();
    try {
        // return await storer.group.read({group:0})
        return await getMap();
    } catch (err) {
        console.log('STORE | getroot error')
    }
}