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
let inputFile = __dirname + '/input.txt'

let lineStream = readline.createInterface(({
    input: fs.createReadStream(inputFile),
}))

let results = [0, 1]
let mode = 'rule'

stacks = {
    rule: [],
    yourTicket: [],
    nearbyTicket: []
}

let invalid = []
let sumInvalid = 0
let totalRules = 0


let booleanMap = []

lineStream.on('line', (line) => {
    if (line === '') {
        return
    }

    if (line === 'your ticket:') {
        mode = 'yourTicket'
        return
    } else if (line === 'nearby tickets:') {
        mode = 'nearbyTicket'
        return
    }

    if (mode === 'rule') {
        let regexRule = /(.*): (\d*)-(\d*) or (\d*)-(\d*)/
        let [, ruleDescription, min1, max1, min2, max2] = regexRule.exec(line)

        stacks[mode].push([ruleDescription, Number(min1), Number(max1), Number(min2), Number(max2)])
        totalRules++

    } else if (mode === 'yourTicket') {
        line = line.split(',').map(element => Number(element))
        stacks[mode] = line

        for (let i = 0; i < totalRules; i++) {
            booleanMap.push(Array(totalRules).fill(true))
        }
    } else if (mode === 'nearbyTicket') {
        let value = line.split(',').map(element => Number(element))

        let lineValid = true

        for (let i = 0; i < totalRules; i++) { // part 1, check if any item is valid
            let valid = false
            for (let j = 0; j < totalRules; j++) {
                if (((stacks.rule[j][1] < value[i] && value[i] < stacks.rule[j][2]) || (stacks.rule[j][3] < value[i] && value[i] < stacks.rule[j][4]))) {
                    valid = true
                    break;
                }
            }

            if (!valid) {
                lineValid = false
                invalid.push(value[i])
                sumInvalid += value[i]
            }
        }

        // rules goes to right - j
        // column pos goes to bottom - i

        if (lineValid) {
            for (let i = 0; i < totalRules; i++) { // part 2, check if any item is valid
                for (let j = 0; j < totalRules; j++) {
                    if (!((stacks.rule[j][1] <= value[i] && value[i] <= stacks.rule[j][2]) || (stacks.rule[j][3] <= value[i] && value[i] <= stacks.rule[j][4]))) {
                        booleanMap[i][j] = false
                    }
                }
            }
        }

    }


})


lineStream.on('close', () => {

    let columnToRuleMapping = Array(totalRules).fill(undefined) // column n correspond to rule n value

    let found = 0

    while (true) {
        for (let i = 0; i < totalRules; i++) {
            // console.table(booleanMap, stacks.rule)
            let count = booleanMap[i].filter(e => e === true).length
            // console.log(count)
            let pos = undefined
            if (count === 1) {
                pos = booleanMap[i].findIndex(e => e === true)
                for (let j = 0; j < totalRules; j++) {
                    booleanMap[j][pos] = false
                }
                found++
                // console.log(i, pos)
                columnToRuleMapping[i] = pos
            }
        }

        if (found === totalRules) {
            break
        }
    }

    // console.table(columnToRuleMapping)
    // console.table(stacks.rule)
    // console.table(stacks.yourTicket)

    for (let i = 0; i < 6; i++) {
        let index = columnToRuleMapping.findIndex(e => e === i)
        // console.log(columnToRuleMapping[i], stacks.rule[i][0], stacks.yourTicket[columnToRuleMapping[i]])
        results[1] *= stacks.yourTicket[index]
    }

    // part 1
    results[0] = sumInvalid
    console.log(`Result #1: ${results[0]}`)

    // part 2
    console.log(`Result #2: ${results[1]}`)

    performance.mark('end')
    performance.measure('Start to end', 'start', 'end')
})