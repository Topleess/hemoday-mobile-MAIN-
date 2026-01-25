import { Model } from '@nozbe/watermelondb';
import { text, field } from '@nozbe/watermelondb/decorators';

export default class ComponentType extends Model {
    static table = 'component_types';

    @text('name') name!: string;
    @text('icon_name') iconName!: string;
    @field('is_default') isDefault!: boolean;
    @field('sort_order') sortOrder!: number;
}
