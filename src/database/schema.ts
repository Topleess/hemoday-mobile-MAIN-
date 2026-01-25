import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const mySchema = appSchema({
    version: 7,
    tables: [
        tableSchema({
            name: 'transfusions',
            columns: [
                { name: 'date', type: 'string' },
                { name: 'component', type: 'string', isOptional: true },
                { name: 'volume', type: 'number' },
                { name: 'weight', type: 'number' },
                { name: 'volume_per_kg', type: 'number' },
                { name: 'hb_before', type: 'number' },
                { name: 'hb_after', type: 'number' },
                { name: 'delta_hb', type: 'number' },
                { name: 'chelator', type: 'string', isOptional: true },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ]
        }),
        tableSchema({
            name: 'analyses',
            columns: [
                { name: 'name', type: 'string' },
                { name: 'date', type: 'string' },
                { name: 'template_name', type: 'string', isOptional: true },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ]
        }),
        tableSchema({
            name: 'analysis_items',
            columns: [
                { name: 'analysis_id', type: 'string', isIndexed: true },
                { name: 'name', type: 'string' },
                { name: 'value', type: 'string' },
                { name: 'unit', type: 'string' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ]
        }),
        tableSchema({
            name: 'reminders',
            columns: [
                { name: 'title', type: 'string' },
                { name: 'date', type: 'string' },
                { name: 'time', type: 'string' },
                { name: 'repeat', type: 'string' },
                { name: 'note', type: 'string', isOptional: true },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ]
        }),
        tableSchema({
            name: 'component_types',
            columns: [
                { name: 'name', type: 'string' },
                { name: 'icon_name', type: 'string' },
                { name: 'is_default', type: 'boolean' },
                { name: 'sort_order', type: 'number' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ]
        }),
        tableSchema({
            name: 'chelator_types',
            columns: [
                { name: 'name', type: 'string' },
                { name: 'is_default', type: 'boolean' },
                { name: 'sort_order', type: 'number' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ]
        }),
        tableSchema({
            name: 'analysis_templates',
            columns: [
                { name: 'name', type: 'string' },
                { name: 'is_default', type: 'boolean' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ]
        }),
        tableSchema({
            name: 'analysis_template_items',
            columns: [
                { name: 'template_id', type: 'string', isIndexed: true },
                { name: 'name', type: 'string' },
                { name: 'unit', type: 'string' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ]
        }),
    ]
})
