import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class Transfusion extends Model {
    static table = 'transfusions'

    @text('date') date!: string
    @field('volume') volume!: number
    @field('weight') weight!: number
    @field('volume_per_kg') volumePerKg!: number
    @field('hb_before') hbBefore!: number
    @field('hb_after') hbAfter!: number
    @field('delta_hb') deltaHb!: number
    @text('component') component?: string
    @text('chelator') chelator?: string
    @readonly @date('created_at') createdAt!: number
    @readonly @date('updated_at') updatedAt!: number
}
