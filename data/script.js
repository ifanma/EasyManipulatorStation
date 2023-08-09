import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


var gateway = `ws://${window.location.hostname}/ws`;
var websocket;
function initWebSocket() {
    console.log('Trying to open a WebSocket connection...');
    websocket = new WebSocket(gateway);
    websocket.onopen = onOpen;
    websocket.onclose = onClose;
    websocket.onmessage = onMessage; // <-- add this line
    websocket.onerror = onerror;
}

function onOpen(event) {
    console.log('Connection opened');
}

function onClose(event) {
    console.log('Connection closed');
    setTimeout(initWebSocket, 2000);
}

function onMessage(event) {
    var state;
    if (event.data == "1") {
        state = "ON";
    }
    else {
        state = "OFF";
    }
    document.getElementById('state').innerHTML = state;
}

function onerror(event) {
    console.log('Error,...  connection closed');
}

window.addEventListener('load', onLoad);
window.onbeforeunload = function () {
    websocket.onclose = function () { }; // disable onclose handler first
    websocket.close()
};

function onLoad(event) {
    init();
    initWebSocket();
    initButton();
}

function initButton() {
    document.getElementById('button').addEventListener('click', toggle);
}

function toggle() {
    websocket.send('toggle');
}


var mesh, renderer, scene, camera, loadFinished;
function init() {

    //* 创建场景
    scene = new THREE.Scene();

    //* 加载模型
    // 1.STL 模型
    var loader = new STLLoader();
    loadFinished = false;
    loader.load("model.stl", function (geometry) {
        var material = new THREE.MeshLambertMaterial({
            color: 0xffffff,
        }); //材质对象Material
        // var material = new THREE.MeshNormalMaterial();

        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
    }, function (xhr) {
        var _onProgress = Math.floor(xhr.loaded / xhr.total * 100)
        if (_onProgress == 100) {
            loadFinished = true;
        }
        console.log("on progress");
    });

    // 2.Box 模型
    // var geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    // var material = new THREE.MeshNormalMaterial();
    // mesh = new THREE.Mesh(geometry, material);
    // scene.add(mesh);

    // 3.辅助坐标系  参数250表示坐标系大小，可以根据场景大小去设置
    var axisHelper = new THREE.AxesHelper(250);
    scene.add(axisHelper);

    //* 光源设置
    // 点光源
    var point = new THREE.DirectionalLight(0xffffff);
    point.position.set(1000, 50, 1000);
    point.castShadow = true;
    scene.add(point);

    //环境光
    scene.add(new THREE.AmbientLight(0x444444));

    //* 相机设置
    var width = window.innerWidth; //窗口宽度
    var height = window.innerHeight; //窗口高度
    var k = width / height; //窗口宽高比

    // 1.透视投影相机
    camera = new THREE.PerspectiveCamera(70, k, 1, 1000);
    // 2.正投影相机
    // var s = 200; //三维场景显示范围控制系数，系数越大，显示的范围越大
    // var camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000);

    // 3.设置相机位置
    camera.position.set(60, 60, 80); //设置相机位置
    camera.lookAt(scene.position); //设置相机方向(指向的场景对象)

    //* 创建渲染器对象
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width / 2, height / 2);
    renderer.shadowMap.enabled = true;
    renderer.setClearColor(0xb9d3ff, 1); //设置背景颜色

    // 在HTML showWindow中加入渲染器元素
    console.log();
    let showWindowID = document.getElementById("showWindow");
    renderer.domElement.style.display="inline";     // 调整block为inline能够居中
    showWindowID.appendChild(renderer.domElement);
    console.log("html appended renderer.");

    // 渲染器迭代函数，更新渲染，在其中可以让物体进行旋转
    function render() {
        //执行渲染操作   指定场景、相机作为参数
        renderer.render(scene, camera); //执行渲染操作
        if (mesh != undefined){
            mesh.rotation.x += 0.01;
            // mesh.rotateY(0.01);//每次绕y轴旋转0.01弧度
        }
        requestAnimationFrame(render); //请求再次执行渲染函数render
    }
    render();
    var controls = new OrbitControls(camera, renderer.domElement); //创建控件对象
}


// the other demo
// var WebSocket_connection;

// if (!"WebSocket" in window) {
//     alert("WebSocket NOT supported by your Browser!");
//     $('#WebSocket_State').text("WebSocket NOT supported by your Browser!");
// }

// window.onbeforeunload = function () {
//     websocket.onclose = function () { }; // disable onclose handler first
//     websocket.close()
// };

// function connect() {
//     WebSocket_connection = new WebSocket($('#websocket_address').val());

//     $('#WebSocket_State').text("Connecting");

//     WebSocket_connection.onopen = function () {
//         $('#WebSocket_State').html('<input type="text" id="websocket_message" value="Data to be send"/><a href=\"javascript:WebSocketSend()\">send WebSocket</a>');
//     };

//     WebSocket_connection.onmessage = function (evt) {
//         //read data and append it to output_div
//         animate(evt.data);
//         //$( "#output_div" ).append( evt.data + "<br>" );
//     };

//     WebSocket_connection.onerror = function () {
//         $('#WebSocket_State').text("Error,...  connection closed");
//     };

//     WebSocket_connection.onclose = function () {
//         $('#WebSocket_State').text("Disconnected");
//     };
// }


// function WebSocketSend() {
//     WebSocket_connection.send($('#websocket_message').val());
// }




// function animate(data) {

//     //requestAnimationFrame( animate );
//     //console.log(data)
//     //console.log(typeof(data))
//     var euler = JSON.parse(data);
//     //console.log(euler.roll,euler.pitch,euler.yaw)
//     mesh.rotation.x = (euler.roll) / 57320.0;
//     mesh.rotation.y = 0//(euler.yaw)/57320.0;
//     mesh.rotation.z = (euler.pitch) / 57320.0;
//     //mesh.rotation.z=0;
//     renderer.render(scene, camera);

// }