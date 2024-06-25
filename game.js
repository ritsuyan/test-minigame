// 初始化场景
var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);

var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 0.0000000000000000000001);

    // 相机
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    // 光照
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // 地面
    var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 20, height: 20 }, scene);

    // 玩家方块
    var player = BABYLON.MeshBuilder.CreateBox("player", { size: 1 }, scene);
    player.position.y = 0.5; // 将方块放在地面上

    // 障碍物生成
    var obstacles = [];
    var obstacleInterval = 3; // 障碍物生成间隔（秒）
    var lastObstacleTime = 0;

    scene.onBeforeRenderObservable.add(function () {
        var deltaTime = engine.getDeltaTime() / 1000; // 转换成秒

        // 让玩家自动向前移动
        player.moveWithCollisions(new BABYLON.Vector3(0, 0, 2 * deltaTime));

        // 生成障碍物
        if (performance.now() / 1000 - lastObstacleTime > obstacleInterval) {
            var obstacle = BABYLON.MeshBuilder.CreateBox("obstacle", { size: 1 }, scene);
            obstacle.position.x = Math.random() * 10 - 5; // X 范围在 -5 到 5 之间
            obstacle.position.z = player.position.z + 20; // 放在玩家前方一段距离
            obstacles.push(obstacle);
            lastObstacleTime = performance.now() / 1000;
        }

        // 检测障碍物是否需要被移除
        for (var i = 0; i < obstacles.length; i++) {
            if (obstacles[i].position.z < player.position.z - 5) {
                obstacles[i].dispose();
                obstacles.splice(i, 1);
                i--;
            }
        }
    });

    // 处理空格键事件
    window.addEventListener("keydown", function (event) {
        if (event.keyCode === 32) { // 空格键的 keyCode 是 32
            // 跳过当前障碍物（将第一个障碍物移除）
            if (obstacles.length > 0) {
                obstacles[0].dispose();
                obstacles.shift();
            }
        }
    });

    // 碰撞检测
    scene.onBeforeRenderObservable.add(function () {
        for (var i = 0; i < obstacles.length; i++) {
            if (player.intersectsMesh(obstacles[i], true)) {
                console.log("Game Over!");
                // 这里可以添加游戏结束逻辑
                engine.stopRenderLoop();
            }
        }
    });

    return scene;
};

var scene = createScene();

engine.runRenderLoop(function () {
    scene.render();
});

// 窗口大小变化时重新渲染
window.addEventListener("resize", function () {
    engine.resize();
});
