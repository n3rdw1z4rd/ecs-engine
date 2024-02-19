export const EPSILON: number = 0.000001;
export const DEG_2_RAD_FACTOR: number = (Math.PI / 180);
export const RAD_2_DEG_FACTOR: number = (180 / Math.PI);
export const PI_X2 = (Math.PI * 2);

export class XY {
    constructor(public x: number = 0, public y: number = 0) { }
}

export class XYWH {
    constructor(
        public x: number = 0,
        public y: number = 0,
        public w: number = 0,
        public h: number = 0,
    ) { }
}