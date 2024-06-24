import * as fs from 'fs';
import * as path from 'path';

interface Config {
    databaseId: string;
}

function loadConfig(): Config {
    try {
        const configPath = path.resolve(__dirname, '../config.json');
        const rawData = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error('Error loading config.json:', error);
        throw error;
    }
}

export const config = loadConfig();
