import { Database } from '@nozbe/watermelondb'
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs'
import { schemaMigrations, addColumns } from '@nozbe/watermelondb/Schema/migrations'

import { mySchema } from './schema'
import Transfusion from './models/Transfusion'
import Analysis from './models/Analysis'
import AnalysisItem from './models/AnalysisItem'
import Reminder from './models/Reminder'
import ComponentType from './models/ComponentType'
import ChelatorType from './models/ChelatorType'
import AnalysisTemplate from './models/AnalysisTemplate'
import AnalysisTemplateItem from './models/AnalysisTemplateItem'

const adapter = new LokiJSAdapter({
    schema: mySchema,
    migrations: schemaMigrations({
        migrations: [
            {
                toVersion: 4,
                steps: [],
            },
            {
                toVersion: 5,
                steps: [],
            },
            {
                toVersion: 6,
                steps: [],
            },
            {
                toVersion: 7,
                steps: [
                    addColumns({
                        table: 'analysis_templates',
                        columns: [
                            { name: 'is_default', type: 'boolean' },
                        ],
                    }),
                ],
            },
        ],
    }),
    // (You might want to comment out the following line for production to persist data to IndexedDB)
    useWebWorker: false,
    useIncrementalIndexedDB: false,
    // dbName: 'hemoday_db', // optional
    onSetUpError: error => {
        // Database failed to load -- offer the user to reload the app or log out
        console.error('Database failed to load', error)
    }
})

export const database = new Database({
    adapter,
    modelClasses: [
        Transfusion,
        Analysis,
        AnalysisItem,
        Reminder,
        ComponentType,
        ChelatorType,
        AnalysisTemplate,
        AnalysisTemplateItem,
    ],
})
