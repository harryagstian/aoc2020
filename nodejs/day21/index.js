const fs = require('fs')
const _ = require('lodash')
const assert = require('assert')
Error.stackTraceLimit = 2;

const main = (runSample) => {
    console.time("runtime")

    let inputFile = __dirname
    inputFile += (runSample) ? '/input.txt' : '/sample.txt'
    console.log(`Reading file ${inputFile}`)

    const text = fs.readFileSync(inputFile).toString().split("\n")

    // each lines guaranteed to have at least 1 (contains)

    let allListedAllergens = []
    let allListedIngredients = [] // 
    const rawData = text.map(item => {
        const rules = /(.*)\(contains(.*)\)/g
        let [, i, a] = rules.exec(item) // all match, ingredients, allergens

        i = i.trim().split(' ')
        a = a.trim().replace(/ /g, '').split(',')

        allListedAllergens = allListedAllergens.concat(a)
        allListedIngredients = allListedIngredients.concat(i)
        return [i, a]
    })

    // console.log(rawData)

    // for each listed allergen, one of the ingredients listed on same line is GUARANTEED to have the allergen

    const ingredientsToAllergenMapping = {}

    const guaranteedAllergens = new Set()

    for (let i = 0; i < rawData.length; i++) {
        const [ingredients, allergens] = rawData[i]
        for (let j = 0; j < allergens.length; j++) {
            const allergen = allergens[j]
            if (ingredientsToAllergenMapping[allergen] === undefined) {
                ingredientsToAllergenMapping[allergen] = ingredients
            } else {
                ingredientsToAllergenMapping[allergen] = _.intersection(ingredientsToAllergenMapping[allergen], ingredients) // ingredientsToAllergenMapping[allergen].filter(i => ingredients.includes(i))
            }

            if (ingredientsToAllergenMapping[allergen].length === 1) {
                guaranteedAllergens.add(...ingredientsToAllergenMapping[allergen])
            }
        }
    }

    let stacks = [...guaranteedAllergens]

    while (stacks.length > 0) {
        const currentAllergen = stacks.shift()
        for (const [key, value] of Object.entries(ingredientsToAllergenMapping)) {
            if (value.length > 1) {
                ingredientsToAllergenMapping[key] = _.remove(value, i => i !== currentAllergen)
                if(ingredientsToAllergenMapping[key].length === 1){
                    stacks.push(...ingredientsToAllergenMapping[key])
                    guaranteedAllergens.add(...ingredientsToAllergenMapping[key])
                } 
            }
        }
    }
    
    const results = [1, 0]

    // part 1

    results[0] = _.without(allListedIngredients, ...guaranteedAllergens).length

    console.log(`Part 1 solution: ${results[0]}`)

    // part 2

    const sortedAllergen = Object.keys(ingredientsToAllergenMapping).sort()

    results[1] = sortedAllergen.map(key => ingredientsToAllergenMapping[key][0]).join(',')

    console.log(`Part 2 solution: ${results[1]}`)

    console.timeEnd("runtime")
}

const args = process.argv.slice(2)

main(args.includes('input')) // run sample by default. to run with input, do node index input
