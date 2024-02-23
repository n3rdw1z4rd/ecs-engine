import { Engine, Entity } from '..';
import { CanvasRenderer } from './canvas-renderer';
import { StatsDiv } from './stats-div';

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
        x: (): number => (Math.random() * 4 - 2),
        y: (): number => (Math.random() * 4 - 2),
    })
    .createComponent('Appearance', {
        color: () => ['red', 'green', 'blue', 'yellow'][Math.floor(Math.random() * 4)],
        size: 2,
    })
    .includeAsDefaultComponents('Position', 'Velocity', 'Appearance')
    .createSystem('Move', 'Position', 'Velocity', (_: Entity, { Position, Velocity }) => {
        if (Position.x + Velocity.x > renderer.width || Position.x + Velocity.x < 0) {
            Velocity.x = -Velocity.x;
        }

        if (Position.y + Velocity.y > renderer.height || Position.y + Velocity.y < 0) {
            Velocity.y = -Velocity.y;
        }

        Position.x += Velocity.x;
        Position.y += Velocity.y;
    })
    .createSystem('Draw', 'Position', 'Appearance', (_: Entity, { Position, Appearance }) => {
        renderer.drawCircle(Position.x, Position.y, Appearance.color, Appearance.size);
    })
    .createEntities(1000)
    .onBeforeRun(() => {
        console.debug('entities:', engine.entities);
    })
    .beforeTick(() => {
        renderer.clear();
        renderer.resize();
    })
    .afterTick(() => {
        statsDiv.update(engine);
    });

const update = (t: number) => {
    engine.update();
    requestAnimationFrame(update);
};

requestAnimationFrame(update);