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
let stacks = {}
let flatStacks = {}

lineStream.on('line', (line) => {
    let [container, content] = line.split('contain')

    // container 

    container = container.trim().split(' ')

    container = `${container[0]} ${container[1]}`

    // content

    content = content.trim()

    content = content.split(',')

    let rule = /(\d) (\w*) (\w*) (\w*)/

    let newContentStacks = []
    let newContentFlatStacks = []

    content.forEach(element => {
        let temp = rule.exec(element)
        let bagName = null
        let bagQuantity = null
        // [ '2 vibrant plum bags', '2', 'vibrant', 'plum', 'bags', index: 0, input: '2 vibrant plum bags.', groups: undefined ]

        if (temp !== null) { // no other bag
            bagName = `${temp[2]} ${temp[3]}`
            bagQuantity = parseInt(temp[1])
            newContentFlatStacks.push(bagName)
        } else {
            newContentFlatStacks = null
        }
        newContentStacks.push({
            bag: bagName,
            quantity: bagQuantity
        })


    })

    // add to stacks

    stacks[container] = newContentStacks
    flatStacks[container] = newContentFlatStacks
})


let traverse = (bag, parentValue) => {
    results[1] += parentValue // add every parentValue to results
    let current = stacks[bag] // current holds bags content for given bag string. since the input is complete (no missing bags reference), there's no case for current = undefined
    
    for (let i = 0; i < current.length; i++) { // loop through current bags content
        if (current[i].bag !== null) {  // if current bags content is not null
            traverse(current[i].bag, parentValue * current[i].quantity) // recursively check for bags content with given bag string
        }
    }
}


lineStream.on('close', () => {
    // console.log(stacks)

    // part 1 - traverse down to top
    let bags = _.pickBy(flatStacks, (element) => { return element !== null && element.includes('shiny gold') }) // get bags that has shiny gold 
    bags = Object.keys(bags)

    let allBags = []
    while (!_.isEmpty(bags)) { // while bags is not empty
        let newItem = bags.pop() // take last item from bags
        allBags.push(newItem) // push it to all bags 

        let filteredBags = _.pickBy(flatStacks, (element) => { return element !== null && element.includes(newItem) }) // get bags that has newItem
        bags = bags.concat(Object.keys(filteredBags)) // concat old bags with new filtered bags value
    }

    let distinctBags = new Set(allBags) // remove duplicate from all bags

    console.log(`Result #1: ${distinctBags.size}`)

    // part 2
    results[1] -= 1 // offset count for shiny gold bag since it doesnt need to be counted
    traverse('shiny gold', 1)

    console.log(`Result #2: ${results[1]}`)
    performance.measure('Start to end', 'start')
})