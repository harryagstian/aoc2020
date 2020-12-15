const _ = require('lodash')
const { PerformanceObserver, performance } = require('perf_hooks');

const obs = new PerformanceObserver((items) => {
    let { name, duration } = items.getEntries()[0]
    console.log(`${name}: ${duration}ms`)
    performance.clearMarks()
})
obs.observe({ entryTypes: ['measure'] });

performance.mark('start')

// let input = [0, 3, 6]

let input = [16, 1, 0, 18, 12, 14, 19]
let results = [0, 0]

stacks = new Map() // more performant compared to object. whole script ran for 3900ms

let i = 1
let last

while (input.length > 0) {
    last = input.shift()
    stacks.set(last, i)
    i++
}

last = 0 

for (i; i < 30000000; i++) {
    // console.log(i, last, stacks)
    let newValue
    if(stacks.has(last)){
        newValue = i - stacks.get(last)
    }else{
        newValue = 0
    }
    stacks.set(last, i)

    last = newValue

    if(i === 2019){
        results[0] = last
    }
}

results[1] = last

// part 1

console.log(`Result #1: ${results[0]}`)

// part 2

console.log(`Result #2: ${results[1]}`)

performance.mark('end')
performance.measure('Start to end', 'start', 'end')