import './engine/css';
import { CanvasRenderer } from './renderer';
import { Engine, Entity } from './engine';
import { vec2 } from 'gl-matrix';

(async () => {
    const renderer: CanvasRenderer = new CanvasRenderer();
    renderer.appendTo(document.body);

    const stats: HTMLDivElement = document.createElement('div');
    stats.classList.add('stats');
    document.body.appendChild(stats);

    const engine: Engine = Engine.instance;

    // engine.traceLogEnabled = true;

    engine
        .setAppTitle('ECS Engine')
        .createComponent('Boundary')
        .createComponent('Position', {
            x: () => engine.rng.rangei(0, renderer.width),
            y: () => engine.rng.rangei(0, renderer.height),
        })
        .createComponent('Velocity', {
            x: (): number => (engine.rng.nextf * 4 - 2),
            y: (): number => (engine.rng.nextf * 4 - 2),
            speed: 32,
        })
        .createComponent('Attributes', {
            type: 'normal',
            color: [255, 255, 0, 255],
            size: 2,
        })
        .includeAsDefaultComponents('Boundary', 'Position', 'Velocity', 'Attributes')

        .createComponent('Attraction', { type: 'normal', range: 100, force: -2, other: null })
        .createSystem('Attractiveness', 'Attraction', 'Position', 'Velocity', 'Attributes', (entity: Entity, { Attraction, Position, Velocity }) => {
            if (!Attraction.other) {
                const entities: { entity: Entity, distance: number, dx: number, dy: number }[] = [];

                engine.getEntitiesWithComponents('Attributes', 'Position', { Attributes: { type: 'normal' } }).forEach((e: Entity) => {
                    const b = { ...e.components.get('Position') };
                    const dx: number = Position.x - b.x;
                    const dy: number = Position.y - b.y;
                    const distance: number = Math.sqrt(dx * dx + dy * dy);

                    if (distance > 0 && distance < Attraction.range) {
                        entities.push({ entity: e, distance, dx, dy });
                    }
                });

                if (entities.length > 0) {
                    entity.components.get('Attraction').other = entities[0].entity.alias;
                }
            } else {
                const other: Entity = engine.getEntity(Attraction.other);
                const otherPosition = other.components.get('Position');

                let dx: number = Position.x - otherPosition.x;
                let dy: number = Position.y - otherPosition.y;

                let distance: number = Math.sqrt(dx * dx + dy * dy);

                if (distance > 0 && distance < Attraction.range) {
                    const F: number = Attraction.force * 1 / distance;
                    Velocity.x += ((F * dx) * engine.clock.deltaTime);
                    Velocity.y += ((F * dy) * engine.clock.deltaTime);
                } else {
                    entity.components.get('Attraction').other = null;
                }
            }
        })

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
        .createSystem('Draw', 'Position', 'Attributes', (_, { Attraction, Position, Attributes }) => {
            renderer.drawRect(vec2.fromValues(Position.x, Position.y), Attributes.color, Attributes.size);

            // renderer.drawText(
            //     vec2.fromValues(Position.x, Position.y + (Attributes.size * 5)),
            //     `${Math.floor(Position.x)}x${Math.floor(Position.y)}`,
            //     { textAlign: 'center', fontSize: 12 },
            // );

            if (Attraction) {
                renderer.drawCircle(vec2.fromValues(Position.x, Position.y), Attributes.color, Attributes.size * 4, false);
            }
        })
        .createMultpleEntities(200)
        .createEntityWithAlias('player', 'Attraction')
        // .onAllEntitiesNow((entity: Entity) => {
        //     if (engine.rng.nextf < 0.1) {
        //         entity.components.get('Attributes').type = 'other';
        //         entity.components.get('Attributes').color = [255, 0, 0, 255];
        //         engine.addComponent(entity.alias, 'Attraction');
        //         entity.components.set('Velocity', { x: 0, y: 0, speed: 32 });
        //     }
        // })
        .onTickStart(() => {
            renderer.clear();
            renderer.resize();
        })
        .onTickEnd(() => {
            stats.innerText = `FPS: ${engine.clock.fps}`;
        })
        .onBeforeRun(() => {
            engine.getEntity('player').components.set('Attributes', { type: 'other', color: [255, 0, 0, 255], size: 2 });
            engine.getEntity('player').components.set('Velocity', { x: 0, y: 0, speed: 32 });
            // engine.duplicateEntity('player', 2);
        })
        .run();
})();