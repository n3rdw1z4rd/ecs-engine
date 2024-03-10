export class Emitter {
    private listeners: any;

    constructor() {
        this.listeners = {};
    }

    on(events: Array<string> | string, callback: Function): Emitter {
        if (!Array.isArray(events)) {
            events = [events];
        }

        events.forEach((event: string) => {
            if (!(event in this.listeners)) {
                this.listeners[event] = [callback];
            } else {
                this.listeners[event].push(callback);
            }
        });

        return this;
    }

    emit(event: string, ...args: any): Emitter {
        this.listeners[event]?.forEach((callback: Function) => callback.apply(null, args));

        return this;
    }
}