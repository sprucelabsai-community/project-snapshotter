import { Box } from 'ink'
import React from 'react'
import CommandHeading from './CommandHeading.js'

export default function CommandLayout(props: Props): React.ReactElement {
    return (
        <Box flexDirection="column" paddingX={1} paddingBottom={1}>
            <CommandHeading heading={props.heading} />
            <Box marginTop={1}>{props.children}</Box>
        </Box>
    )
}

interface Props {
    heading: string
    children?: React.ReactNode
}
