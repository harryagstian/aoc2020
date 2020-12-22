const fs = require('fs')
const readline = require('readline')
const _ = require('lodash')
const { PerformanceObserver, performance } = require('perf_hooks');
const { on } = require('process');

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

    let createGameCacheKey = (p1, p2) => {
        return `p1~${p1.join('~')}~p2~${p2.join('~')}`
    }
/* 
    ongoing = true
    let globalGameCache = new Set()
    while(ongoing){

        let cp1 = p1.shift()
        let cp2 = p2.shift()

        
        if (p1.length === 0) {
            winner = p2
            ongoing = false
        }
        
        if (p2.length === 0) {
            winner = p1
            ongoing = false
        }
        
        let c = createGameCacheKey(p1, p2)
        if (globalGameCache.has(c)) {
            winner = p1
            ongoing = false
        }
        globalGameCache.add(c)

    }

    let recursiveBattle = (p1, p2) => {
        if (p1.length === 0) {
            winner = p2
            return
        }
        if (p2.length === 0) {
            winner = p1
            return 'p2'
        }

        let cp1 = p1.shift()
        let cp2 = p2.shift()
        let pool = []
        let gameCache = new Set()
        let c = createGameCacheKey(p1, p2)
        if (gameCache.has(c)) {
            return 'p1'
        }
        gameCache.add(c)

        pool.push(p1)
        if (cp1 > cp2) {
            pool.push(cp2)
        } else {
            pool.splice(0, 0, cp2)
        }

        if (cp1 <= p1.length || cp2 <= p2.length) {
            // recursive battle, need to return winner
        }
    } */

    console.log(`Result #1: ${results[0]}`)

    stacks = _.cloneDeep(baseStacks)

    performance.mark('end')
    performance.measure('Start to end', 'start', 'end')
})