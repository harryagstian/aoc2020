const fs = require('fs')
const readline = require('readline')
const _ = require('lodash')
const { PerformanceObserver, performance } = require('perf_hooks');
const { constant } = require('lodash');

const obs = new PerformanceObserver((items) => {
    let { name, duration } = items.getEntries()[0]
    console.log(`${name}: ${duration}ms`)
    performance.clearMarks()
})
obs.observe({ entryTypes: ['measure'] });

performance.mark('start')

let inputFile = __dirname + '/input.txt'

let DEBUG = true

let debugPrint = (...arr) => {
    DEBUG ? console.log(arr) : ''
}

let lineStream = readline.createInterface(({
    input: fs.createReadStream(inputFile),
}))


let stacks = [0]

let results = [0, 0]


lineStream.on('line', (line) => {
    stacks.push(parseInt(line))
})


lineStream.on('close', () => {
    stacks = _.sortBy(stacks)
    stacks.push(stacks[stacks.length - 1] + 3)
    let stackSet = new Set(stacks)
    let diff = [0, 0] // [1 jolt diff, 3 jolt diff] - used for part 1
    let diffOneOccurence = 0 // add +1 every time sequential 1 jolt difference occurs - used for part 2
    let pwr = [0, 0] // power of 2, power of 7 - used for part 2

    for (let i = 0; i < stacks.length - 1; i++) {
        if (stacks[i] + 1 === stacks[i + 1]) {
            diff[0]++
            diffOneOccurence++
        } else {
            if (diffOneOccurence === 4) {
                pwr[1]++
                diffOneOccurence = 0
            } else if (diffOneOccurence > 0) {
                pwr[0] += diffOneOccurence - 1 // ??? 
                diffOneOccurence = 0
            }
            diff[1]++
        }
    }

    results[0] = diff[0] * diff[1]

    // part 1
    console.log(`Result #1: ${results[0]}`)

    // part 2

    // console.log(pwr)

    results[1] = (2 ** pwr[0]) * (7 ** pwr[1])

    console.log(`Result #2: ${results[1]}`)

    performance.mark('end')
    performance.measure('Start to end', 'start', 'end')
})