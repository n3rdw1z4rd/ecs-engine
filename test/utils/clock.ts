export class Clock {
    private _lastFrameTime: number = 0;
    private _deltaTime: number = 0;
    private _frameCount: number = 0;
    private _frameTime: number = 0;
    private _fps: number = 0;
    private _isRunning: boolean = false;
    private _updateCallback: (deltaTime: number) => void = () => { };

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

    private _update(time: number) {
        this.update(time);

        this._updateCallback(this._deltaTime);

        if (this._isRunning) {
            requestAnimationFrame(this._update.bind(this));
        }
    }

    run(callback: (deltaTime: number) => void) {
        if (!this._isRunning) {
            this._isRunning = true;
            this._updateCallback = callback;
            requestAnimationFrame(this._update.bind(this));
        }
    }

    runOnce(callback: (deltaTime: number) => void) {
        this._isRunning = false;
        this._updateCallback = callback;
        this._update(0);
    }

    stop() {
        this._isRunning = false;
    }
}