class Drawable {
    constructor(app) {
        this.x = 0;
        this.y = 0;
        this.app = app;
        this.number = this.app.elementNumber;

        if(this.constructor.name == 'Line'){
            this.lineNumber = this.app.lineNumb;
        }
    }

    createElement() { // create drag element

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

    createLine(pos1, pos2) { // create connect line
        //let svg = $(`<line x1="${pos1.x}" y1="${pos1.y}" x2="${pos2.x}" y2="${pos2.y}" stroke="black" />`);
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        let attrs = {
            x1: pos1.x,
            y1: pos1.y,
            x2: pos2.x,
            y2: pos2.y,
            stroke: "black"
        };

        for(let attr in attrs){
            svg.setAttribute(attr, attrs[attr]);
        }

        console.log(this.app.svgContainer)

        this.app.svgContainer.append(svg);
        this.app.lineNumb++;

        return svg;
    }

    draw() { // draw drag element on drag_zone
        this.element.css({
            left: this.x + "px",
            top: this.y + "px"
        })
    }

    update(){ // update position drag element
        this.x = this.element.position().left;
        this.y = this.element.position().top;
    }

    removeElement(){ // remove element in drag_zone
        this.element.remove();
    }
}

class Line extends Drawable{
    constructor(app, position){
        super(app);
        this.line = this.createLine(position.obj1, position.obj2);
    }

    update(pos1, pos2){ // update position line
        this.x1 = pos1.x;
        this.x2 = pos2.x;
        this.y1 = pos1.y;
        this.y2 = pos2.y;
    }

    getLine(){ // get object line
        return this.line;
    }

    draw(){ // draw line on svg
        let obj = {
            x1: this.x1,
            y1: this.y1,
            x2: this.x2,
            y2: this.y2
        }

        for(let name in obj){
            this.line.setAttribute(name, obj[name]);
        }
    }
}


class DragElement extends Drawable {
    constructor(position, app) {
        super(app);

        this.x = position.x;
        this.y = position.y;

        this.status = 'dragged';

        this.createElement();

        this.w = this.h = this.element.width();

        this.childElements = { // child element in element
            firstElement: this.element[0].children[0],
            secondElement: this.element[0].children[1],
            threeElement: this.element[0].children[2],
            fourElement: this.element[0].children[3],
        };

        this.buttonsContainer = this.element[0].children[4]; // buttons in element

        this.connectedElements = { // connected elements with this element
            firstElement: null,
            secondElement: null,
            threeElement: null,
            fourElement: null
        };

        this.lines = { // lines for connected elements
            firstElement: null,
            secondElement: null,
            threeElement: null,
            fourElement: null
        };

        this.clickEvents();
        this.buttonsShow();
    }

    buttonsShow(){ // show buttons container
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

    drag() { // function for drag this element
        if(!this.app.shiftPressed){

            this.element.draggable({
                disabled: false
            });
            this.status = 'dragged';
            for(let name in this.childElements){
                $(this.childElements[name]).draggable({
                    disabled: true,
                })
                this.childElements[name].style.opacity = "";
            }

        }
        else{

            for(let name in this.childElements){
                $(this.childElements[name]).draggable({
                    disabled: false,
                    revert: true
                })
                this.childElements[name].style.opacity = 1;
            }
            this.element.draggable({
                disabled: true
            });
            this.status = 'non-dragged';
        }

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

    update(){ // update lines

        for(let name in this.lines) {
            if(this.lines[name] !== null){
                let linePosition = {
                    obj1:{
                        x: this.x + this.w / 2,
                        y: this.y + this.h / 2
                    },
                    obj2:{
                        x: this.app.elements[this.app.elements.findIndex(item => item.number === this.connectedElements[name])].x + this.app.elements[this.app.elements.findIndex(item => item.number === this.connectedElements[name])].w / 2,
                        y: this.app.elements[this.app.elements.findIndex(item => item.number === this.connectedElements[name])].y + this.app.elements[this.app.elements.findIndex(item => item.number === this.connectedElements[name])].h / 2
                    }
                }
                this.app.lines[this.app.lines.findIndex(line => line.lineNumber === this.lines[name])].update(linePosition.obj1, linePosition.obj2);
                this.app.lines[this.app.lines.findIndex(line => line.lineNumber === this.lines[name])].draw();
            }
        }
        super.update();
    }

    clickEvents() { // click event handler
        
        for(let name in this.childElements){
            let startTime, endTime, longPress;

            this.childElements[name].addEventListener('click' ,()=>{

                if(longPress) {

                    if (this.connectedElements[name] === null) {

                        this.childElements[name].className += " disable"; // add class disable for disabled child element

                        let pos = this.changePosition(name); // change new position for new drag element
                        let el = app.spawn_element(DragElement, pos); // create new drag element
                        let linePosition = {
                            obj1:{
                                x: this.x + this.w / 2,
                                y: this.y + this.h / 2
                            },
                            obj2:{
                                x: el.x + el.w / 2,
                                y: el.y + el.h / 2
                            }
                        }
                        this.connectedElements[name] = el.number;

                        let connectedName = this.connectedHelper(name);
                        el.connectedElements[connectedName] = this.number;

                        el.childElements[connectedName].className += " disable";

                        let line = new Line(this.app, linePosition);

                        this.lines[name] = line.lineNumber; // create new line
                        el.lines[connectedName] = line.lineNumber; // create new line

                        this.app.lines.push(line);

                        // this place for connected logic

                        this.app.connected.push({
                            from: `${this.number}-${name}`,
                            to: `${el.number}-${connectedName}`
                        })

                        this.app.store();

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

        //delete drag and line connection
        this.buttonsContainer.children[1].onclick = () =>{
            for(let name in this.lines){
                if (this.lines[name] !== null) {
                    let el = this.app.elements[this.app.elements.findIndex(item => item.number === this.connectedElements[name])];

                    this.app.lines[this.app.lines.findIndex(line => line.lineNumber === this.lines[name])].line.remove();
                    this.app.lines.splice(this.app.lines.findIndex(line => line.lineNumber === this.lines[name]), 1);

                    let connectedName = this.connectedHelper(name);
                    el.lines[connectedName] = null;
                    el.connectedElements[connectedName] = null;
                    el.childElements[connectedName].classList.remove('disable');
                }
            }
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
        this.lines = [];
        this.connected = [];
        this.elementNumber  = 0;
        this.lineNumb  = 0;
        this.shiftPressed = false;

        this.keyEvents();
    }

    keyEvents(){
        document.addEventListener('keydown',e=>{
            if(e.key === "Shift"){
                this.shiftPressed = true;
            }
        })
        document.addEventListener('keyup', e=>{
            if(e.key === 'Shift'){
                this.shiftPressed = false;
            }
        })
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
            e.drag();
        })
    }

    store(){
        console.log('store not working :)')
    }
}

let app = new App();
app.start();