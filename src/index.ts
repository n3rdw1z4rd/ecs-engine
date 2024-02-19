import './engine/css';
import { Engine, Entity, XY, XYWH, choose, log, randomFloat, randomRange } from './engine';
import { Renderer } from './renderer';

(() => {
    log('*** ecs-engine ***');

    const renderer: Renderer = new Renderer();
    renderer.appendTo(document.body);

    const engine: Engine = Engine.instance;

    // engine.traceLogEnabled = true;

    engine
        .createComponent('Boundary')
        .createComponent('Position', { x: 0, y: 0 })
        .createComponent('Velocity', {
            x: (): number => (randomFloat() * 4 - 2),
            y: (): number => (randomFloat() * 4 - 2),
            speed: 32,
        })
        .createComponent('Drawable', {
            color: () => choose(['red', 'green', 'blue', 'yellow']),
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
        .createSystem('Draw', 'Position', 'Drawable', (_, { Attraction, Position, Drawable }) => {
            renderer.drawCircle(
                new XY(Position.x, Position.y),
                Drawable.size,
                {
                    lineColor: Drawable.color,
                    fillColor: Drawable.color,
                }
            );

            // renderer.drawText(
            //     new XY(Position.x, Position.y + (Drawable.size * 5)),
            //     `${Math.floor(Position.x)}x${Math.floor(Position.y)}`,
            //     { textAlign: 'center', fontSize: 12 },
            // );

            if (Attraction) {
                renderer.drawCircle(
                    new XY(Position.x, Position.y),
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
                x: randomRange(0, renderer.width),
                y: randomRange(0, renderer.height),
            });

            // if (entity.components.get('Drawable').color !== 'red' && randomFloat() > 0.5) {
            //     engine.addComponent(entity.alias, 'Attraction');
            // }
        })
        .onTickStart(() => {
            renderer.clear();
            renderer.resize();
        })
        .run();
})();