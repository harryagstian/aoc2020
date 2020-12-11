const fs = require('fs')
const readline = require('readline')
const _ = require('lodash')
const { PerformanceObserver, performance } = require('perf_hooks');
const { invert } = require('lodash');
const { cpuUsage } = require('process');

const obs = new PerformanceObserver((items) => {
    let { name, duration } = items.getEntries()[0]
    console.log(`${name}: ${duration}ms`)
    performance.clearMarks()
})
obs.observe({ entryTypes: ['measure'] });

performance.mark('start')

let inputFile = __dirname + '/input.txt'

let lineStream = readline.createInterface(({
    input: fs.createReadStream(inputFile),
}))

let lineLen = 0
let stacks = []
let results = [0, 0]

let printForEachLine = (arr) => {
    for (let i = 0; i < arr.length; i++) {
        console.log(arr[i].join(''))
    }
    console.log('\n')
}

lineStream.on('line', (line) => {
    if (stacks.length === 0) {
        lineLen = line.length + 2

        stacks.push(Array(lineLen).fill('.')) // append full floor on first line
    }
    stacks.push(['.', ...line, '.']) // add floor to the left most and right most of line
})


lineStream.on('close', () => {
    stacks.push(Array(lineLen).fill('.')) // append full floor on last line
    
    let newArray = _.cloneDeep(stacks)
    let previousArray = _.cloneDeep(stacks)

    let memoization = {}
    let changes = 0

    let invert = (row, col) => {
        let key = ""
        let occupied = 0
        let seat = previousArray[row][col]

        for (let i = row - 1; i < row + 2; i++) { // create key and check for occupied seats adjacent index
            for (let j = col - 1; j < col + 2; j++) {
                key += previousArray[i][j]

                if (row === i && j === col) continue;

                if (previousArray[i][j] === "#") {
                    occupied++
                }
            }
        }

        if (memoization[key] !== undefined) {
            if (previousArray[row][col] !== memoization[key]) {
                changes++
                newArray[row][col] = memoization[key];
            }
        } else {
            if (seat === "L" && occupied === 0) {
                changes++
                seat = "#"
            } else if (seat === "#" && occupied >= 4) {
                changes++
                seat = "L"
            }

            newArray[row][col] = seat
            memoization[key] = seat
        }
    }

    do { // check while there is changes 
        changes = 0
        for (let row = 1; row < stacks.length - 1; row++) {
            for (let column = 1; column < lineLen - 1; column++) {
                invert(row, column)
            }
        }
        previousArray = _.cloneDeep(newArray)
    } while (changes > 0)


    for (let i = 0; i < newArray.length; i++) {
        let currentCount = newArray[i].filter(element => { return element === "#" }).length
        results[0] += currentCount
    }

    // part 1
    console.log(`Result #1: ${results[0]}`)

    // part 2

    console.log(`Result #2: ${results[1]}`)


    performance.mark('end')
    performance.measure('Start to end', 'start', 'end')
})