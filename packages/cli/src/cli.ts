#!/usr/bin/env node
import 'dotenv/config'
import { render } from 'ink'
import React from 'react'
import Init from './components/Init.js'

const command = process.argv[2]
const projectNameArg = process.argv[3]

if (command === 'init') {
    render(React.createElement(Init, { projectName: projectNameArg }))
} else {
    console.log('Usage: regressionproof <command>')
    console.log('')
    console.log('Commands:')
    console.log('  init [projectName]    Initialize a new project')
    process.exit(1)
}
