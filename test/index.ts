import '@n3rdw1z4rd/core-ts/dist/css/reset.css';
import '@n3rdw1z4rd/core-ts/dist/css/my-styles.css';
import { EcsEngine, Entity } from '../src';
import { StatsDiv } from './stats-div';
import { CanvasRenderer, Clock, Color } from '@n3rdw1z4rd/core-ts';

const clock: Clock = new Clock();
const statsDiv: StatsDiv = new StatsDiv();
const renderer: CanvasRenderer = new CanvasRenderer();
// renderer.pixelRatio = 1; // uncomment if on a retina display, for now
renderer.appendTo(document.body);
const engine: EcsEngine = EcsEngine.instance;

const colors: Color[] = [
    Color.Red,
    Color.Green,
    Color.Blue,
    Color.Yellow,
]

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
        color: () => colors[Math.floor(Math.random() * colors.length)],
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
        renderer.setPixel(Position.x, Position.y, Appearance.color, Appearance.size);
    })
    .createEntities(1000);

clock.run((deltaTime: number) => {
    engine.update();
    renderer.render();

    statsDiv.updateContent({
        Entities: engine.entities.length,
        Components: engine.components.length,
        Systems: engine.systems.length,
        FPS: clock.fps,
    });
});