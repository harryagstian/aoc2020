const fs = require('fs')
const readline = require('readline')
const _ = require('lodash')
const { PerformanceObserver, performance } = require('perf_hooks');
const { cloneDeep, pick } = require('lodash');

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

lineStream.on('line', (line) => {
    let arr = line.split('').map(Number)

    let labelCursor = arr[0]
    let destinationCursor = 0

    for (let i = 0; i < 100; i++) {
        let pickup = []
        let labelDestination = arr[destinationCursor]
        // console.log(`Iteration ${i + 1}`)
        // console.log(`Start: ${arr.join(' ')}`)
        // console.log(`Cursor label: ${labelCursor}`)
        // console.log(`Destination cursor: ${destinationCursor}`)
        // console.log(labelDestination, cursor, arr)
        for (let j = 1; j < 4; j++) {
            let v = destinationCursor + 1
            // console.log(destinationCursor, arr, v)
            if (v >= arr.length) {
                v = 0
            }
            // console.log(j, (destinationCursor + 1) % arr.length, arr)
            pickup = pickup.concat(arr.splice(v, 1))
        }
        do {
            labelDestination--
            if (labelDestination === 0) {
                labelDestination = 9
            }
        } while (pickup.includes(labelDestination))
        // console.log(`Destination label: ${labelDestination}`)
        // console.log(`Pickup: ${pickup.join('')}`)
        let cursorDestination = arr.findIndex(e => e === labelDestination) + 1
        arr.splice(cursorDestination, 0, ...pickup)

        destinationCursor = (arr.findIndex(e => e === labelCursor) + 1) % 9
        labelCursor = arr[destinationCursor]

        // console.log(`End: ${arr.join(' ')}`)
        // console.log(Array(50).fill("=").join("="))

    }

    let pos = arr.findIndex(e => e === 1)
    let stack = []
    for (let i = 1; i < 9; i++) {
        stack.push(arr[(pos + i) % 9])
    }
    
    results[0] = stack.join('')
})


lineStream.on('close', () => {
    // part 1
    console.log(`Result #1: ${results[0]}`)

    // part 2
    console.log(`Result #2: ${results[1]}`)

    performance.mark('end')
    performance.measure('Start to end', 'start', 'end')
})