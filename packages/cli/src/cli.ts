#!/usr/bin/env node
import 'dotenv/config'
import { render } from 'ink'
import React from 'react'
import Init from './components/Init.js'

const command = process.argv[2]

if (command === 'init') {
    render(React.createElement(Init))
} else {
    console.log('Usage: regressionproof <command>')
    console.log('')
    console.log('Commands:')
    console.log('  init    Initialize a new project')
    process.exit(1)
}
