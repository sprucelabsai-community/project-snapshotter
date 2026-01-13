export default class LocalConfigUpgrader {
    private currentVersion: string

    public constructor(currentVersion: string) {
        this.currentVersion = currentVersion
    }

    public upgrade(
        existing: LocalConfig | null,
        desired: LocalConfig
    ): UpgradeResult {
        const starting = existing ?? { ...desired, version: '0.0.0' }
        const migrated = this.applyMigrations(starting, desired)
        const finalConfig: LocalConfig = {
            ...migrated,
            projectName: desired.projectName,
            remote: desired.remote,
            version: this.currentVersion,
        }
        return {
            config: finalConfig,
            shouldWrite: !this.isEquivalent(existing, finalConfig),
        }
    }

    private applyMigrations(
        config: LocalConfig,
        desired: LocalConfig
    ): LocalConfig {
        let current = config
        for (const migration of this.getMigrations()) {
            if (
                compareVersions(current.version, migration.toVersion) < 0 &&
                compareVersions(this.currentVersion, migration.toVersion) >= 0
            ) {
                current = migration.run(current, desired)
                current = { ...current, version: migration.toVersion }
            }
        }
        return current
    }

    private getMigrations(): Migration[] {
        return []
    }

    private isEquivalent(
        existing: LocalConfig | null,
        next: LocalConfig
    ): boolean {
        if (!existing) {
            return false
        }

        return (
            existing.version === next.version &&
            existing.projectName === next.projectName &&
            existing.remote?.url === next.remote.url
        )
    }
}

function compareVersions(left: string, right: string): number {
    const leftParts = normalizeVersion(left).split('.').map(Number)
    const rightParts = normalizeVersion(right).split('.').map(Number)
    const maxLength = Math.max(leftParts.length, rightParts.length)

    for (let i = 0; i < maxLength; i += 1) {
        const leftPart = leftParts[i] ?? 0
        const rightPart = rightParts[i] ?? 0
        if (leftPart === rightPart) {
            continue
        }
        return leftPart > rightPart ? 1 : -1
    }

    return 0
}

function normalizeVersion(version: string): string {
    return version.split('-')[0] ?? version
}

interface Migration {
    toVersion: string
    run: (config: LocalConfig, desired: LocalConfig) => LocalConfig
}

export interface UpgradeResult {
    config: LocalConfig
    shouldWrite: boolean
}

export interface LocalConfig {
    version: string
    projectName: string
    remote: {
        url: string
    }
    [key: string]: unknown
}
