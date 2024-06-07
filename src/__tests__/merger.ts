import { Util } from "../util/Util"

const data: any = {
    mytest: 'owo',
    k: [],
    dude: {
        nope: true
    }
}

const src: any = {
    mytest: 'no',
    k: {},
    dude: {
        brah: 'false',
        nope: false
    },
    owa: {
        owo: null
    }
}

/**
 * Value should be
 * {
 *  mytest: 'owo',
 *  k: [],
 *  dude: { 
 *      nope: true, 
 *      brah: 'false' 
 *  },
 *  owa: { 
 *      owo: null 
 *      }
 * }
 */
console.log(
    Util.mergeDefault(data, src)
)