import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class Reminder extends Model {
    static table = 'reminders'

    @text('title') title!: string
    @text('date') date!: string
    @text('time') time!: string
    @text('repeat') repeat!: string
    @text('note') note?: string
    @readonly @date('created_at') createdAt!: number
    @readonly @date('updated_at') updatedAt!: number
}
