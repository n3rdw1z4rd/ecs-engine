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
        // .createComponent('Attraction', { color: 'red', amount: 0.5 })
        .includeAsDefaultComponents('Boundary', 'Position', 'Velocity', 'Drawable')

        // .createSystem('Attractiveness', 'Attraction', 'Position', 'Velocity', 'Drawable', (entity: Entity, { Attraction, Position, Velocity }) => {
        //     const entities: Entity[] = engine.getEntitiesWithComponents('Drawable', 'Position', { Drawable: { color: Attraction.color } });
        //     // log('*** attractive entities:', entities);

        //     let fx: number = 0;
        //     let fy: number = 0;

        //     for (let j: number = 0; j < entities.length; j++) {
        //         const b = { ...entities[j].components.get('Position') };

        //         let dx: number = Position.x - b.x;
        //         let dy: number = Position.y - b.y;

        //         let distance: number = Math.sqrt(dx * dx + dy * dy);

        //         if (distance > 0 && distance < 200) {
        //             const F: number = Attraction.amount * 1 / distance;
        //             fx += (F * dx);
        //             fy += (F * dy);
        //         }

        //         Velocity.x = (Velocity.x + fx) * 0.99;// * engine.clock.deltaTime;
        //         Velocity.y = (Velocity.y + fy) * 0.99;// * engine.clock.deltaTime;

        //         // if (
        //         //     (Position.x + Velocity.x) <= this.params.canvasPadding ||
        //         //     (Position.x + Velocity.x) >= this.canvas.width - this.params.canvasPadding - this.params.particleSize
        //         // ) {
        //         //     Velocity.x *= -1;
        //         // }

        //         // if (
        //         //     (Position.y + Velocity.y) <= this.params.canvasPadding ||
        //         //     (Position.y + Velocity.y) >= this.canvas.height - this.params.canvasPadding - this.params.particleSize
        //         // ) {
        //         //     Velocity.y *= -1;
        //         // }
        //     }
        // })

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
        .createMultpleEntities(500)
        .onAllEntitiesNow((entity: Entity) => {
            if (engine.rng.nextf < 0.1) {
                entity.components.get('Attributes').type = 'Different';
                entity.components.get('Attributes').color = [255, 0, 0, 255];
                engine.addComponent(entity.alias, 'Attraction');
                engine.log.debug('Added Attraction component to entity', entity.alias);
            }
        })
        .onTickStart(() => {
            renderer.clear();
            renderer.resize();
        })
        .onTickEnd(() => {
            stats.innerText = `FPS: ${engine.clock.fps}`;
        })
        .run();
})();