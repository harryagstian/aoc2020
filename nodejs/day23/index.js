const assert = require('assert')
const fs = require('fs')
const _ = require('lodash')
Error.stackTraceLimit = 10;

const setMinMax = (min, max, current) => {
    if (min === undefined || min > current) {
        min = current
    }

    if (max === undefined || max < current) {
        max = current
    }
    return [min, max]
}

const pickup = (cll, current) => {
    // from 
    // {
    //     3: 8
    //     8: 9
    //     9: 1
    //     1: 2
    //     2: 5
    // }

    // to
    // {
    //     3: 2
    //     2: 5
    // }
    let next = cll[current]
    cll[current] = undefined
    let arr = []
    for (let i = 0; i < 3; i++) {
        arr.push(next)
        const temp = next
        next = cll[next] // move to next linked list
        delete cll[temp] // delete previous item
    }

    cll[current] = next

    return [arr, next]
}

const place = (cll, arr, destination) => {
    const lastChain = cll[destination]
    let next = destination
    for (let i = 0; i < arr.length; i++) {
        const current = arr[i]
        cll[next] = current
        next = current
    }

    cll[next] = lastChain

    return lastChain
}

const simulate = (cll, current, max) => {
    const [arr, newCurrent] = pickup(cll, current)
    let destination = current - 1
    while (true) {
        if (destination <= 0) {
            destination = max
        }
        if (!arr.includes(String(destination))) {
            break
        };
        destination--
    }
    place(cll, arr, destination)

    return newCurrent
}

const printChain = (cll, start, print = true) => {
    const arr = []
    const keys = Object.keys(cll)
    let current = start || keys[0]
    while (arr.length < keys.length) {
        arr.push(cll[current])
        current = cll[current]
    }
    if (start !== undefined) {
        _.pull(arr, String(start))
    }
    if (print) {
        console.log(arr.join(''))
    }
    return arr.join('')
}

const main = (runSample) => {
    console.time("runtime")

    let inputFile = __dirname
    inputFile += (runSample) ? '/input.txt' : '/sample.txt'
    console.log(`Reading file ${inputFile}`)

    const input = fs.readFileSync(inputFile).toString()
    console.log(`Input number: ${input}`)

    const results = [0, 1]

    // create circular linked list with object / map

    let first
    let min
    let max

    // maybe move this to a function?
    let cll = {}
    /**
     * {
     *      2: 3
     *      3: 1
     *      1: 2
     * }
     * will looks like 2 -> 3 -> 1 -> 2
     */

    for (let i = 0; i < input.length; i++) {
        const current = input[i]
        let next = input[i + 1]
        if (first === undefined) {
            first = current
        }
        if (next === undefined) {
            next = first
        }

        [min, max] = setMinMax(min, max, current)

        cll[current] = next
    }

    // move around n times
    let iteration = 100
    let currentCup = input[0]
    for (let i = 0; i < iteration; i++) {
        currentCup = simulate(cll, currentCup, max)
    }

    results[0] = printChain(cll, 1, false)

    console.log(`Part 1 solution: ${results[0]}`)

    cll = {}

    const cupsCount = 1000000
    // const cupsCount = 20
    first = undefined
    for (let i = 0; i < cupsCount; i++) {
        let current
        let next
        if (i < input.length) {
            current = input[i]
            next = input[i + 1]
        } else {
            current = String(i + 1)
            next = String(i + 2)
        }

        if (next === undefined) {
            next = String(i + 2)
        }

        if (first === undefined) {
            first = current
        }
        if (next > cupsCount) {
            next = first
        }

        [min, max] = [1, cupsCount]

        cll[current] = next
    }
    // sanity check

    assert.deepStrictEqual(Object.keys(cll).length === new Set(Object.keys(cll)).size, true)
    assert.deepStrictEqual(Object.values(cll).length === new Set(Object.values(cll)).size, true)

    let p = _.sortBy(Object.values(cll), Number)
    assert.deepStrictEqual(p[0] == min && p[p.length - 1] == max, true)

    iteration = 10000000
    currentCup = input[0]
    for (let i = 0; i < iteration; i++) {
        if (i % 2000000 === 0) {
            console.log(`Iteration ${i}, ${currentCup}`)
        }
        currentCup = simulate(cll, currentCup, max)
    }

    // sanity check

    assert.deepStrictEqual(Object.keys(cll).length === new Set(Object.keys(cll)).size, true)
    assert.deepStrictEqual(Object.values(cll).length === new Set(Object.values(cll)).size, true)

    p = _.sortBy(Object.values(cll), Number)
    assert.deepStrictEqual(p[0] == min && p[p.length - 1] == max, true)

    let c = 1
    for (let i = 0; i < 2; i++) {
        console.log(cll[c], c)
        results[1] *= cll[c]
        c = cll[c]
    }

    console.log(`Part 2 solution: ${results[1]}`)

    console.timeEnd("runtime")
}

const args = process.argv.slice(2)

main(args.includes('input')) // run sample by default. to run with input, do node index input
