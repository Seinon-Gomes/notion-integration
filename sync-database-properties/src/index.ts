
import { fetchDBProps, ensureSyncSourceProp, extractSyncPropNames, syncPropValues } from './libs';
import { config } from './config';

async function main() {
    const databaseId = config.databaseId;
    if (!databaseId) {
        console.error('No databaseId in config.json');
        return;
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

main();