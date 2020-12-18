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

// let inputFile = __dirname + '/sample.txt'
let inputFile = __dirname + '/input.txt'

let lineStream = readline.createInterface(({
    input: fs.createReadStream(inputFile),
}))

let results = [0, 0]
let activeMap
let baseMap = new Map()
let maxIter = 12 // if ur answer too low, set this number to higher


let getKey = (x, y, z, w = 0) => {
    return `${x}.${y}.${z}.${w}`
}

let lineCount = 0

lineStream.on('line', (line) => {
    for (let i = 0; i < line.length; i++) {
        if (line[i] === "#") {
            baseMap.set(getKey(lineCount, i, 0, 0), '#')
        }
    }
    lineCount++
})


lineStream.on('close', () => {

    // part 1 - 3D
    activeMap = _.cloneDeep(baseMap)
    for (let loop = 0; loop < 6; loop++) {
        console.log(`Iteration: ${loop}, size ${activeMap.size}`)
        // console.log(loop)
        let activeMapCp = _.cloneDeep(activeMap)
        for (let x = -maxIter; x < maxIter; x++) {
            for (let y = -maxIter; y < maxIter; y++) {
                for (let z = -maxIter; z < maxIter; z++) {
                    let neighbor = 0
                    for (const i of [-1, 0, 1]) {
                        for (const j of [-1, 0, 1]) {
                            for (const k of [-1, 0, 1]) {
                                if (i === 0 && j === 0 && k === 0) {
                                    continue;
                                }
                                if (activeMap.has(getKey(x + i, y + j, z + k))) {
                                    neighbor++
                                }
                            }
                        }
                    }
                    let currentKey = getKey(x, y, z)
                    let isActive = activeMap.has(currentKey)
                    if (isActive && (neighbor !== 2 && neighbor !== 3)) {
                        activeMapCp.delete(currentKey)
                    } else if (!isActive && neighbor === 3) {
                        activeMapCp.set(currentKey, '#')
                    }
                }
            }
        }

        activeMap = _.cloneDeep(activeMapCp)
    }
    results[0] = activeMap.size
    console.log(`Result #1: ${results[0]}`)

    // part 2 - 4D
    activeMap = _.cloneDeep(baseMap)

    for (let loop = 0; loop < 6; loop++) {
        console.log(`Iteration: ${loop}, size ${activeMap.size}`)
        // console.log(loop)
        let activeMapCp = _.cloneDeep(activeMap)
        for (let x = -maxIter; x < maxIter; x++) {
            for (let y = -maxIter; y < maxIter; y++) {
                for (let z = -maxIter; z < maxIter; z++) {
                    for (let w = -maxIter; w < maxIter; w++) {
                        let neighbor = 0
                        for (const i of [-1, 0, 1]) {
                            for (const j of [-1, 0, 1]) {
                                for (const k of [-1, 0, 1]) {
                                    for (const l of [-1, 0, 1]) {
                                        if (i === 0 && j === 0 && k === 0 && l === 0) {
                                            continue;
                                        }
                                        if (activeMap.has(getKey(x + i, y + j, z + k, w + l))) {
                                            neighbor++
                                        }
                                    }
                                }
                            }
                        }
                        let currentKey = getKey(x, y, z, w)
                        let isActive = activeMap.has(currentKey)
                        if (isActive && (neighbor !== 2 && neighbor !== 3)) {
                            activeMapCp.delete(currentKey)
                        } else if (!isActive && neighbor === 3) {
                            activeMapCp.set(currentKey, '#')
                        }
                    }
                }
            }
        }

        activeMap = _.cloneDeep(activeMapCp)
    }
    results[1] = activeMap.size
    console.log(`Result #2: ${results[1]}`)

    performance.mark('end')
    performance.measure('Start to end', 'start', 'end')
})