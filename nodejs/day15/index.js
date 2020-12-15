const fs = require('fs')
const readline = require('readline')
const _ = require('lodash')
const { PerformanceObserver, performance } = require('perf_hooks');
const { add, before } = require('lodash');

const obs = new PerformanceObserver((items) => {
    let { name, duration } = items.getEntries()[0]
    console.log(`${name}: ${duration}ms`)
    performance.clearMarks()
})
obs.observe({ entryTypes: ['measure'] });

performance.mark('start')

// let stacks = [0, 3, 6]

let stacks = [16, 1, 0, 18, 12, 14, 19]
let results = [0, 0]

let current = 0

for (let i = stacks.length; i < 2020; i++) {
    let len = stacks.filter(e => e === current).length
    if (len < 2) {
        current = 0
    } else {
        let lastIndex = _.findLastIndex(stacks, (e => {return e === current}))
        let beforeLastIndex = _.findLastIndex(stacks, (e => {return e === current}), lastIndex - 1)
        current = lastIndex - beforeLastIndex
    }
    stacks.push(current)
    // console.log(i)
}

results[0] = current

// part 1

console.log(`Result #1: ${results[0]}`)

// part 2

console.log(`Result #2: ${results[1]}`)

performance.mark('end')
performance.measure('Start to end', 'start', 'end')