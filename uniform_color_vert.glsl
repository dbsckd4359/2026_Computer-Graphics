#version 300 es

layout(location = 0) in vec3 vPosition;

uniform mat4 worldMat, viewMat, projMat;

void main(){
    gl_Position = projMat * viewMat * worldMat * vec4(vPosition, 1);
}

