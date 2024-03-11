export class StatsDiv {
    docTitle: string;
    div: HTMLDivElement;

    constructor(docTitle: string = 'ecs-engine-demo') {
        this.docTitle = docTitle;

        this.div = document.createElement('div');
        this.div.style.setProperty('position', 'absolute');
        this.div.style.setProperty('top', '0');
        this.div.style.setProperty('right', '0');
        this.div.style.setProperty('color', 'white');
        this.div.style.setProperty('background-color', 'black');
        this.div.style.setProperty('padding', '16px');
        this.div.style.setProperty('font-size', '1.2rem');
        this.div.style.setProperty('z-index', '100');

        document.title = this.docTitle;
        document.body.appendChild(this.div);
    }

    updateContent(data: object): void {
        this.div.innerHTML = Object.entries(data).map(([key, value]) => `${key}: ${value}`).join('<br>');
    }
}