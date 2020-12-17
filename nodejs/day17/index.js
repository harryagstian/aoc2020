const fs = require('fs')
const readline = require('readline')
const _ = require('lodash')
const { PerformanceObserver, performance } = require('perf_hooks');
const { add } = require('lodash');

const obs = new PerformanceObserver((items) => {
    let { name, duration } = items.getEntries()[0]
    console.log(`${name}: ${duration}ms`)
    performance.clearMarks()
})
obs.observe({ entryTypes: ['measure'] });

performance.mark('start')

// let inputFile = __dirname + '/sample.txt'
let inputFile = __dirname + '/input.txt'

let lineStream = readline.createInterface(({
    input: fs.createReadStream(inputFile),
}))

let results = [0, 0]
let len = 0
let spaces = [[]]

let countNeighbor = (x, y, z) => {
    let count = 0
    for (let i = -1; i < 2; i++) {
        let currX = x + i
        if (currX < 0 || currX > spaces.length - 1) {
            continue;
        }
        for (let j = -1; j < 2; j++) {
            let currY = y + j
            if (currY < 0 || currY > spaces[currX].length - 1) {
                continue;
            }

            for (let k = -1; k < 2; k++) {
                let currZ = z + k
                // console.log(spaces, currX, currY, currZ)
                if (currZ < 0 || currZ > spaces[currX][currY].length - 1 || (i === 0 && j === 0 && k === 0)) {
                    continue;
                }
                if (spaces[currX][currY][currZ] === '#') {
                    // console.log('found on', currX, currY, currZ, x, y, z, i, j, k)
                    count++
                }
            }
        }
    }
    // console.log('returned')
    return count
}

let expandArray = (arr) => {

    len += 2
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            arr[i][j].splice(0, 0, '.')
            arr[i][j].push('.')
        }
        let t = Array(len).fill('.')
        arr[i].splice(0, 0, t)
        t = _.cloneDeep(t)
        arr[i].push(t)
    }

    let temp = []
    for (let i = 0; i < len; i++) {
        temp.push(Array(len).fill('.'))
    }

    arr.splice(0, 0, temp)
    temp = _.cloneDeep(temp)
    arr.push(temp)

}

lineStream.on('line', (line) => {
    if (len === 0) {
        len = line.length
        // spaces[0].push(Array(len).fill('.'))
    }
    // spaces[0].push(['.', ...line, '.'])
    spaces[0].push([...line])
    console.log(spaces)
})


lineStream.on('close', () => {

    // console.table(spaces)
    // JSON.stringify(spaces)
    // expandArray(spaces)
    // JSON.stringify(spaces)
    // console.table(spaces)
    // spaces[0].push(Array(len).fill('.'))


    for (let loop = 0; loop < 6; loop++) {
        // let temp = []
        // for (let i = 0; i < len; i++) {
        //     temp.push(Array(len).fill('.'))
        // }

        // spaces.push(temp)
        expandArray(spaces)
        let spacesCp = _.cloneDeep(spaces)

        for (let i = 0; i < spacesCp.length; i++) {
            for (let j = 0; j < spacesCp[i].length; j++) {
                for (let k = 0; k < spacesCp[i][j].length; k++) {
                    
                    // if(loop == 0 && i === 0 && j === 2&& k === 1) debugger
                    let count = countNeighbor(i, j, k)
                    let current = spacesCp[i][j][k]
                    if (current === '#' && (count !== 2 && count !== 3)) {
                        // console.log('changed # to .', i, j, k, count)
                        spacesCp[i][j][k] = '.'
                    } else if (current === '.' && count === 3) {
                        // console.log('changed . to #', i, j, k, count)
                        // console.log(current)
                        spacesCp[i][j][k] = '#'
                    }
                }
            }
        }

        for (let i = 0; i < spacesCp.length; i++) {
            // console.table(spaces[i])
            console.table(spacesCp[i])
        }
        console.log(loop + 1, Array(50).fill('-').join(''))
        // console.table(spaces)
        // console.table(spacesCp)
        spaces = _.cloneDeep(spacesCp)
    }
    // console.table(spaces)

    for (let i = 0; i < spaces.length; i++) {
        for (let j = 0; j < spaces[i].length; j++) {
            for (let k = 0; k < spaces[i][j].length; k++) {
                if (spaces[i][j][k] === '#') {
                    let inc = 1

                    // if (i > 0) {
                    //     inc = 2
                    // }

                    results[0] += inc
                }
            }
        }
    }
    // part 1
    console.log(`Result #1: ${results[0]}`)

    // part 2
    console.log(`Result #2: ${results[1]}`)

    performance.mark('end')
    performance.measure('Start to end', 'start', 'end')
})