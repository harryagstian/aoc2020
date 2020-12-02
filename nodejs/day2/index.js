const fs = require('fs')
const readline = require('readline')
const _ = require('lodash')

let inputFile = __dirname + '/input.txt'

let DEBUG = true

let debugPrint = (...arr) => {
    DEBUG ? console.log(arr) : ''
}

let lineStream = readline.createInterface(({
    input: fs.createReadStream(inputFile),
}))

let results = [0, 0]

lineStream.on('line', (line) => {
    // part 1
    let regexExpression = /(\d*)-(\d*) (.{1}): (.*)/

    let regexResult = line.match(regexExpression)

    let min = parseInt(regexResult[1])
    let max = parseInt(regexResult[2])
    let char = regexResult[3]
    let password = regexResult[4]

    let occurence = _.countBy(password)[char] || 0

    if (min <= occurence && occurence <= max) {
        results[0]++
    }

    // part 2

    if (password[min - 1] === char ^ password[max - 1] === char) {
        // debugPrint(min, max, password, char)
        results[1]++
    }
})

lineStream.on('close', () => {
    // part 1
    console.log(`Result #1: ${results[0]}`)

    // part 2
    console.log(`Result #1: ${results[1]}`)

})