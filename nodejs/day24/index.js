const fs = require('fs')
const readline = require('readline')
const _ = require('lodash')
const { PerformanceObserver, performance } = require('perf_hooks');
const { cloneDeep } = require('lodash');

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

let moveValue = {
    'e': { x: 1, y: 0 },
    'w': { x: -1, y: 0 },
    'nw': { x: 0, y: 1 },
    'se': { x: 0, y: -1 },
    'ne': { x: 1, y: 1 },
    'sw': { x: -1, y: -1 }
}

let tiles = new Map()

let createKey = (pos) => {
    return `x${pos.x}y${pos.y}`
}

let readKey = (key) => {
    let r = /x(.*)y(.*)/
    let [, x, y] = r.exec(key)

    return { x: Number(x), y: Number(y) }
}

let move = (pos, dir) => {
    pos.x += moveValue[dir].x
    pos.y += moveValue[dir].y
}

let check = () => {
    let newTiles = cloneDeep(tiles)
    let blacks = new Set()

    for (let [keyStr, value] of tiles.entries()) {
        if (value === 'black') {
            blacks.add(keyStr)
        }

        let blackAdjacent = 0
        for (const dir of Object.keys(moveValue)) {
            let key = readKey(keyStr)
            // console.log(key)
            move(key, dir)

            if (tiles.has(createKey(key))) {
                blackAdjacent++
            } else {
                // check with adjacent cell as center, look for exactly 2 black cell
                let blackAdjacent2 = 0
                let whiteKeyStr = createKey(key)
                for (const dir2 of Object.keys(moveValue)) {
                    let key = readKey(whiteKeyStr)
                    move(key, dir2)
                    if (tiles.has(createKey(key))) {
                        blackAdjacent2++
                    }
                }

                if (blackAdjacent2 === 2) {
                    newTiles.set(whiteKeyStr, 'black')
                }
            }
        }

        if (blackAdjacent > 2 || blackAdjacent === 0) {
            newTiles.delete(keyStr)
        }
    }
    tiles = cloneDeep(newTiles)

}

lineStream.on('line', (line) => {
    let currentPos = { x: 0, y: 0 }
    for (let i = 0; i < line.length; i++) {
        let nextDirection = line[i]
        if (line[i] !== 'e' && line[i] !== 'w' && i + 1 < line.length) {
            nextDirection = `${line[i]}${line[i + 1]}`
            i++
        }

        move(currentPos, nextDirection)
    }

    let key = createKey(currentPos)
    if (tiles.has(key)) {
        tiles.delete(key)
    } else {
        tiles.set(key, 'black')
    }
})


lineStream.on('close', () => {

    // part 1
    results[0] = [...tiles.values()].filter(e => e === 'black').length
    console.log(`Result #1: ${results[0]}`)

    // part 2

    for (let i = 0; i < 100; i++) {
        check()
    }
    results[1] = [...tiles.values()].filter(e => e === 'black').length
    console.log(`Result #2: ${results[1]}`)

    performance.mark('end')
    performance.measure('Start to end', 'start', 'end')
})