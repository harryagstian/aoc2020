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

// let inputFile = __dirname + '/sample.txt'
let inputFile = __dirname + '/input.txt'

let lineStream = readline.createInterface(({
    input: fs.createReadStream(inputFile),
}))

let results = [0, 0]

let getValue = (arr) => {
    let isFirst = true
    let value = 0
    let shouldReturn = false
    let op = undefined
    // console.log(arr)
    while (!shouldReturn) {

        let current = arr.shift()

        if (current === '(') {
            let innerValue = getValue(arr)
            if (op !== undefined) {
                if (op === '+') value += innerValue
                if (op === '*') value *= innerValue
                if (op === '/') value /= innerValue
                if (op === '-') value -= innerValue
                op = undefined
            } else if(isFirst){
                value = Number(innerValue)
                isFirst = false
            }
        } else if (current === ')') {
            shouldReturn = true
        } else if (isNaN(current)) {
            op = current
        } else if (op !== undefined) {

            if (op === '+') value += Number(current)
            if (op === '*') value *= Number(current)
            if (op === '/') value /= Number(current)
            if (op === '-') value -= Number(current)
            op = undefined
        } else if (isFirst) {
            value = Number(current)
            isFirst = false
        }

        if (arr.length === 0) {
            shouldReturn = true
        }
    }
    // console.log(value)
    return value

}

lineStream.on('line', (line) => {
    line = line.replace(/ /g, '')
    // console.log(getValue([...line]))
    let lineValue = getValue([...line])
    results[0] += lineValue
    console.log(lineValue)
    console.log(line.replace(/ /g, ''))
})


lineStream.on('close', () => {

    console.log(`Result #1: ${results[0]}`)

    console.log(`Result #2: ${results[1]}`)

    performance.mark('end')
    performance.measure('Start to end', 'start', 'end')
})