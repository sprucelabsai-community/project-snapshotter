import { Box, Text } from 'ink'
import BigText from 'ink-big-text'
import React from 'react'
import type { DoctorResult } from '../doctor/DoctorResult.js'

class DoctorComponent extends React.Component<Props> {
    public render(): React.ReactElement {
        return (
            <Box flexDirection="column">
                <Box flexDirection="column" padding={1}>
                    <BigText
                        text="regressionproof.ai"
                        font="tiny"
                        colors={['magenta', 'cyan']}
                    />
                    <Text color="gray">
                        Teaching LLMs to write better code.
                    </Text>
                </Box>
                <Box flexDirection="column" paddingX={1} paddingBottom={1}>
                    <Text bold>RegressionProof Doctor</Text>
                    {this.props.results.map((result) => (
                        <Box key={result.name} flexDirection="column">
                            <Box>
                                <Text color={this.colorFor(result.status)}>
                                    {this.labelFor(result.status)}
                                </Text>
                                <Text> {result.name}</Text>
                            </Box>
                            {result.details.map((detail) => (
                                <Text key={detail}> {detail}</Text>
                            ))}
                            {result.fix ? (
                                <Text> Fix: {result.fix}</Text>
                            ) : null}
                            <Text> </Text>
                        </Box>
                    ))}
                </Box>
            </Box>
        )
    }

    private labelFor(status: DoctorResult['status']): string {
        switch (status) {
            case 'ok':
                return 'OK'
            case 'warn':
                return 'WARN'
            case 'fail':
                return 'FAIL'
        }
    }

    private colorFor(
        status: DoctorResult['status']
    ): 'green' | 'yellow' | 'red' {
        switch (status) {
            case 'ok':
                return 'green'
            case 'warn':
                return 'yellow'
            case 'fail':
                return 'red'
        }
    }
}

export default function Doctor(props: Props): React.ReactElement {
    return <DoctorComponent results={props.results} />
}

interface Props {
    results: DoctorResult[]
}
