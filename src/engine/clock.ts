export class Clock {
    private _lastFrameTime: number = 0;
    private _deltaTime: number = 0;
    private _frameCount: number = 0;
    private _frameTime: number = 0;
    private _fps: number = 0;

    get fps(): number { return this._fps; }
    get deltaTime(): number { return this._deltaTime; }
    get time(): number { return this._lastFrameTime; }

    update(time: number) {
        this._deltaTime = (time - this._lastFrameTime) / 1000;
        this._lastFrameTime = time;

        if (this._frameTime + 1000 >= time) {
            this._frameCount += 1;
        } else {
            this._frameTime = time;
            this._fps = this._frameCount;
            this._frameCount = 0;
        }
    }
}