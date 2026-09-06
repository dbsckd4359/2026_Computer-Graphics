var gl;
let vertices = [];
var GroundVertexCount = 0, Parent_GroundVertexCount, objVertexCount = 0,
    SliderVertexCount = 0, TeeterVertexCount = 0,
    BarrierVertexCount = 0, BenchVertexCount = 0, //Barrier : railings 

    MerryVertexCount = 0, CrossBarVertexCount = 0,

    Swing_body_VertexCount = 0, swing_left_VertexCount = 0,
    swing_right_VertexCount = 0,

    lamp_body_VertexCount = 0, lamp_head_VertexCount = 0,
    SeeSaw_Head_VertexCount = 0, SeeSaw_Body_VertexCount = 0,

    ArchwayVertexCount = 0,
    StandVertexCount = 0,
    URP_Tree_VertexCount = 0,
    sirenVertexCount = 0;

var theta = 45, SliderTheta = 135, SeeSawTheta = 90, MerryTheta = -90, BarrierAngle = -90, BenchAngle = -90, SwingTheta = 0;

var program1, program2, program3;

let eye = vec3(0, 5, 28), at = vec3(0, 0, 0), cameraVec = vec3(0, -0.4472, -0.8944); // 0.4472 == 1.0/Math.sqrt(5)
var worldMatrix, viewMatrix, projectMatrix;
var worldMatLoc1, viewMatLoc1, projMatLoc1, texImageLoc1, NormalMapLoc, texImageLoc3;

var eyePosLoc1, matShLoc1, lightDirLoc1, matSpecLoc1, matAmbiLoc1, matEmitLoc1;
var worldMatLoc2, viewMatLoc2, projMatLoc2, uColorLoc2;
var worldMatLoc3, viewMatLoc3, projMatLoc3;

//nightMode
var matEmitLoc02;

var selectedObjectId = 0;

var isDragging = false;
var lastPosX = 0;

var shininess = 100;
var lightDir = vec3(15, 15, 13);
var night_Flug = false; //point lighting flug(Night)
var lamp_light_Flug = false;

let eye02 = vec3(0, 5, 0), at02 = vec3(0, 0, 0), cameraVec02 = vec3(0, -0.4472, -0.8944);
var eyePosLoc02;


//color-picking 
let time = performance.now() * 0.001;
let time02 = performance.now() * 0.001;

const Camera = { //카메라 시점 데이터
    free: 0,
    boarded: 1 //탑승
}
let currCameraState = Camera.free;
let boardedObj = null;
let CurrMerryWorldMat = mat4();

let boarded_swing = null;
let currSwingWorldMat = mat4();

let boarded_seeSaw = null;
let currSeeSawWorldMat = mat4();

let pickingObjectId; //frameLoop of global

let merryWorldPos, swingWorldPos, seeSawWorldPos, sirenWorldPos = vec3(0, 0, 0);
let visible = {//카메라 back위치 렌더링 오류 해결 플러그
    active: false,
    PosNum: Infinity
}

let pickObjworldPos;

let step_picking_flug = false; //탑승 시 unPicking & picking 제어

const $bgm = document.getElementById(`bgm-main`);
let change_picking_flug = false; //siren

//모닝 테마를 위한 구성
let curr_shMat = 300; // 8/29  카메라 기준 light dir ※수정사항: 특정 위치 기준 dir할수있게 변경
//let morning_lighting_flug = false;

//fog color  
let currStart = 0;
let currEnd = 0;
let curr_fog_colorR = 0;
let curr_fog_colorB = 0;
let curr_fog_colorG = 0;

//sunset Ambient 
let curr_amb_R = 0;
let curr_amb_G = 0;
let curr_amb_B = 0;


//dynamic view
function Updata_ViewMatrix(picking_Obj_Id) {
    if (picking_Obj_Id === 0) return; //floor

    else if (picking_Obj_Id === 2) { //Merry
        CurrMerryWorldMat[1][1] = 2; //eye 임시조정
        boardedObj = {
            getWorldMat: CurrMerryWorldMat,
            eyeOffset: vec3(0, 1, 0), //카메라
            targetOffset: vec3(-5, 1, 0) //시선 방향

        }


    } else if (picking_Obj_Id === 5) { //swing
        boardedObj = {
            getWorldMat: currSwingWorldMat,
            eyeOffset: vec3(0, 1, 0),
            targetOffset: vec3(0, 1, 1)
        }



    } else if (picking_Obj_Id === 6) { //seesaw
        boardedObj = {
            getWorldMat: currSeeSawWorldMat,
            eyeOffset: vec3(0, 1, 0),
            targetOffset: vec3(0, 1, -5)
        }


    } else {
        console.log(`about pickingObject Id : ${picking_Obj_Id}`);
        return;
    }
    currCameraState = Camera.boarded;


}

let isNight = false;
//nightMode Emit효과 부분제어 
function set_lampEmit(isNight) {
    let vec = isNight ? [0.7, 0.7, 0] : [0, 0, 0];
    gl.uniform3f(matEmitLoc02, vec[0], vec[1], vec[2]);
}




generateModel();

await loadOBJModel("models/Slider.obj");
await loadOBJModel("models/Railings.obj"); //Barrier.obj : before
await loadOBJModel("models/street_bench.obj");
await loadOBJModel("models/Teeter.obj"); //Merry
await loadOBJModel("models/CrossBar.obj");
await loadOBJModel("models/swing_body.obj");
await loadOBJModel("models/swing_left.obj");
await loadOBJModel("models/swing_right.obj");
await loadOBJModel("models/lamp_body.obj");
await loadOBJModel("models/lamp_head.obj");
await loadOBJModel("models/SeeSaw_body.obj");
await loadOBJModel("models/SeeSaw_head.obj");
await loadOBJModel("models/Archway.obj");
await loadOBJModel("models/Stand.obj");
//await loadOBJModel("models/URP_Tree.obj");
await loadOBJModel("models/siren.obj");



init();
render();



function init() {
    var canvas = document.getElementById('glCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    gl = canvas.getContext('webgl2', { antialias: false });
    if (!gl) {
        alert("WebGL 2 is not available!");
        return;
    }

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1.0);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Enable hidden surface removal
    gl.enable(gl.DEPTH_TEST);

    // Load shaders and initialize attribute buffers
    program1 = initShaders(gl, "./shaders/fog_light_tex_vert.glsl", "./shaders/fog_light_tex_frag.glsl");
    gl.useProgram(program1);

    // Load the data into the GPU
    var vbufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0);

    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 32, 12);

    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 32, 24);

    worldMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    worldMatLoc1 = gl.getUniformLocation(program1, "worldMat");
    gl.uniformMatrix4fv(worldMatLoc1, false, worldMatrix);

    viewMatrix = lookAt(eye, at, vec3(0, 1, 0));
    viewMatLoc1 = gl.getUniformLocation(program1, "viewMat");
    gl.uniformMatrix4fv(viewMatLoc1, false, flatten(viewMatrix));

    // 3D perspective viewing
    var aspectRatio = canvas.width / canvas.height;
    projectMatrix = perspective(90, aspectRatio, 0.001, 1000);
    projMatLoc1 = gl.getUniformLocation(program1, "projMat");
    gl.uniformMatrix4fv(projMatLoc1, false, flatten(projectMatrix));


    texImageLoc1 = gl.getUniformLocation(program1, "texImage");
    loadTextureFbx("./Images/T_Generic_colors.bmp", gl.TEXTURE0);


    texImageLoc1 = gl.getUniformLocation(program1, "texImage");//before Barrier
    loadTextureFbx("./Images/Playground.png", gl.TEXTURE1);

    texImageLoc1 = gl.getUniformLocation(program1, "texImage");
    loadTexture("./Images/swing_basecolor.png", gl.TEXTURE2);

    texImageLoc1 = gl.getUniformLocation(program1, "texImage");//bench
    loadTexture("./Images/DefaultMaterial_BaseColor.png", gl.TEXTURE3);

    texImageLoc1 = gl.getUniformLocation(program1, "texImage");
    loadTexture("./Images/SandG_001.jpg", gl.TEXTURE4);

    texImageLoc1 = gl.getUniformLocation(program1, "texImage");
    loadTexture("./Images/sand_03_diff_4k.jpg", gl.TEXTURE5);


    //Tree
    texImageLoc1 = gl.getUniformLocation(program1, "texImage");
    loadTexture("./Images/URP_3_Leaf.png", gl.TEXTURE6);

    texImageLoc1 = gl.getUniformLocation(program1, "texImage");
    loadTexture("./Images/URP_3_Trunk.png", gl.TEXTURE7);

    function loadTexture(src, textureUnit) {
        var imageTex = new Image();
        imageTex.src = src;
        imageTex.onload = function () {
            var textureID = gl.createTexture();
            gl.activeTexture(textureUnit);
            gl.bindTexture(gl.TEXTURE_2D, textureID);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, imageTex);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }
    }

    //아틀라스
    function loadTextureFbx(src, textureUnit) {
        var imageTex = new Image();
        imageTex.src = src;

        imageTex.onload = function () {
            var textureID = gl.createTexture();
            gl.activeTexture(textureUnit);
            gl.bindTexture(gl.TEXTURE_2D, textureID);

            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); //Ai-question

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, imageTex);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        };
    }

    eyePosLoc1 = gl.getUniformLocation(program1, "eyePos");
    gl.uniform3fv(eyePosLoc1, flatten(eye), 0);

    //static lighting
    eyePosLoc02 = gl.getUniformLocation(program1, "eyePos02");

    lightDirLoc1 = gl.getUniformLocation(program1, "lightDir");
    gl.uniform3fv(lightDirLoc1, flatten(lightDir), 0);


    gl.uniform3f(gl.getUniformLocation(program1, "srcDiff"), 1, 1, 1);
    gl.uniform3f(gl.getUniformLocation(program1, "srcSpec"), 1, 1, 1);
    gl.uniform3f(gl.getUniformLocation(program1, "srcAmbi"), 0, 0, 0);



    matSpecLoc1 = gl.getUniformLocation(program1, "matSpec");
    gl.uniform3f(matSpecLoc1, 0.2, 0.2, 0.2);
    matAmbiLoc1 = gl.getUniformLocation(program1, "matAmbi");
    gl.uniform3f(matAmbiLoc1, 0.2, 0.2, 0.2);
    matEmitLoc1 = gl.getUniformLocation(program1, "matEmit");
    // gl.uniform3f(matEmitLoc1, 0, 0, 0);
    matShLoc1 = gl.getUniformLocation(program1, "matSh");
    gl.uniform1f(matShLoc1, curr_shMat);



    gl.uniform1f(gl.getUniformLocation(program1, "fogStart"), 2);
    //    gl.uniform1f(gl.getUniformLocation(program1, "fogEnd"), 20);
    //   gl.uniform1f(gl.getUniformLocation(program1, "fogColor"), 0);

    var alphaLoc = gl.getUniformLocation(program1, "uAlpha");
    gl.uniform1f(alphaLoc, 1.0);


    const lamp_light_FlugLoc = gl.getUniformLocation(program1, "lampFlug");
    const lamp_LightLoc = gl.getUniformLocation(program1, "LamplightDir[0]");
    const srcSpecLoc02 = gl.getUniformLocation(program1, "srcSpec02[0]");
    const matSpecLoc02 = gl.getUniformLocation(program1, "matSpec02[0]");

    //const matEmitLoc02 = gl.getUniformLocation(program1, "matEmit02");
    const matShLoc02 = gl.getUniformLocation(program1, "matSh02");
    matEmitLoc02 = gl.getUniformLocation(program1, "matEmit02");

    var lamp_lightDirArr = new Float32Array([-18, 7, 13, -18, 7, -20, 18, 7, 13, 18, 7, -20]); //pointLight
    var lamp_srcSpecArr = new Float32Array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
    var lamp_matSpecArr = new Float32Array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);

    gl.uniform3fv(lamp_LightLoc, lamp_lightDirArr);
    gl.uniform3fv(srcSpecLoc02, lamp_srcSpecArr);
    gl.uniform3fv(matSpecLoc02, lamp_matSpecArr);


    gl.uniform3f(gl.getUniformLocation(program1, "srcDiff02"), 1, 1, 1);

    gl.uniform3f(gl.getUniformLocation(program1, "srcAmbi02"), 0, 0, 0);
    gl.uniform3f(gl.getUniformLocation(program1, "matAmbi02"), 0, 0, 0);
    gl.uniform3f(matEmitLoc02, 0, 0, 0);

    gl.uniform1i(lamp_light_FlugLoc, 0);

    //===================================================================
    //2026-8/24 사이드바 기능추가 
    const $closeBtn = document.getElementById(`close-btn`);
    const $openBtn = document.getElementById(`open-btn`);
    const sideBar = document.querySelector(`.canvas-ui`);
    $closeBtn.addEventListener(`click`, () => {
        if (sideBar.classList.contains("open")) {
            sideBar.classList.remove(`open`);
            sideBar.classList.add(`close`);
            return;
        }
        sideBar.classList.add(`close`);
    });


    $openBtn.addEventListener(`click`, () => {
        console.log(`클릭`);
        if (sideBar.classList.contains("close")) {
            sideBar.classList.remove(`close`);
            sideBar.classList.add(`open`);
            return;
        }
        sideBar.classList.add(`open`);

    });





    const List_Btn = document.querySelectorAll(`.menu`);

    List_Btn.forEach((btn) => {
        btn.addEventListener(`click`, e => {
            List_Btn.forEach(b => b.classList.remove(`selected`));
            e.target.classList.add(`selected`);

        });
    });

    //=======================================================================================
    //fog slider
    const fog_List = document.querySelectorAll(`[class*="fog-range01"]`);
    const fog_Color = document.querySelector(`.fog-range02`); //rgb

    fog_List.forEach(ele => {
        ele.addEventListener(`input`, (e) => {
            let str = e.target.className.slice(12, 12 + 1); //
            //  console.log(str);
            let value = Number(e.target.value);
            Selected_fog(str, value);
        })
    });

    function Selected_fog(str, value) {
        if (str == null) {
            console.log(`fog slider error!`);
            return;
        }

        if (str === "s") {
            currStart = value;
            gl.uniform1f(gl.getUniformLocation(program1, "fogStart"), currStart);
            document.querySelector(`.fog_start`).lastChild.textContent = ` ${currStart}`;
            return;
        }
        currEnd = value;
        gl.uniform1f(gl.getUniformLocation(program1, "fogEnd"), currEnd);
        document.querySelector(`.fog_end`).lastChild.textContent = ` ${currEnd}`;
    }

    //fogColor
    fog_Color.addEventListener(`input`, e => {
        gl.uniform1f(gl.getUniformLocation(program1, "fogColor"), Number(e.target.value));
        document.querySelector(`.fog_color`).lastChild.textContent = ` ${e.target.value}`;
    });




    //morning free-set
    let Infinity = 99999;
    const $BtnMorning = document.querySelector(`.Morning`);
    const $dirX = document.querySelector(`.light-rangeX`);
    const $dirY = document.querySelector(`.light-rangeY`);
    const $dirZ = document.querySelector(`.light-rangeZ`);
    const light_dir_list = document.querySelectorAll(`[class*="light-range"]`);
    const $morning_ShMat = document.getElementById(`shMat01`);
    //console.log(light_dir_list);

    //테마 프리셋 클릭시 클릭 이외의 테마 off처리
    const $morning_box = document.querySelector(`.page03_morning`);

    const $sunset_box = document.querySelector(`.page04`);
    const $night_box = document.querySelector(`.page05`);

    $BtnMorning.addEventListener(`click`, () => {
        gl.uniform1i(lamp_light_FlugLoc, 0);
        night_Flug = false;
        gl.clearColor(0.65, 0.85, 1.0, 1.0);
        gl.uniform1f(gl.getUniformLocation(program1, "fogStart"), 99998);
        gl.uniform1f(gl.getUniformLocation(program1, "fogEnd"), Infinity);
        gl.uniform3f(gl.getUniformLocation(program1, "fogColor"), 0.65, 0.85, 1.0);
        gl.uniform3f(gl.getUniformLocation(program1, "srcDiff"), 1.0, 1.0, 1.0);
        gl.uniform3f(gl.getUniformLocation(program1, "srcAmbi"), 0.2, 0.25, 0.3);

        gl.uniform1f(matShLoc1, curr_shMat);
        gl.uniform3f(matSpecLoc1, 0.2, 0.2, 0.2);
        //  gl.uniform3f(matAmbiLoc1, 0.2, 0.2, 0.2);

        $morning_box.style.opacity = "1";
        $sunset_box.style.opacity = `0.2`;
        $night_box.style.opacity = `0.2`;




    });

    let dir;
    let dirValue;
    let currX = lightDir[0];
    let currY = lightDir[1];
    let currZ = lightDir[2];

    light_dir_list.forEach(ele => {
        //  console.log(`테스트`);
        ele.addEventListener(`input`, (e) => {
            dir = e.target.className.slice(-1);
            //console.log(dir);
            dirValue = Number(e.target.value);
            Selected_Dir(dir, dirValue);
        });
    });
    function Selected_Dir(dir, value) {


        switch (dir) {
            case "X":
                currX = value;
                gl.uniform3f(gl.getUniformLocation(program1, "lightDir"), currX, currY, currZ);
                document.querySelector(`.morning-x`).lastChild.textContent = ` ${currX}`;
                break;
            case "Y":
                currY = value;
                gl.uniform3f(gl.getUniformLocation(program1, "lightDir"), currX, currY, currZ);
                document.querySelector(`.morning-y`).lastChild.textContent = ` ${currY}`;
                break;
            case "Z":
                currZ = value;
                gl.uniform3f(gl.getUniformLocation(program1, "lightDir"), currX, currY, currZ);
                document.querySelector(`.morning-z`).lastChild.textContent = ` ${currZ}`;
                break;
            default:
                console.log(`morning mode light direction error`);

        }
    }


    $morning_ShMat.addEventListener(`input`, (e) => {
        curr_shMat = Number(e.target.value);
        //console.log(curr_shMat);
        gl.uniform1f(matShLoc1, curr_shMat);
        document.querySelector(`.morning-matSh`).lastChild.textContent = ` ${curr_shMat}`;
    });


    const $BtnSunset = document.querySelector(`.Sunset`);
    const sunset_List = document.querySelectorAll(`[class*="sunset-amb"]`);

    $BtnSunset.addEventListener(`click`, () => {
        gl.uniform1i(lamp_light_FlugLoc, 0);
        night_Flug = false;
        gl.clearColor(0.62, 0.48, 0.32, 1.0);
        gl.uniform1f(gl.getUniformLocation(program1, "fogStart"), 99998);
        gl.uniform1f(gl.getUniformLocation(program1, "fogEnd"), Infinity);
        gl.uniform3f(gl.getUniformLocation(program1, "fogColor"), 0.62, 0.48, 0.32);
        gl.uniform3f(gl.getUniformLocation(program1, "srcDiff"), 0.65, 0.35, 0.15);
        gl.uniform3f(gl.getUniformLocation(program1, "srcAmbi"), 0.3, 0.15, 0.2);
        gl.uniform1f(matShLoc1, 1);
        gl.uniform3f(matSpecLoc1, 0, 0, 0);


        $sunset_box.style.opacity = `1`;
        $night_box.style.opacity = `0.2`;
        $morning_box.style.opacity = "0.2";




    });

    sunset_List.forEach(ele => {
        ele.addEventListener(`input`, e => {

            Selected_sunset_color(e);
        });
    });

    function Selected_sunset_color(event) {
        let str = event.target.className.slice(11, 11 + 1);
        let value = event.target.value;

        switch (str) {
            case "R":
                curr_amb_R = value;
                gl.uniform3f(gl.getUniformLocation(program1, "srcAmbi"), curr_amb_R, curr_amb_G, 0.2);
                document.querySelector(`.sunset-r`).lastChild.textContent = ` ${curr_amb_R}`;
                break;
            case "G":
                curr_amb_G = value;
                gl.uniform3f(gl.getUniformLocation(program1, "srcAmbi"), curr_amb_R, curr_amb_G, 0.2);
                document.querySelector(`.sunset-g`).lastChild.textContent = ` ${curr_amb_G}`;
                break;
            case "B":
                //curr_amb_R = value;
                gl.uniform3f(gl.getUniformLocation(program1, "srcAmbi"), curr_amb_R, curr_amb_G, 0.2);
                document.querySelector(`.sunset-b`).lastChild.textContent = ` ${curr_amb_B}`;
                break;
            default:
                console.log(`sunset_ambi error`);
                break;
        }
    }


    const $BtnNight = document.querySelector(`.Night`);
    const $matSh_Night = document.getElementById(`night-range01`);

    $BtnNight.addEventListener(`click`, () => {
        gl.useProgram(program1);
        gl.clearColor(0.05, 0.05, 0.12, 1.0);
        gl.uniform1i(lamp_light_FlugLoc, 1);
        night_Flug = true;

        // gl.uniform1f(gl.getUniformLocation(program1, "fogStart"), 99998);
        // gl.uniform1f(gl.getUniformLocation(program1, "fogEnd"), Infinity);
        // gl.uniform3f(gl.getUniformLocation(program1, "fogColor"), 0.05, 0.05, 0.12);
        gl.uniform3f(gl.getUniformLocation(program1, "srcDiff"), 1, 1, 1);
        gl.uniform3f(gl.getUniformLocation(program1, "srcAmbi"), 0.02, 0.02, 0.05);
        gl.uniform1f(matShLoc02, 10);
        gl.uniform3fv(eyePosLoc02, flatten(vec3(0, 5, 0)), 0);

        $night_box.style.opacity = `1`;
        $sunset_box.style.opacity = `0.2`;
        $morning_box.style.opacity = "0.2";



    });

    $matSh_Night.addEventListener(`input`, e => {
        gl.uniform1f(matShLoc02, Number(e.target.value));
        document.querySelector(`.night_matSh`).lastChild.textContent = ` ${e.target.value}`;
    });


    //특정 테마 클릭 시  남은 테마에 대한 환경제어 비활성화 애니메이션 추가 
    //테마별 슬라이더 제어 코드



    program2 = initShaders(gl, "./shaders/uniform_color_vert.glsl", "./shaders/uniform_color_frag.glsl");
    gl.useProgram(program2);

    worldMatLoc2 = gl.getUniformLocation(program2, "worldMat");
    gl.uniformMatrix4fv(worldMatLoc2, false, worldMatrix);

    viewMatLoc2 = gl.getUniformLocation(program2, "viewMat");
    gl.uniformMatrix4fv(viewMatLoc2, false, flatten(viewMatrix));

    projMatLoc2 = gl.getUniformLocation(program2, "projMat");
    gl.uniformMatrix4fv(projMatLoc2, false, flatten(projectMatrix));

    uColorLoc2 = gl.getUniformLocation(program2, "uColor");




    function PickingObject(event) {
        gl.useProgram(program2);

        // gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.uniformMatrix4fv(viewMatLoc2, false, flatten(viewMatrix));
        gl.uniformMatrix4fv(projMatLoc2, false, flatten(projectMatrix));


        //Slider 
        gl.uniform4f(uColorLoc2, (1.0 / 255.0), 0, 1, 1);
        worldMatrix = scalem(13, 13, 13);
        worldMatrix = mult(worldMatrix, rotateY(SliderTheta));
        worldMatrix = mult(translate(10, 3, -10), worldMatrix);
        gl.uniformMatrix4fv(worldMatLoc2, false, flatten(worldMatrix));
        gl.drawArrays(gl.TRIANGLES, GroundVertexCount, SliderVertexCount);


        //Merry
        gl.uniform4f(uColorLoc2, (2.0 / 255.0), 0, 1, 1);
        worldMatrix = scalem(8, 8, 8);
        worldMatrix = mult(worldMatrix, rotateY(MerryTheta))
        worldMatrix = mult(translate(10, 1, 5), worldMatrix);
        gl.uniformMatrix4fv(worldMatLoc2, false, flatten(worldMatrix));
        gl.drawArrays(gl.TRIANGLES, GroundVertexCount + SliderVertexCount + BarrierVertexCount +
            BenchVertexCount, MerryVertexCount);



        let SwingAngle = 45;
        let speed = 2.0;
        let currAngle = SwingAngle * Math.sin(time * speed);

        //swing left            
        gl.uniform4f(uColorLoc2, (4.0 / 255.0), 0, 1, 1);
        worldMatrix = mat4();
        worldMatrix = mult(worldMatrix, translate(0, 2, 0));
        worldMatrix = mult(worldMatrix, translate(-7, 3.2, -14));
        worldMatrix = mult(worldMatrix, rotateX(currAngle));
        worldMatrix = mult(worldMatrix, translate(0, -2, 0));
        worldMatrix = mult(worldMatrix, scalem(5, 5, 5));
        gl.uniformMatrix4fv(worldMatLoc2, false, flatten(worldMatrix));
        gl.drawArrays(gl.TRIANGLES, GroundVertexCount + SliderVertexCount +
            BarrierVertexCount + BenchVertexCount + MerryVertexCount + CrossBarVertexCount + Swing_body_VertexCount,
            swing_left_VertexCount);

        //swing right
        gl.uniform4f(uColorLoc2, (5.0 / 255.0), 0, 1, 1);
        worldMatrix = mat4();
        worldMatrix = mult(worldMatrix, translate(0, 2, 0));
        worldMatrix = mult(worldMatrix, translate(-3.0, 3.2, -14));
        worldMatrix = mult(worldMatrix, rotateX(-currAngle));
        worldMatrix = mult(worldMatrix, translate(0, -2.0, 0));
        worldMatrix = mult(worldMatrix, scalem(5, 5, 5));
        gl.uniformMatrix4fv(worldMatLoc2, false, flatten(worldMatrix));
        gl.drawArrays(gl.TRIANGLES, GroundVertexCount + SliderVertexCount +
            BarrierVertexCount + BenchVertexCount + MerryVertexCount + CrossBarVertexCount + Swing_body_VertexCount +
            swing_left_VertexCount, swing_right_VertexCount);




        //SeeSaw ani
        let SwingAngle02 = 15;
        let speed02 = 2.0;
        let currAngle02 = SwingAngle02 * Math.sin(time02 * speed02);
        //SeeSaw Head
        for (let z = 9; z >= 6; z -= 3) {
            gl.uniform4f(uColorLoc2, (6.0 / 255.0), 0, 1, 1);
            worldMatrix = mat4();
            worldMatrix = mult(worldMatrix, translate(-12, 1.2, z));
            if (z === 6 ? worldMatrix = mult(worldMatrix, rotateZ(currAngle02)) : worldMatrix = mult(worldMatrix, rotateZ(-currAngle02)))
                worldMatrix = mult(worldMatrix, rotateY(90));
            currSeeSawWorldMat = worldMatrix; //기준좌표: 0,0,0 
            seeSawWorldPos = worldMatrix.slice(0, 3).map((low) => low[3]);
            worldMatrix = mult(worldMatrix, scalem(8, 8, 8));
            gl.uniformMatrix4fv(worldMatLoc2, false, flatten(worldMatrix));
            gl.drawArrays(gl.TRIANGLES, GroundVertexCount + SliderVertexCount +
                BarrierVertexCount + BenchVertexCount + MerryVertexCount + CrossBarVertexCount + Swing_body_VertexCount +
                swing_left_VertexCount + swing_right_VertexCount + lamp_body_VertexCount + lamp_head_VertexCount + SeeSaw_Body_VertexCount, SeeSaw_Head_VertexCount);

        }

        //siren

        gl.uniform4f(uColorLoc2, (7.0 / 255.0), 0, 1, 1);
        worldMatrix = mat4();
        worldMatrix = mult(worldMatrix, translate(5, 5.0, -20));
        worldMatrix = mult(worldMatrix, rotateY(140));
        worldMatrix = mult(worldMatrix, scalem(10, 10, 10));
        gl.uniformMatrix4fv(worldMatLoc2, false, flatten(worldMatrix));
        gl.drawArrays(gl.TRIANGLES, GroundVertexCount + SliderVertexCount +
            BarrierVertexCount + BenchVertexCount + MerryVertexCount + CrossBarVertexCount + Swing_body_VertexCount +
            swing_left_VertexCount + swing_right_VertexCount + lamp_body_VertexCount + lamp_head_VertexCount + SeeSaw_Body_VertexCount + SeeSaw_Head_VertexCount +
            ArchwayVertexCount + StandVertexCount + URP_Tree_VertexCount, sirenVertexCount);

        //===================================================================================================



        //mouse position
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = rect.bottom - event.clientY;

        //read Pixel
        const pixels = new Uint8Array(4);
        gl.readPixels(mouseX, mouseY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        selectedObjectId = pixels[0];
        console.log("Picked ID: ", selectedObjectId);


        gl.useProgram(program1);
        return selectedObjectId;
    }

    function Switching_ViewData() { //sub
        if (pickingObjectId === 0) return;
        else if (pickingObjectId === 2) { //Merry
            boardedObj = {
                getWorldMat: CurrMerryWorldMat,
                eyeOffset: vec3(0, 1, 0), //카메라
                targetOffset: vec3(-5, 1, 0) //시선 방향

            }
            currCameraState = Camera.boarded;

        } else if (pickingObjectId === 5) { //swing
            boardedObj = {
                getWorldMat: currSwingWorldMat,
                eyeOffset: vec3(0, 1, 0), //카메라
                targetOffset: vec3(0, 1, 1) //시선 방향
            }

            currCameraState = Camera.boarded;

        } else if (pickingObjectId === 6) { //seesaw
            boardedObj = {
                getWorldMat: currSeeSawWorldMat,
                eyeOffset: vec3(0, 1, 0), //카메라
                targetOffset: vec3(1, 1, 0) //시선 방향
            }

            currCameraState = Camera.boarded;

        } else {
            console.log(`about pickingObject Id : ${pickingObjectId}`);
        }


    }

    function ViewPortPosition(objWorldPos, viewMatrix, projMatrix, pickId) {
        let Pos = vec4(objWorldPos[0], objWorldPos[1], objWorldPos[2], 1.0);

        let clipPos = multMat4Vec4(projMatrix, multMat4Vec4(viewMatrix, Pos));
        //  console.log(clipPos);

        const w = clipPos[3];
        let NDC = [clipPos[0] / w,
        clipPos[1] / w,
        clipPos[2] / w];

        const rect = canvas.getBoundingClientRect();
        //const canvasX = e.clientX - rect.left; 
        //const canvasY = rect.bottom- e.clientY;
        // console.log(canvasY);
        let ScreenX = ((NDC[0] + 1) / 2) * canvas.clientWidth;
        console.log(ScreenX);
        let ScreenY = ((1 - NDC[1]) / 2) * canvas.clientHeight;
        //  console.log(ScreenX);
        // console.log(ScreenY);

        visible = {
            active: (w > 0 && NDC[0] >= -1 && NDC[0] <= 1 && NDC[1] >= -1 && NDC[1] <= 1),
            PosNum: 0
        }

        if (pickId === 7) {
            visible.PosNum = 1;
        } else {

        }
        return { ScreenX, ScreenY, visible };

    }




    const $choiseBtn = document.querySelector(`.choise-btn`);
    const $choiseBtn02 = document.querySelector(`.choise-btn02`);

    const $canvasBtn = document.querySelector(`.canvas-btn`);

    const $canvasBtn_box02 = document.querySelector(`.back-canvas-btn`); //뒤로가기
    const $choiseBtn03 = document.querySelector(`.choise-btn03`); //뒤로가기버튼
    const $fileBtn = document.querySelector(`.canvas-file-btn`);//file Input

    canvas.addEventListener("mousedown", function (e) {
        if (event.altKey) {
            isDragging = true;
            lastPosX = event.clientX;
            canvas.style.cursor = "grab";
        } else {
            pickingObjectId = PickingObject(event);

            if (pickingObjectId === 2) { //merry
                pickObjworldPos = merryWorldPos;

            } else if (pickingObjectId === 5) {
                pickObjworldPos = swingWorldPos;
            }
            else if (pickingObjectId === 6) {
                pickObjworldPos = seeSawWorldPos;
            } else if (pickingObjectId === 7) {
                pickObjworldPos = sirenWorldPos;
            } else {
                return; // %
            }

            const { ScreenX, ScreenY, visible } = ViewPortPosition(pickObjworldPos, viewMatrix, projectMatrix, pickingObjectId);
            //  console.log(ScreenX);
            //console.log(ScreenY);
            //console.log(visible);


            if (visible.PosNum === 0) {
                $canvasBtn.style.left = `${ScreenX}px`;
                $canvasBtn.style.bottom = `${ScreenY}px`;
                $canvasBtn.style.visibility = `visible`;
                $fileBtn.style.visibility = `hidden`;

            } else {
                $fileBtn.style.left = `${ScreenX}px`;
                $fileBtn.style.bottom = `${ScreenY}px`;
                $fileBtn.style.visibility = `visible`;
                $canvasBtn.style.visibility = `hidden`;
            }





        }
    });


    $choiseBtn.addEventListener(`click`, () => { //view translation
        //view transition func
        Switching_ViewData()
        $canvasBtn.style.visibility = `hidden`;
        $canvasBtn_box02.style.visibility = `visible`;
        step_picking_flug = !step_picking_flug;
        selectedObjectId = Infinity;
    });

    $choiseBtn03.addEventListener(`click`, () => { //back lastEyePos
        $canvasBtn.style.visibility = `hidden`;
        $canvasBtn_box02.style.visibility = `hidden`;
        currCameraState = Camera.free;
        step_picking_flug = !step_picking_flug;

    });

    const $ChangeBgmInput = document.getElementById(`bgm-input`);

    $ChangeBgmInput.addEventListener(`change`, (e) => {

        const file = e.target.files[0];
        if (!file) return;

        $bgm.pause();
        $bgm.src = `Audios/${file.name}`;
        //console.log(file.name);
        $bgm.play();
        $fileBtn.style.visibility = `hidden`;
        selectedObjectId = Infinity;

    });

    const $VolumeBar = document.getElementById(`bgm-range`);
    $VolumeBar.addEventListener(`input`, () => {
        $bgm.volume = $VolumeBar.value;
        document.querySelector(`.normal-volume`).lastChild.textContent = `  ${$VolumeBar.value}`;
    });

    //테마저장소 흐름요소
    const utility_list = document.querySelectorAll(`[class*="tool-btn"]`);
     




















    


    //커스텀테마 더보기 사이드패널
    const $more_popUp = document.querySelector(`.page07-more-popUp`);
    const $more_openBtn = document.querySelector(`.more-btn`);
    const $more_exitBtn = document.querySelector(`.more-exit-btn`);

    $more_openBtn.addEventListener(`click`, () => {
        $more_popUp.style.transform = `translate(-50%,-50%)`;
        $more_popUp.style.opacity = `1`;
        $more_popUp.style.visibility = `visible`;
    });


    $more_exitBtn.addEventListener(`click`, () => {
        $more_popUp.style.transform = `translate(-50%,-20%)`;
        $more_popUp.style.opacity = `0`;
        $more_popUp.style.visibility = `hidden`;

    });





    //조작설명 모달창
    const $quesBtn = document.querySelector(`.ques-toggle`);
    const $popUp = document.querySelector(`.canvas-popUp`);
    const $backBtn = document.querySelector(".back-button");


    $quesBtn.addEventListener(`click`, () => {

        $popUp.style.transform = `translate(-50%,-50%)`;
        $popUp.style.opacity = `1`;
        $popUp.style.visibility = `visible`;

    });


    $backBtn.addEventListener(`click`, () => {

        $popUp.style.transform = `translate(-50%,-20%)`;
        $popUp.style.opacity = `0`;
        $popUp.style.visibility = `hidden`;

    });

    document.addEventListener(`keydown`, (e) => {
        if (e.key === `Escape`) {
            $popUp.style.visibility = `hidden`;
        }
    });


    canvas.addEventListener("mouseleave", function (event) {
        isDragging = false;
        canvas.style.cursor = "default";
    });


    canvas.addEventListener("mousemove", function (event) {
        if (!isDragging || !(event.altKey)) return;

        var deltaX = event.clientX - lastPosX;
        lastPosX = event.clientX;


        if (Math.abs(deltaX) > 0.1) {
            const angle = -deltaX * 0.11 * Math.PI / 180.0;
            const sinAngle = Math.sin(angle);
            const cosAngle = Math.cos(angle);
            var newVecX = cosAngle * cameraVec[0] + sinAngle * cameraVec[2];
            var newVecZ = -sinAngle * cameraVec[0] + cosAngle * cameraVec[2];

            cameraVec[0] = newVecX;
            cameraVec[2] = newVecZ; //update

        }
    });



    canvas.addEventListener("wheel", function (event) {
        event.preventDefault();

        var delta = 0;
        if (event.deltaY > 0)
            delta = 1.0;
        else {
            delta = -1.0;
        }

        var newPosX = eye[0] + delta * cameraVec[0];
        var newPosZ = eye[2] + delta * cameraVec[2];
        if (newPosX > -30 && newPosX < 30 && newPosZ > -30 && newPosZ < 30) {

            eye[0] = newPosX;
            console.log(newPosZ.toFixed(2));
            eye[2] = newPosZ;
        } else {
            alert("경계에 닿았습니다!");
            //  alert("원점으로 돌아갑니다.");
            //  eye[0] =0;
            // eye[2] = 0;
        }
    }, { passive: false });


    let StartPlug = false;


    var sinTheta = Math.sin(0.1);
    var cosTheta = Math.cos(0.1);
    window.onkeydown = function (event) {
        var key = String.fromCharCode(event.keyCode);
        switch (key) {
            case 'A':
            case 'a':
                var newVecX = cosTheta * cameraVec[0] + sinTheta * cameraVec[2];
                var newVecZ = -sinTheta * cameraVec[0] + cosTheta * cameraVec[2];
                cameraVec[0] = newVecX;
                cameraVec[2] = newVecZ;
                break;
            case 'D':
            case 'd':
                var newVecX = cosTheta * cameraVec[0] - sinTheta * cameraVec[2];
                var newVecZ = sinTheta * cameraVec[0] + cosTheta * cameraVec[2];
                cameraVec[0] = newVecX;
                cameraVec[2] = newVecZ;
                break;
            case 'W':
            case 'w':
                var newPosX = eye[0] + 2.0 * cameraVec[0];
                var newPosZ = eye[2] + 2.0 * cameraVec[2];

                if (newPosZ <= 16 && !StartPlug) {
                    StartPlug = true;
                    const $text = document.querySelector(`.text-space`);
                    const $timer = document.querySelector(`.timer-space`);
                    const $startBtn = document.querySelector(".start-button");
                    const $morningBtn = document.querySelector(`.Morning`);
                    $startBtn.style.visibility = `visible`;
                    $text.textContent = `Start 클릭 시 입장`;

                    $startBtn.addEventListener(`click`, (e) => {
                        e.target.style.visibility = `hidden`;
                        $timer.style.color = `white`;
                        $morningBtn.click();
                        $bgm.play();

                        $text.textContent = `추억을 회상 해보세요!`;

                        let totalTime = 20;
                        let alpha = 1.0;
                        const Timer = setInterval(() => {
                            if (totalTime <= 0) {
                                clearInterval(Timer);
                                $text.textContent = `타이머영역`;
                                $bgm.pause();
                                $bgm.currentTime = 0;
                                init();
                                return;
                            }

                            totalTime--;
                            const minute = Math.floor(totalTime / 60);
                            const second = totalTime % 60;
                            const m = String(minute).padStart(2, '0');
                            const s = String(second).padStart(2, '0');
                            if (totalTime <= 4) {
                                $text.textContent = `돌아 갈 시간입니다`;
                                $timer.style.color = `red`;
                                alpha -= 0.2;
                                gl.uniform1f(alphaLoc, alpha);
                            }

                            $timer.textContent = (`${m}:${s}`);

                        }, 1000);

                    });


                }
                if (newPosX > -30 && newPosX < 30 && newPosZ > -30 && newPosZ < 30) {
                    eye[0] = newPosX;
                    eye[2] = newPosZ;
                    console.log(newPosZ)
                } else {
                    alert("경계에 닿았습니다!!!");
                }
                break;
            case 'S':
            case 's':
                var newPosX = eye[0] - 2.0 * cameraVec[0];
                var newPosZ = eye[2] - 2.0 * cameraVec[2];
                if (newPosX > -30 && newPosX < 30 && newPosZ > -30 && newPosZ < 30) {
                    eye[0] = newPosX;

                    eye[2] = newPosZ;
                } else {
                    alert("경계에 닿았습니다!!!");
                }
                break;
        }
    };

    window.onresize = function () {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);

        // 3D perspective viewing
        var aspectRatio = canvas.width / canvas.height;
        projectMatrix = perspective(90, aspectRatio, 0.001, 1000);
        gl.uniformMatrix4fv(projMatLoc1, false, flatten(projectMatrix));
    };




}


function render() {
    gl.useProgram(program1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (currCameraState === Camera.free) {

        at[0] = eye[0] + cameraVec[0];
        at[1] = eye[1] + cameraVec[1];
        at[2] = eye[2] + cameraVec[2];
        viewMatrix = lookAt(eye, at, vec3(0, 1, 0));
        gl.uniform3fv(eyePosLoc1, flatten(eye), 0);

    } else if (currCameraState === Camera.boarded) {
        Updata_ViewMatrix(pickingObjectId);
        // console.log(boardedObj.getWorldMat);

        let objMatrix = boardedObj.getWorldMat; //update loop

        //console.log(vec4(boardedObj.eyeOffset, 1.0));
        let worldEye = multMat4Vec4(objMatrix, vec4(boardedObj.eyeOffset, 1.0));
        //  console.log(worldEye);
        let worldAt = multMat4Vec4(objMatrix, vec4(boardedObj.targetOffset, 1.0));
        //  console.log(worldAt);


        //vec4 -> vec3
        let currEye = vec3(worldEye[0], worldEye[1], worldEye[2]);
        let currAt = vec3(worldAt[0], worldAt[1], worldAt[2]);
        //   console.log(currEye);
        viewMatrix = lookAt(currEye, currAt, vec3(0, 1, 0));

        gl.uniform3fv(eyePosLoc1, flatten(currEye), 0);

    }

    gl.uniformMatrix4fv(viewMatLoc1, false, flatten(viewMatrix));


    // Ground
    worldMatrix = mat4();
    gl.uniformMatrix4fv(worldMatLoc1, false, flatten(worldMatrix));
    gl.uniform1i(texImageLoc1, 4);
    gl.uniform3f(matEmitLoc1, 0, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, GroundVertexCount);



    // Ground: parent
    worldMatrix = mat4();
    gl.uniformMatrix4fv(worldMatLoc1, false, flatten(worldMatrix));
    gl.uniform1i(texImageLoc1, 5);
    gl.uniform3f(matEmitLoc1, 0, 0, 0);
    gl.drawArrays(gl.TRIANGLES, GroundVertexCount, Parent_GroundVertexCount);

    //Slider
    worldMatrix = scalem(13, 13, 13);
    worldMatrix = mult(worldMatrix, rotateY(SliderTheta));
    worldMatrix = mult(translate(10, 3, -10), worldMatrix);
    gl.uniformMatrix4fv(worldMatLoc1, false, flatten(worldMatrix));//
    gl.uniform1i(texImageLoc1, 1);

    if (selectedObjectId == 1) gl.uniform3f(matEmitLoc1, 0.2, 0.2, 0);
    else gl.uniform3f(matEmitLoc1, 0, 0, 0);
    gl.drawArrays(gl.TRIANGLES, GroundVertexCount + Parent_GroundVertexCount, SliderVertexCount);



    //Barrier-Lines top,down
    for (let x = -15.3.toFixed(2); x <= 15.3.toFixed(2); x += 7.65) {

        if (x === 0) continue;

        worldMatrix = mult(mat4(), translate(vec3(x, 1, 13)));
        worldMatrix = mult(worldMatrix, scalem(8, 8, 8));
        gl.uniformMatrix4fv(worldMatLoc1, false, flatten(worldMatrix));
        gl.uniform1i(texImageLoc1, 0);
        gl.uniform3f(matEmitLoc1, 0, 0, 0);
        gl.drawArrays(gl.TRIANGLES, GroundVertexCount + Parent_GroundVertexCount + SliderVertexCount,
            BarrierVertexCount);



        worldMatrix = mult(mat4(), translate(vec3(x, 1, -19)));
        worldMatrix = mult(worldMatrix, scalem(8, 8, 8));
        gl.uniformMatrix4fv(worldMatLoc1, false, flatten(worldMatrix));
        gl.uniform1i(texImageLoc1, 0);
        gl.uniform3f(matEmitLoc1, 0, 0, 0);
        gl.drawArrays(gl.TRIANGLES, GroundVertexCount + Parent_GroundVertexCount + SliderVertexCount,
            BarrierVertexCount);
    }


    //Barrier-Lines left,right
    for (let z = -15; z <= 9; z += 8.0) {
        worldMatrix = scalem(8, 8, 8);
        worldMatrix = mult(worldMatrix, rotateY(BarrierAngle));
        worldMatrix = mult(translate(vec3(-19.3, 1, z)), worldMatrix);
        gl.uniformMatrix4fv(worldMatLoc1, false, flatten(worldMatrix));
        gl.uniform1i(texImageLoc1, 0);
        gl.uniform3f(matEmitLoc1, 0, 0, 0);
        gl.drawArrays(gl.TRIANGLES, GroundVertexCount + Parent_GroundVertexCount + SliderVertexCount,
            BarrierVertexCount);


        worldMatrix = scalem(8, 8, 8);
        worldMatrix = mult(worldMatrix, rotateY(BarrierAngle));
        worldMatrix = mult(translate(vec3(19.3, 1, z)), worldMatrix);
        gl.uniformMatrix4fv(worldMatLoc1, false, flatten(worldMatrix));
        gl.uniform1i(texImageLoc1, 0);
        gl.uniform3f(matEmitLoc1, 0, 0, 0);
        gl.drawArrays(gl.TRIANGLES, GroundVertexCount + Parent_GroundVertexCount + SliderVertexCount,
            BarrierVertexCount);
    }



    //Bench left->right auto top,bottom
    for (let x = -28; x <= 28; x += 56) {

        let curr = (x === 28) ? 90 : -90;

        worldMatrix = scalem(6, 6, 6)
        worldMatrix = mult(worldMatrix, rotateY(curr));
        worldMatrix = mult(translate(vec3(x, -1, -10)), worldMatrix);
        gl.uniformMatrix4fv(worldMatLoc1, false, flatten(worldMatrix));
        gl.uniform1i(texImageLoc1, 3);

        gl.uniform3f(matEmitLoc1, 0, 0, 0);
        gl.drawArrays(gl.TRIANGLES, GroundVertexCount + Parent_GroundVertexCount + SliderVertexCount +
            BarrierVertexCount, BenchVertexCount);


        worldMatrix = scalem(6, 6, 6)
        worldMatrix = mult(worldMatrix, rotateY(curr));
        worldMatrix = mult(translate(vec3(x, -1, 4)), worldMatrix);
        gl.uniformMatrix4fv(worldMatLoc1, false, flatten(worldMatrix));
        gl.uniform1i(texImageLoc1, 3);

        gl.uniform3f(matEmitLoc1, 0, 0, 0);
        gl.drawArrays(gl.TRIANGLES, GroundVertexCount + Parent_GroundVertexCount + SliderVertexCount +
            BarrierVertexCount, BenchVertexCount);

    }

    //Merry
    worldMatrix = mat4();
    MerryTheta--;

    worldMatrix = mult(worldMatrix, translate(10, 1, 5));
    worldMatrix = mult(worldMatrix, rotateY(MerryTheta))
    worldMatrix = mult(worldMatrix, scalem(8, 8, 8));

    CurrMerryWorldMat = worldMatrix;
    merryWorldPos = worldMatrix.slice(0, 3).map((low) => low[3]);
    //console.log(merryWorldPos);
    gl.uniformMatrix4fv(worldMatLoc1, false, flatten(worldMatrix));

    gl.uniform1i(texImageLoc1, 0);

    if (selectedObjectId == 2) gl.uniform3f(matEmitLoc1, 0.2, 0.2, 0);
    if (selectedObjectId == 2 && step_picking_flug) gl.uniform3f(matEmitLoc1, 0, 0, 0);
    gl.drawArrays(gl.TRIANGLES, GroundVertexCount + Parent_GroundVertexCount + SliderVertexCount +
        BarrierVertexCount + BenchVertexCount, MerryVertexCount);



    //CrossBar 
    worldMatrix = scalem(8, 8, 8);
    worldMatrix = mult(translate(1, 2, 1), worldMatrix)
    worldMatrix = mult(translate(-15, 1, -6), worldMatrix);
    gl.uniformMatrix4fv(worldMatLoc1, false, flatten(worldMatrix));
    gl.uniform1i(texImageLoc1, 0);

    gl.drawArrays(gl.TRIANGLES, GroundVertexCount + Parent_GroundVertexCount + SliderVertexCount +
        BarrierVertexCount + BenchVertexCount + MerryVertexCount, CrossBarVertexCount);



    //------------------------------------------------------------------------------)
    /*
    - blender를 통한 오브젝트 분리✓  
    - 운동을 위한 피벗 재설정✓
    - 지지대와 최상단 결합? 애니메이션 구현✓ 2026/08/01
     */

    //2026.07.22 swing animation
    //swing body
    worldMatrix = scalem(9, 15, 8);
    worldMatrix = mult(translate(-5, 1, -14), worldMatrix)
    gl.uniformMatrix4fv(worldMatLoc1, false, flatten(worldMatrix));
    gl.uniform1i(texImageLoc1, 2);
    gl.drawArrays(gl.TRIANGLES, GroundVertexCount + Parent_GroundVertexCount + SliderVertexCount +
        BarrierVertexCount + BenchVertexCount + MerryVertexCount + CrossBarVertexCount, Swing_body_VertexCount);




    time = performance.now() * 0.001;
    let SwingAngle = 45;
    let speed = 2.0;
    let currAngle = SwingAngle * Math.sin(time * speed);

    //swing left
    worldMatrix = mat4();
    worldMatrix = mult(worldMatrix, translate(0, 2, 0));
    worldMatrix = mult(worldMatrix, translate(-7, 3.2, -14));
    worldMatrix = mult(worldMatrix, rotateX(currAngle));
    worldMatrix = mult(worldMatrix, translate(0, -2, 0));
    worldMatrix = mult(worldMatrix, scalem(5, 5, 5));

    gl.uniformMatrix4fv(worldMatLoc1, false, flatten(worldMatrix));
    gl.uniform1i(texImageLoc1, 2);
    if (selectedObjectId == 4) gl.uniform3f(matEmitLoc1, 0.2, 0.2, 0);
    else gl.uniform3f(matEmitLoc1, 0, 0, 0);
    gl.drawArrays(gl.TRIANGLES, GroundVertexCount + Parent_GroundVertexCount + SliderVertexCount +
        BarrierVertexCount + BenchVertexCount + MerryVertexCount + CrossBarVertexCount + Swing_body_VertexCount,
        swing_left_VertexCount);

    //swing right
    worldMatrix = mat4();

    worldMatrix = mult(worldMatrix, translate(0, 2, 0));
    worldMatrix = mult(worldMatrix, translate(-3.0, 3.2, -14));
    worldMatrix = mult(worldMatrix, rotateX(-currAngle));
    worldMatrix = mult(worldMatrix, translate(0, -2.0, 0));
    currSwingWorldMat = worldMatrix; //scale반영X
    swingWorldPos = worldMatrix.slice(0, 3).map((low) => low[3]);
    worldMatrix = mult(worldMatrix, scalem(5, 5, 5));

    gl.uniformMatrix4fv(worldMatLoc1, false, flatten(worldMatrix));
    gl.uniform1i(texImageLoc1, 2);
    if (selectedObjectId == 5) gl.uniform3f(matEmitLoc1, 0.2, 0.2, 0);
    if (selectedObjectId == 5 && step_picking_flug) gl.uniform3f(matEmitLoc1, 0, 0, 0);

    gl.drawArrays(gl.TRIANGLES, GroundVertexCount + Parent_GroundVertexCount + SliderVertexCount +
        BarrierVertexCount + BenchVertexCount + MerryVertexCount + CrossBarVertexCount + Swing_body_VertexCount +
        swing_left_VertexCount, swing_right_VertexCount);





    //------------------------------------------------------------------------------)
    //2026-07-28 lamp 국소조명 lighting 
    //2026 08/01 ✓

    //lamp
    for (let x = -20; x <= 20; x += 40) {
        for (let z = 13; z >= -20; z -= 33) {
            worldMatrix = scalem(10, 10, 10);
            worldMatrix = mult(translate(x, 4, z), worldMatrix)
            gl.uniformMatrix4fv(worldMatLoc1, false, flatten(worldMatrix));
            gl.uniform1i(texImageLoc1, 0);
            gl.uniform3f(matEmitLoc02, 0, 0, 0); //조명 발산을 위한 독립제어
            gl.drawArrays(gl.TRIANGLES, GroundVertexCount + Parent_GroundVertexCount + SliderVertexCount +
                BarrierVertexCount + BenchVertexCount + MerryVertexCount + CrossBarVertexCount + Swing_body_VertexCount +
                swing_left_VertexCount + swing_right_VertexCount, lamp_body_VertexCount);


            worldMatrix = scalem(1, 1, 1);
            worldMatrix = mult(translate(x, 8, z), worldMatrix)
            gl.uniformMatrix4fv(worldMatLoc1, false, flatten(worldMatrix));
            gl.uniform1i(texImageLoc1, 0);
            gl.uniform3f(matEmitLoc1, 0, 0, 0);

            if (night_Flug ? gl.uniform3f(matEmitLoc02, 0.7, 0.7, 0) : gl.uniform3f(matEmitLoc02, 0, 0, 0));
            gl.drawArrays(gl.TRIANGLES, GroundVertexCount + Parent_GroundVertexCount + SliderVertexCount +
                BarrierVertexCount + BenchVertexCount + MerryVertexCount + CrossBarVertexCount + Swing_body_VertexCount +
                swing_left_VertexCount + swing_right_VertexCount + lamp_body_VertexCount, lamp_head_VertexCount);

            gl.uniform3f(matEmitLoc02, 0, 0, 0); //nightMode전환시
        }
    }


    //SeeSaw animations
    time02 = performance.now() * 0.001;
    let SwingAngle02 = 15;
    let speed02 = 2.0;
    let currAngle02 = SwingAngle02 * Math.sin(time02 * speed02);


    for (let z = 9; z >= 6; z -= 3) {
        worldMatrix = scalem(2, 2, 2);
        worldMatrix = mult(worldMatrix, rotateY(90));
        worldMatrix = mult(translate(-12, 0, z), worldMatrix);

        gl.uniformMatrix4fv(worldMatLoc1, false, flatten(worldMatrix));
        gl.uniform1i(texImageLoc1, 0);

        if (selectedObjectId == 6) gl.uniform3f(matEmitLoc1, 0.2, 0.2, 0);
        if (selectedObjectId && step_picking_flug) gl.uniform3f(matEmitLoc1, 0, 0, 0);
        gl.drawArrays(gl.TRIANGLES, GroundVertexCount + Parent_GroundVertexCount + SliderVertexCount +
            BarrierVertexCount + BenchVertexCount + MerryVertexCount + CrossBarVertexCount + Swing_body_VertexCount +
            swing_left_VertexCount + swing_right_VertexCount + lamp_body_VertexCount + lamp_head_VertexCount, SeeSaw_Body_VertexCount);


        //SeeSaw Head
        worldMatrix = mat4();
        worldMatrix = mult(worldMatrix, translate(-12, 1.2, z));
        if (z === 6 ? worldMatrix = mult(worldMatrix, rotateZ(currAngle02)) : worldMatrix = mult(worldMatrix, rotateZ(-currAngle02)))
            worldMatrix = mult(worldMatrix, rotateY(90));
        currSeeSawWorldMat = worldMatrix; //기준좌표: 0,0,0 
        seeSawWorldPos = worldMatrix.slice(0, 3).map((low) => low[3]);
        worldMatrix = mult(worldMatrix, scalem(8, 8, 8));
        gl.uniformMatrix4fv(worldMatLoc1, false, flatten(worldMatrix));
        gl.uniform1i(texImageLoc1, 0);

        if (selectedObjectId == 6) gl.uniform3f(matEmitLoc1, 0.2, 0.2, 0);
        if (selectedObjectId && step_picking_flug) gl.uniform3f(matEmitLoc1, 0, 0, 0);

        gl.drawArrays(gl.TRIANGLES, GroundVertexCount + Parent_GroundVertexCount + SliderVertexCount +
            BarrierVertexCount + BenchVertexCount + MerryVertexCount + CrossBarVertexCount + Swing_body_VertexCount +
            swing_left_VertexCount + swing_right_VertexCount + lamp_body_VertexCount + lamp_head_VertexCount + SeeSaw_Body_VertexCount, SeeSaw_Head_VertexCount);

    }
    //2026/08/08 interactions Human
    //archway
    worldMatrix = mat4();
    worldMatrix = mult(worldMatrix, translate(0, 5, 13));
    worldMatrix = mult(worldMatrix, scalem(12, 12, 12));
    gl.uniformMatrix4fv(worldMatLoc1, false, flatten(worldMatrix));
    gl.uniform1i(texImageLoc1, 0);

    gl.uniform3f(matEmitLoc1, 0, 0, 0);
    gl.drawArrays(gl.TRIANGLES, GroundVertexCount + Parent_GroundVertexCount + SliderVertexCount +
        BarrierVertexCount + BenchVertexCount + MerryVertexCount + CrossBarVertexCount + Swing_body_VertexCount +
        swing_left_VertexCount + swing_right_VertexCount + lamp_body_VertexCount + lamp_head_VertexCount + SeeSaw_Body_VertexCount + SeeSaw_Head_VertexCount, ArchwayVertexCount);

    //stand
    worldMatrix = mat4();
    worldMatrix = mult(worldMatrix, translate(5, 0, 15));
    worldMatrix = mult(worldMatrix, scalem(4, 7, 4));
    gl.uniformMatrix4fv(worldMatLoc1, false, flatten(worldMatrix));
    gl.uniform1i(texImageLoc1, 0);

    gl.uniform3f(matEmitLoc1, 0, 0, 0);
    gl.drawArrays(gl.TRIANGLES, GroundVertexCount + Parent_GroundVertexCount + SliderVertexCount +
        BarrierVertexCount + BenchVertexCount + MerryVertexCount + CrossBarVertexCount + Swing_body_VertexCount +
        swing_left_VertexCount + swing_right_VertexCount + lamp_body_VertexCount + lamp_head_VertexCount + SeeSaw_Body_VertexCount + SeeSaw_Head_VertexCount + ArchwayVertexCount,
        StandVertexCount);


    //tree   
    for (let x = -28; x <= 28; x += 28) {
        if (x === 0) continue;
        //bottom
        worldMatrix = mat4();
        worldMatrix = mult(worldMatrix, translate(x, 7, -15));
        worldMatrix = mult(worldMatrix, scalem(8, 15, 8));
        gl.uniformMatrix4fv(worldMatLoc1, false, flatten(worldMatrix));
        gl.uniform1i(texImageLoc1, 5);
        // gl.uniform1i(texImageLoc1, 6);


        gl.uniform3f(matEmitLoc1, 0, 0, 0);

        gl.drawArrays(gl.TRIANGLES, GroundVertexCount + Parent_GroundVertexCount + SliderVertexCount +
            BarrierVertexCount + BenchVertexCount + MerryVertexCount + CrossBarVertexCount + Swing_body_VertexCount +
            swing_left_VertexCount + swing_right_VertexCount + lamp_body_VertexCount + lamp_head_VertexCount + SeeSaw_Body_VertexCount + SeeSaw_Head_VertexCount + ArchwayVertexCount +
            + StandVertexCount, URP_Tree_VertexCount);

        //top
        worldMatrix = mat4();
        worldMatrix = mult(worldMatrix, translate(x, 7, 9));
        worldMatrix = mult(worldMatrix, scalem(8, 15, 8));
        gl.uniformMatrix4fv(worldMatLoc1, false, flatten(worldMatrix));
        gl.uniform1i(texImageLoc1, 5);
        // gl.uniform1i(texImageLoc1, 6);


        gl.uniform3f(matEmitLoc1, 0, 0, 0);

        gl.drawArrays(gl.TRIANGLES, GroundVertexCount + Parent_GroundVertexCount + SliderVertexCount +
            BarrierVertexCount + BenchVertexCount + MerryVertexCount + CrossBarVertexCount + Swing_body_VertexCount +
            swing_left_VertexCount + swing_right_VertexCount + lamp_body_VertexCount + lamp_head_VertexCount +
            SeeSaw_Body_VertexCount + SeeSaw_Head_VertexCount + ArchwayVertexCount +
            + StandVertexCount, URP_Tree_VertexCount);
    }

    //siren
    worldMatrix = mat4();
    worldMatrix = mult(worldMatrix, translate(5, 5.0, -20));
    worldMatrix = mult(worldMatrix, rotateY(140));
    swingWorldPos = worldMatrix.slice(0, 3).map((low) => low[3]);
    sirenWorldPos = worldMatrix;
    worldMatrix = mult(worldMatrix, scalem(10, 10, 10));
    gl.uniformMatrix4fv(worldMatLoc1, false, flatten(worldMatrix));

    if (selectedObjectId == 7) gl.uniform3f(matEmitLoc1, 0.2, 0.2, 0);
    else gl.uniform3f(matEmitLoc1, 0, 0, 0);

    gl.drawArrays(gl.TRIANGLES, GroundVertexCount + Parent_GroundVertexCount + SliderVertexCount +
        BarrierVertexCount + BenchVertexCount + MerryVertexCount + CrossBarVertexCount + Swing_body_VertexCount +
        swing_left_VertexCount + swing_right_VertexCount + lamp_body_VertexCount + lamp_head_VertexCount +
        SeeSaw_Body_VertexCount + SeeSaw_Head_VertexCount + ArchwayVertexCount + StandVertexCount + URP_Tree_VertexCount,
        sirenVertexCount);




    window.requestAnimationFrame(render);
}



function generateModel() {
    // Ground
    vertices.push(vec3(-20, -1, 13), vec3(0, 1, 0), vec2(0, 0),
        vec3(20, -1, 13), vec3(0, 1, 0), vec2(10, 0),
        vec3(20, -1, -20), vec3(0, 1, 0), vec2(10, 10),
        vec3(-20, -1, 13), vec3(0, 1, 0), vec2(0, 0),
        vec3(20, -1, -20), vec3(0, 1, 0), vec2(10, 10),
        vec3(-20, -1, -20), vec3(0, 1, 0), vec2(0, 10));
    GroundVertexCount = 6;

    vertices.push(vec3(-30, -2, 30), vec3(0, 1, 0), vec2(0, 0),// parent
        vec3(30, -2, 30), vec3(0, 1, 0), vec2(10, 0),
        vec3(30, -2, -30), vec3(0, 1, 0), vec2(10, 10),
        vec3(-30, -2, 30), vec3(0, 1, 0), vec2(0, 0),
        vec3(30, -2, -30), vec3(0, 1, 0), vec2(10, 10),
        vec3(-30, -2, -30), vec3(0, 1, 0), vec2(0, 10));
    Parent_GroundVertexCount = 6;


}




async function loadOBJModel(objPath) {
    try {
        const response = await fetch(objPath);
        if (!response.ok) {
            throw new Error(`${objPath} load failed: ${response.status}`);
        }
        const objText = await response.text();
        //console.log(objPath);

        const lines = objText.split("\n");


        // Parsing
        var positions = [], normals = [], texCoords = [];
        var posIndex = [], norIndex = [], texIndex = [];
        var currGroup = "";
        for (var i = 0; i < lines.length; i++) {
            const parts = lines[i].trim().split(/\s+/);
            const keyword = parts[0];


            if (keyword === "v") {
                positions.push(vec3(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])));
            }
            else if (keyword === "vn") {
                normals.push(vec3(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])));
            }
            else if (keyword === "vt") {
                texCoords.push(vec2(parseFloat(parts[1]), parseFloat(parts[2])));
            }


            else if (keyword === "f") {
                var pIndices = [], nIndices = [], tIndices = [];
                for (var j = 1; j < parts.length; j++) {
                    var indices = parts[j].split('/');
                    pIndices.push(parseInt(indices[0]) - 1);    // Because OBJ index starts from 1. //0-base
                    tIndices.push(indices[1] ? parseInt(indices[1]) - 1 : -1);
                    nIndices.push(indices[2] ? parseInt(indices[2]) - 1 : -1);
                }

                // Triangulation of polygons
                for (var j = 1; j < pIndices.length - 1; j++) {
                    posIndex.push(pIndices[0], pIndices[j], pIndices[j + 1]);
                    norIndex.push(nIndices[0], nIndices[j], nIndices[j + 1]);
                    texIndex.push(tIndices[0], tIndices[j], tIndices[j + 1]);
                }
            }
        }


        // Center alignment and size adjustment
        var min = [Infinity, Infinity, Infinity];
        var max = [-Infinity, -Infinity, -Infinity];
        for (var i = 0; i < positions.length; i++) {
            for (var j = 0; j < 3; j++) {
                if (positions[i][j] < min[j]) min[j] = positions[i][j];
                if (positions[i][j] > max[j]) max[j] = positions[i][j];
            }
        }
        var center = [(max[0] + min[0]) / 2, (max[1] + min[1]) / 2, (max[2] + min[2]) / 2];
        var maxExtent = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]);
        var scale = 1.0 / maxExtent;
        for (var i = 0; i < positions.length; i++) {
            positions[i][0] = (positions[i][0] - center[0]) * scale;
            positions[i][1] = (positions[i][1] - center[1]) * scale;
            positions[i][2] = (positions[i][2] - center[2]) * scale;
        }

        // Updating vertex array
        for (var i = 0; i < posIndex.length; i++) {
            vertices.push(positions[posIndex[i]]);
            vertices.push((norIndex[i] == -1) ? vec3(0, 0, 0) : normals[norIndex[i]]);
            vertices.push((texIndex[i] == -1) ? vec2(0, 0) : texCoords[texIndex[i]]);


            if (objPath === "models/Slider.obj") {
                SliderVertexCount++;

            } else if (objPath === "models/Railings.obj") {
                BarrierVertexCount++;
            } else if (objPath === "models/street_bench.obj") {
                BenchVertexCount++;
            } else if (objPath === "models/Teeter.obj") {
                MerryVertexCount++;
            } else if (objPath === "models/CrossBar.obj") {
                CrossBarVertexCount++;
            } else if (objPath === "models/swing_body.obj") {
                Swing_body_VertexCount++;
            } else if (objPath === "models/swing_left.obj") {
                swing_left_VertexCount++;
            } else if (objPath === "models/swing_right.obj") {
                swing_right_VertexCount++;
            } else if (objPath === "models/lamp_body.obj") {
                lamp_body_VertexCount++;
                // console.log("lamp_body_counting");
            } else if (objPath === "models/lamp_head.obj") {
                lamp_head_VertexCount++;
            } else if (objPath === "models/SeeSaw_head.obj") {
                SeeSaw_Head_VertexCount++;
            } else if (objPath === "models/SeeSaw_body.obj") {
                SeeSaw_Body_VertexCount++;
            } else if (objPath === "models/Archway.obj") {
                ArchwayVertexCount++;
            } else if (objPath === "models/Stand.obj") {
                StandVertexCount++;
            } else if (objPath === "models/URP_Tree.obj") {
                URP_Tree_VertexCount++;
            } else if (objPath === "models/siren.obj") {
                sirenVertexCount++;

            } else {
                objVertexCount++; //check Object
                console.log(objVertexCount);
            }
        }
        console.log(`OBJ loaded: ${objPath}, # of vertices: ${objVertexCount}`);

    } catch (error) {
        console.error(`${objPath} load failed: ${error}`);
    }
}
