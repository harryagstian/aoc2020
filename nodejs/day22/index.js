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
let mode = 'p1'
let stacks = undefined
let baseStacks = {
    p1: [],
    p2: []
}

let memoize = new Map()

let createGameCacheKey = (p1, p2) => {
    return `p1~${p1.join('~')}~p2~${p2.join('~')}`
}

let createMemoizeGameKey = (p1, p2, cp1, cp2) => {
    return `p1~${p1.join('~')}~${cp1}~p2~${p2.join('~')}~${cp2}`
}

let recursiveBattle = (p1arr, p2arr, base = false) => {
    let ongoing = true
    let roundWinner = undefined

    let currCache = new Set()

    while (ongoing) {
        let currGameKey = createGameCacheKey(p1arr, p2arr)
        let cp1 = p1arr.shift()
        let cp2 = p2arr.shift()
        if (currCache.has(currGameKey)) {
            roundWinner = 'p1r' // if game array already happened, declare p1 as winenr
            ongoing = false
        } else {
            currCache.add(currGameKey)

            // winner's value should be above from the stacks

            if (cp1 <= p1arr.length && cp2 <= p2arr.length) {
                // recursive
                roundWinner = recursiveBattle(_.take(_.cloneDeep(p1arr), cp1), _.take(_.cloneDeep(p2arr), cp2), false)
                // console.log('entry', _.take(_.cloneDeep(p1arr), cp1).length, _.take(_.cloneDeep(p2arr), cp2).length)
            } else if (cp1 > cp2) {
                roundWinner = 'p1'
            } else {
                roundWinner = 'p2'
            }
        }

        if (roundWinner === 'p1' || roundWinner === 'p1r') {
            p1arr.push(cp1)
            p1arr.push(cp2)
        } else {
            p2arr.push(cp2)
            p2arr.push(cp1)
        }

        if (p1arr.length === 0) {
            ongoing = false
            roundWinner = 'p2'
        } else if (p2arr.length === 0 || roundWinner === 'p1r') {
            ongoing = false
            roundWinner = 'p1'
        }
        // console.log(p1arr, p2arr, cp1, cp2, base, roundWinner)
    }
    return roundWinner
}


lineStream.on('line', (line) => {
    if (line === '') {
        return
    }

    if (line === 'Player 2:') {
        mode = 'p2'
        return
    }

    // console.log(line)

    if (!isNaN(line)) {
        // console.log(mode)
        baseStacks[mode].push(Number(line))
    }

})


lineStream.on('close', () => {

    // part 1
    let ongoing = true
    let winner = []

    stacks = _.cloneDeep(baseStacks)
    while (ongoing) {
        let cp1 = stacks.p1.shift()
        let cp2 = stacks.p2.shift()

        if (cp1 > cp2) {
            stacks.p1.push(cp1)
            stacks.p1.push(cp2)
        } else {
            stacks.p2.push(cp2)
            stacks.p2.push(cp1)
        }

        if (stacks.p1.length === 0) {
            ongoing = false
            winner = stacks.p2
        } else if (stacks.p2.length === 0) {
            ongoing = false
            winner = stacks.p1
        }
    }

    for (let i = winner.length - 1; i >= 0; i--) {
        results[0] += (winner.length - i) * winner[i]
    }
    console.log(`Result #1: ${results[0]}`)

    // part 2

    stacks = _.cloneDeep(baseStacks)
    winner = stacks[recursiveBattle(stacks.p1, stacks.p2, true)]

    // console.log(stacks.p1, stacks.p2)

    for (let i = winner.length - 1; i >= 0; i--) {
        results[1] += (winner.length - i) * winner[i]
    }
    console.log(`Result #2: ${results[1]}`)

    performance.mark('end')
    performance.measure('Start to end', 'start', 'end')
})