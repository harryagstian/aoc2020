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

let insertEntry = (cumulative, value, intersect, counter) => {
    // debugPrint(intersect)
    cumulative.push(value) 
    counter[0] += [...value].length // part 1 - count distinct number of yes in a group
    counter[1] += [...intersect].length // part 2 - count distinct number of remaining intersecting yes in a group
}

let entries = [] // array of distinct yes in all groups
let entry = new Set()
let intersection = new Set()
let results = [0, 0]

lineStream.on('line', (line) => {
    if (line === '') {
        insertEntry(entries, entry, intersection, results)
        entry = new Set()
        intersection = new Set()
    } else {
        let isNewGroup = [...entry].length === 0;

        [...line].forEach(element => {
            entry.add(element)

            if (isNewGroup) { // if new group, add every item to intersection
                intersection.add(element)
            }
        })

        // if not new group, get same item between line and intersection and create assign it to intersection
        if(!isNewGroup){ 
            intersection = new Set([...line].filter(i => intersection.has(i)))
        }
        // debugPrint(line, entry)
    }
})

lineStream.on('close', () => {
    insertEntry(entries, entry, intersection, results) // insert last group 
    
    // part 1
    console.log(`Result #1: ${results[0]}`)

    // part 2
    console.log(`Result #2: ${results[1]}`)
    performance.measure('Start to end', 'start')

})