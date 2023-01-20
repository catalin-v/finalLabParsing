// const a = require('./input.in')
var fs = require('fs')
const data = fs.readFileSync('./inputLab5.in',
{encoding:'utf8', flag:'r'})
// console.log(data)
var _ = require('lodash')
const util = require('util')

// var treeify = require('treeify')



let [nonterminals, terminals, productions, initialStates, finalStates] = data.split('\n')

const text = `Select Option:
  0: exit
  1: see nonterminals
  2: see terminals
  3: see prductions
  4: see production for given nonterminal
  5: CFG check\n
`

const ask = function(q){
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })

  var response;

  readline.setPrompt(q);
  readline.prompt();

  return new Promise(( resolve , reject) => {

      readline.on('line', (userInput) => {
          response = userInput;
          readline.close();
      });

      readline.on('close', () => {
          resolve(response);
      });

  });
} 

const cfgCheck = (productions, nonterminals) => productions.every(prod => nonterminals.indexOf(prod.split(':=')[0]) !== -1)

const againLogic = (seq) => {
  const result = productions.split(',').filter(prod => prod.indexOf(seq) === 0)
  console.log()
  result.forEach(res => console.log(res))
  console.log()
}

const logic = (option) => {
  option = Number(option)
  switch (option) {
    case 0:
      console.log('END')
      return false
    case 1:
      console.log(nonterminals)
      break
    case 2:
      console.log(terminals.split('|').join(','))
      break
    case 3:
      console.log(productions.replace(/,/g, '\n'))
      break;
    case 4:
      return 'some more logic required'
      break;
    case 5:
      // console.log()
      productions.split(',').every(prod => {
        console.log(nonterminals.indexOf(prod.split(':=')[0]), prod.split(':=')[0], nonterminals)
        return nonterminals.indexOf(prod.split(':=')[0]) !== -1
      })
      console.log(cfgCheck(productions.split(','), nonterminals) ? 'It is\n' : 'it is not \n')
      
      break;
    default:
      console.log(`Bad input\n`)
  }
  console.log('\n')
  return true

}

const otherLogicMenu = () => {
  ask('What is the nonterminal?\n').then(nonterminal => {
    againLogic(nonterminal)
  })
  .then(menu)
}

const menu = () => {
  ask(text).then(res => {
    if (typeof logic(res) === 'string') otherLogicMenu()
      else if (logic(res)) menu()
        else console.log('ended')
  })
}

// menu()
// example of stmt
// assignment:= identifier "=" const

// const stnr = 'assignment:= identifier "=" const'

let prods = 's:=S,S:=aA,A:=bA,A:=c'
let prod2 = `Program ::= "BOF" stmtlist "EOF"
stmtlist ::= stmt | "{" multiStmt "}"
stmt ::= simplstmt | structstmt | declaration
simplstmt ::= assignstmt | iostmt
structstmt ::= ifstmt | whilestmt
declaration ::= "def" identifier | "def" array | declaration , (identifier | array)
identifier ::= letter | identifierletter | identifierdigit
letter ::= a | b | c | d | e | f | g | h | i | j | k | l | m | n | o | p | q | r | s | t | u | v | w | x | y | z | A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X | Y | Z
number ::= nonzero | number digit
nonzero ::= 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
zero ::= 0
digir ::= nonzero " zero
array ::= "[" identifierList "]"
identifierList ::= identifier | identifierList, identifier
assignstmt ::= identifier "is" expression
expression ::= expression "plus" term | expression "minus" term | term 
term ::= term "or" factor | term "dividedBy" factor | factor
factor ::= "(" expression ")" | identifier | 
constant ::= number | string
iostmt ::= screen.get(identifierList) | screen.write(identifierList)"
ifstmt ::= "IF" condition stmtlist ["ELSE" stmtlist]
whilestmt ::= “as” condition stmtlist
condition ::= expression RELATION expression | condition and condition | condition or condition | not condition
RELATION ::= "<" | "<=" | "=" | "<>" | ">=" | ">"
multiStmt ::= stmt | stmt stmt`

// terminals = 'def BOF EOF if then else screen is plus minus dividedBy or < <= > >= ='.split(' ') //['a', 'b', 'c']
// nonterminals = []// ['s', 'S', 'A']
terminals = ['a', 'b', 'c']
nonterminals = ['s', 'S', 'A']
// prod2.replace(/"/ig, '').split('\n').map(trans => trans.split('::=')).forEach(asd => nonterminals.push(asd[0].trim()))
let structuredProductions = []

const structuredProductions1 = prods.split(',').map(production => production.split(':=')).map(([l, r]) => ([l, r.split('|')]))//.map(([l, r], index) => [l, r])
structuredProductions1.forEach(([l, r]) => {
 r.forEach(rSide => structuredProductions.push([l, rSide.split('')]))
})

// custom gramar construct
const strProd2 = prod2.replace(/"/ig, '').split('\n').map(trans => trans.split('::=')).map(([l, r]) => ([l, r.split('|')]))
strProd2.forEach(([l, r]) => {
  r.forEach(rSide => structuredProductions.push([l.trim(), rSide.trim().split(' ')]))
})

// console.log(nonterminals)
const asd = [ '">"' ]
// console.log(asd.map(str => {
//   console.log((str[0] === str[str.length - 1]) && (str[0] === '"'), str[0], str[str.length - 1], "\"")
//   return (str[0] === str[str.length - 1]) && (str[0] === '"') ? str.slice(1, -1) : str
// }))
const current = [{
  prod: structuredProductions[0],
  pointPos: 0
}]

// let a = 'a'
// for (i = 0; i < 26; i++) {
//   a += ' | ' + String.fromCharCode(65 + i)
// }
// console.log(a)
// console.log(structuredProductions)
let wasThere = 0
const closured = []
const closure = (productions) => {
  const newProds = []
  // console.log(productions)
  productions.forEach(structuredProd => {
    const rightSide = structuredProd.prod[1]

    // skip if all the string has been parsed (paint already at the end)
    if (structuredProd.pointPos === rightSide.length) return
    const char = rightSide[structuredProd.pointPos] ///     cahnge to split with space after

    // if a nonterminal skip
    console.log(nonterminals.indexOf(char), char)
    if (nonterminals.indexOf(char) === -1) return
    console.log('found')

    // skip if production was already processed
    if (closured.some(prod => prod.prod === structuredProd.prod && prod.pointPos === structuredProd.pointPos)) return

    // add to the list of processed closures
    closured.push({
      prod: structuredProd.prod,
      pointPos: structuredProd.pointPos
    })
    structuredProductions.forEach(structuredProd2 => {
      // check if production is not already in the result
      const uniq = !newProds.some(nextEl => structuredProd2 == nextEl.prod && nextEl.pointPos == 0)
      console.log(structuredProd2[0], structuredProd2[0] === char, uniq)
      if (structuredProd2[0] === char && uniq) {
        console.log('added')
        newProds.push({
          prod: structuredProd2,
          pointPos: 0
        })
      }
    })
  })

  return [...productions, ...newProds]
}

const goTo = (productions, char) => {
  const newProds = []
  productions.forEach(production => {
    const rightSide = production.prod[1]
    // skip if all the string has been parsed (paint already at the end)
    if (production.pointPos === rightSide.length) return 
    // skip if the current chat is not the goto one
    // console.log(rightSide[production.pointPos], char, rightSide[production.pointPos] !== char)
    if (rightSide[production.pointPos] !== char) return
    // console.log('finds')
    newProds.push({
      prod: production.prod,
      pointPos: production.pointPos + 1
    })
  })
  return closure(newProds)
}

states = []
const doneOperations = {}
const stateTypes = {}
const stateParseTable = {}

const getStateType = (state) => {
  // console.log(state)
  if (state.some(prod => prod.pointPos < prod.prod[1].length)) return 'shift'

  if (state.some(prod => prod.pointPos === prod.prod[1].length && prod.prod[1][prod.pointPos - 1] !== 'S')) {
    const prod = state.find(prod => 
      prod.pointPos === prod.prod[1].length && prod.prod[1][prod.pointPos - 1] !== 'S'
    )
    // console.log(structuredProductions, '||', prod, ';;;;;;;;;;;;')
    const prodIndex = structuredProductions.findIndex(strProd => _.isEqual(strProd, prod.prod))
    return ['reduce', prodIndex]
  }

  if (state.some(prod =>  prod.pointPos === prod.prod[1].length && prod.prod[1][prod.pointPos - 1] === 'S')) return 'acc'

  return 'err'
}

const cannonicalCollection = (productions) => {
  let c = []
  initialState = closure(productions)
  let canonStates = [initialState]
  states.push([..._.cloneDeep(initialState), `closere initial`])
  stateTypes[0] = getStateType(initialState)
  const alphabet = [...nonterminals, ...terminals]

  // for (let i = 0; i < 4; i++) {

  while (!_.isEqual(c, canonStates)) {
    c = _.cloneDeep(canonStates)
    // console.log('||', c, '|', canonStates)
    // newStates = []
    canonStates.forEach((currentState, index) => {
      alphabet.forEach(char => {
        if (doneOperations[`${index}-${char}`]) return
        // done operations marked
        doneOperations[`${index}-${char}`] = true
  
        const goToResult = goTo(_.cloneDeep(currentState), char)
        if (goToResult.length && goToResult !== currentState) {
          // console.log('found')
          let isNew = !stateParseTable[`${index}-${char}`]//!canonStates.some(canonState => _.isEqual(canonState, goToResult))
          
          if (isNew) {
            states.push([..._.cloneDeep(goToResult), `goto (${JSON.stringify(currentState)}, ${char}), ${getStateType(goToResult)}`])
            // console.log(filtered)
            // insert into state table - equal to table[S index][char] = S newIndex
            const isAlready = canonStates.findIndex(canonState => _.isEqual(canonState, goToResult))
            if (isAlready !== -1) {
              stateParseTable[`${index}-${char}`] =  isAlready
            } else {
              stateParseTable[`${index}-${char}`] = canonStates.length
              stateTypes[canonStates.length] = getStateType(goToResult)
              canonStates.push(goToResult)// = [...canonStates, ...filtered]
  
            }
          }
        }
      })
    })
    // console.log(c, canonStates)
  }
  return c
}

const parseAndCompute = (current1, input) => {
  let result = ''
  let current = _.cloneDeep(current1)

  for (let i = 0; i < 9; i++) {
    const lastState = current[current.length - 1] // just -1
    const gotoTableValue = stateParseTable[`${lastState}-${input[0]}`]
    const currentState = stateTypes[lastState]
    // console.log(currentState, gotoTableValue, `${lastState}-${input[0]}`)

    if (currentState === 'shift' && gotoTableValue) {
      current = [...current, input.shift(), gotoTableValue]
      // console.log('shufted')
    }
  
    if (Array.isArray(currentState)) {
      result = [currentState[1], ...result]
      const reduceProd = structuredProductions[currentState[1]]
  
      let leastExistingIndex = reduceProd[1].length
      while (leastExistingIndex) {
        if (reduceProd[1][leastExistingIndex - 1] === current.pop()) leastExistingIndex--
      }
  
      const newA = reduceProd[0]
      const newS = stateParseTable[`${current[current.length - 1]}-${newA}`]
      // console.log('reduced', reduceProd, current[current.length - 1])
      current = [...current, newA, newS]
    }
  
    if (currentState === 'acc') {
      // console.log('accepted')
      return result
    }
    // console.log(current, input)
  }
  return result
}

const buildTree = (transformation, productions) => {
  const buildChildren = (nodes) => nodes.map(node => ({ nodeChar: node, children: [] }))
  const addProduction = (tree, transIndex) => 
    tree && tree.nodeChar === productions[transIndex][0] && !tree.children.length 
      ? tree.children = buildChildren(productions[transIndex][1])
      : tree.children.forEach(child => addProduction(child, transIndex))
    

  const firstTransformationIndex = transformation[0]
  const rootProd = productions[firstTransformationIndex]
  const tree = {
    nodeChar: rootProd[0],
    children: buildChildren(rootProd[1])
  }

  transformation.slice(1).forEach(transIndex => addProduction(tree, transIndex))

  return tree
}


//  current = S -> aA
// console.log(current)
const cannonicalCollectionValue = cannonicalCollection(current)
console.log(util.inspect(states, false, null, true /* enable colors */))
const transformations = parseAndCompute(['$', 0], ['a', 'b', 'b', 'c', '$'])
// // console.log(transformations)

// console.log(structuredProductions)
const tree = buildTree(transformations, structuredProductions)
console.log(util.inspect(tree, false, null, true /* enable colors */))

// const getStringFromTree = (tree) => !tree.children.length ? tree.nodeChar : tree.children.map(child => getStringFromTree(child)).join('')

// console.log(getStringFromTree(tree))