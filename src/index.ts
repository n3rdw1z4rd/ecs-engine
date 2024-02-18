import './engine/css';
import { Clock, Engine, Entity, choose, log, randomFloat, randomRange } from './engine';

type CTX = CanvasRenderingContext2D;
const DEVICE_PIXEL_RATIO: number = window.devicePixelRatio;

function InitCtx(): CTX {
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    const ctx: CTX = canvas.getContext('2d');

    if (!ctx) throw 'failed to init ctx';

    document.body.appendChild(canvas);
    ResizeCtx(ctx);

    return ctx;
}

function ResizeCtx(ctx: CTX, displayWidth?: number, displayHeight?: number): void {
    const { width, height } = (
        ctx.canvas.parentElement?.getBoundingClientRect() ??
        ctx.canvas.getBoundingClientRect()
    );

    displayWidth = (0 | (displayWidth ?? width) * DEVICE_PIXEL_RATIO);
    displayHeight = (0 | (displayHeight ?? height) * DEVICE_PIXEL_RATIO);

    if (ctx.canvas.width !== displayWidth || ctx.canvas.height !== displayHeight) {
        ctx.canvas.width = displayWidth
        ctx.canvas.height = displayHeight;
    }
}

(() => {
    log('*** me3 ECS ***');
    log('*** _ENV:', _ENV);

    const clock: Clock = new Clock();
    const ctx: CTX = InitCtx();
    const eng: Engine = Engine.instance;

    eng
        .createComponent('Position', { x: 0, y: 0 })
        .createComponent('Boundary', { minx: 0, miny: 0, maxx: ctx.canvas.width, maxy: ctx.canvas.height })
        .createComponent('Velocity', { x: 0, y: 0 })
        .createComponent('Drawable', { color: 'red', size: 4 })
        .createSystem('Draw', 'Position', 'Drawable', ({ Position, Drawable }) => {
            ctx.fillStyle = Drawable.color;
            ctx.fillRect(Position.x, Position.y, Drawable.size, Drawable.size);
        })
        .createSystem('Movement', 'Position', 'Velocity', ({ Boundary, Position, Velocity }) => {
            Velocity.x += randomFloat() - 0.5;
            Velocity.y += randomFloat() - 0.5;

            if (Boundary) {
                if (
                    Position.x + Velocity.x <= Boundary.minx ||
                    Position.x + Velocity.x >= Boundary.maxx
                ) Velocity.x *= -1;

                if (
                    Position.y + Velocity.y <= Boundary.miny ||
                    Position.y + Velocity.y >= Boundary.maxy
                ) Velocity.y *= -1;
            }

            const dt: number = eng.getGlobal('deltaTime') as number;

            Position.x += (Velocity.x * dt);
            Position.y += (Velocity.y * dt);
        })
        .createEntityWithAlias('Node', 'Position', 'Velocity', 'Drawable', 'Boundary')
        .duplicateEntity('Node', 999)
        .onAllEntitiesNow((entity: Entity) => {
            entity.components.set('Position', {
                x: randomRange(0, ctx.canvas.width),
                y: randomRange(0, ctx.canvas.height),
            });

            entity.components.set('Drawable', { size: 4, color: choose(['red', 'green', 'blue', 'yellow']) });
        })
        .beforeSystems((time: number) => {
            clock.update(time);
            eng.setGlobal('deltaTime', clock.deltaTime);

            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ResizeCtx(ctx);
        })
        .run();
})();