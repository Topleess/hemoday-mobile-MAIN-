import { database } from './index';
import ComponentType from './models/ComponentType';
import ChelatorType from './models/ChelatorType';
import AnalysisTemplate from './models/AnalysisTemplate';
import AnalysisTemplateItem from './models/AnalysisTemplateItem';

export async function seedDefaultData() {
    // Purge logic: Remove any records that have non-canonical IDs but are marked as default
    // This cleans up "ghost" duplicates from before the ID alignment fix.
    const canonicalComponentIds = ['comp_hb_01', 'comp_fe_01', 'comp_plt_01'];
    const canonicalChelatorIds = ['chel_none_01', 'chel_desf_01', 'chel_exja_01', 'chel_jade_01'];
    // Re-introducing fixed IDs for GLOBAL default templates
    const canonicalTemplateIds = ['tmpl_cbc_01', 'tmpl_biochem_01'];
    const canonicalTemplateItemIds = [
        'tmpl_item_hb_01', 'tmpl_item_ery_01', 'tmpl_item_leu_01', 'tmpl_item_plt_01',
        'tmpl_item_fer_01', 'tmpl_item_alt_01', 'tmpl_item_ast_01', 'tmpl_item_bil_01'
    ];

    await database.write(async () => {
        const allComponents = await database.get<ComponentType>('component_types').query().fetch();
        for (const ct of allComponents) {
            if (ct.isDefault && !canonicalComponentIds.includes(ct.id)) {
                await ct.markAsDeleted();
                await ct.destroyPermanently();
            }
        }

        const allChelators = await database.get<ChelatorType>('chelator_types').query().fetch();
        for (const ch of allChelators) {
            if (ch.isDefault && !canonicalChelatorIds.includes(ch.id)) {
                await ch.markAsDeleted();
                await ch.destroyPermanently();
            }
        }

        // Restore purge logic for default templates to ensure consistency
        const allTemplates = await database.get<AnalysisTemplate>('analysis_templates').query().fetch();
        for (const t of allTemplates) {
            if (t.isDefault && !canonicalTemplateIds.includes(t.id)) {
                await t.markAsDeleted();
                await t.destroyPermanently();
            }
        }

        const allTemplateItems = await database.get<AnalysisTemplateItem>('analysis_template_items').query().fetch();
        for (const ti of allTemplateItems) {
            if (!canonicalTemplateItemIds.includes(ti.id)) {
                const defaultItemNames = ['Гемоглобин', 'Эритроциты', 'Лейкоциты', 'Тромбоциты', 'Ферритин', 'АЛТ', 'АСТ', 'Билирубин общий'];
                if (defaultItemNames.includes(ti.name)) {
                    try {
                        const template = await ti.template.fetch(); // Check parent
                        if (template && template.isDefault) {
                            await ti.markAsDeleted();
                            await ti.destroyPermanently();
                        }
                    } catch (e) { /* orphan or error */ }
                }
            }
        }
    });

    // Seed Component Types
    const componentCount = await database.get<ComponentType>('component_types').query().fetchCount();

    if (componentCount === 0) {
        console.log('Seeding default component types...');
        await database.write(async () => {
            await database.get<ComponentType>('component_types').create(ct => {
                ct._raw.id = 'comp_hb_01';
                ct.name = 'Гемоглобин';
                ct.iconName = 'droplet';
                ct.isDefault = true;
                ct.sortOrder = 1;
            });

            await database.get<ComponentType>('component_types').create(ct => {
                ct._raw.id = 'comp_fe_01';
                ct.name = 'Ферритин';
                ct.iconName = 'flask-conical';
                ct.isDefault = true;
                ct.sortOrder = 2;
            });

            await database.get<ComponentType>('component_types').create(ct => {
                ct._raw.id = 'comp_plt_01';
                ct.name = 'Тромбоциты';
                ct.iconName = 'history';
                ct.isDefault = true;
                ct.sortOrder = 3;
            });
        });
        console.log('Default component types seeded!');
    }

    // Seed Chelator Types
    const chelatorCount = await database.get<ChelatorType>('chelator_types').query().fetchCount();

    if (chelatorCount === 0) {
        console.log('Seeding default chelator types...');
        await database.write(async () => {
            await database.get<ChelatorType>('chelator_types').create(ch => {
                ch._raw.id = 'chel_none_01';
                ch.name = 'Нет';
                ch.isDefault = true;
                ch.sortOrder = 0;
            });

            await database.get<ChelatorType>('chelator_types').create(ch => {
                ch._raw.id = 'chel_desf_01';
                ch.name = 'Десферал';
                ch.isDefault = true;
                ch.sortOrder = 1;
            });

            await database.get<ChelatorType>('chelator_types').create(ch => {
                ch._raw.id = 'chel_exja_01';
                ch.name = 'Эксиджад';
                ch.isDefault = true;
                ch.sortOrder = 2;
            });

            await database.get<ChelatorType>('chelator_types').create(ch => {
                ch._raw.id = 'chel_jade_01';
                ch.name = 'Джадену';
                ch.isDefault = true;
                ch.sortOrder = 3;
            });
        });
        console.log('Default chelator types seeded!');
    }

    // Seed Analysis Templates
    const templateCount = await database.get<AnalysisTemplate>('analysis_templates').query().fetchCount();

    if (templateCount === 0) {
        console.log('Seeding default analysis templates...');
        await database.write(async () => {
            // Общий анализ крови
            const template1 = await database.get<AnalysisTemplate>('analysis_templates').create(t => {
                t._raw.id = 'tmpl_cbc_01';
                t.name = 'Общий анализ крови';
                t.isDefault = true;
            });

            await database.get<AnalysisTemplateItem>('analysis_template_items').create(item => {
                item._raw.id = 'tmpl_item_hb_01';
                item.templateId = template1.id;
                item.name = 'Гемоглобин';
                item.unit = 'g/l';
            });

            await database.get<AnalysisTemplateItem>('analysis_template_items').create(item => {
                item._raw.id = 'tmpl_item_ery_01';
                item.templateId = template1.id;
                item.name = 'Эритроциты';
                item.unit = '×10¹²/л';
            });

            await database.get<AnalysisTemplateItem>('analysis_template_items').create(item => {
                item._raw.id = 'tmpl_item_leu_01';
                item.templateId = template1.id;
                item.name = 'Лейкоциты';
                item.unit = '×10⁹/л';
            });

            await database.get<AnalysisTemplateItem>('analysis_template_items').create(item => {
                item._raw.id = 'tmpl_item_plt_01';
                item.templateId = template1.id;
                item.name = 'Тромбоциты';
                item.unit = '×10⁹/л';
            });

            // Биохимический анализ
            const template2 = await database.get<AnalysisTemplate>('analysis_templates').create(t => {
                t._raw.id = 'tmpl_biochem_01';
                t.name = 'Биохимический анализ';
                t.isDefault = true;
            });

            await database.get<AnalysisTemplateItem>('analysis_template_items').create(item => {
                item._raw.id = 'tmpl_item_fer_01';
                item.templateId = template2.id;
                item.name = 'Ферритин';
                item.unit = 'нг/мл';
            });

            await database.get<AnalysisTemplateItem>('analysis_template_items').create(item => {
                item._raw.id = 'tmpl_item_alt_01';
                item.templateId = template2.id;
                item.name = 'АЛТ';
                item.unit = 'Ед/л';
            });

            await database.get<AnalysisTemplateItem>('analysis_template_items').create(item => {
                item._raw.id = 'tmpl_item_ast_01';
                item.templateId = template2.id;
                item.name = 'АСТ';
                item.unit = 'Ед/л';
            });

            await database.get<AnalysisTemplateItem>('analysis_template_items').create(item => {
                item._raw.id = 'tmpl_item_bil_01';
                item.templateId = template2.id;
                item.name = 'Билирубин общий';
                item.unit = 'мкмоль/л';
            });
        });
        console.log('Default analysis templates seeded!');
    }
}
