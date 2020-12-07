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
let stacks = {}

lineStream.on('line', (line) => {
    let [container, content] = line.split('contain')

    // container 

    container = container.trim().split(' ')

    container = `${container[0]} ${container[1]}`

    // content

    content = content.trim()

    content = content.split(',')

    let rule = /(\d) (\w*) (\w*) (\w*)/

    let newContent = []

    content.forEach(element => {
        let temp = rule.exec(element)

        // [ '2 vibrant plum bags', '2', 'vibrant', 'plum', 'bags', index: 0, input: '2 vibrant plum bags.', groups: undefined ]

        if (temp === null) { // no other bag
            newContent = null
        } else {
            newContent.push(`${temp[2]} ${temp[3]}`)
        }
    })

    // add to stacks

    stacks[container] = newContent

})


lineStream.on('close', () => {

    let bags = _.pickBy(stacks, (element) => { return element !== null && element.includes('shiny gold') })
    bags = Object.keys(bags)
    
    let allBags = []
    while (!_.isEmpty(bags)) {
        console.log(bags)
        let newItem = bags.pop()
        allBags.push(newItem)

        let filteredBags = _.pickBy(stacks, (element) => { return element !== null && element.includes(newItem) })
        bags = bags.concat(Object.keys(filteredBags))
    }

    let distinctBags = new Set(allBags)
    // console.log(distinctBags)
    // part 1
    console.log(`Result #1: ${distinctBags.size}`)

    // part 2
    console.log(`Result #1: ${results[1]}`)
    
})