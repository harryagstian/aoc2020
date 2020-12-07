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

let results = [0, 0]
let entries = []
let entry = {}

let isValidLine = (element) => {
    let valid = true
    for (let [key, value] of Object.entries(element)) {
        valid = isValidKey(key, value)
        if (!valid) {
            break
        }
    }
    return valid
}

let isValidKey = (key, value) => {
    switch (key) {
        case 'byr':
            return (1920 <= parseInt(value) && parseInt(value) <= 2002)
        case 'iyr':
            return (2010 <= parseInt(value) && parseInt(value) <= 2020)
        case 'eyr':
            return (2020 <= parseInt(value) && parseInt(value) <= 2030)
        case 'hgt':
            if (_.endsWith(value, 'in')) {
                let trimmedValue = value.substring(0, value.length - 2)
                return (59 <= parseInt(trimmedValue) && parseInt(trimmedValue) <= 76)
            } else if (_.endsWith(value, 'cm')) {
                let trimmedValue = value.substring(0, value.length - 2)
                return (150 <= parseInt(trimmedValue) && parseInt(trimmedValue) <= 193)
            } else {
                return false
            }
        case 'hcl':
            return /^#[0-9a-f]{6}$/.test(value)
        case 'ecl':
            return ['amb', 'blu', 'brn', 'gry', 'grn', 'hzl', 'oth'].includes(value)
        case 'pid':
            return /^\d{9}$/.test(value)
        case 'cid':
            return true
        default:
            return false
    }
}

let regexExpression = /(.{3}):([^\s]+)/g

lineStream.on('line', (line) => {
    if (line === '') {
        entries.push(entry)
        entry = {}
    } else {
        let regexResult = [...line.matchAll(regexExpression)]

        regexResult.forEach(element => {
            entry[element[1]] = element[2]
        })
    }
})

lineStream.on('close', () => {
    entries.push(entry) // push last item since it maybe stucks due to no empty line afterwards

    entries.forEach(element => {
        let keyCount = _.size(element)
        if ((keyCount === 8) || (keyCount === 7 && element.cid === undefined)) {
            results[0]++
            if (isValidLine(element)) {
                results[1]++
                // debugPrint(element)
            }
        }
    })

    // part 1
    console.log(`Result #1: ${results[0]}`)

    // part 2
    console.log(`Result #2: ${results[1]}`)
    performance.measure('Start to end', 'start')

})