import { Clock } from './clock';
import { DEV } from './env';
import { Logger } from './logger';
import { RNG } from './rng';

const log: Logger = new Logger('[Engine]');

export type SystemCallback = (entity: Entity, components: any) => void;
export type TickCallback = () => void;

export interface System {
    components: string[],
    callback: SystemCallback,
};

export interface Entity {
    alias: string,
    components: Map<string, any>,
};

declare global {
    interface Window { Engine: Engine; }
}

export class Engine {
    private _globals: Map<string, any> = new Map<string, any>();
    private _entities: Map<string, Entity> = new Map<string, Entity>();
    private _components: Map<string, any> = new Map<string, any>();
    private _defaultComponents: string[] = [];
    private _systems: Map<string, System> = new Map<string, System>();
    private _onTickStartCallbacks: TickCallback[] = [];
    private _onTickEndCallbacks: TickCallback[] = [];

    public clock: Clock = new Clock();
    public isRunning: boolean = false;

    public set traceLogEnabled(enabled: boolean) {
        if (enabled && this.isRunning) {
            log.warn('traceLogEnabled: stopping Engine while traceLogEnabled is:', enabled);
            this.isRunning = false;
        }

        log.traceEnabled = enabled;
    }

    public get log(): Logger { return log; }

    public get rng(): RNG { return RNG.instance; }

    public get components(): string[] {
        return [...this._components.keys()];
    }

    public get systems(): string[] {
        return [...this._systems.keys()];
    }

    public get entities(): Entity[] {
        return [...this._entities.values()];
    }

    public createComponent(alias: string, data: any = null): this {
        log.trace('createComponent:', { alias, data });

        if (!this._components.has(alias)) {
            this._components.set(alias, data);
            log.debug('created component:', { alias, data });
        } else {
            log.warn('createComponent: a component already exists with alias:', alias);
        }

        return this;
    }

    public includeAsDefaultComponents(...components: string[]): this {
        log.trace('includeAsDefaultComponents:', { components });

        components.forEach((component: string) => {
            if (!this._defaultComponents.includes(component)) {
                this._defaultComponents.push(component);
                log.debug('includeAsDefaultComponents:', component);
            } else {
                log.debug('includeAsDefaultComponents: already exists:', component);
            }
        });

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
            const componentList: string[] = [
                ...(new Set<string>([
                    ...this._defaultComponents,
                    ...components,
                ]))];

            const comps: Map<string, any> = new Map<string, any>();

            componentList.forEach((component: string) => {
                if (this._components.has(component)) {
                    const componentData: any = this._components.get(component);
                    const data: any = {};

                    for (const alias in componentData) {
                        const value = componentData[alias];

                        data[alias] = (typeof value === 'function') ? value() : value;
                    }

                    comps.set(component, data);
                } else {
                    log.warn('createEntityWithAlias: missing component:', component);
                }
            });

            if (comps.size === componentList.length) {
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
        const alias: string = this.rng.uid();
        log.trace('createEntity, calling: createEntityWithAlias:', alias);
        return this.createEntityWithAlias(alias, ...components);
    }

    public createEntities(count: number, ...components: string[]): this {
        log.trace('createEntities:', { count, components });

        for (; count > 0; count--) {
            this.createEntity(...components);
        }

        return this;
    }

    public getEntity(alias: string): Entity {
        log.trace('getEntity:', { alias });
        return this._entities.get(alias);
    }

    public getEntitiesWithComponents<T extends string[]>(...components: [...T, filter: any]): Entity[] {
        const filter: any = components.pop() as any;
        const aliases: string[] = components.filter((component: any) => typeof component === 'string');

        const entities: Entity[] = []

        this._entities.forEach((entity: Entity) => {
            if (aliases.every((component: string) =>
                [...entity.components.keys()].includes(component)
            )) {
                let add: boolean = true;

                for (const filterComponent in filter) {
                    for (const filterKey in filter[filterComponent]) {
                        const entityValue = entity.components.get(filterComponent)[filterKey];
                        const filterValue = filter[filterComponent][filterKey];
                        // log.debug({ entityValue, filterValue }, (entityValue === filterValue));
                        if (entityValue === filterValue) {
                            entities.push(entity);
                        }
                    }
                }

                // entities.push(entity);
            }
        });

        return entities;
    }

    public addComponent(alias: string, component: string): this {
        log.trace('addComponent:', { alias, component });

        const entity: Entity = this._entities.get(alias);

        if (entity) {
            if (this._components.has(component)) {
                entity.components.set(component, this._components.get(component));
                log.debug('addComponent: added component:', component, 'to entity:', alias);
            } else {
                log.warn('addComponent: component not found:', component);
            }
        } else {
            log.warn('addComponent: entity not found:', alias);
        }

        return this;
    }

    public onAllEntitiesNow(callback: (entit: Entity) => void): this {
        log.trace('onAllEntitiesNow:', { callback });

        this._entities.forEach((entity: Entity) => callback(entity));
        log.debug('onAllEntitiesNow: executed on all entities:', callback);

        return this;
    }

    public duplicateEntity(alias: string, count: number = 1, deep: boolean = false): this {
        log.trace('duplicateEntity:', { alias, count, deep });

        const entity: Entity = this._entities.get(alias);

        if (entity) {
            if (!deep) {
                for (let i = 0; i < count; i++) this.createEntity(...entity.components.keys());
            } else {
                for (let i = 0; i < count; i++) {
                    const newEntity: Entity = { alias: this.rng.uid(), components: new Map<string, any>() };

                    entity.components.forEach((value: any, key: string) => {
                        newEntity.components.set(key, value);
                    });

                    this._entities.set(newEntity.alias, newEntity);
                };
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

    public beforeTick(callback: TickCallback): this {
        log.trace('beforeTick:', { callback });

        this._onTickStartCallbacks.push(callback);
        log.debug('beforeTick: added:', callback);

        return this;
    }

    public afterTick(callback: TickCallback): this {
        log.trace('afterTick:', { callback });

        this._onTickEndCallbacks.push(callback);
        log.debug('afterTick: added:', callback);

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
                    system.callback(entity, Object.fromEntries(entity.components));
                }
            });
        } else {
            log.warn('runSystem: system not found:', alias);
        }

        return this;
    }

    private _tick(time: number) {
        this.clock.update(time);

        this._onTickStartCallbacks.forEach((cb: TickCallback) => cb());
        this._systems.forEach((_: System, alias: string) => this.runSystem(alias));
        this._onTickEndCallbacks.forEach((cb: TickCallback) => cb());

        if (this.isRunning) {
            requestAnimationFrame(this._tick.bind(this));
        }
    }

    public onBeforeRun(callback: () => void): this {
        callback();
        return this;
    }

    public run(): this {
        log.trace('run');

        if (!this.isRunning) {
            if (!log.traceEnabled) {
                this.isRunning = true;
                log.debug('run: running Engine...');
                requestAnimationFrame(this._tick.bind(this));
            } else {
                log.warn('run: cannot run when traceLogEnabled is true');
            }
        } else {
            log.warn('run: already running');
        }

        return this;
    }

    public runOnce(): this {
        log.trace('runOnce');

        if (!this.isRunning) {
            log.debug('runOnce: running Engine ONCE');
            requestAnimationFrame(this._tick.bind(this));
        } else {
            log.warn('runOnce: already running');
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

            if (DEV) {
                window.Engine = Engine._instance;
            }
        }

        return Engine._instance;
    }

    private static _instance: Engine;

    private constructor() {
        log.trace('instance created');
    }
}