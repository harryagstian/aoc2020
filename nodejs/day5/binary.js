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

let inputFile = __dirname + '/input.txt'

let DEBUG = true

let debugPrint = (...arr) => {
    DEBUG ? console.log(arr) : ''
}

let lineStream = readline.createInterface(({
    input: fs.createReadStream(inputFile),
}))

let idArray = []

let getId = (row, col) => {
    return (row * 8) + col
}

lineStream.on('line', (line) => {

    line = line.replace(/[FL]/g, 0)
    line = line.replace(/[BR]/g, 1)

    let [, rowInput, colInput] = line.match(/(.{7})(.{3})/)

    let row = parseInt(rowInput, 2)
    let col = parseInt(colInput, 2)

    // debugPrint(row, col)
    let id = getId(row, col)

    idArray.push(id)
})

lineStream.on('close', () => {

    idArray = _.sortBy(idArray)

    // part 1
    console.log(`Result #1: ${_.last(idArray)}`)

    // part 2
    let result2
    for (let i = 0; i < idArray.length - 1; i++) {
        if (idArray[i] + 1 !== idArray[i + 1]) {
            result2 = idArray[i] + 1
            break
        }
    }
    console.log(`Result #2: ${result2}`)
    performance.measure('Start to end', 'start')

})