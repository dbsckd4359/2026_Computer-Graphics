#version 300 es
  precision mediump float;

            uniform sampler2D texImage, normalMap;
               uniform vec3 matSpec, matAmbi, matEmit;  //Material
                  uniform float matSh;
                     uniform vec3 srcDiff, srcSpec, srcAmbi; //Light sourse

                     in vec3 fViewTS, fLightTS;
             in vec2 fTexCoord;

             

           layout(location = 0) out vec4 fragColor;

            void main()
            {
                //normalization
                vec3 normal = normalize(2.0 * texture(normalMap, fTexCoord).xyz - 1.0);
                   vec3 view = normalize(fViewTS);
                      vec3 light = normalize(fLightTS);


                      //diffuse term
                      vec3 matDiff = texture(texImage,fTexCoord).rgb;
                      vec3 diff = max(dot(normal,light), 0.0) * srcDiff * matDiff;
                      
                
                      //Blinn Model
                      vec3 halfV = normalize(light + view);
                      vec3 spec = pow(max(dot(normal, halfV), 0.0), matSh) * srcSpec * matSpec;

                      //ambient term
                      vec3 ambi = srcAmbi * matAmbi;


                fragColor =  vec4(diff + spec + ambi + matEmit, 1.0);
		
            }