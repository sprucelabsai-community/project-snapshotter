import { execSync } from 'child_process'
import RegressionProofClient from '@regressionproof/client'
import { Box, Text } from 'ink'
import BigText from 'ink-big-text'
import TextInput from 'ink-text-input'
import React, { useEffect, useState } from 'react'

const API_URL =
    process.env.REGRESSIONPROOF_API_URL ?? 'https://api.regressionproof.ai'

function getRepoName(): string {
    try {
        const remoteUrl = execSync('git remote get-url origin', {
            encoding: 'utf-8',
        }).trim()
        // Handle both SSH and HTTPS formats
        // git@github.com:user/repo.git -> repo
        // https://github.com/user/repo.git -> repo
        const match = remoteUrl.match(/[/:]([^/:]+?)(\.git)?$/)
        return match?.[1] ?? ''
    } catch {
        return ''
    }
}

export default function Init(): React.ReactElement {
    const [name, setName] = useState(getRepoName)
    const [availability, setAvailability] = useState<
        'idle' | 'checking' | 'available' | 'taken' | 'error'
    >('idle')
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        if (name.length < 3) {
            setAvailability('idle')
            setErrorMessage('')
            return
        }

        setAvailability('checking')
        const timeout = setTimeout(async () => {
            try {
                const client = new RegressionProofClient(API_URL)
                const isAvailable = await client.checkNameAvailability(name)
                setAvailability(isAvailable ? 'available' : 'taken')
                setErrorMessage('')
            } catch (err) {
                setAvailability('error')
                setErrorMessage(err instanceof Error ? err.message : String(err))
            }
        }, 300)

        return () => clearTimeout(timeout)
    }, [name])

    const getStatusIndicator = () => {
        switch (availability) {
            case 'idle':
                return null
            case 'checking':
                return <Text color="yellow">⏳ Checking...</Text>
            case 'available':
                return <Text color="green">✓ Available</Text>
            case 'taken':
                return <Text color="red">✗ Already taken</Text>
            case 'error':
                return <Text color="red">⚠ {errorMessage}</Text>
        }
    }

    return (
        <Box flexDirection="column" padding={1}>
            <BigText
                text="regressionproof"
                font="tiny"
                colors={['magenta', 'cyan']}
            />
            <Text color="gray">Teaching LLM's to write better code.</Text>

            <Box marginTop={1} flexDirection="column">
                <Text bold>Project name:</Text>
                <Box>
                    <TextInput
                        value={name}
                        onChange={setName}
                        placeholder="my-awesome-project"
                    />
                    <Box marginLeft={2}>{getStatusIndicator()}</Box>
                </Box>
                {name.length > 0 && name.length < 3 && (
                    <Text color="gray">Name must be at least 3 characters</Text>
                )}
            </Box>
        </Box>
    )
}
