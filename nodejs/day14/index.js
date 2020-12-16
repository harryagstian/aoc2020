const fs = require('fs')
const readline = require('readline')
const _ = require('lodash')
const { PerformanceObserver, performance } = require('perf_hooks');

const obs = new PerformanceObserver((items) => {
    let { name, duration } = items.getEntries()[0]
    console.log(`${name}: ${duration}ms`)
    performance.clearMarks()
})
obs.observe({ entryTypes: ['measure'] });

performance.mark('start')

let inputFile = __dirname + '/input.txt'

let lineStream = readline.createInterface(({
    input: fs.createReadStream(inputFile),
}))

let mem = {}
let mem2 = {}
let mask
let results = [0, 0]

let calc = (m, v) => {
    v = Number(v).toString(2).padStart(36, '0')
    let s = []
    for (let i = 0; i < m.length; i++) {
        if (m[i] !== 'X') {
            s.push(m[i])
        } else {
            s.push(v[i])
        }
    }
    s = s.join("")
    return parseInt(s, 2)
}

let calc2 = (mask, key, value) => { // this should works unless given mask has too much wildcard (then iteration become too slow)
    value = Number(value)
    key = Number(key.match(/mem\[(\d*)\]/)[1]).toString(2).padStart(36, '0')
    let s = [] // modified key based on mask
    for (let i = 0; i < mask.length; i++) {
        if (mask[i] !== '0') {
            s.push(mask[i])
        } else {
            s.push(key[i])
        }
    }

    let addr = []
    addr.push(s.join(""))

    let nX = s.filter(element => element === 'X').length
    for (let i = 0; i < nX; i++) {
        let newAddr = []
        for (let j = 0; j < addr.length; j++) {
            for (let k = 0; k < 2; k++) {
                newAddr.push(addr[j].replace('X', k))
            }
        }
        addr = _.cloneDeep(newAddr)
    }

    for (let i = 0; i < addr.length; i++) {
        mem2[parseInt(addr[i], 2)] = value
    }
}


lineStream.on('line', (line) => {
    let [key, val] = line.split(" = ")

    if (key === 'mask') {
        mask = val
    } else {
        mem[key] = calc(mask, val)
        calc2(mask, key, val)
    }
})


lineStream.on('close', () => {
    // part 1
    results[0] = Object.values(mem).reduce((acc, val) => {
        return acc + val
    }, 0)

    console.log(`Result #1: ${results[0]}`)

    // part 2

    results[1] = Object.values(mem2).reduce((acc, val) => {
        return acc + val
    }, 0)

    console.log(`Result #2: ${results[1]}`)

    performance.mark('end')
    performance.measure('Start to end', 'start', 'end')
})