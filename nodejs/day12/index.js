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

let direction = {
    N: [0, 1],
    E: [1, 0],
    S: [0, -1],
    W: [-1, 0]
}

let pos = [0, 0]
let results = [0, 0]
let waypoint = [10, 1]
let pos2 = [0, 0]

let directionIndex = ['N', 'E', 'S', 'W']

let currentDirection = 'E'

let turn = (val) => { // R = +, L = -
    val /= 90

    let i = directionIndex.findIndex(e => e === currentDirection)

    i = i + val
    if (i >= directionIndex.length) {
        i = i - directionIndex.length
    } else if (i < 0) {
        i = i + directionIndex.length
    }
    // console.log(directionIndex, i)

    if (val < 0) {
        for (let i = 0; i < Math.abs(val); i++) {
            waypoint = [waypoint[1] * -1, waypoint[0]]
        }
    } else {
        for (let i = 0; i < Math.abs(val); i++) {
            waypoint = [waypoint[1], waypoint[0] * -1]
        }
    }

    currentDirection = directionIndex[i]
}

lineStream.on('line', (line) => {
    let dir = line.substr(0, 1)
    let val = parseInt(line.substr(1))
    // console.log(currentDirection)
    if (directionIndex.includes(dir)) {
        for (let i = 0; i < 2; i++) {
            pos[i] += direction[dir][i] * val
            waypoint[i] += direction[dir][i] * val
        }
    } else if (dir === "F") {
        for (let i = 0; i < 2; i++) {
            pos[i] += direction[currentDirection][i] * val
            pos2[i] += waypoint[i] * val
        }
    } else {
        if (dir === "L") {
            val *= -1
        }

        turn(val)
    }
    console.log(line, waypoint, pos2)
})


lineStream.on('close', () => {

    // part 1

    results[0] = Math.abs(pos[0]) + Math.abs(pos[1])

    console.log(`Result #1: ${results[0]}`)

    // part 2

    results[1] = Math.abs(pos2[0]) + Math.abs(pos2[1])

    console.log(`Result #2: ${results[1]}`)

    performance.mark('end')
    performance.measure('Start to end', 'start', 'end')
})