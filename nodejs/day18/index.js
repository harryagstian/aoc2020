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
            } else if (isFirst) {
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

let setPrecedence = (arr) => {
    let arrLen = arr.length
    for (let i = 0; i < arrLen; i++) {
        let current = arr[i]
        // console.log(arr.join(''), current)

        if (current === '+') {
            // console.log('found at: ', i)
            let left = i - 1
            let right = i + 1
            let brackets = 0
            let firstRun = true

            if (arr[left - 1] === '(' && arr[right + 1] === ')') {
                // console.log('skipping')
                continue
            }


            while (true) { // lookup left
                if (arr[left] === undefined) {
                    // left++
                    break;
                }
                else if (arr[left] === '(') {
                    brackets--

                    if (brackets === 0) {
                        // left--
                        break;
                    }
                } else if (arr[left] === ')') {
                    brackets++
                } else if (!isNaN(arr[left]) && brackets === 0) {
                    // left++
                    break;
                }
                left--
            }

            // console.log('L', left)
            brackets = 0

            while (true) { // lookup right
                if (arr[right] === undefined) {
                    // right++
                    break;
                }
                else if (arr[right] === '(') {
                    brackets++

                } else if (arr[right] === ')') {
                    brackets--
                    if (brackets === 0) {
                        right++
                        break;
                    }
                } else if (!isNaN(arr[right]) && brackets === 0) {
                    right++
                    break;
                }
                right++
                firstRun = false
            }

            arr.splice(right, 0, ')')
            arr.splice(left, 0, '(')
            i++
            // console.log('R', right)
            // console.log('after: ', arr.join(''))
            arrLen = arr.length
        }

    }
    return arr
}


lineStream.on('line', (line) => {
    line = line.replace(/ /g, '')
    let lineValue = getValue([...line])
    // console.log('SUM part 1', line, lineValue)
    results[0] += lineValue


    line = setPrecedence([...line]).join('')
    lineValue = getValue([...line])
    // console.log('SUM part 2', line, lineValue)
    results[1] += lineValue

})


lineStream.on('close', () => {

    console.log(`Result #1: ${results[0]}`)

    console.log(`Result #2: ${results[1]}`)

    performance.mark('end')
    performance.measure('Start to end', 'start', 'end')
})