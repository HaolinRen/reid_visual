
"use strict"

var map3D = function() {
    var ele = $('#map3d');
    var width = window.innerWidth-50;
    var height = width>>1;
    ele.width(width)

    const BOTTOM = -100;
    const LEFT = -300;
    const RIGHT = 300;

    const WIDTH = 0;
    const DEPTH = 600;


    const COLOR_GRIS = '#C0C0C0';

    const circleRadius = 80;

    const circle0 = {
        x0: -200,
        y0: -200,
        x1: -280,
        y1: -280,
        color: '#FFFFFF'
    }

    const circle1 = {
        x0: 50,
        y0: -200,
        x1: -130,
        y1: -280,
        color: '#FFFFFF'
    }

    const circle2 = {
        x0: -200,
        y0: 50,
        x1: -280,
        y1: -30,
        color: '#FFFFFF'
    }

    const circle3 = {
        x0: 20,
        y0: 30,
        x1: -60,
        y1: -50,
        color: '#FFFFFF'
    }

    const circle4 = {
        x0: 250,
        y0: -50,
        x1: 170,
        y1: -130,
        color: '#FFFFFF'
    }

    const circle5 = {
        x0: 180,
        y0: 180,
        x1: 100,
        y1: 100,
        color: '#FFFFFF'
    }

    let circleList = [circle0, circle1, circle2, circle3, circle4, circle5]
    var scene = new THREE.Scene();

    scene.background = new THREE.Color( '#FFFFFF' );

    var camera = new THREE.PerspectiveCamera(90, width/height, 0.1 , 1000);
    camera.position.set( 0, 100, 100 );
    camera.lookAt( 0, 0, 0 );

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    ele.append(renderer.domElement)

    var group = new THREE.Group();
    scene.add( group )

    var nodesGroup = new THREE.Group();
    scene.add(nodesGroup)

    var controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.enableDamping = true;

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        controls.update();
    }

    function addFlatShape( shape, color, x=0, y=0, z=0, rx=0, ry=0, rz=0) {

        var geometry = new THREE.ShapeBufferGeometry( shape );

        var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: color, side: THREE.DoubleSide, opacity: 0.3, transparent: true } ) );
        mesh.position.set( x, y, z );
        mesh.rotation.set( rx, ry, rz );
        group.add( mesh );

    }


    function addLine(shape, color, x, y, z, rx, ry, rz) {
        var points = shape.getPoints();
        var geometryPoints = new THREE.BufferGeometry().setFromPoints( points );
        var line = new THREE.Line( geometryPoints, new THREE.LineBasicMaterial( { color: color } ) );
        line.position.set( x, y, z );
        line.rotation.set( rx, ry, rz );
        group.add( line );
    }

    function addCurve(vp, color) {

        
        var curve = new THREE.CatmullRomCurve3(vp);
        var geometry = new THREE.Geometry();
        geometry.vertices = curve.getPoints(50);
        var material = new THREE.LineBasicMaterial({color : color});
        var line = new THREE.Line(geometry, material);
        group.add(line)
    }

    function addLight(x, y, z, intensity = 0.8, color=0xFFFFFF) {

        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(x,y,z)
        scene.add(light);

    }


    function createRanShape(sqLength, sqWidth) {
        return new THREE.Shape()
                        .moveTo( 0, 0 )
                        .lineTo( 0, sqLength )
                        .lineTo( sqWidth, sqLength )
                        .lineTo( sqWidth, 0 )
                        .lineTo( 0, 0 );
    }

    function makeInstance(boxWidth, boxHeight, boxDepth, color, x, y, z) {

        var geometry = new THREE.BoxGeometry( boxWidth, boxHeight, boxDepth );

        let material = new THREE.MeshPhongMaterial({
            color, 
            opacity: 0.9,
            transparent: true
        })

        let cube = new THREE.Mesh(geometry, material);
        cube.position.set(x, y, z);

        group.add(cube)

        return cube
    }

    function createRandomBuilding(x0, y0, boxWidth, boxHeight) {
        let bn = parseInt(Math.random() * 5 + 2);
        let border = boxWidth/10;
        let bbw = boxWidth - 2 * border;
        let bbh = boxHeight - 2 * border;

        let bbd = 50*Math.random()
        let startX = x0 + border + bbw/2;
        let startY = y0 - border -  bbh/2;
        
        // let bh = Math.random() * 10;
        // let bd = boxWidth >> 1;
        // let bw = bd * Math.random() * 4;
        // for (let i = 0; i < bn; i += 1) {
        //  let tx = x0 + i * bd;
        //  let ty = y0 + i * bw;
        //  makeInstance(bw, bh, bd, COLOR_GRIS, tx, ty)
        // }
        makeInstance(bbw, bbd, bbh, COLOR_GRIS, startX, BOTTOM+bbd/2, startY)
    }

    function addPositionCircle(left, depth) {
        
        let r = -90 * Math.PI / 180
        var circleShape = new THREE.Shape()
            .moveTo( 0, circleRadius )
            .quadraticCurveTo( circleRadius, circleRadius, circleRadius, 0 )
            .quadraticCurveTo( circleRadius, - circleRadius, 0, - circleRadius )
            .quadraticCurveTo( - circleRadius, - circleRadius, - circleRadius, 0 )
            .quadraticCurveTo( - circleRadius, circleRadius, 0, circleRadius );

        circleShape.autoClose = true;

        var spacedPoints = circleShape.getSpacedPoints( 80 );

        var geometrySpacedPoints = new THREE.BufferGeometry().setFromPoints( spacedPoints );


        var particles = new THREE.Points( geometrySpacedPoints, new THREE.PointsMaterial( { color: '#E52B50', size: 2 } ) );
        particles.position.set( left, BOTTOM, depth );
        particles.rotation.set( r, 0, 0 );
        // particles.scale.set( r, 0, 1 );
        group.add( particles );

    }

    function addCircles() {
        addPositionCircle(circle0.x0, circle0.y0)
        addPositionCircle(circle1.x0, circle1.y0)
        addPositionCircle(circle2.x0, circle2.y0)
        addPositionCircle(circle3.x0, circle3.y0)
        addPositionCircle(circle4.x0, circle4.y0)
        addPositionCircle(circle5.x0, circle5.y0)
    }

    function createGarden(z0, z1, r) {
        let points = []

        let xp2 = 40
        points.push([xp2, BOTTOM, z0])

        points.push([xp2, BOTTOM, z1])

        points.push([xp2+10, BOTTOM, z1])

        points.push([xp2*4, BOTTOM, (z0+z1)/2])

        points.push([xp2+20, BOTTOM, z0])

        points.push([xp2, BOTTOM, z0])

        let vp = []

        for (let p of points) {
            vp.push(new THREE.Vector3(p[0], p[1], p[2]))
        }

        addCurve(vp, '#A9A9A9');
        // addFlatShape(vp, '#F5F5F5', xp2, BOTTOM, 0, r, 0, 0);
    }

    function createRandom() {

        let xNum = 6;
        let zNum = 10
        let width0 = 32;
        let startPosi = LEFT - width0 * xNum;
        let startZposi = LEFT * 3;
        let endZposi = startZposi;
        let r = -90 * Math.PI / 180;

        for (let i = 0; i < xNum; i += 1) {
            let tp = startZposi
            for (let j = 0; j < zNum; j += 1) {

                let roadWidth = Math.random() * 20 + 10;
                let tempWidth = width0 - Math.random() * 10;
                tp += tempWidth + roadWidth;

                let w0 = width0 + Math.random() * 5;
                var sq = createRanShape(tempWidth, w0);

                addFlatShape(sq, '#F5F5F5', startPosi, BOTTOM, tp, r, 0, 0);
                addLine(sq, '#A9A9A9', startPosi, BOTTOM, tp, r, 0, 0);
                createRandomBuilding(startPosi, tp, w0, tempWidth);

                if (tp > endZposi) {
                    endZposi = tp
                }

            }
            
            startPosi += width0 + Math.random() * 20 + 5
        }   

        // createGarden(startZposi, endZposi, r)

    }

    function addSprite(imgPath) {

        var textured = new THREE.TextureLoader().load(imgPath);
        var spriteMaterial = new THREE.SpriteMaterial({
        // color: 0xffffff,
            map: textured
        });
        var sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(
            Math.random() * 300 - 100,
            Math.random() * 200,
            Math.random() * 300
        );

        sprite.scale.set(15, 15, 15)

        scene.add(sprite);

    }


    function addPoint(x, y, z, color) {
        
        let material = new THREE.MeshPhongMaterial({
            color: color, 
            opacity: 0.95,
            transparent: true,
        })
        let object = new THREE.Mesh( new THREE.SphereBufferGeometry( 40, 40, 40 ), material );
        object.position.set(x, y, z);
        object.scale.set(0.1, 0.1, 0.1)
        nodesGroup.add( object );
    }

    function clearNodes() {
        scene.remove(nodesGroup)
        nodesGroup = new THREE.Group();
        scene.add(nodesGroup)
    }

    return {
        createScene : function() {
            
            addLight(1, 1, 1, 0.5)
            addLight(0, 1, -1, 0.4)

            var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
            scene.add( ambientLight );

            var helper = new THREE.GridHelper( 600, 100 );
            helper.material.opacity = 0.25;
            helper.material.transparent = true;
            helper.position.set(0, BOTTOM, 0)
            group.add( helper );
            // createRandom();

            addCircles()
            // createParticles()
            animate()
        },
        addNodes: function(graphWidth, graphHeight, d) {
            "0315_c3s1_071117_02.jpg"
            clearNodes()
            let maxX = 0;
            let maxY = 0;

            let minTime = 0;
            let maxTime = 0;
            let timeArr = []
            for (let n of d.innerNodes) {
                if (n.x > maxX) {
                    maxX = n.x
                }
                if (n.y > maxY) {
                    maxY = n.y
                }
                let timeinfo = +n.imageID.split('_')[2];
                timeArr.push(timeinfo);
            }
            timeArr.sort();
            let timeDict = {}
            let lg = 200 / timeArr.length;
            let i = 0;
            for (let one of timeArr) {
                timeDict[one] = i * lg;
                i += 1
            }
            for (let n of d.innerNodes) {
                let info = n.imageID.split('_');
                let color = n.color;

                let camerID = +info[1].substring(1, 2) - 1;
                // let tinfo = info[1].substring(3, 4) + info[2];
                let tinfo = +info[2];

                let circleCeur = circleList[camerID];

                let x = circleCeur.x1 + n.x / maxX * circleRadius * 2;
                let y = circleCeur.y1 + n.y / maxY * circleRadius * 2;
                
                addPoint(x, timeDict[tinfo], y, color)
            }
        },
        addSprite: addSprite
    }

}()