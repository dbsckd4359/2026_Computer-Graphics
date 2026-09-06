#version 300 es
precision mediump float;

uniform sampler2D texImage;
uniform vec3 matSpec, matAmbi, matEmit; // Material
uniform float matSh;
uniform vec3 srcDiff, srcSpec, srcAmbi; // Light-sourse
uniform vec3 lightDir;                  // directional light
uniform vec3 eyePos;
uniform float fogStart, fogEnd, fogColor;

     uniform float uAlpha;   // screen blending
   

    // night_Mode
    uniform vec3 LamplightDir[4], srcSpec02[4], matSpec02[4];
    uniform vec3  srcDiff02,  srcAmbi02, matAmbi02,matEmit02; 
   uniform float matSh02;
 
 uniform bool lampFlug;

in vec3 fNormal, worldPos;
in vec2 fTexCoord;

//lamp_lighting center Pos
uniform vec3 eyePos02;

layout(location = 0) out vec4 fragColor;


//Blinn Model 
vec3 BlinnFunc(vec3 light, vec3 view, vec3 normal, float matSh, vec3 srcSpec, vec3 matSpec){
    vec3 halfV = normalize(light + view);
  vec3 spec = pow(max(dot(normal, halfV), 0.0), matSh) * srcSpec * matSpec;
  return spec;
}
  vec3 temp = vec3(0,0,0); //Emit issue


vec4 lamp_lighting(vec3 normal , float fogDepth){
   vec3 view02 = normalize(eyePos02 - worldPos);
  for(int i=0; i< 4; i++){
   vec3 Lamp_light = normalize(LamplightDir[i] - worldPos);

// diffuse term
  vec3 matDiff02 = texture(texImage, fTexCoord).rgb;
  vec3 diff02 = max(dot(normal, Lamp_light), 0.0) * srcDiff02 * matDiff02;

  // ambient term
  vec3 ambi02 = srcAmbi02 * matAmbi02;

float fogFactor02  = smoothstep(fogStart, fogEnd ,fogDepth);
   
 vec3 fColor02 = mix((diff02 + BlinnFunc(Lamp_light,view02,normal,matSh02,srcSpec02[i], matSpec02[i])  + ambi02 + vec3(0,0,0)), vec3(fogColor), fogFactor02);

 temp += fColor02;
}
  temp =  temp / 4.0;
vec4 temp02 =  vec4(temp + matEmit02, 0.0);
fragColor += temp02;

return fragColor;
}




void main()
{
  // normalization
  vec3 normal = normalize(fNormal);
  vec3 view = normalize(eyePos - worldPos);
  vec3 light = normalize(lightDir);
    
  // diffuse term
  vec3 matDiff = texture(texImage, fTexCoord).rgb;
  vec3 diff = max(dot(normal, light), 0.0) * srcDiff * matDiff;

  
  // ambient term
  vec3 ambi = srcAmbi * matAmbi;


  float fogDepth = length(eyePos - worldPos);

  float fogFactor = smoothstep(fogStart, fogEnd, fogDepth);

  vec3 fColor = mix((diff +  BlinnFunc(light,view, normal ,matSh,srcSpec, matSpec)  + ambi + matEmit), vec3(fogColor), fogFactor);
  fragColor = vec4(fColor, uAlpha);

if(lampFlug){
  lamp_lighting(normal ,fogDepth);
}


}