import { classToPlain, plainToClass } from 'class-transformer';
import * as fs from 'fs';
import * as path from 'path';

export class ConfigManager {

    private configDir = 'config';
    private emptyOptions = new ModuleOptions();
    private static _instance: ConfigManager;
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

    public register<T extends ModuleOptions> (ctor: new () => T) {
        const clazz = new ctor();
        this.optionsMap.set(ctor.name, clazz);
        return this;
    }

    public getOptions<T extends ModuleOptions> (ctor: new () => T): T {
        let plainObject = this.optionsMap.get(ctor.name);
        plainObject = plainObject || this.emptyOptions;
        return plainToClass(ctor, plainObject);
    }

    public getOptionsAsPlain<T extends ModuleOptions> (ctor: new () => T): any {
        const optClass = this.getOptions(ctor);
        return classToPlain(optClass);
    }

    public exists<T extends ModuleOptions> (ctor: new () => T): boolean {
        return !!this.getOptions(ctor);
    }

    private getConfigFilePath () {
        const fileName = process.env.NODE_ENV === 'development' ? 'dev.config.json' : 'prod.config.json';
        return path.resolve(this.configDir, fileName);
    }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export class ModuleOptions {

}