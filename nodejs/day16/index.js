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

let inputFile = __dirname + '/sample.txt'

let lineStream = readline.createInterface(({
    input: fs.createReadStream(inputFile),
}))

let results = [0, 0]
let mode = 'rule'

stacks = {
    rule: [],
    yourTicket: [],
    nearbyTicket: []
}

let invalid = []
let sumInvalid = 0

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
        let regexRule = /.*: (\d*)-(\d*) or (\d*)-(\d*)/
        // console.log(regexRule.exec(line))
        let [, min1, max1, min2, max2] = regexRule.exec(line)

        stacks[mode].push([Number(min1), Number(max1)])
        stacks[mode].push([Number(min2), Number(max2)])
    } else if (mode === 'yourTicket') {
        line = line.split(',').map(element => Number(element))
        stacks[mode] = line
    } else if (mode === 'nearbyTicket') {
        line = line.split(',').map(element => Number(element))
        stacks[mode] = stacks[mode].concat(line)

        for (const value of line) {
            let valid = false

            for(const r of stacks.rule){
                if(r[0] <= value && value <= r[1]){
                    valid = true
                    break
                }
            }

            if(!valid){
                invalid.push(value)
                sumInvalid += value
            }
        }
    }


})


lineStream.on('close', () => {
    console.log(stacks)
    console.log(invalid)
    // console.table(stacks.nearbyTicket)
    // part 1
    results[0] = sumInvalid
    console.log(`Result #1: ${results[0]}`)

    // part 2
    console.log(`Result #2: ${results[1]}`)

    performance.mark('end')
    performance.measure('Start to end', 'start', 'end')
})