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

let DEBUG = true

let debugPrint = (...arr) => {
    DEBUG ? console.log(arr) : ''
}

let lineStream = readline.createInterface(({
    input: fs.createReadStream(inputFile),
}))

let results = [0, 0, 0, 0, 0] // 
let x = [0, 0, 0, 0, 0]
let rightSteps = [1, 3, 5, 7, 1]
let y = 0
let maxX = 0

lineStream.on('line', (line) => {
    if (maxX === 0) maxX = line.length - 1

    for (i = 0; i < 5; i++) {
        if (i !== 4) {
            if (line[x[i]] === '#') results[i]++ // need case buat y = 2 
            x[i] += rightSteps[i]
        } else if (y % 2 === 0) {
            // debugPrint(y, x[i], line)
            if (line[x[i]] === '#') results[i]++ // need case buat y = 2 
            x[i] += rightSteps[i]
        }

        if (x[i] > maxX) x[i] = x[i] - maxX - 1
    }

    y++

})

lineStream.on('close', () => {
    // part 1
    console.log(`Result #1: ${results[1]}`)

    // part 2
    // debugPrint(results)
    let result2 = results.reduce((accumulator, current) => {
        return accumulator * current
    })
    console.log(`Result #2: ${result2}`)
    performance.measure('Start to end', 'start')

})