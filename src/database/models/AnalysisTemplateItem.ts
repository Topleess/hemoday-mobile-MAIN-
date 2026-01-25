import { Model } from '@nozbe/watermelondb';
import { text, relation } from '@nozbe/watermelondb/decorators';
import type { Relation } from '@nozbe/watermelondb';
import type AnalysisTemplate from './AnalysisTemplate';

export default class AnalysisTemplateItem extends Model {
    static table = 'analysis_template_items';
    static associations = {
        analysis_templates: { type: 'belongs_to', key: 'template_id' },
    } as any;

    @text('template_id') templateId!: string;
    @text('name') name!: string;
    @text('unit') unit!: string;

    @relation('analysis_templates', 'template_id') template!: Relation<AnalysisTemplate>;
}
