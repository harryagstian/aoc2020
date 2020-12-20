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

let results = [1, 0]
let tn = undefined
let unmatchedImageArray = new Map()
let unmatchedBorderArray = new Map()
let smallImageDimension = 0
let memoizeBorderCounts = new Map()

let rotateClockwise = (arr) => { // rotate 2d square array 1 time clockwise
    let rotatedArr = []
    // console.table(arr)
    for (let i = 0; i < smallImageDimension; i++) {
        let str = ''
        for (let j = 0; j < smallImageDimension; j++) {
            str += arr[smallImageDimension - j - 1][i]

        }
        rotatedArr.push(str)

    }

    // console.table(rotatedArr)

    return rotatedArr
}

let flip = (arr, direction) => {
    // direction: vertical, horizontal
    let flippedArr = []

    for (let i = 0; i < smallImageDimension; i++) {
        if (direction === 'horizontal') {
            flippedArr.push(_.reverse([...arr[i]]).join(""))
        } else {
            flippedArr.push(arr[smallImageDimension - i - 1])
        }
    }
    // console.table(flippedArr)
    return flippedArr
}



let getBorders = (arr) => {
    // console.log(Array(80).fill('.').join(''))
    // console.table(arr)
    let borders = Array(4).fill('')
    borders[0] = arr[0] // top
    borders[2] = arr[smallImageDimension - 1] // bottom

    for (let j = 0; j < smallImageDimension; j++) { // assuming image array is always square
        borders[1] += arr[j][smallImageDimension - 1] // right
        borders[3] += arr[j][0] // left
    }

    // console.log(borders)

    return borders
}

let findMatch = (border, currentId, usedImageIds) => {

    let id = undefined
    let found = false
    let matchCount = 0
    let possibleIds = memoizeBorderCounts.get([...border].filter(e => e === "#").length)
    possibleIds = _.cloneDeep(possibleIds)
    possibleIds.delete(currentId)

    // console.log(border, possibleIds, [...border].filter(e => e === "#").length, memoizeBorderCounts)
    for (const possibleId of possibleIds) {
        let c = unmatchedImageArray.get(possibleId)
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 4; j++) {
                let possibleBorders = getBorders(c)

                let idx = possibleBorders.findIndex(e => { return e === border })

                if (idx > -1) {
                    // console.log(possibleId, idx, possibleBorders)
                    matchCount++
                    id = possibleId
                    break;
                } 
                c = rotateClockwise(c)
                // if possibleId is in usedImagesIds, image cannot be transform anymore
            }

            if(id !== undefined){
                break;
            }
            // flip image
            c = flip(c, 'horizontal')
        }
        if(id !== undefined){
            break;
        }
    }
    // console.log(matchCount)
    return (found) ? undefined : id
}

lineStream.on('line', (line) => {
    if (line.includes('Tile')) {
        tn = line.split(' ').pop().replace(':', '')

        unmatchedImageArray.set(tn, [])
    } else if (line === '') {
        return
    } else {
        let p = unmatchedImageArray.get(tn)
        p.push(line)
        unmatchedImageArray.set(tn, p)

        if (smallImageDimension === 0) {
            smallImageDimension = line.length
        }
    }
})


lineStream.on('close', () => {

    // extract border from unmatchedImageArray

    for (const [k, v] of unmatchedImageArray.entries()) {
        let borders = getBorders(v)
        // console.log(k, borders)
        unmatchedBorderArray.set(k, borders)

        for (let i = 0; i < borders.length; i++) {
            let occurence = [...borders[i]].filter(element => element === '#').length
            let t = undefined
            if (!memoizeBorderCounts.has(occurence)) {
                t = new Set()
                t.add(k)
            } else {
                t = memoizeBorderCounts.get(occurence)
                t.add(k)
            }
            memoizeBorderCounts.set(occurence, t) // image will only match if number of # in each border is equal, we can map out possible border pairs
        }
    }

    // console.log(unmatchedImageArray)
    // console.log(dimension, unmatchedImageArray.size)

    // console.table(unmatchedBorderArray.get('2729'))
    // rotateClockwise(unmatchedBorderArray.get('2729'))
    // console.table(unmatchedBorderArray.get('2729'))

    // console.table(unmatchedImageArray.get('2729'))
    // console.log(1, unmatchedBorderArray)

    // rotateClockwise(unmatchedImageArray.get('2729'))
    // unmatchedImageArray.set('2729', rotateClockwise(unmatchedImageArray.get('2729')))
    // unmatchedImageArray.set('2729', rotateClockwise(unmatchedImageArray.get('2729')))
    // unmatchedImageArray.set('2729', rotateClockwise(unmatchedImageArray.get('2729')))
    // unmatchedImageArray.set('2729', rotateClockwise(unmatchedImageArray.get('2729')))

    // flip(unmatchedImageArray.get('2729'), 'horizontal')
    // flip(unmatchedImageArray.get('2729'), 'vertical') // isnt flip vertical = flip horizontal + rotate clockwise 2x ?

    // assuming original image is square, side length is equal to root square of unmatched.size


    let unmatchedImageArrayId = [...unmatchedImageArray.keys()]
    // console.log(memoizeBorderCounts)
    console.log(unmatchedImageArrayId, memoizeBorderCounts)

    for(const id of unmatchedImageArrayId){
        let count = 0
        for (let i = 0; i < 4; i++){
            let a = findMatch(unmatchedBorderArray.get(id)[i], id)
            // console.log(a)
            if( a !== undefined){
                count++
            }
        }
        if(count <3){
            results[0] *= id
            console.log(id, count)
        }
    }

    console.log(`Result #1: ${results[0]}`)

    performance.mark('end')
    performance.measure('Start to end', 'start', 'end')
})