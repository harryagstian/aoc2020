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

let departureTime = 0
let id = []
let stacks = []
let results = [0, 0]

lineStream.on('line', (line) => {
    if (departureTime === 0) {
        departureTime = parseInt(line)
    } else {
        id = line.split(',').filter(element => element !== 'x')
        stacks = line.split(',')
    }
})


lineStream.on('close', () => {
    // part 1
    let closest
    for (let i = 0; i < id.length; i++) {
        id[i] = parseInt(id[i])
        let m = departureTime % id[i]
        let c = id[i] - m
        if (closest === undefined || closest > c) {
            results[0] = c * id[i]
            closest = c
        }
    }

    console.log(`Result #1: ${results[0]}`)

    // part 2

    // Chinese remainder theorem
    // https://crypto.stanford.edu/pbc/notes/numbertheory/crt.html
    // https://en.wikipedia.org/wiki/Chinese_remainder_theorem
    // https://www.reddit.com/r/adventofcode/comments/kc5a23/2020_day_13_part_2_chinese_remainder_theorem/

    let currentTime = id[0]
    let timeSkip = id[0]
    for (let i = 1; i < id.length; i++) {
        let offset1 = stacks.findIndex(element => element == id[i])
        while (true) {
            // console.log({currentTime, offset1, id: id[i], i, timeSkip, a: arrMultiply(i)})
            if ((currentTime + offset1) % id[i] === 0) {
                timeSkip *= id[i]
                break;
            } else {
                currentTime += timeSkip
            }

        }
    }

    results[1] = currentTime

    console.log(`Result #2: ${results[1]}`)

    performance.mark('end')
    performance.measure('Start to end', 'start', 'end')
})