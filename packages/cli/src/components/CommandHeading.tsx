import { Text } from 'ink'
import React from 'react'

export default function CommandHeading(props: Props): React.ReactElement {
    return <Text bold>{props.heading}</Text>
}

interface Props {
    heading: string
}
