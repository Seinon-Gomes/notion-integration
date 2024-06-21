import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const headers = {
    'Authorization': `Bearer ${NOTION_API_KEY}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28'
};

async function checkSyncSourceProperty(databaseId: string) {
    const url = `https://api.notion.com/v1/databases/${databaseId}`;
    const response = await axios.get(url, { headers });
    const properties = response.data.properties;

    if (!properties.SyncSource || properties.SyncSource.type !== 'relation') {
        throw new Error('SyncSourceという名前のRelationプロパティが見つかりません。');
    }
}

async function getRollupProperties(databaseId: string) {
    const url = `https://api.notion.com/v1/databases/${databaseId}`;
    const response = await axios.get(url, { headers });
    const properties = response.data.properties;

    const rollupProperties = [];
    for (const propName in properties) {
        const prop = properties[propName];
        if (prop.type === 'rollup' && prop.rollup.function === 'show_original') {
            const originalPropName = propName.replace('_src', '');
            if (properties[originalPropName]) {
                rollupProperties.push({ rollup: propName, original: originalPropName });
            }
        }
    }

    return rollupProperties;
}
// TODO: 次、ここから見始める
async function updateProperties(databaseId: string, rollupProperties: any[]) {
    const url = `https://api.notion.com/v1/databases/${databaseId}/query`;
    const response = await axios.post(url, {}, { headers });
    const pages = response.data.results;

    for (const page of pages) {
        const pageId = page.id;
        const properties = page.properties;

        const updates = {};
        for (const { rollup, original } of rollupProperties) {
            if (properties[rollup] && properties[original]) {
                updates[original] = properties[rollup];
            }
        }

        if (Object.keys(updates).length > 0) {
            await updatePageProperties(pageId, updates);
        }
    }
}

async function updatePageProperties(pageId: string, updates: any) {
    const url = `https://api.notion.com/v1/pages/${pageId}`;
    const payload = { properties: updates };
    await axios.patch(url, payload, { headers });
}

async function main() {
    const databaseId = 'your_database_id';

    try {
        await checkSyncSourceProperty(databaseId);
        const rollupProperties = await getRollupProperties(databaseId);
        await updateProperties(databaseId, rollupProperties);
    } catch (error) {
        console.error('エラーが発生しました:', error.message);
    }
}

main();
