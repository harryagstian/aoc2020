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

let baseIter = [0, 0, 2, 2]

let getKey = (x, y, z, w = 0) => {
    return `${x}.${y}.${z}.${w}`
}

let lineCount = 0
let lineLen = 0

lineStream.on('line', (line) => {
    if (lineLen === 0) {
        lineLen = line.length
    }
    for (let i = 0; i < line.length; i++) {
        if (line[i] === "#") {
            baseMap.set(getKey(lineCount, i, 0, 0), '#')
        }
    }
    lineCount++
})


lineStream.on('close', () => {

    baseIter[0] = lineCount + 2
    baseIter[1] = lineLen + 2

    let maxIter = _.cloneDeep(baseIter)

    // part 1 - 3D
    activeMap = _.cloneDeep(baseMap)

    for (let loop = 0; loop < 6; loop++) {
        let maxActive = [0, 0, 0, 0]
        console.log(`Iteration: ${loop}, size ${activeMap.size}, dimension are ${maxIter}`)
        // console.log(loop)
        let activeMapCp = _.cloneDeep(activeMap)
        for (let x = -maxIter[0]; x < maxIter[0]; x++) {
            for (let y = -maxIter[1]; y < maxIter[1]; y++) {
                for (let z = -maxIter[2]; z < maxIter[2]; z++) {
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
                        if (maxActive[0] < Math.abs(x)) {
                            maxActive[0] = Math.abs(x)
                        }
                        if (maxActive[1] < Math.abs(y)) {
                            maxActive[1] = Math.abs(y)
                        }
                        if (maxActive[2] < Math.abs(z)) {
                            maxActive[2] = Math.abs(z)
                        }
                    }
                }
            }
        }
        for (let i = 0; i < maxActive.length; i++) {
            maxIter[i] = maxActive[i] + 2
        }
        activeMap = _.cloneDeep(activeMapCp)
    }
    results[0] = activeMap.size
    console.log(`Result #1: ${results[0]}`)

    // part 2 - 4D
    maxIter = _.cloneDeep(baseIter)
    activeMap = _.cloneDeep(baseMap)

    for (let loop = 0; loop < 6; loop++) {
        let maxActive = [0, 0, 0, 0]
        console.log(`Iteration: ${loop}, size ${activeMap.size}, dimension are ${maxIter}`)
        // console.log(loop)
        let activeMapCp = _.cloneDeep(activeMap)
        for (let x = -maxIter[0]; x < maxIter[0]; x++) {
            for (let y = -maxIter[1]; y < maxIter[1]; y++) {
                for (let z = -maxIter[2]; z < maxIter[2]; z++) {
                    for (let w = -maxIter[3]; w < maxIter[3]; w++) {
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
                        // console.log(currentKey)
                        let isActive = activeMap.has(currentKey)
                        if (isActive && (neighbor !== 2 && neighbor !== 3)) {
                            activeMapCp.delete(currentKey)
                        } else if (!isActive && neighbor === 3) {
                            activeMapCp.set(currentKey, '#')
                            if (maxActive[0] < Math.abs(x)) {
                                maxActive[0] = Math.abs(x)
                            }
                            if (maxActive[1] < Math.abs(y)) {
                                maxActive[1] = Math.abs(y)
                            }
                            if (maxActive[2] < Math.abs(z)) {
                                maxActive[2] = Math.abs(z)
                            }
                            if (maxActive[3] < Math.abs(w)) {
                                maxActive[3] = Math.abs(w)
                            }
                        }
                    }
                }
            }
        }
        // console.log(maxActive)
        for (let i = 0; i < maxActive.length; i++) {
            maxIter[i] = maxActive[i] + 2
        }
        // console.log(maxIter, maxActive)
        activeMap = _.cloneDeep(activeMapCp)
    }
    results[1] = activeMap.size
    console.log(`Result #2: ${results[1]}`)

    performance.mark('end')
    performance.measure('Start to end', 'start', 'end')
})