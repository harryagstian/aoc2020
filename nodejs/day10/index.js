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

let inputFile = __dirname + '/sample2.txt'

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
    let stackSet = new Set(stacks)
    let diff = [0, 0] // 1 jolt diff, 3 jolt diff
    let diffOf3Array = []
    let has3 = 0

    for (let i = 0; i < stacks.length - 1; i++) {
        if (stacks[i] + 1 === stacks[i + 1]) {
            diff[0]++
        } else {
            diff[1]++
        }

        let count = 0
        if (stackSet.has(stacks[i] + 3)) {
            for (let j = 1; j < 3; j++) {
                if (stackSet.has(stacks[i] + j)) {
                    count++
                }
            }
        }else if (stackSet.has(stacks[i] + 2)) {
            for (let j = 1; j < 2; j++) {
                if (stackSet.has(stacks[i] + j)) {
                    count++
                }
            }
        }
        if(count > 0){
            diffOf3Array.push(count)
        }
    }

    diff[1]++

    results[0] = diff[0] * diff[1]
    console.log(stacks)
    // part 1
    console.log(`Result #1: ${results[0]}`)

    // part 2
    diffOf3Array = diffOf3Array
    console.log(diffOf3Array)
    let a = diffOf3Array.filter((element) => { return element > 0 }).reduce((acc, current) => {
        return acc * current
    }, 1)

    console.log(a)
    console.log(`Result #2: ${results[1]}`)

    performance.mark('end')
    performance.measure('Start to end', 'start', 'end')
})