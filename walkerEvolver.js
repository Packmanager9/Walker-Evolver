
window.addEventListener('DOMContentLoaded', (event) => {

    let gen = 12//300


    let keysPressed = {}

    document.addEventListener('keydown', (event) => {
        keysPressed[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
        delete keysPressed[event.key];
    });

    let tutorial_canvas = document.getElementById("tutorial");
    let tutorial_canvas_context = tutorial_canvas.getContext('2d');

    tutorial_canvas.style.background = "#000000"

    class Triangle {
        constructor(x, y, color, length) {
            this.x = x
            this.y = y
            this.color = color
            this.length = length
            this.x1 = this.x + this.length
            this.x2 = this.x - this.length
            this.tip = this.y - this.length * 2
            this.accept1 = (this.y - this.tip) / (this.x1 - this.x)
            this.accept2 = (this.y - this.tip) / (this.x2 - this.x)

        }

        draw() {
            tutorial_canvas_context.strokeStyle = this.color
            tutorial_canvas_context.stokeWidth = 3
            tutorial_canvas_context.moveTo(this.x, this.y)
            tutorial_canvas_context.lineTo(this.x1, this.y)
            tutorial_canvas_context.lineTo(this.x, this.tip)
            tutorial_canvas_context.lineTo(this.x2, this.y)
            tutorial_canvas_context.lineTo(this.x, this.y)
            tutorial_canvas_context.stroke()
        }

        isPointInside(point) {
            if (point.x <= this.x1) {
                if (point.y >= this.tip) {
                    if (point.y <= this.y) {
                        if (point.x >= this.x2) {
                            this.accept1 = (this.y - this.tip) / (this.x1 - this.x)
                            this.accept2 = (this.y - this.tip) / (this.x2 - this.x)
                            this.basey = point.y - this.tip
                            this.basex = point.x - this.x
                            if (this.basex == 0) {
                                return true
                            }
                            this.slope = this.basey / this.basex
                            if (this.slope >= this.accept1) {
                                return true
                            } else if (this.slope <= this.accept2) {
                                return true
                            }
                        }
                    }
                }
            }
            return false
        }
    }


    class Rectangle {
        constructor(x, y, height, width, color) {
            this.x = x
            this.y = y
            this.height = height
            this.width = width
            this.color = color
            this.xmom = 0
            this.ymom = 0
        }
        draw() {
            tutorial_canvas_context.fillStyle = this.color
            tutorial_canvas_context.fillRect(this.x, this.y, this.width, this.height)
        }
        move() {
            this.x += this.xmom
            this.y += this.ymom
        }
        isPointInside(point) {
            if (point.x >= this.x) {
                if (point.y >= this.y) {
                    if (point.x <= this.x + this.width) {
                        if (point.y <= this.y + this.height) {
                            return true
                        }
                    }
                }
            }
            return false
        }
    }
    class Circle {
        constructor(x, y, radius, color, xmom = 0, ymom = 0) {

            this.height = 0
            this.width = 0
            this.x = x
            this.y = y
            this.radius = radius
            this.color = color
            this.xmom = xmom
            this.ymom = ymom
            this.lens = 0
        }
        draw() {
            tutorial_canvas_context.lineWidth = 0
            tutorial_canvas_context.strokeStyle = this.color
            tutorial_canvas_context.beginPath();
            tutorial_canvas_context.arc(this.x, this.y, this.radius, 0, (Math.PI * 2), true)
            tutorial_canvas_context.fillStyle = this.color
               tutorial_canvas_context.fill()
            tutorial_canvas_context.stroke();
        }
        move() {
            this.x += this.xmom
            this.y += this.ymom
        }
        isPointInside(point) {
            this.areaY = point.y - this.y
            this.areaX = point.x - this.x
            if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= (this.radius * this.radius)) {
                return true
            }
            return false
        }

        repelCheck(point) {
            this.areaY = point.y - this.y
            this.areaX = point.x - this.x
            if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= (this.radius + point.radius) * (point.radius + this.radius)) {
                return true
            }
            return false
        }
    }

    class Line {
        constructor(x, y, x2, y2, color, width) {
            this.x1 = x
            this.y1 = y
            this.x2 = x2
            this.y2 = y2
            this.color = color
            this.width = width
        }
        hypotenuse() {
            let xdif = this.x1 - this.x2
            let ydif = this.y1 - this.y2
            let hypotenuse = (xdif * xdif) + (ydif * ydif)
            return Math.sqrt(hypotenuse)
        }
        draw() {
            tutorial_canvas_context.strokeStyle = this.color
            tutorial_canvas_context.lineWidth = this.width
            tutorial_canvas_context.beginPath()
            tutorial_canvas_context.moveTo(this.x1, this.y1)
            tutorial_canvas_context.lineTo(this.x2, this.y2)
            tutorial_canvas_context.stroke()
            tutorial_canvas_context.lineWidth = 1
        }
    }

    class Observer {
        constructor() {
            this.body = new Circle(500, 500, 5, "white")
            this.ray = []
            this.rayrange = 220
            this.globalangle = Math.PI
            this.gapangle = Math.PI / 8
            this.currentangle = 0
            this.obstacles = []
            this.raymake = 40
        }

        beam() {
            this.currentangle = this.gapangle / 2
            for (let k = 0; k < this.raymake; k++) {
                this.currentangle += (this.gapangle / Math.ceil(this.raymake / 2))
                let ray = new Circle(this.body.x, this.body.y, 1, "white", ((this.rayrange * (Math.cos(this.globalangle + this.currentangle)))) / this.rayrange * 2, ((this.rayrange * (Math.sin(this.globalangle + this.currentangle)))) / this.rayrange * 2)
                ray.collided = 0
                ray.lifespan = this.rayrange - 1
                this.ray.push(ray)
            }
            for (let f = 3; f < this.rayrange / 2; f++) {
                for (let t = 0; t < this.ray.length; t++) {
                    if (this.ray[t].collided < 1) {
                        this.ray[t].move()
                        for (let q = 0; q < this.obstacles.length; q++) {
                            if (this.obstacles[q].isPointInside(this.ray[t])) {
                                this.ray[t].collided = 1
                            }
                        }
                    }
                }
            }
        }

        draw() {
            this.beam()
            this.body.draw()
            tutorial_canvas_context.lineWidth = 1
            tutorial_canvas_context.fillStyle = "red"
            tutorial_canvas_context.strokeStyle = "red"
            tutorial_canvas_context.beginPath()
            tutorial_canvas_context.moveTo(this.body.x, this.body.y)
            for (let y = 0; y < this.ray.length; y++) {
                tutorial_canvas_context.lineTo(this.ray[y].x, this.ray[y].y)
                tutorial_canvas_context.lineTo(this.body.x, this.body.y)
            }
            tutorial_canvas_context.stroke()
            tutorial_canvas_context.fill()
            this.ray = []
        }

        control() {
            if (keysPressed['t']) {
                this.globalangle += .05
            }
            if (keysPressed['r']) {
                this.globalangle -= .05
            }
            if (keysPressed['w']) {
                this.body.y -= 2
            }
            if (keysPressed['d']) {
                this.body.x += 2
            }
            if (keysPressed['s']) {
                this.body.y += 2
            }
            if (keysPressed['a']) {
                this.body.x -= 2
            }
        }
    }

    // class Bone{
    //     constructor(){
    //         this.body
    //     }

    // }

    class Muscle {
        constructor(joint, endJoint, animal) {
            this.animal = animal
            this.limbs = [joint, endJoint]
            this.body = joint.center
            this.anchor = endJoint.center
            this.radius = joint.center.radius*.5
            this.link = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "red", 2)
            this.length = this.link.hypotenuse()
            this.state = 1
            this.min = this.length * .5
            this.max = (this.limbs[0].dis+this.limbs[1].length)*.45
            this.counter = 0
            this.speed =  Math.random() * .05
        }
        draw() {
            this.balance()
            this.body = this.limbs[0].center
            this.anchor = this.limbs[1].center
            this.body.draw()
            this.anchor.draw()
            this.link = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "red", this.radius)
            if (this.state == -1) {
                this.link.color = "blue"
            }
            if (this.state == 0) {
                this.link.color = "gray"
            }
            this.length = this.link.hypotenuse()
            this.link.width = (this.length/this.max)*this.radius
            this.link.draw()
        }
        balance() {
            if (this.limbs[0].rooted + this.limbs[1].rooted == 0) {
                if (this.state == 1) {
                    if (this.length > this.min) {
                        this.limbs[0].angle += this.speed
                        this.limbs[1].angle -= this.speed
                    } else {
                        // this.state *= -1
                    }
                } else if (this.state == -1) {
                    if (this.length < this.max) {
                        this.limbs[0].angle -= this.speed
                        this.limbs[1].angle += this.speed
                    } else {
                        // this.state *= -1
                    }
                }
            } else if (this.limbs[0].rooted + this.limbs[1].rooted == 1) {
                if (this.limbs[0].rooted == 1) {
                    if (this.state == 1) {
                        if (this.length > this.min) {
                            this.limbs[1].angle -= this.speed 
                            if(this.animal.center != this.limbs[1].median){
                                let mediholder = {}
                                mediholder.x = this.limbs[0].median.x
                                mediholder.y = this.limbs[0].median.y
                               this.limbs[0].median.x = this.limbs[0].end.x + (this.limbs[0].dis * Math.cos(Math.PI + this.limbs[0].angle + this.speed))
                               this.limbs[0].median.y = this.limbs[0].end.y + (this.limbs[0].dis * Math.sin(Math.PI + this.limbs[0].angle + this.speed))
                               this.limbs[0].angle += this.speed
                               this.animal.center.x += mediholder.x- this.limbs[0].median.x
                               this.animal.center.y += mediholder.y- this.limbs[0].median.y

                            }else{
                                let mediholder = {}
                                mediholder.x = this.limbs[0].median.x
                                mediholder.y = this.limbs[0].median.y
                                this.limbs[0].median.x = this.limbs[0].end.x + (this.limbs[0].dis * Math.cos(Math.PI + this.limbs[0].angle + this.speed))
                                this.limbs[0].median.y = this.limbs[0].end.y + (this.limbs[0].dis * Math.sin(Math.PI + this.limbs[0].angle + this.speed))
                                this.limbs[0].angle += this.speed
                                // let protothing = {}
                                // protothing = this.limbs[0].holdcenter
                                // for(let t = 0;t<this.animal.joints.length;t++){
                                //     if(Object.keys(protothing).includes('holdcenter')){
                                //         protothing = protothing.holdcenter
                                //         protothing.center.x += mediholder.x- this.limbs[0].median.x
                                //         protothing.center.y += mediholder.y- this.limbs[0].median.y
                                //     }else{
                                //         protothing.center.x += mediholder.x- this.limbs[0].median.x
                                //         protothing.center.y += mediholder.y- this.limbs[0].median.y
                                //     }
                                // }
                            }
                        } else {
                            // this.state *= -1
                        }
                    } else if (this.state == -1) {
                        if (this.length < this.max) {
                            this.limbs[1].angle += this.speed 
                            if(this.animal.center != this.limbs[1].median){
                                let mediholder = {}
                                mediholder.x = this.limbs[0].median.x
                                mediholder.y = this.limbs[0].median.y
                               this.limbs[0].median.x = this.limbs[0].end.x + (this.limbs[0].dis * Math.cos(Math.PI + this.limbs[0].angle - this.speed))
                               this.limbs[0].median.y = this.limbs[0].end.y + (this.limbs[0].dis * Math.sin(Math.PI + this.limbs[0].angle - this.speed))
                               this.limbs[0].angle -= this.speed
                               this.animal.center.x += mediholder.x- this.limbs[0].median.x
                               this.animal.center.y += mediholder.y- this.limbs[0].median.y

                            }else{
                                this.limbs[0].median.x = this.limbs[0].end.x + (this.limbs[0].dis * Math.cos(Math.PI + this.limbs[0].angle - this.speed))
                                this.limbs[0].median.y = this.limbs[0].end.y + (this.limbs[0].dis * Math.sin(Math.PI + this.limbs[0].angle - this.speed))
                                this.limbs[0].angle -= this.speed
                                // let protothing = {}
                                // protothing = this.limbs[0].holdcenter
                                // for(let t = 0;t<this.animal.joints.length;t++){
                                //     if(Object.keys(protothing).includes('holdcenter')){
                                //         protothing = protothing.holdcenter
                                //         protothing.center.x += mediholder.x- this.limbs[0].median.x
                                //         protothing.center.y += mediholder.y- this.limbs[0].median.y
                                //     }else{
                                //         protothing.center.x += mediholder.x- this.limbs[0].median.x
                                //         protothing.center.y += mediholder.y- this.limbs[0].median.y
                                //     }
                                // }
                            }
                        } else {
                            // this.state *= -1
                        }
                    }
                }
                if (this.limbs[1].rooted == 1) {
                    if (this.state == 1) {
                        if (this.length > this.min) {
                            this.limbs[0].angle -= this.speed 
                            if(this.animal.center != this.limbs[1].median){
                                let mediholder = {}
                                mediholder.x = this.limbs[1].median.x
                                mediholder.y = this.limbs[1].median.y
                               this.limbs[1].median.x = this.limbs[1].end.x + (this.limbs[1].dis * Math.cos(Math.PI + this.limbs[1].angle + this.speed))
                               this.limbs[1].median.y = this.limbs[1].end.y + (this.limbs[1].dis * Math.sin(Math.PI + this.limbs[1].angle + this.speed))
                               this.limbs[1].angle += this.speed
                               this.animal.center.x += mediholder.x- this.limbs[1].median.x
                               this.animal.center.y += mediholder.y- this.limbs[1].median.y

                            }else{
                                let mediholder = {}
                                mediholder.x = this.limbs[1].median.x
                                mediholder.y = this.limbs[1].median.y
                                this.limbs[1].median.x = this.limbs[1].end.x + (this.limbs[1].dis * Math.cos(Math.PI + this.limbs[1].angle + this.speed))
                                this.limbs[1].median.y = this.limbs[1].end.y + (this.limbs[1].dis * Math.sin(Math.PI + this.limbs[1].angle + this.speed))
                                this.limbs[1].angle += this.speed
                                // let protothing = {}
                                // protothing = this.limbs[1].holdcenter
                                // for(let t = 0;t<this.animal.joints.length;t++){
                                //     if(Object.keys(protothing).includes('holdcenter')){
                                //         protothing = protothing.holdcenter
                                //         protothing.center.x += mediholder.x- this.limbs[1].median.x
                                //         protothing.center.y += mediholder.y- this.limbs[1].median.y
                                //     }else{
                                //         protothing.center.x += mediholder.x- this.limbs[1].median.x
                                //         protothing.center.y += mediholder.y- this.limbs[1].median.y
                                //     }
                                // }
                            }
                        } else {
                            // this.state *= -1
                        }
                    } else if (this.state == -1) {
                        if (this.length < this.max) {
                            this.limbs[0].angle += this.speed 
                            if(this.animal.center != this.limbs[1].median){
                                let mediholder = {}
                                mediholder.x = this.limbs[1].median.x
                                mediholder.y = this.limbs[1].median.y
                               this.limbs[1].median.x = this.limbs[1].end.x + (this.limbs[1].dis * Math.cos(Math.PI + this.limbs[1].angle - this.speed))
                               this.limbs[1].median.y = this.limbs[1].end.y + (this.limbs[1].dis * Math.sin(Math.PI + this.limbs[1].angle - this.speed))
                               this.limbs[1].angle -= this.speed
                               this.animal.center.x += mediholder.x- this.limbs[1].median.x
                               this.animal.center.y += mediholder.y- this.limbs[1].median.y

                            }else{
                                let mediholder = {}
                                mediholder.x = this.limbs[1].median.x
                                mediholder.y = this.limbs[1].median.y
                                this.limbs[1].median.x = this.limbs[1].end.x + (this.limbs[1].dis * Math.cos(Math.PI + this.limbs[1].angle - this.speed))
                                this.limbs[1].median.y = this.limbs[1].end.y + (this.limbs[1].dis * Math.sin(Math.PI + this.limbs[1].angle - this.speed))
                                this.limbs[1].angle -= this.speed
                                // let protothing = {}
                                // protothing = this.limbs[1].holdcenter
                                // for(let t = 0;t<this.animal.joints.length;t++){
                                //     if(Object.keys(protothing).includes('holdcenter')){
                                //         protothing = protothing.holdcenter
                                //         protothing.center.x += mediholder.x- this.limbs[1].median.x
                                //         protothing.center.y += mediholder.y- this.limbs[1].median.y
                                //     }else{
                                //         protothing.center.x += mediholder.x- this.limbs[1].median.x
                                //         protothing.center.y += mediholder.y- this.limbs[1].median.y
                                //     }
                                // }
                                
                            }
                            // console.log(mediholder)
                            // this.limbs[1].end = new Circle(this.limbs[1].median.x + (Math.cos(this.limbs[1].angle) * this.limbs[1].dis), this.limbs[1].median.y + (Math.sin(this.limbs[1].angle) * this.limbs[1].dis), this.limbs[1].median.radius, this.limbs[1].holdcenter.color)
                           
                        } else {
                            // this.state *= -1
                            
                        }
                    }
                }
            } else {

            }

            this.counter++
            if (this.counter % 10 == 0) {
                if (keysPressed[' ']) {
                    this.state *= -1
                }
            }

        }


    }

    class Joint {
        constructor(center, angle, dis, animal) {
            this.animal = animal
            this.holdcenter = center
            this.median = center.center
            this.angle = angle
            this.dis = dis
            this.rooted = 0
            this.end = new Circle(this.median.x + (Math.cos(this.angle) * this.dis), this.median.y + (Math.sin(this.angle) * this.dis), this.median.radius, this.holdcenter.color)
            this.center = new Circle((this.median.x + this.end.x) * .5, (this.median.y + this.end.y) * .5, this.median.radius, this.holdcenter.color)

        }
        draw() {

            this.median = this.holdcenter.center
            this.end = new Circle(this.median.x + (Math.cos(this.angle) * this.dis), this.median.y + (Math.sin(this.angle) * this.dis), this.median.radius, this.holdcenter.color)
            this.center = new Circle((this.median.x + this.end.x) * .5, (this.median.y + this.end.y) * .5, this.median.radius, this.holdcenter.color)
            if(this.rooted == 1){
                this.end.radius = 4
            }else{
                this.end.radius = 1

            }
            this.end.draw()
            // this.center.draw()

            this.link = new Line(this.end.x, this.end.y, this.median.x, this.median.y, "white", this.holdcenter.radius)

            this.link.draw()
        }

    }



    class Animal {
        constructor(x, y, bind = true) {
            this.r = Math.random() * 255
            this.g = Math.random() * 255
            this.b = Math.random() * 255
            this.color = `rgba(${this.r},${this.g},${this.b},1)`
            this.center = new Circle(x, y, 2, this.color)
            this.counter = 0

            // if(bind == true){
            let joint1 = new Joint(this,0+1,21)
            let joint2 = new Joint(this, 1+Math.PI*.5,21, this)
            // let joint3 = new Joint(joint2, 3,20)
            let joint4 = new Joint(this, 1+(Math.PI),21, this)
            let joint5 = new Joint(this, 1+(Math.PI*3)*.5,21, this)
            // let joint5 = new Joint(joint3, 5,20)

            let center = new Muscle(joint1, joint2, this)
            // let center2 = new Muscle(joint3, joint1)
            // let center3 = new Muscle(joint2, joint4, this)
            let center4 = new Muscle(joint4, joint5, this)
            // let center5 = new Muscle(joint5, joint1, this)
            // // let center4 = new Muscle(joint5, joint1)

            // let jointA = new Joint(this,Math.PI,12, this)
            // let jointB = new Joint(jointA,Math.PI,21, this)
            // let jointC = new Joint(jointA,Math.PI,21, this)
            // let jointD = new Joint(jointA,Math.PI,21, this)
            // let jointE = new Joint(jointA,Math.PI,21, this)
            // let jointF = new Joint(jointA,Math.PI,21, this)
            // let jointG = new Joint(jointA,Math.PI,21, this)
            // this.muscles = []
            // this.joints = []
            // let clone = {}


            // for(let t = 0;t<5;t++){
            //     clone = jointA
            //     this.joints.push(jointA)
            //     jointA = new Joint(clone,Math.PI,34, this)
            //     // if(t<4){
            //         let muscleA = new Muscle(jointA, clone, this)
            //         this.muscles.push(muscleA)
                    
            //     // }
            //     if(t == 4){

            //     this.joints.push(jointA)
            //     }
            // }





            // let jointAx = new Joint(this,Math.PI*.75,21, this)
            // let jointBx = new Joint(this,Math.PI*.25,21, this)
            // let jointC = new Joint(this,Math.PI,21, this)
            // let jointC = new Joint(jointA,Math.PI,21, this)
            // let jointD= new Joint(jointB,Math.PI,21, this)
            // let jointC = new Joint(jointB,Math.PI,21, this)
            // // let jointD = new Joint(jointC,Math.PI,21, this)
            // let muscleA = new Muscle(jointA, jointB, this)
            // let muscleAx = new Muscle(jointAx, jointBx, this)
            // let muscleAy = new Muscle(jointAx, jointB, this)
            // let muscleAz = new Muscle(jointA, jointBx, this)
            // let muscleB = new Muscle(jointB, jointC, this)
            // let muscleB = new Muscle(jointA, jointB, this)
            // let muscleC = new Muscle(jointA, jointB, this)
            // let muscleD = new Muscle(jointA, jointB, this)
            // let muscleB = new Muscle(jointC, jointB, this)
            // let muscleC = new Muscle(jointD, jointA, this)
            // let muscleB = new Muscle(jointB, jointC, this)
            // let muscleC = new Muscle(jointC, jointD, this)


            // this.muscles = [center, center3, center4, center5]
            this.joints = [joint1, joint2, joint4, joint5]
            this.muscles = [center,center4 ]
            //, muscleAx]//, t
            // }else{
            //     this.muscles =  []
            //     this.joints = []
            // }
            this.cyclemax = (gen*.5)+Math.floor(Math.random() * (gen*.5))
            this.cycles = []
            this.mcycles = []
            for (let t = 0; t < this.cyclemax; t++) {
                this.cycles.push([Math.floor(Math.random() * this.joints.length), Math.floor(Math.random() * 2), Math.floor(Math.random() * this.cyclemax)])
                if (Math.random() < .95) {
                    this.mcycles.push([Math.floor(Math.random() * this.muscles.length), 0, Math.floor(Math.random() * this.cyclemax)])
                } else if (Math.random() < .5) {
                    this.mcycles.push([Math.floor(Math.random() * this.muscles.length), 1, Math.floor(Math.random() * this.cyclemax)])
                } else  {
                    this.mcycles.push([Math.floor(Math.random() * this.muscles.length), -1, Math.floor(Math.random() * this.cyclemax)])
                }

            }
            // console.log(this)
        }
        draw() {
            this.counter++
            this.counter %= this.cyclemax
            for (let t = 0; t < this.joints.length; t++) {
                this.joints[t].draw()
                for (let k = 0; k < this.cycles.length; k++) {
                    if (this.cycles[k][0] == t) {
                        if (this.cycles[k][2] == this.counter) {
                            this.joints[t].rooted = this.cycles[k][1]
                        }
                    }
                }
            }
            for (let t = 0; t < this.muscles.length; t++) {
                this.muscles[t].draw()
                for (let k = 0; k < this.mcycles.length; k++) {
                    if (this.mcycles[k][0] == t) {
                        if (this.mcycles[k][2] == this.counter) {
                            this.muscles[t].state = this.mcycles[k][1]
                        }
                    }
                }
            }
            // this.center.draw()

        }
        mutate(){
            this.center.color = this.color
            for(let t = 0;t<this.cycles.length;t++){
                if(Math.random() < .05){
                    this.cycles[t] = [Math.floor(Math.random() * this.joints.length), Math.floor(Math.random() * 2), Math.floor(Math.random() * this.cyclemax)]
                }
            }
            for(let t = 0;t<this.mcycles.length;t++){
                if(Math.random() < .05){
                    this.mcycles[t] = [Math.floor(Math.random() * this.muscles.length), -1, Math.floor(Math.random() * this.cyclemax)]
                }
                if(Math.random() < .05){
                    this.mcycles[t] = [Math.floor(Math.random() * this.muscles.length), 1, Math.floor(Math.random() * this.cyclemax)]
                }
                if(Math.random() < .05){
                    this.mcycles[t] = [Math.floor(Math.random() * this.muscles.length), 0, Math.floor(Math.random() * this.cyclemax)]
                }
            }
            for(let t = 0;t<this.muscles.length;t++){
                if(Math.random()<.05){
                    this.muscles[t].speed+=.01
                }
                if(Math.random()<.05){
                    this.muscles[t].speed-=.01
                }
            }
            for(let t = 0;t<this.joints.length;t++){
                if(Math.random()<.05){
                    this.joints[t].dis+=(Math.random()*.3)
                }
                if(Math.random()<.05){
                    this.joints[t].dis-=(Math.random()*.3)
                }
            }


            for(let t =0;t<10;t++){
                if(Math.random()<.3){
                    this.cyclemax +=1
                }
                if(Math.random()<.3){
                    this.cyclemax -=1
                }
            }

            if(Math.random()<.05){
                this.cycles.push([Math.floor(Math.random() * this.joints.length), Math.floor(Math.random() * 2), Math.floor(Math.random() * this.cyclemax)])
            }

            if(Math.random()<.016){
            this.mcycles.push([Math.floor(Math.random() * this.muscles.length), 1, Math.floor(Math.random() * this.cyclemax)])
            }

            if(Math.random()<.016){
            this.mcycles.push([Math.floor(Math.random() * this.muscles.length), 0, Math.floor(Math.random() * this.cyclemax)])
            }

            if(Math.random()<.016){
            this.mcycles.push([Math.floor(Math.random() * this.muscles.length), -1, Math.floor(Math.random() * this.cyclemax)])
            }
        }


    }


    let animals = []

    let chopper = 150
    for (let t = 0; t < chopper; t++) {
        let mule = new Animal(150, 350)
        animals.push(mule)

    }

    let fitnessdot = new Circle(650, 350, 12, "gold")
    let fitnesscutoff = 100000
    let indexcut = 0
    let counter = 0



    window.setInterval(function () {
        tutorial_canvas_context.clearRect(0, 0, tutorial_canvas.width, tutorial_canvas.height)
        for (let t = 0; t < animals.length; t++) {
            animals[t].draw()
        }
        // for (let t = 0; t < animals.length; t++) {
        //     animals[t].center.draw()
        // }
        fitnessdot.draw()


        counter++
        if (counter >= gen) {
            gen++
            fitnesscutoff = 100000
            indexcut = -1
            for (let t = 0; t < animals.length; t++) {
                let link = new Line(animals[t].center.x, animals[t].center.y, fitnessdot.x, fitnessdot.y, "#00FF00", 1)
                if (fitnesscutoff > link.hypotenuse()) {
                    fitnesscutoff = link.hypotenuse()
                    link.draw()
                    indexcut = t
                }
            }
            refresh()
            counter = 0
            // console.log(animals[indexcut].cycles)
        }
        // if(counter > gen + 3){

        // }
        if(counter%10 == 0){
            if(keysPressed['l']){
                chopper--
                console.log(chopper)
            }
            if(keysPressed['v']){
                chopper  = 1
                console.log(chopper)
            }
            if(keysPressed['c']){
                chopper  = 50
                console.log(chopper)
            }
            if(keysPressed['k']){
                chopper++
                console.log(chopper)
            }
            if(keysPressed['f']){
                gen--
                console.log(gen)
            }
            if(keysPressed['g']){
                gen++
                console.log(gen)
            }
            if(keysPressed['q']){
                console.log(animals)
            }
        }

    }, 40)


    function refresh() {
        let animb = []

        for (let t = 0; t < chopper;t++) {
            let animal = new Animal(150,350)
            animal.cycles = [...animals[indexcut].cycles]
            animal.mcycles = [...animals[indexcut].mcycles]
            animal.cyclemax = animals[indexcut].cyclemax

            // for(let k = 0;k<animal.cycles.length;k++){
            //     if(animal.cycles[k]!=animals[indexcut].cycles[k]){
            //         console.log("error inheriting")
            //     }
            // }

            for(let k = 0;k<animals[indexcut].joints.length;k++){
                animal.joints[k].dis = animals[indexcut].joints[k].dis
            }

            for(let k = 0;k<animals[indexcut].muscles.length;k++){
                animal.muscles[k].speed = animals[indexcut].muscles[k].speed
            }
            animal.r = Math.round(animals[indexcut].r+((Math.random()-.5)*80))
            animal.g = Math.round(animals[indexcut].g+((Math.random()-.5)*80))
            animal.b = Math.round(animals[indexcut].b+((Math.random()-.5)*80))
            
            if(animal.r < 0){
                animal.r = 0
            }
            if(animal.r > 255){
                animal.r = 255
            }
    
            if(animal.g < 0){
                animal.g = 0
            }
            if(animal.g > 255){
                animal.g = 255
            }
    
            if(animal.b < 0){
                animal.b = 0
            }
            if(animal.b > 255){
                animal.b = 255
            }
            animal.color = `rgba(${animal.r},${animal.g},${animal.b},1)`
            if(t > 0){
                animal.mutate()
            }

            // for(let k = 0;k<animal.cycles.length;k++){
            //     if(animal.cycles[k]!=animals[indexcut].cycles[k]){
            //         console.log("natural mutation")
            //     }
            // }
            animb.push(animal)

        }

        animals = []
        animals = [...animb]
    }



})