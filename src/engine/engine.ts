import { Logger } from './logger';
import { uid } from './rng';

/**
 * Testing: type Func = (...args: any[]) => void :
 *  Source:
 *      type Func = (...args: any[]) => void;
 * 
 *      const fmap: Map<string, Func> = new Map<string, Func>();
 * 
 *      fmap.set('test1', (a: number) => console.debug('test1:', a));
 *      fmap.set('test2', (a: number, ...args: any[]) => console.debug('test2:', a, args));
 * 
 *      fmap.get('test1')(12);
 *      fmap.get('test1')(12, 'with extra param');
 *      fmap.get('test2')(76, 'one', 'two', 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 'that last one is the same value used in test1');
 *  Output:
 *      > test1: 12
 *      > index.ts:3 test1: 12
 *      > index.ts:4 test2: 76 (13) ['one', 'two', 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 'that last one is the same value used in test1']
 * 
 *  Unrelated:
 *      // declare type AliasesWithDataCallback<T extends string[]> = (...args: [...T, (data: any) => void]) => void;
 *      this will accept a variable number of string params with the last params always being a callback - pretty cool :)
 */

const log: Logger = new Logger('[Engine]:');

export type SystemCallback = (components: any) => void;
export type EngineCallback = (...args: any[]) => void;

export interface System {
    components: string[],
    callback: SystemCallback,
};

export interface Entity {
    alias: string,
    components: Map<string, any>,
};

export class Engine {
    private _globals: Map<string, any> = new Map<string, any>();
    private _entities: Map<string, Entity> = new Map<string, Entity>();
    private _components: Map<string, any> = new Map<string, any>();
    private _systems: Map<string, System> = new Map<string, System>();
    private _beforeSystems: EngineCallback[] = [];
    private _afterSystems: EngineCallback[] = [];

    isRunning: boolean = false;

    public createComponent(alias: string, data: any): this {
        log.trace('createComponent:', { alias, data });

        if (!this._components.has(alias)) {
            this._components.set(alias, data);
            log.debug('created component:', { alias, data });
        } else {
            log.warn('createComponent: a component already exists with alias:', alias);
        }

        return this;
    }

    public createSystem<T extends string[]>(alias: string, ...components: [...T, SystemCallback]): this {
        const callback: SystemCallback = components.pop() as SystemCallback;
        log.trace('createSystem:', { alias, components });

        const comps: string[] = components.map((comp: any) => {
            if (typeof comp === 'string') {
                return comp;
            }
        });

        if (!this._systems.has(alias)) {
            this._systems.set(alias, { components: comps, callback });
            log.debug('created system:', { alias, components, callback });
        } else {
            log.warn('createSystem: a system already exists with alias:', alias);
        }

        return this;
    }

    public createEntityWithAlias(alias: string, ...components: string[]): this {
        log.trace('createEntityWithAlias:', { alias, components });

        if (!this._entities.has(alias)) {
            const comps: Map<string, any> = new Map<string, any>();

            components.forEach((component: string) => {
                if (this._components.has(component)) {
                    comps.set(component, { ...this._components.get(component) });
                } else {
                    log.warn('createEntityWithAlias: missing component:', component);
                }
            });

            if (comps.size === components.length) {
                const entity: Entity = { alias, components: comps };
                this._entities.set(alias, entity);
                log.debug('created entity:', entity);
            } else {
                log.warn('createEntityWithAlias: failed to create an entity with missing components');
            }
        } else {
            log.warn('createEntityWithAlias: an entity already exists with alias:', alias);
        }

        return this;
    }

    public createEntity(...components: string[]): this {
        const alias: string = uid();
        log.trace('createEntity, calling: createEntityWithAlias:', alias);
        return this.createEntityWithAlias(alias, ...components);
    }

    public onAllEntitiesNow(callback: (entit: Entity) => void): this {
        log.trace('onAllEntitiesNow:', { callback });

        this._entities.forEach((entity: Entity) => callback(entity));
        log.debug('onAllEntitiesNow: executed on all entities:', callback);

        return this;
    }

    public duplicateEntity(alias: string, count: number, deep: boolean = false): this {
        log.trace('duplicateEntity:', { alias, count, deep });

        const zero: Entity = this._entities.get(alias);

        if (zero) {
            if (!deep) {
                for (let i = 0; i < count; i++) this.createEntity(...zero.components.keys());
            } else {
                log.todo('duplicateEntity: deep: true');
            }

            log.debug('duplicateEntity: duplicated entity:', alias);
        } else {
            log.warn('duplicateEntity: entity not found:', alias);
        }

        return this;
    }

    public getGlobal(key: string): any {
        log.trace('getGlobal:', { key });
        return this._globals.get(key);
    }

    public setGlobal(key: string, value: any): this {
        log.trace('setGlobal:', { key, value });
        this._globals.set(key, value);
        return this;
    }

    public beforeSystems(callback: EngineCallback): this {
        log.trace('beforeSystems:', { callback });

        this._beforeSystems.push(callback);
        log.debug('beforeSystems: added:', callback);

        return this;
    }

    public afterSystems(callback: EngineCallback): this {
        log.trace('afterSystems:', { callback });

        this._afterSystems.push(callback);
        log.debug('afterSystems: added:', callback);

        return this;
    }

    public runSystem(alias: string): this {
        log.trace('runSystem:', { alias });

        const system: System = this._systems.get(alias);

        if (system) {
            this._entities.forEach((entity: Entity) => {
                if (system.components.every((component: string) =>
                    [...entity.components.keys()].includes(component)
                )) {
                    const components: any = {};

                    entity.components.forEach((component: any, alias: string) => {
                        components[alias] = component;
                    });

                    system.callback(components);
                } else {
                    log.debug(entity.alias, 'does NOT have all components', system.components);
                }
            });
        } else {
            log.warn('runSystem: system not found:', alias);
        }

        return this;
    }

    private _animate(time: number) {
        this._beforeSystems.forEach((cb: EngineCallback) => cb(time));
        this._systems.forEach((system: System, alias: string) => this.runSystem(alias));
        this._afterSystems.forEach((cb: EngineCallback) => cb(time));

        if (this.isRunning) {
            requestAnimationFrame(this._animate.bind(this));
        }
    }

    public runOnce(): this {
        log.trace('runOnce');

        if (!this.isRunning) {
            requestAnimationFrame(this._animate.bind(this));
            log.debug('********************');
            log.debug('run: ran engine once');
            log.debug('********************');
        } else {
            log.warn('runOnce: engine already running');
        }

        return this;
    }

    public run(): this {
        log.trace('run');

        if (!this.isRunning) {
            this.isRunning = true;
            requestAnimationFrame(this._animate.bind(this));

            log.debug('**********************');
            log.debug('run: engine is running');
            log.debug('**********************');
        } else {
            log.warn('run: already running');
        }

        return this;
    }

    public stop(): this {
        this.isRunning = false;
        return this;
    }

    public static get instance(): Engine {
        if (!Engine._instance) {
            Engine._instance = new Engine();
        }

        return Engine._instance;
    }

    private static _instance: Engine;
    private constructor() { }
}