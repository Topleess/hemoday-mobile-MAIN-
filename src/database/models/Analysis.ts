import { Model, Query } from '@nozbe/watermelondb'
import { field, date, readonly, text, children } from '@nozbe/watermelondb/decorators'
import AnalysisItem from './AnalysisItem'

export default class Analysis extends Model {
    static table = 'analyses'
    static associations = {
        analysis_items: { type: 'has_many', foreignKey: 'analysis_id' },
    } as const


    @text('name') name!: string
    @text('date') date!: string
    @text('template_name') templateName?: string
    @children('analysis_items') items!: Query<AnalysisItem>
    @readonly @date('created_at') createdAt!: number
    @readonly @date('updated_at') updatedAt!: number
}
