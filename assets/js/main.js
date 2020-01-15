class Drawable {
    constructor(app) {
        this.x = 0;
        this.y = 0;
        this.app = app;
        this.number = this.app.elementNumber;
    }

    createElement() {

        this.element = $("\n" +
            "<div class=\"drag_element\" id='" + this.number + "' >\n" +
            "    <div class=\"element el-1 \">1</div>\n" +
            "    <div class=\"element el-2\">2</div>\n" +
            "    <div class=\"element el-3\">3</div>\n" +
            "    <div class=\"element el-4\">4</div>\n" +
            "    <div class='buttons-container'>" +
            "       <button class='btn-drag btn btn-outline-primary'>+</button>" +
            "       <button class='btn-drag btn btn-outline-danger'>-</button>" +
            "    </div>" +
            "    <div></div>" +
            "</div>");

        this.app.zone.append(this.element);
        this.app.elementNumber++;
        this.draw();

    }

    createLine(pos1, pos2) {
        let svg = $(`<line x1="${pos1.x}" y1="${pos1.y}" x2="${pos2.x}" y2="${pos2.y}" stroke="black" />`);
        this.app.svgContainer.append(svg);
    }

    draw() {
        this.element.css({
            left: this.x + "px",
            top: this.y + "px"
        })
    }

    update(){
        this.x = this.element.position().left;
        this.y = this.element.position().top;
    }

    removeElement(){
        this.element.remove();
    }
}

class Line extends Drawable{
    constructor(app, position){
        super(app);
        this.createLine(position.obj1, position.obj2)
    }
}


class DragElement extends Drawable {
    constructor(position, app) {
        super(app);

        this.x = position.x;
        this.y = position.y;

        this.createElement();

        this.w = this.h = this.element.width();

        this.drag();



        this.childElements = {
            firstElement: this.element[0].children[0],
            secondElement: this.element[0].children[1],
            threeElement: this.element[0].children[2],
            fourElement: this.element[0].children[3],
        };

        this.buttonsContainer = this.element[0].children[4];

        this.connectedElements = {
            firstElement: null,
            secondElement: null,
            threeElement: null,
            fourElement: null
        };

        this.lines = {
            firstElement: null,
            secondElement: null,
            threeElement: null,
            fourElement: null
        };

        this.clickEvents();
        this.buttonsShow();
    }

    buttonsShow(){
        if(this.number === 0){
            this.buttonsContainer.children[1].style.display = 'none';
        }
        this.element.mouseenter(()=>{
            this.buttonsContainer.style.opacity = 1;
        })
        this.element.mouseleave(()=>{
            this.buttonsContainer.style.opacity = 0;
        })
    }

    drag() {
        this.element.draggable();
    }

    connectedHelper(name){
        switch(name){
            case "firstElement":
                return "fourElement";
                break;
            case "secondElement":
                return "threeElement";
                break;
            case "threeElement":
                return "secondElement";
                break;
            case "fourElement":
                return "firstElement";
                break;
        }
    }




    clickEvents() {
        for(let name in this.childElements){
            let startTime, endTime, longPress;

            this.childElements[name].addEventListener('click' ,()=>{
                if(longPress) {
                    if (this.connectedElements[name] === null) {

                        this.childElements[name].className += " disable";
                        let pos = this.changePosition(name);
                        let el = app.spawn_element(DragElement, pos);



                        this.connectedElements[name] = el.number;
                        let connectedName = this.connectedHelper(name);

                        el.connectedElements[connectedName] = this.number;
                        el.childElements[connectedName].className += " disable";

                        this.app.connected.push({
                            from: `${this.number}-${name}`,
                            to: `${el.number}-${connectedName}`
                        })

                        this.app.store();
                        console.log(this.connectedElements)
                        console.log(this.app.connected)
                    }
                }
            })

            this.childElements[name].addEventListener('mousedown' ,()=>{
                startTime = new Date().getTime();
            })

            this.childElements[name].addEventListener('mouseup' ,()=>{
                endTime = new Date().getTime();
                longPress = (endTime - startTime > 100) ? false : true;
            })

        }
        this.buttonsContainer.children[1].onclick = () =>{
            if (this.app.remove(this)) {
                this.removeElement();
            }
        }
    }

    changePosition(name){
        switch(name){
            case "firstElement":
                return {x: this.x, y: this.y - 200};
                break;
            case "secondElement":
                return {x: this.x - 200, y: this.y};
                break;
            case "threeElement":
                return {x: this.x + 200, y: this.y};
                break;
            case "fourElement":
                return {x: this.x, y: this.y + 200};
                break;
        }
    }
}


class App {
    constructor() {
        this.zone = $('#drag_zone');
        this.svgContainer = $('.svg-container');
        this.elements = [];
        this.connected = [];
        this.elementNumber  = 0;
    }

    start() {
        console.log('app is started')
        this.startPos = {
            x: this.zone.width() / 2 - 60,
            y: this.zone.height() / 2 - 60,
        }
        this.mainEl = this.spawn_element(DragElement, this.startPos);

        this.loop();
    }

    remove(element){
        let idx = this.elements.indexOf(element);
        if(idx !== -1){
            this.elements.splice(idx,1);
            return true;
        }
        return false;
    }

    spawn_element(className, position) {
        let el = new className(position, this);
        this.elements.push(el);

        return el;
    }
    loop(){
        requestAnimationFrame(()=>{

            this.updateElements();

            this.loop();
        })
    }
    updateElements(){
        this.elements.forEach(e=>{
            e.update();
        })
    }

    store(){
        console.log('store not working :)')
    }
}

let app = new App();
app.start();