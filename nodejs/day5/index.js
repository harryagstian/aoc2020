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

let idArray = []

let maxIndex = [0, 0] // row, column
let maxEntry = ''

let calculateAvg = (bound) => {
    return (bound[0] + bound[1]) / 2
}

let getId = (row, col) => {
    return (row * 8) + col
}

lineStream.on('line', (line) => {
    // code below can be used for getting part 1 solution without calculating each lines
    /* let currentFIndex = [...line].findIndex((element) => { return element === 'F' }) // earlier F occurence means lower row position
    let currentLIndex = [...line].findIndex((element) => { return element === 'L' })

    if (currentFIndex === -1) {
        currentFIndex = 7
    }

    if (currentLIndex === -1) {
        currentLIndex = 9
    }

    if (currentFIndex > maxIndex[0]) {
        maxEntry = line
        maxIndex[0] = currentFIndex

        if (currentLIndex > maxIndex[1]) {
            // debugPrint(maxIndex)
            maxEntry = line
            maxIndex[1] = currentLIndex
        }

    } */


    let [, [...rowInput], [...colInput]] = line.match(/(.{7})(.{3})/)

    let rowBound = [0, 127]
    let colBound = [0, 7]

    while (rowInput.length > 0) {
        let avg = calculateAvg(rowBound)
        if (rowInput[0] === 'F') { // keep lower
            rowBound[1] = Math.floor(avg)
        } else {
            rowBound[0] = Math.ceil(avg)
        }

        rowInput = _.tail(rowInput)
    }

    while (colInput.length > 0) {
        let avg = calculateAvg(colBound)
        if (colInput[0] === 'L') { // keep lower
            colBound[1] = Math.floor(avg)
        } else {
            colBound[0] = Math.ceil(avg)
        }

        colInput = _.tail(colInput)
    }

    idArray.push(getId(rowBound[0], colBound[0]))
})

lineStream.on('close', () => {

    // code below can be used for getting part 1 solution without calculating each lines
    /* let rowBound = [0, 127]
    let colBound = [0, 7]

    while (rowInput.length > 0) {
        let avg = calculateAvg(rowBound)
        if (rowInput[0] === 'F') { // keep lower
            rowBound[1] = Math.floor(avg)
        } else {
            rowBound[0] = Math.ceil(avg)
        }

        rowInput = _.tail(rowInput)
    }

    while (colInput.length > 0) {
        let avg = calculateAvg(colBound)
        if (colInput[0] === 'L') { // keep lower
            colBound[1] = Math.floor(avg)
        } else {
            colBound[0] = Math.ceil(avg)
        }

        colInput = _.tail(colInput)
    }

    // part 1
    console.log(`Result #1: ${getId(rowBound[0], colBound[0])}`) */

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