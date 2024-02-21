# ecs-engine

Welcome! This project is an attempt to create an ECS framework that has an easy to use functional programing interface. The design idea is that the programming flow is easy to understand, and easy to work with. The `src/index.ts` contains an example of a simple simulation:

```typescript
import { CanvasRenderer } from './helpers/canvas-renderer';
import { Engine, Entity } from './ecs-engine';
import { StatsDiv } from './helpers/stats-div';

const renderer: CanvasRenderer = new CanvasRenderer();
renderer.appendTo(document.body);

const statsDiv: StatsDiv = new StatsDiv();

const engine: Engine = Engine.instance;

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
    .onBeforeRun(() => {
        engine.log.debug('entities:', engine.entities);
    })
    .beforeTick(() => {
        renderer.clear();
        renderer.resize();
    })
    .afterTick(() => {
        statsDiv.update(engine);
    })
    .run();
```

### Building/Running:
* Build (`PRODUCTION`): `$ npm run build`
* Run (`DEVELOPMENT`): `$ npm run dev`
    * Then simply open a broswer tab to `http://localhost:3000` and enjoy!
    * Open DevTools console to checkout the Engine logs

### TODO:
Make this into an npm module when ready.