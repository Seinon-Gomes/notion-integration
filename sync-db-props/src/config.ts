import * as fs from 'fs';
import * as path from 'path';

interface Config {
    databaseId: string;
    notionApiKeyEnvVar: string;
}

function loadConfig(): Config {
    try {
        let configPath: string;
        if (process.env.NODE_ENV === 'dev') {
            configPath = path.resolve(__dirname, '../config.json');
        } else {
            const execDir = path.dirname(process.execPath);
            configPath = path.resolve(execDir, '/config.json');
        }
        const rawData = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error('Error loading config.json:', error);
        throw error;
    }
}

export const config = loadConfig();
