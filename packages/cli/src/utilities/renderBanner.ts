import { render } from 'ink'
import React from 'react'
import Banner from '../components/Banner.js'

export function renderBanner(): void {
    const { unmount } = render(React.createElement(Banner))
    unmount()
}
