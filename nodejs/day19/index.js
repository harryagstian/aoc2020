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
let ruleMode = true

let messages = []
let rules = new Map()

let memoization = new Map()

let part = 2

lineStream.on('line', (line) => {
    if (line === "") {
        ruleMode = false
        return
    }

    if (ruleMode) {
        line = line.replace(/\"/g, "").split(': ')
        let key = line.shift()
        let value = line.shift()
        // let value = line.shift().split(' | ')
        if(part === 2 && key == 8){
            value = '42+'
        }else if(part === 2 && key == 11){
            value = '42+ 31+' // might not be correct if the input for 42's and 31's is not equal, since the original rule state that number of 42's must equal to number of 31's item
        }
        let last = (value.includes('a') || value.includes('b')) ? true : false

        if (last) {
            // value = value.shift()
            memoization.set(key, value)
        }else{

            rules.set(key, value)
        }
    } else {
        messages.push(line)
    }
})


lineStream.on('close', () => {
    let rulesCp
    let memoizationCp

    while (rules.size > 0) {
        rulesCp = _.cloneDeep(rules)
        memoizationCp = new Map()

        for (const keyRule of rules.keys()) {
            for (const [key, value] of memoization.entries()) {

                if (keyRule !== key) {
                    let r = new RegExp(`\\b${key}\\b`, 'g')
                    // console.log(r)
                    // console.log(rulesCp, keyRule)
                    rulesCp.set(keyRule, rulesCp.get(keyRule).replace(r, value))

                }
            }
            
            if (/^[^\d]*$/g.test(rulesCp.get(keyRule))) { // if lines only does not contains digit
                let finalValue = `(${rulesCp.get(keyRule).replace(/ /g, "")})`
                rulesCp.delete(keyRule)
                memoizationCp.set(keyRule, finalValue)
            }
        }

        rules = _.cloneDeep(rulesCp)
        memoization = _.cloneDeep(memoizationCp)
        // console.log('memoization', memoization)
        // console.log('rules', rules)
        // console.log(rules.size)
    }

    // console.log(rules, messages)
    // console.log(memoization)

    let regexRule = new RegExp(`^${memoization.get('0')}$`)
    
    for(const m of messages){
        if(regexRule.test(m)){
            // console.log(m)
            results[0]++
        }
    }

    console.log(`Result #${part}: ${results[0]}`)

    performance.mark('end')
    performance.measure('Start to end', 'start', 'end')
})