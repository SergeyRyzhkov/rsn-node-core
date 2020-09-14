import { classToPlain, plainToClass } from 'class-transformer';
import * as fs from 'fs';
import * as path from 'path';

export class ConfigManager {
    private static _instance: ConfigManager;

    private configDir = 'config';
    private optionsMap = new Map();

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {
    }

    public static get instance () {
        if (!this._instance) {
            ConfigManager._instance = new ConfigManager();
            ConfigManager._instance.load();
        }
        return this._instance;
    }

    public load () {
        const filePath = this.getConfigFilePath();
        let configJson: any;

        if (!fs.existsSync(this.configDir)) {
            fs.mkdirSync(this.configDir);
        }

        if (fs.existsSync(filePath)) {
            const configContent = fs.readFileSync(filePath, 'utf8');
            configJson = JSON.parse(configContent);
        }

        if (!!configJson) {
            configJson.forEach((iterOptions: any) => {
                const iterOptionsKey = Object.keys(iterOptions)[0];
                const optionsPlainClass = iterOptions[iterOptionsKey];
                this.optionsMap.set(iterOptionsKey, optionsPlainClass);
            })
        }
    }

    public write () {
        const filePath = this.getConfigFilePath();
        fs.writeFileSync(filePath, this.stringify(), 'utf8');
    }

    public stringify () {
        return JSON.stringify(this.toJSON());
    }

    public toJSON () {
        const plainOptionsList = [];

        this.optionsMap.forEach((value: any, key: any) => {
            const section = {
                [key]: classToPlain(value)
            }
            plainOptionsList.push(section);
        })
        return plainOptionsList;
    }

    public getOptionsAsClass<T> (ctor: new () => T, configSection: string): T {
        const plainObject = this.optionsMap.get(configSection);
        return plainToClass(ctor, plainObject);
    }

    public getOptionsAsPlain (configSection: string): any {
        return this.optionsMap.get(configSection);
    }

    public exists (configSection: string): boolean {
        return !!this.optionsMap.get(configSection);
    }

    private getConfigFilePath () {
        const fileName = process.env.NODE_ENV === 'development' ? 'dev.config.json' : 'prod.config.json';
        return path.resolve(this.configDir, fileName);
    }
}
