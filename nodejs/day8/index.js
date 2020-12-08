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

let accumulator = 0
let stacks = []

let results = [0, 0]

lineStream.on('line', (line) => {
    stacks.push(line)
})


lineStream.on('close', () => {
    let history = new Set()

    // part 1
    for (let i = 0; i < stacks.length;) {
        let [op, value] = stacks[i].split(' ')
        if (history.has(i)) {
            results[0] = accumulator
            break;
        } else {
            history.add(i)
        }
        switch (op) {
            case "jmp":
                i += parseInt(value)
                break;
            case "acc":
                accumulator += parseInt(value)
                i++
                break;
            case "nop":
                i++
                break;
        }
    }

    console.log(`Result #1: ${results[0]}`)

    // part 2
    let fixed = false
    let swapIndex = 0

    while (!fixed) {
        let stacksCopy = _.cloneDeep(stacks)
        let i = 0
        accumulator = 0
        history = new Set()
        for (swapIndex; swapIndex < stacks.length;) {
            if (stacksCopy[swapIndex].includes("jmp")) {
                stacksCopy[swapIndex] = stacksCopy[swapIndex].replace("jmp", "nop")
                swapIndex++
                break;
            } else if (stacksCopy[swapIndex].includes("nop")) {
                stacksCopy[swapIndex] = stacksCopy[swapIndex].replace("nop", "jmp")
                swapIndex++
                break;
            }
            swapIndex++
        }

        for (i; i < stacksCopy.length;) {
            let [op, value] = stacksCopy[i].split(' ')
            if (history.has(i)) {
                break;
            } else {
                history.add(i)
            }
            switch (op) {
                case "jmp":
                    i += parseInt(value)
                    break;
                case "acc":
                    accumulator += parseInt(value)
                    i++
                    break;
                case "nop":
                    i++
                    break;
            }
        }
        
        if(i >= stacksCopy.length){
            fixed = true
        }
    }

    results[1] = accumulator

    console.log(`Result #2: ${results[1]}`)
    performance.measure('Start to end', 'start')
})