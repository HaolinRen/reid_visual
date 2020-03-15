
"use strict"

var map3D = function() {
    var ele = $('#map3d');
    var width = window.innerWidth-50;
    var height = width>>1;
    ele.width(width)

    const BOTTOM = -30;
    const LEFT = -100;

    const COLOR_GRIS = '#C0C0C0';

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

    function addExtrudedShape( shape, color, depth=8, x=0, y=0, z=0, rx=0, ry=0, rz=0, s=1 ) {
        // extruded shape
        var extrudeSettings = { depth: depth, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };

        var geometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings );

        var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: color } ) );
        mesh.position.set( x, y, z );
        mesh.rotation.set( rx, ry, rz );
        mesh.scale.set( s, s, s );
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

    function addLineShape( shape, color, x, y, z, rx, ry, rz, s ) {

        shape.autoClose = true;

        var points = shape.getPoints();
        var spacedPoints = shape.getSpacedPoints( 50 );

        var geometryPoints = new THREE.BufferGeometry().setFromPoints( points );
        var geometrySpacedPoints = new THREE.BufferGeometry().setFromPoints( spacedPoints );

        // solid line

        var line = new THREE.Line( geometryPoints, new THREE.LineBasicMaterial( { color: color } ) );
        line.position.set( x, y, z - 25 );
        line.rotation.set( rx, ry, rz );
        line.scale.set( s, s, s );
        group.add( line );

        // line from equidistance sampled points

        var line = new THREE.Line( geometrySpacedPoints, new THREE.LineBasicMaterial( { color: color } ) );
        line.position.set( x, y, z + 25 );
        line.rotation.set( rx, ry, rz );
        line.scale.set( s, s, s );
        group.add( line );

        // vertices from real points

        var particles = new THREE.Points( geometryPoints, new THREE.PointsMaterial( { color: color, size: 4 } ) );
        particles.position.set( x, y, z + 75 );
        particles.rotation.set( rx, ry, rz );
        particles.scale.set( s, s, s );
        group.add( particles );

        // equidistance sampled points

        var particles = new THREE.Points( geometrySpacedPoints, new THREE.PointsMaterial( { color: color, size: 4 } ) );
        particles.position.set( x, y, z + 125 );
        particles.rotation.set( rx, ry, rz );
        particles.scale.set( s, s, s );
        group.add( particles );

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
        addFlatShape(vp, '#F5F5F5', xp2, BOTTOM, 0, r, 0, 0);
    }

    function createRandom() {

        let xNum = 6;
        let zNum = 10
        let width0 = 32;
        let startPosi = LEFT - width0 * xNum;
        let startZposi = LEFT * 3;
        let endZposi = startZposi;
        let r = -90 * Math.PI / 180
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
        console.log(imgPath)
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
    return {
        createScene : function() {
            
            addLight(1, 1, 1, 0.4)
            addLight(0, 1, -1, 0.4)

            var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.56 );
            scene.add( ambientLight );

            // var helper = new THREE.GridHelper( 200, 4 );
            // helper.position.set(0, BOTTOM, 0)
            // group.add( helper );
            createRandom();

            animate()
        },
        addSprite: addSprite
    }

}()