# ecs-engine

Welcome! This project is an attempt to create an ECS framework that has an easy to use functional programing interface. The design idea is that the programming flow is easy to understand, and easy to work with.

## Installation:
* npm: `$ npm install @n3rdw1z4rd/ecs-engine`
* yarn: `$ yarn install @n3rdw1z4rd/ecs-engine`

## Usage:
```typescript
import { EcsEngine } from '@n3rdw1z4rd/ecs-engine';

// get the instance:
const engine: EcsEngine = EcsEngine.instance;

// create a component:
engine.createComponent('Position', { x: 0, y: 0 });

// create a system:
engine.createSystem('Draw', (entity: Entity, { Position }) => {
    renderer.drawPixel(x, y);
});

// create an entity:
engine.createEntity('Position');

// in your render loop:
renderer.render(() => {
    engine.update();
});
```

## API:

### Types:
- `SystemCallback = (entity: Entity, components: any) => void;`
- `TickCallback = () => void;`

### Interfaces:
- `System { components: string[], callback: SystemCallback, }`
- `Entity { uid: string, components: Map<string, any>, }`

### Methods:
- `uid(length: number = 8): string`
  - Generates a unique identifier.
- `createComponent(uid: string, data: any = null): this`
  - Creates a new component. Data should be in this form: `{ value: 'the value' }`, if the value(s) are a function, like: `{ value: () => Math.random() }`, then, when the Entity is created, the EcsEngine will execute the function to create unique data for that property.
- `includeAsDefaultComponents(...components: string[]): this`
  - Includes components as default components. Any entities created after this call will automatically have the components listed.
- `createSystem<T extends string[]>(uid: string, ...components: [...T, SystemCallback]): this`
  - Creates a new system. 
- `createEntityWithUid(uid: string, ...components: string[]): this`
  - Creates a new entity with a given UID.
- `createEntity(...components: string[]): this`
  - Creates a new entity with a unique UID.
- `createEntities(count: number, ...components: string[]): this`
  - Creates multiple entities with the same components.
- `getEntity(uid: string): Entity`
  - Retrieves an entity by its UID.
- `getEntitiesWithComponents<T extends string[]>(...components: [...T, filter: any]): Entity[]`
  - Retrieves entities with specified components.
- `addComponent(uid: string, component: string): this`
  - Adds a component to an entity.
- `onAllEntitiesNow(callback: (entity: Entity) => void): this`
  - Executes a callback on all entities.
- `duplicateEntity(uid: string, count: number = 1, deep: boolean = false): this`
  - Duplicates an entity.
- `getGlobal(key: string): any`
  - Retrieves a global variable by its key.
- `setGlobal(key: string, value: any): this`
  - Sets a global variable.
- `beforeTick(callback: TickCallback): this`
  - Adds a callback to be executed before each tick.
- `afterTick(callback: TickCallback): this`
  - Adds a callback to be executed after each tick.
- `runSystem(uid: string): this`
  - Runs a system.
- `update(): void`
  - Updates the engine, executing tick callbacks and running systems.

## Full Example:
The code below can be found in `test/index.ts`:
```typescript
import { EcsEngine, Entity } from '..';
import { CanvasRenderer } from './canvas-renderer';
import { StatsDiv } from './stats-div';

const renderer: CanvasRenderer = new CanvasRenderer();
renderer.appendTo(document.body);

const statsDiv: StatsDiv = new StatsDiv();

const engine: EcsEngine = EcsEngine.instance;

engine
    .createComponent('Position', {
        x: renderer.width / 2,
        y: renderer.height / 2,
    })
    .createComponent('Velocity', {
        x: (): number => (engine.rng.nextf * 4 - 2),
        y: (): number => (engine.rng.nextf * 4 - 2),
    })
    .createComponent('Appearance', {
        color: () => engine.rng.choose(['red', 'green', 'blue', 'yellow']),
        size: 2,
    })
    .includeAsDefaultComponents('Position', 'Velocity', 'Appearance')
    .createSystem('Move', 'Position', 'Velocity', (entity: Entity, { Position, Velocity }) => {
        if (Position.x + Velocity.x > renderer.width || Position.x + Velocity.x < 0) {
            Velocity.x = -Velocity.x;
        }

        if (Position.y + Velocity.y > renderer.height || Position.y + Velocity.y < 0) {
            Velocity.y = -Velocity.y;
        }

        Position.x += Velocity.x;
        Position.y += Velocity.y;
    })
    .createSystem('Draw', 'Position', 'Appearance', (entity: Entity, { Position, Appearance }) => {
        renderer.drawCircle(Position.x, Position.y, Appearance.color, Appearance.size);
    })
    .createEntities(1000)
    .beforeTick(() => {
        renderer.clear();
        renderer.resize();
    })
    .afterTick(() => {
        statsDiv.update(engine);
    })
    .run();
```
This example can be run like this:
```bash
$ git clone https://github.com/n3rdw1z4rd/ecs-engine.git

$ cd ecs-engine

$ npm install

$ npm run dev
```
Then navigate to `http://localhost:3000/` in the browser of your choice to enjoy the show, below is a screenshot:

![image](https://github.com/JohnCWakley/ecs-engine/assets/33690133/d6e07110-33f6-4b87-a569-6239e540affe)