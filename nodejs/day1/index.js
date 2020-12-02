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
let stacks = [[], []]

performance.mark('start')

lineStream.on('line', (line) => {
    line.length === 3 ? stacks[0].push(parseInt(line)) : stacks[1].push(parseInt(line))
})

lineStream.on('close', () => {
    // part 1
    let index

    index = stacks[0].findIndex(element => {
        return stacks[1].includes(2020 - element)
    })

    console.log(`Result #1: ${stacks[0][index] * (2020 - stacks[0][index])}`)

    let sortedStacks = _.sortBy(stacks[0].concat(stacks[1]))

    // debugPrint(sortedStacks)
    // let iteration = 0
    while (true) {
        // iteration++
        let workingArray = []
        let valid = []
        valid[0] = sortedStacks.pop()

        workingArray = _.cloneDeep(sortedStacks)

        for (let element of workingArray) {
            let result = undefined

            if (valid[0] + element < 2020) {
                result = workingArray.find(element2 => {
                    return valid[0] + element + element2 === 2020
                })
            }
            
            // debugPrint(result, element, iteration)
            if (result !== undefined) {
                valid[1] = element
                valid[2] = result
                break;
            } else {
                valid[1] = undefined
                valid[2] = undefined
            }
        }

        // debugPrint(iteration, valid)

        if (!valid.includes(undefined)) {
            // debugPrint(iteration, valid)
            console.log(`Result #2: ${valid[0] * valid[1] * valid[2]}`)
            performance.measure('Start to end', 'start')
            break;
        }
    }
})