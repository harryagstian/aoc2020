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

// let inputFile = __dirname + '/sample2.txt'
// let inputFile = __dirname + '/sample.txt'
let inputFile = __dirname + '/input.txt'

let lineStream = readline.createInterface(({
    input: fs.createReadStream(inputFile),
}))

let results = [0, 0]
let card, door

let transform = (subject, target) => {
    let curr = 1
    let loopsize = 0
    while (curr !== target) {
        curr = (curr * subject) % 20201227
        loopsize++
        // console.log(curr, loopsize, target)
    }

    return loopsize
}

let calculateEncryptionKey = (loopsize, subject) => {
    let curr = 1
    for (let i = 0; i < loopsize; i++) {
        curr = (curr * subject) % 20201227
    }

    return curr
}

lineStream.on('line', (line) => {
    if (card === undefined) {
        card = Number(line)
    } else {
        door = Number(line)
    }
})


lineStream.on('close', () => {

    let cardLoop = transform(7, card)
    results[0] = calculateEncryptionKey(cardLoop, door)
    // console.log(transform(7, card), transform(7, door))
    // part 1
    console.log(`Result #1: ${results[0]}`)

    // part 2
    console.log(`Result #2: ${results[1]}`)

    performance.mark('end')
    performance.measure('Start to end', 'start', 'end')
})