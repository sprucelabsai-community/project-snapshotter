import { Box, Text } from 'ink'
import BigText from 'ink-big-text'
import React from 'react'
import { getCliVersion } from '../utilities/version.js'

export default function Banner(): React.ReactElement {
    const version = getCliVersion()

    return (
        <Box flexDirection="column" padding={1}>
            <BigText
                text="regressionproof.ai"
                font="tiny"
                colors={['magenta', 'cyan']}
            />
            <Text color="gray">Teaching LLMs to write better code.</Text>
            <Text color="gray">CLI v{version}</Text>
        </Box>
    )
}
