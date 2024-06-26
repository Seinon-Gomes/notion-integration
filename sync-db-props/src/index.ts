
import { fetchDBProps, ensureSyncSourceProp, extractSyncPropNames, syncPropValues } from './libs';
import { config } from './config';

async function main() {
    const databaseIdList = config.databaseIdList;
    if (!databaseIdList) {
        console.error('No databaseIdList in config.json');
        return;
    }
    for (const databaseId of databaseIdList) {
        // databaseIdが空でないstringであることを確認
        if (!databaseId || typeof databaseId !== 'string') {
            console.error('Invalid databaseId in config.json: ', databaseId);
            continue;
        }
        try {
            const properties = await fetchDBProps(databaseId);
            ensureSyncSourceProp(properties);
            const syncPropNames = extractSyncPropNames(properties);
            await syncPropValues(databaseId, syncPropNames);
        } catch (error) {
            console.error('Error Occured', error);
        }
    }
}

main();