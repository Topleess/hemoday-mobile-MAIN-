import { Model } from '@nozbe/watermelondb';
import { text, field } from '@nozbe/watermelondb/decorators';

export default class ChelatorType extends Model {
    static table = 'chelator_types';

    @text('name') name!: string;
    @field('is_default') isDefault!: boolean;
    @field('sort_order') sortOrder!: number;
}
