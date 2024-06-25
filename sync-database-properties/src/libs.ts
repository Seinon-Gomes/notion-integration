import axios from 'axios';
import { config } from './config';

const notionApiKeyEnvVar = config.notionApiKeyEnvVar;
const NOTION_API_KEY = process.env[notionApiKeyEnvVar];
if (!NOTION_API_KEY) {
    throw new Error(`Environment variable ${notionApiKeyEnvVar} is not set.`);
}
const headers = {
    'Authorization': `Bearer ${NOTION_API_KEY}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28'
};

interface NotionDBProp {
    id: string;
    type: string;
    [key: string]: any;
}

interface NotionDB {
    object: string;
    id: string;
    properties: { [key: string]: NotionDBProp };
}

interface NotionPage {
    id: string;
    properties: { [key: string]: NotionDBProp };
}

export async function fetchDBProps(databaseId: string): Promise<{ [key: string]: NotionDBProp }> {
    const url = `https://api.notion.com/v1/databases/${databaseId}`;
    try {
        const response = await axios.get<NotionDB>(url, { headers });
        return response.data.properties;
    } catch (error) {
        console.error('Error fetching database properties:', error);
        throw error;
    }
}

export function ensureSyncSourceProp(properties: { [key: string]: NotionDBProp }) {
    if (!properties.SyncSource || properties.SyncSource.type !== 'relation') {
        throw new Error('SyncSourceという名前のRelationプロパティが見つかりません。');
    }
}

interface SyncPropName {
    srcPropName: string;
    destPropName: string;
}

export function extractSyncPropNames(properties: { [key: string]: NotionDBProp }): SyncPropName[] {
    const syncPropNames: SyncPropName[] = [];
    for (const srcPropName in properties) {
        const prop = properties[srcPropName];
        if (prop.type === 'rollup' && prop.rollup.function === 'show_original') {
            const destPropName = srcPropName.replace('_src', '');
            if (properties[destPropName]) {
                syncPropNames.push({ srcPropName: srcPropName, destPropName: destPropName });
            }
        }
    }
    return syncPropNames;
}

export async function syncPropValues(databaseId: string, syncPropNames: SyncPropName[]) {
    const url = `https://api.notion.com/v1/databases/${databaseId}/query`;
    try {
        const response = await axios.post<{ results: NotionPage[] }>(url, {}, { headers });
        const pages = response.data.results;

        for (const page of pages) {
            const pageId = page.id;
            const props = page.properties;

            const propsToUpdate: { [key: string]: any } = {};
            for (const { srcPropName: srcPropName, destPropName: destPropName } of syncPropNames) {
                if (props[srcPropName] && props[destPropName]) {
                    const datatype: string = props[srcPropName]['rollup']['array'][0]['type'];
                    propsToUpdate[destPropName] = props[srcPropName]['rollup']['array'][0][datatype];
                }
            }

            if (Object.keys(propsToUpdate).length > 0) {
                await syncPagePropValues(pageId, propsToUpdate);
            }
        }
    } catch (error) {
        console.error('Error updating properties:', error);
        throw error;
    }
}

export async function syncPagePropValues(pageId: string, propsToUpdate: { [key: string]: any }) {
    const url = `https://api.notion.com/v1/pages/${pageId}`;
    console.log('pageId:', pageId);
    const payload = { properties: propsToUpdate };
    console.log('Updating page properties:', payload);
    try {
        await axios.patch(url, payload, { headers });
        console.log('Page properties successfully updated.')
    } catch (error) {
        console.error('Error updating page properties:', error);
        throw error;
    }
}

