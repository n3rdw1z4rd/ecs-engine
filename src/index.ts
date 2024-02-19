import './engine/css';
import { Engine, Entity, log, CanvasRenderer } from './engine';
import { vec2 } from 'gl-matrix';

(() => {
    log('*** ecs-engine ***');

    const renderer: CanvasRenderer = new CanvasRenderer();
    renderer.appendTo(document.body);

    const engine: Engine = Engine.instance;

    // engine.traceLogEnabled = true;

    engine
        .createComponent('Boundary')
        .createComponent('Position', {
            x: 0,
            y: 0,
        })
        .createComponent('Velocity', {
            x: (): number => (engine.rng.nextf * 4 - 2),
            y: (): number => (engine.rng.nextf * 4 - 2),
            speed: 32,
        })
        .createComponent('Drawable', {
            color: () => engine.rng.choose(['red', 'green', 'blue', 'yellow']),
            size: 2,
        })
        .includeAsDefaultComponents('Boundary', 'Position', 'Velocity', 'Drawable')
        .createSystem('Movement', 'Position', 'Velocity', (_, { Boundary, Position, Velocity }) => {
            const targetVelocity = {
                x: (Velocity.x * Velocity.speed * engine.clock.deltaTime),
                y: (Velocity.y * Velocity.speed * engine.clock.deltaTime),
            };

            if (Boundary) {
                if (Position.x + targetVelocity.x <= 0 || Position.x + targetVelocity.x >= renderer.width) {
                    Velocity.x *= -1;
                }

                if (Position.y + targetVelocity.y <= 0 || Position.y + targetVelocity.y >= renderer.height) {
                    Velocity.y *= -1;
                }
            }

            Position.x += (Velocity.x * Velocity.speed * engine.clock.deltaTime);
            Position.y += (Velocity.y * Velocity.speed * engine.clock.deltaTime);
        })
        .createSystem('Draw', 'Position', 'Drawable', (_, { Attraction, Position, Drawable }) => {
            renderer.drawCircle(
                vec2.fromValues(Position.x, Position.y),
                Drawable.size,
                {
                    lineColor: Drawable.color,
                    fillColor: Drawable.color,
                }
            );

            // renderer.drawText(
            //     vec2.fromValues(Position.x, Position.y + (Drawable.size * 5)),
            //     `${Math.floor(Position.x)}x${Math.floor(Position.y)}`,
            //     { textAlign: 'center', fontSize: 12 },
            // );

            if (Attraction) {
                renderer.drawCircle(
                    vec2.fromValues(Position.x, Position.y),
                    Drawable.size * 4,
                    {
                        lineColor: Drawable.color,
                        filled: false,
                    }
                );
            }
        })
        .createMultpleEntities(250)
        .onAllEntitiesNow((entity: Entity) => {
            entity.components.set('Position', {
                x: engine.rng.rangei(0, renderer.width),
                y: engine.rng.rangei(0, renderer.height),
            });

        })
        .onTickStart(() => {
            renderer.clear();
            renderer.resize();
        })
        .run();
})();