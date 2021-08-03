const fs = require('fs')
const _ = require('lodash')
const assert = require('assert')
const { cloneDeep } = require('lodash')
Error.stackTraceLimit = 2;
const POSITION_VALUE = ["top", "right", "bottom", "left"]

/**
 * Rotate CW 
 * @param {*} arr 2D Array 
 */

const rotate = (arr) => {
    const len = arr.length // assuming 2D array length is equal
    const rotatedArr = []

    for (let i = 0; i < len; i++) {
        rotatedArr[i] = []
        for (let j = 0; j < len; j++) {
            rotatedArr[i][j] = cloneDeep(arr[len - j - 1][i]) // -1 since since array start from 0 
        }
    }

    return rotatedArr
}

/**
 * Flip horizontal
 * @param {*} arr 2D array
 */

const flip = (arr) => {
    const len = arr.length // assuming 2D array length is equal
    const rotatedArr = []

    for (let i = 0; i < len; i++) {
        rotatedArr[len - i - 1] = arr[i] // -1 since since array start from 0 
    }

    return rotatedArr
}

const isMatchingSide = (val1, val2) => {
    return val1.join('') === val2.join('')
}

/**
 * 
 * @param {*} arr 
 * @param {*} position 
 *
 */


const getSideValue = (arr, position) => {
    assert.strictEqual(POSITION_VALUE.includes(position), true)
    let returnValue = []
    const len = arr.length

    if (["top", "bottom"].includes(position)) {
        const index = position === "top" ? 0 : len - 1

        returnValue = cloneDeep(arr[index])
    } else {
        const index = position === "left" ? 0 : len - 1

        for (let i = 0; i < len; i++) {
            returnValue.push(arr[i][index])
        }
    }

    return returnValue
}

const findMatch = (currentTiles, sideHashtagCounts, currentID, position, currentTileConditions, matchedID) => {
    if (currentTileConditions[currentID][position] === null) {
        const tile = currentTiles[currentID]
        const side = getSideValue(tile, position)
        const oppositePosition = POSITION_VALUE[(POSITION_VALUE.findIndex(e => e === position) + 2) % POSITION_VALUE.length]
        const hashtagCount = side.filter(e => e === '#').length
        const possibleMatchID = [...new Set(sideHashtagCounts[hashtagCount].filter(e => e !== currentID))]
        const newStacks = []
        for (matchID of possibleMatchID) {
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 4; j++) {
                    const oppositeSide = getSideValue(currentTiles[matchID], oppositePosition)
                    if (isMatchingSide(side, oppositeSide)) {
                        currentTileConditions[currentID][position] = matchID
                        currentTileConditions[matchID][oppositePosition] = currentID
                        matchedID.add(currentID)
                        matchedID.add(matchID)
                        newStacks.push(matchID)
                    }

                    if (!matchedID.has(matchID)) {
                        currentTiles[matchID] = rotate(currentTiles[matchID])
                    }
                }

                if (i === 0 && !matchedID.has(matchID)) {
                    currentTiles[matchID] = flip(currentTiles[matchID])
                }
            }
        }
        return newStacks
    }
}

const removeTileBorder = (tile) => {
    let newTile = _.cloneDeep(tile)

    newTile.shift() // top
    newTile.pop() // bottom

    for (let i = 0; i < newTile.length; i++) {
        newTile[i].shift() // left
        newTile[i].pop() // right
    }

    return newTile
}

const printFullImage = (largeImageArray) => {
    let returnData = ''
    for (let i = 0; i < largeImageArray.length; i++) {
        returnData += largeImageArray[i].join('')
        returnData += '\n'
    }
    return returnData
}

const mapImageID = (currentID, currentTileConditions, IDCoordinateMapping) => {
    let [baseY, baseX] = IDCoordinateMapping[currentID].split('.').map(Number)
    const stacks = []

    for ([key, value] of Object.entries(_.pickBy(currentTileConditions[currentID], (o) => { return o !== null }))) {
        let y = baseY
        let x = baseX
        switch (key) {
            case "top":
                y++
                break;
            case "bottom":
                y--
                break;
            case "left":
                x--
                break;
            case "right":
                x++
                break;
        }
        if (IDCoordinateMapping[value] === undefined) {
            IDCoordinateMapping[value] = `${y}.${x}`
            stacks.push(value)
        }
    }

    return stacks
}

const parseSeaMonster = (text) => {
    text = text.split('\n')
    let pos = []

    // parse position 
    for (let i = 0; i < text.length; i++) {
        let line = text[i].split('')
        for (let j = 0; j < line.length; j++) {
            if (line[j] === "#") {
                pos.push(`${i}.${j}`)
            }
        }
    }

    // normalize position so that first occurence of # is on 0.0

    const [baseY, baseX] = pos[0].split('.').map(Number)

    for (let i = 1; i < pos.length; i++) {
        const [y, x] = pos[i].split('.').map(Number)
        pos[i] = `${y}.${x - baseX}`
    }

    return pos
}


const main = () => {
    console.time("runtime")

    const inputFile = __dirname + '/input.txt'
    // const inputFile = __dirname + '/sample.txt'

    const text = fs.readFileSync(inputFile).toString().split("\n")

    const results = [1, 0]

    let baseTiles = {}

    // parse text into object with 2d array

    let currentLineID = undefined

    for (let i = 0; i < text.length; i++) {
        const line = text[i]
        if (line.includes("Tile")) {
            currentLineID = /(\d+)/g.exec(line).shift()

            assert.strictEqual(baseTiles[currentLineID], undefined)

            baseTiles[currentLineID] = []
        } else if (line === "") {
            currentLineID = undefined
        } else {
            assert.notStrictEqual(currentLineID, undefined)

            baseTiles[currentLineID].push([...line])
        }
    }


    const baseID = Object.keys(baseTiles)
    let baseTileConditions = {}

    // speed up matching by counting number of # in given sides

    const sideHashtagCounts = {}

    for (let i = 0; i < baseID.length; i++) {
        const currentID = baseID[i]
        const currentTiles = baseTiles[currentID]
        baseTileConditions[currentID] = {}

        for (let j = 0; j < POSITION_VALUE.length; j++) {
            const currentPosition = POSITION_VALUE[j]
            const currentSide = getSideValue(currentTiles, currentPosition)
            const hashtagCount = currentSide.filter(e => e === '#').length

            if (sideHashtagCounts[hashtagCount] === undefined) {
                sideHashtagCounts[hashtagCount] = []
            }

            sideHashtagCounts[hashtagCount].push(currentID)
            baseTileConditions[currentID][currentPosition] = null
        }
    }


    for (let i = 0; i < baseID.length; i++) {
        let stacks = [baseID[i]]
        const currentTileConditions = cloneDeep(baseTileConditions)
        const currentTiles = cloneDeep(baseTiles)
        const matchedID = new Set()

        while (stacks.length > 0) {
            const currentID = stacks.shift()

            for (position of POSITION_VALUE) {
                const newStacks = findMatch(currentTiles, sideHashtagCounts, currentID, position, currentTileConditions, matchedID)
                stacks = stacks.concat([...new Set(newStacks)])

            }
        }
        if (matchedID.size === baseID.length) {
            baseTileConditions = currentTileConditions
            baseTiles = currentTiles
            break;
        }
    }

    // part 1 solution

    let bottomLeftID = undefined

    for ([key, value] of Object.entries(baseTileConditions)) {
        if (Object.keys(_.pickBy(value, (o) => { return o === null })).length === 2) {
            results[0] *= key
        }

        if (value.bottom === null && value.left === null) {
            bottomLeftID = key
        }
    }

    console.log(`Part 1 solution: ${results[0]}`)

    // arrange picture. small / large image is square, so image size is rootsquare of baseID.length

    // start from bottom left

    let IDCoordinateMapping = {}

    IDCoordinateMapping[bottomLeftID] = "0.0"
    let stacks = [bottomLeftID]


    while (Object.keys(IDCoordinateMapping).length < baseID.length) {
        const currentID = stacks.shift()
        let newStacks = mapImageID(currentID, baseTileConditions, IDCoordinateMapping)
        stacks = [...new Set(newStacks)]
    }


    const distinctValue = new Set(Object.values(IDCoordinateMapping))
    assert(distinctValue.size === Object.values(IDCoordinateMapping).length, true, `Expecting ${IDCoordinateMapping.length}, got ${distinctValue.length}`) // sanity check
    // convert position coordinate to array

    const largeImageLen = Math.sqrt(distinctValue.size)
    IDCoordinateMapping = _.invert(IDCoordinateMapping)

    for (const [key, value] of Object.entries(baseTiles)) {
        baseTiles[key] = removeTileBorder(value)
    }

    const smallImageLen = baseTiles[bottomLeftID].length

    let largeImageArray = []
    for (let y = 0; y < largeImageLen; y++) {
        for (let i = 0; i < smallImageLen; i++) { // iterate downwards in the small array
            let temp = []
            for (let x = 0; x < largeImageLen; x++) {
                const currentID = IDCoordinateMapping[`${largeImageLen - y - 1}.${x}`]
                const currentTile = baseTiles[currentID]
                temp = temp.concat(currentTile[i])
            }
            largeImageArray.push(temp)
        }
    }

    const seaMonsterText = fs.readFileSync(__dirname + '/seamonster.txt').toString()

    let seaMonsterPosition = parseSeaMonster(seaMonsterText)

    // 4 years with javascript, first time came across this statement.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/label

    let seaMonsterOccurence
    flipLoop:
    for (let i = 0; i < 2; i++) { // flip
        for (let j = 0; j < 4; j++) { // rotate
            seaMonsterOccurence = 0
            for (let y = 0; y < largeImageArray.length; y++) {
                for (let x = 0; x < largeImageArray.length; x++) {
                    if (largeImageArray[y][x] === "#") {
                        let hasSeaMonster = true
                        for (let z = 1; z < seaMonsterPosition.length; z++) {
                            const [offsetY, offsetX] = seaMonsterPosition[z].split('.').map(Number)

                            if (largeImageArray[y + offsetY] === undefined || largeImageArray[y + offsetY][x + offsetX] !== "#") {
                                hasSeaMonster = false
                                break;
                            }
                        }

                        if (hasSeaMonster) {
                            seaMonsterOccurence++
                        }
                    }
                }
            }
            if (seaMonsterOccurence > 0) {
                break flipLoop;
            }
            largeImageArray = rotate(largeImageArray)
        }
        largeImageArray = flip(largeImageArray)
    }

    results[1] = printFullImage(largeImageArray).match(/#/g).length - (seaMonsterPosition.length * seaMonsterOccurence)
    console.log(`Part 2 solution: ${results[1]}`)

    console.timeEnd("runtime")
}

main()
