import { Model, Relation } from '@nozbe/watermelondb'
import { field, date, readonly, text, relation } from '@nozbe/watermelondb/decorators'
import Analysis from './Analysis'

export default class AnalysisItem extends Model {
    static table = 'analysis_items'
    static associations = {
        analyses: { type: 'belongs_to', key: 'analysis_id' },
    } as const


    @relation('analyses', 'analysis_id') analysis!: Relation<Analysis>
    @text('name') name!: string
    @text('value') value!: string
    @text('unit') unit!: string
    @readonly @date('created_at') createdAt!: number
    @readonly @date('updated_at') updatedAt!: number
}
