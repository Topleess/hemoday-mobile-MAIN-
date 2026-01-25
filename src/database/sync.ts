import { synchronize } from '@nozbe/watermelondb/sync'
import { database } from './index'
import api from '../utils/api'

export async function sync() {
    await synchronize({
        database,
        pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
            const response = await api.get('/sync', {
                params: {
                    last_pulled_at: lastPulledAt,
                    schema_version: schemaVersion,
                    // migration: JSON.stringify(migration) // Not using complex migrations yet
                }
            })

            const { changes, timestamp } = response.data
            return { changes, timestamp }
        },
        pushChanges: async ({ changes, lastPulledAt }) => {
            await api.post('/sync', {
                changes,
                last_pulled_at: lastPulledAt,
            })
        },
        migrationsEnabledAtVersion: 6, // Start tracking migrations from v6
    })
}
