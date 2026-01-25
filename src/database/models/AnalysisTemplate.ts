import { Model } from '@nozbe/watermelondb';
import { text, children, field } from '@nozbe/watermelondb/decorators';
import type { Query } from '@nozbe/watermelondb';
import type AnalysisTemplateItem from './AnalysisTemplateItem';

export default class AnalysisTemplate extends Model {
    static table = 'analysis_templates';
    static associations = {
        analysis_template_items: { type: 'has_many', foreignKey: 'template_id' },
    } as any;

    @text('name') name!: string;
    @field('is_default') isDefault!: boolean;
    @children('analysis_template_items') items!: Query<AnalysisTemplateItem>;
}
