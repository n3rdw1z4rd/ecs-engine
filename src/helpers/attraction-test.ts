import { CanvasRenderer } from './canvas-renderer';
import { Engine, Entity } from '../ecs-engine';
import { StatsDiv } from './stats-div';


(async () => {
    const renderer: CanvasRenderer = new CanvasRenderer();
    renderer.appendTo(document.body);

    const statsDiv: StatsDiv = new StatsDiv('attraction test');

    const stats: HTMLDivElement = document.createElement('div');
    stats.classList.add('stats');
    document.body.appendChild(stats);

    const engine: Engine = Engine.instance;

    // engine.traceLogEnabled = true;

    engine
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
            color: 'yellow',
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
                    entities[0].entity.components.get('Attributes').color = 'lime';
                    entities[0].entity.components.get('Attributes').size = 4;
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
                    other.components.get('Attributes').color = 'yellow';
                    other.components.get('Attributes').size = 2;
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
            renderer.drawRect(Position.x, Position.y, Attributes.color, Attributes.size);

            // renderer.drawText(
            //     vec2.fromValues(Position.x, Position.y + (Attributes.size * 5)),
            //     `${Math.floor(Position.x)}x${Math.floor(Position.y)}`,
            //     { textAlign: 'center', fontSize: 12 },
            // );

            if (Attraction) {
                renderer.drawCircle(Position.x, Position.y, Attributes.color, Attributes.size * 4, false);
            }
        })
        .createEntities(200)
        .createEntityWithAlias('player', 'Attraction')
        // .onAllEntitiesNow((entity: Entity) => {
        //     if (engine.rng.nextf < 0.1) {
        //         entity.components.get('Attributes').type = 'other';
        //         entity.components.get('Attributes').color = 'red';
        //         engine.addComponent(entity.alias, 'Attraction');
        //         entity.components.set('Velocity', { x: 0, y: 0, speed: 32 });
        //     }
        // })
        .beforeTick(() => {
            renderer.clear();
            renderer.resize();
        })
        .afterTick(() => {
            statsDiv.update(engine);
        })
        .onBeforeRun(() => {
            engine.getEntity('player').components.set('Attributes', { type: 'other', color: 'red', size: 2 });
            engine.getEntity('player').components.set('Velocity', { x: 0, y: 0, speed: 32 });
            // engine.duplicateEntity('player', 2);
        })
        .run();
})();