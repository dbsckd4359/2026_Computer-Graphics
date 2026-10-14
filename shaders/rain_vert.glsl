#version 300 es

layout(location = 3) in vec3 initStartPos; //빗방물 초기위치
layout(location = 4) in float  speed; //빗방물 낙하속도

uniform mat4 worldMat, viewMat, projMat;

uniform float time;//경과시간 : js에서 갱신(frame)
uniform float FallHeight;//전체 높이 범위

void main(){

    float y = initStartPos.y - time * speed; 
    y = mod(y, FallHeight) - FallHeight * 0.5;

    vec3 pos = vec3(initStartPos.x, y, initStartPos.z);
    gl_Position = projMat * viewMat * worldMat * vec4(pos, 1);
 
    gl_PointSize = 3.0;
}