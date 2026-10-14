#version 300 es
precision mediump float;

layout(location = 0) out vec4 fragColor;

uniform vec4 rainColor;
void main() {
   
    fragColor = rainColor;

  
}