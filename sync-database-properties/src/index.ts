import { getDatabaseItems, updateItemDate } from './libs';

const databaseId = 'your_database_id';
const pageId = 'your_page_id';
const datePropertyName = 'your_date_property_name';
const date = '2023-06-21T00:00:00Z';

async function main() {
    try {
        const items = await getDatabaseItems(databaseId);
        console.log('Database items:', items);

        const updatedItem = await updateItemDate(pageId, date, datePropertyName);
        console.log('Updated item:', updatedItem);
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
