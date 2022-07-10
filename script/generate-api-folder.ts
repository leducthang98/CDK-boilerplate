import * as fs from 'fs-extra'
import * as moment from 'moment'

let type = ''
let apiName = ''

const args = process.argv[process.argv.length - 1].split(':')

type = args[0].toLowerCase()
type = type.charAt(0).toUpperCase() + type.slice(1);
apiName = args[1]

if (!(type === 'Query' || type === 'Mutation')) {
  throw new Error('Invalid params')
}

let data = `{
  "name": "${apiName}",
  "type": "${type}",
  "createdAt": ${moment.utc().valueOf()}
}`

fs.mkdirSync(`src/lambdas/${type}/${apiName}`)
fs.createFileSync(`src/lambdas/${type}/${apiName}/index.ts`)
fs.writeFileSync(`src/lambdas/${type}/${apiName}/setting.json`, data)