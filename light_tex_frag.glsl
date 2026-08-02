#version 300 es
            precision mediump float;

            uniform sampler2D texImage;
               uniform vec3 matSpec, matAmbi, matEmit; //Material
                  uniform float matSh;
                     uniform vec3 srcDiff, srcSpec, srcAmbi; //Light-sourse
                        uniform vec3 lightDir; //light vector
             in vec3 fNormal, fView;           
            in vec2 fTexCoord;
           layout(location = 0) out vec4 fragColor;

            void main()
            {
                vec3 normal = normalize(fNormal);
                   vec3 view = normalize(fView);
                      vec3 light = normalize(lightDir);

                      //diffuse term
                      vec3 matDiff = texture(texImage,fTexCoord).rgb;
                      vec3 diff = max(dot(normal,light), 0.0) * srcDiff * matDiff;
                      
                      //specular term
                      //Phong Model
                      //vec3 refl = 2.0 * normal * dot(normal,light) -light;
                      //vec3 spec = pow(max(dot(refl,view),0.0), matSh) * srcSpec * matSpec;
                    
                      //Blinn Model
                      vec3 halfV = normalize(light + view);
                      vec3 spec = pow(max(dot(normal, halfV), 0.0), matSh) * srcSpec * matSpec;

                      //ambient term
                      vec3 ambi = srcAmbi * matAmbi;
                    
                fragColor =  vec4(diff  + spec + ambi + matEmit, 1.0);
		        //fragColor = vec4(fTexCoord, 1, 1);
            }