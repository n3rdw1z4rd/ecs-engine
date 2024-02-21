import { CanvasRenderer } from './helpers/canvas-renderer';
import { Engine, Entity } from './ecs-engine';

document.title = 'ecs-engine';

const renderer: CanvasRenderer = new CanvasRenderer();
renderer.appendTo(document.body);

const statsDiv: HTMLDivElement = document.createElement('div');
statsDiv.style.setProperty('position', 'absolute');
statsDiv.style.setProperty('top', '0');
statsDiv.style.setProperty('right', '0');
statsDiv.style.setProperty('color', 'white');
statsDiv.style.setProperty('background-color', 'black');
statsDiv.style.setProperty('padding', '16px');
statsDiv.style.setProperty('font-size', '1.2rem');
statsDiv.style.setProperty('z-index', '100');
document.body.appendChild(statsDiv);

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
        statsDiv.innerHTML = [
            `Components: ${engine.components.length}`,
            `Systems: ${engine.systems.length}`,
            `Entities: ${engine.entities.length}`,
            `FPS: ${engine.clock.fps}`,
        ].join('<br>');
    })
    .run();