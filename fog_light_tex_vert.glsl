#version 300 es

layout(location = 0) in vec3 vPosition;
layout(location = 1) in vec3 vNormal;
layout(location = 2) in vec2 vTexCoord;


out vec3 fNormal, worldPos;
out vec2 fTexCoord;

//out vec3 worldPos02;



uniform mat4 worldMat, viewMat, projMat;

//uniform mat4  viewMat02

// uniform bool lampFlug;

void main(){
    fNormal = normalize(transpose(inverse(mat3(worldMat))) * normalize(vNormal));
                worldPos = (worldMat * vec4(vPosition,1)).xyz;
             //   fView = normalize(eyePos - worldPos); //?
                gl_Position = projMat * viewMat *  vec4(worldPos, 1);
                fTexCoord = vTexCoord;

}