
import { fetchDBProps, ensureSyncSourceProp, extractSyncPropNames, syncPropValues } from './libs';
import { config } from './config';

async function main() {
    const databaseId = config.databaseId;
    if (!databaseId) {
        console.error('config.jsonにdatabaseIdが見つかりません。');
        return;
    }
    try {
        const properties = await fetchDBProps(databaseId);
        ensureSyncSourceProp(properties);
        const syncPropNames = extractSyncPropNames(properties);
        await syncPropValues(databaseId, syncPropNames);
    } catch (error) {
        console.error('エラーが発生しました:', error);
    }
}

main();