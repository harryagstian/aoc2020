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

let lineStream = readline.createInterface(({
    input: fs.createReadStream(inputFile),
}))

let stacks = [0]
let results = 0

lineStream.on('line', (line) => {
    stacks.push(parseInt(line))
})

lineStream.on('close', () => {
    stacks = _.sortBy(stacks)
    stacks.push(stacks[stacks.length - 1] + 3)

    
    // only solve part 2

    let memoization = {}

    let dp = (i) => {
        let path = 0
        if (i === stacks.length - 1) { // when current i is the last item, return 1 since theres only 1 possible way to arrange
            return 1
        }

        if (memoization[i] !== undefined) { // memoization
            return memoization[i]
        }

        for (let j = 1; j < 4; j++) { // check next 3 items. example in [1, 2, 3, 4] if lets say current index is 0, condition where stacks[n] - 1 <= 3 is true, max n is 3 ==> i + n <= 3
            if (stacks[j + i] - stacks[i] <= 3) {
                path += dp(i + j) // number of path is equal to sum of all previous value. in this case, base case starts from end of the array
            }
        }

        memoization[i] = path

        return path
    }

    results = dp(0)
    // console.log(cache)

    console.log(`Result #2: ${results}`)

    performance.mark('end')
    performance.measure('Start to end', 'start', 'end')
})