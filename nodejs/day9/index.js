const fs = require('fs')
const readline = require('readline')
const _ = require('lodash')
const { PerformanceObserver, performance } = require('perf_hooks');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');

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


const preambleLength = 25

let fullStacks = [] // keep item from start of line until invalid number
let stacks = [] // only kept preambleLength number of items

let results = [0, 0]

let hasPair = false
let done = false

lineStream.on('line', (line) => {
    line = parseInt(line)
    if (stacks.length < preambleLength) {
        stacks.push(line)
    } else if (!done) {
        // part one
        fullStacks.push(line)

        let diff = stacks.map(element => { // get array of difference value from preamble to current line
            return line - element
        })
        diff = new Set([...diff]) // convert to set for since set search is faster than array search
        let i = 0
        for (i; i < stacks.length; i++) { // loop over preamble array
            if (diff.has(stacks[i]) && (stacks[i] * 2) !== line) { // if preamble value found inside diff array and preamble value x2 is not equal to line (since 40 - 20 will create diff = 20 and preamble value is also 20)
                break; // stop loop, line is valid item
            }
        }

        if (i === stacks.length) { // if the loop doesnt breaks, current line is invalid number
            done = true
            results[0] = line
        }

        stacks.shift()
        stacks.push(line)

    }
})


lineStream.on('close', () => {
    // part 1

    console.log(`Result #1: ${results[0]}`)

    // part 2
    let start = 0
    let end = 0
    let fullStacksCopy = _.cloneDeep(fullStacks)

    while (fullStacksCopy.length > 0) {
        let len = fullStacksCopy.length - 1 // start from last array
        let i = len // current index
        let current = 0 // current sum value
        for (i; i >= 0; i--) { // loop down from last array
            current += fullStacksCopy[i]
            if (current > results[0]) {
                break;
            } else if (current === results[0] && ((end - start) < (len - i))) { // if current sum is equal to invalid number and current continuous array is longer
                end = len
                start = i
                break;
            }
        }

        fullStacksCopy.pop() // remove last item in array
    }

    let continuousArray = _.sortBy(fullStacks.slice(start, end + 1))

    results[1] = continuousArray[0] + continuousArray[continuousArray.length - 1]

    console.log(`Result #2: ${results[1]}`)
    
    performance.measure('Start to end', 'start')
})