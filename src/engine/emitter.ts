export type EmitterCallback = (...args: any) => void;

export class Emitter {
    private listeners: any = {};

    on(event: string, callback: EmitterCallback): void {
        if (this.listeners[event] === undefined) {
            this.listeners[event] = [callback];
        } else {
            this.listeners[event].push(callback);
        }
    }

    emit(event: string, ...args: any[]) {
        this.listeners[event]?.forEach((callback) => callback(...args));
    }
}