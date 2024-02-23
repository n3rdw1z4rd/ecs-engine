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

export class Engine {
    private _globals: Map<string, any> = new Map<string, any>();
    private _entities: Map<string, Entity> = new Map<string, Entity>();
    private _components: Map<string, any> = new Map<string, any>();
    private _defaultComponents: string[] = [];
    private _systems: Map<string, System> = new Map<string, System>();
    private _onTickStartCallbacks: TickCallback[] = [];
    private _onTickEndCallbacks: TickCallback[] = [];

    public get components(): string[] {
        return [...this._components.keys()];
    }

    public get systems(): string[] {
        return [...this._systems.keys()];
    }

    public get entities(): Entity[] {
        return [...this._entities.values()];
    }

    public uid(length: number = 8): string {
        const numBytes: number = Math.ceil(length / 2);
        const buffer: Uint8Array = new Uint8Array(numBytes);

        window.crypto.getRandomValues(buffer);

        let uid: string = '';

        for (let i = 0; i < buffer.length; i++) {
            uid += buffer[i].toString(16).padStart(2, '0');
        }

        return uid.substring(0, length);
    }

    public createComponent(alias: string, data: any = null): this {
        if (!this._components.has(alias)) {
            this._components.set(alias, data);
            console.log('[ECS] created component:', { alias, data });
        } else {
            console.warn('[ECS] createComponent: a component already exists with alias:', alias);
        }

        return this;
    }

    public includeAsDefaultComponents(...components: string[]): this {
        components.forEach((component: string) => {
            if (!this._defaultComponents.includes(component)) {
                this._defaultComponents.push(component);
                console.log('[ECS] includeAsDefaultComponents:', component);
            } else {
                console.log('[ECS] includeAsDefaultComponents: already exists:', component);
            }
        });

        return this;
    }

    public createSystem<T extends string[]>(alias: string, ...components: [...T, SystemCallback]): this {
        const callback: SystemCallback = components.pop() as SystemCallback;

        const comps: string[] = components.map((comp: any) => {
            if (typeof comp === 'string') {
                return comp;
            }
        });

        if (!this._systems.has(alias)) {
            this._systems.set(alias, { components: comps, callback });
            console.log('[ECS] created system:', { alias, components, callback });
        } else {
            console.warn('[ECS] createSystem: a system already exists with alias:', alias);
        }

        return this;
    }

    public createEntityWithAlias(alias: string, ...components: string[]): this {
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
                    console.warn('[ECS] createEntityWithAlias: missing component:', component);
                }
            });

            if (comps.size === componentList.length) {
                const entity: Entity = { alias, components: comps };
                this._entities.set(alias, entity);
                console.log('[ECS] created entity:', entity);
            } else {
                console.warn('[ECS] createEntityWithAlias: failed to create an entity with missing components');
            }
        } else {
            console.warn('[ECS] createEntityWithAlias: an entity already exists with alias:', alias);
        }

        return this;
    }

    public createEntity(...components: string[]): this {
        const alias: string = this.uid();
        return this.createEntityWithAlias(alias, ...components);
    }

    public createEntities(count: number, ...components: string[]): this {
        for (; count > 0; count--) {
            this.createEntity(...components);
        }

        return this;
    }

    public getEntity(alias: string): Entity {
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
        const entity: Entity = this._entities.get(alias);

        if (entity) {
            if (this._components.has(component)) {
                entity.components.set(component, this._components.get(component));
                console.log('[ECS] addComponent: added component:', component, 'to entity:', alias);
            } else {
                console.warn('[ECS] addComponent: component not found:', component);
            }
        } else {
            console.warn('[ECS] addComponent: entity not found:', alias);
        }

        return this;
    }

    public onAllEntitiesNow(callback: (entit: Entity) => void): this {
        this._entities.forEach((entity: Entity) => callback(entity));
        console.log('[ECS] onAllEntitiesNow: executed on all entities:', callback);

        return this;
    }

    public duplicateEntity(alias: string, count: number = 1, deep: boolean = false): this {
        const entity: Entity = this._entities.get(alias);

        if (entity) {
            if (!deep) {
                for (let i = 0; i < count; i++) this.createEntity(...entity.components.keys());
            } else {
                for (let i = 0; i < count; i++) {
                    const newEntity: Entity = { alias: this.uid(), components: new Map<string, any>() };

                    entity.components.forEach((value: any, key: string) => {
                        newEntity.components.set(key, value);
                    });

                    this._entities.set(newEntity.alias, newEntity);
                };
            }

            console.log('[ECS] duplicateEntity: duplicated entity:', alias);
        } else {
            console.warn('[ECS] duplicateEntity: entity not found:', alias);
        }

        return this;
    }

    public getGlobal(key: string): any {
        return this._globals.get(key);
    }

    public setGlobal(key: string, value: any): this {
        this._globals.set(key, value);
        return this;
    }

    public beforeTick(callback: TickCallback): this {
        this._onTickStartCallbacks.push(callback);
        console.log('[ECS] beforeTick: added:', callback);

        return this;
    }

    public afterTick(callback: TickCallback): this {
        this._onTickEndCallbacks.push(callback);
        console.log('[ECS] afterTick: added:', callback);

        return this;
    }

    public runSystem(alias: string): this {
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
            console.warn('[ECS] runSystem: system not found:', alias);
        }

        return this;
    }

    public onBeforeRun(callback: () => void): this {
        callback();
        return this;
    }

    public update() {
        this._onTickStartCallbacks.forEach((cb: TickCallback) => cb());
        this._systems.forEach((_: System, alias: string) => this.runSystem(alias));
        this._onTickEndCallbacks.forEach((cb: TickCallback) => cb());
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