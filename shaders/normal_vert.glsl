#version 300 es

            layout(location = 0) in vec3 vPosition;
            layout(location = 1) in vec3 vNormal;
            layout(location = 2) in vec2 vTexCoord;
             layout(location = 3) in vec3 vTangent;

            out vec3 fViewTS, fLightTS;
            out vec2 fTexCoord;

            uniform mat4 worldMat, viewMat, projMat;
            uniform vec3 eyePos, lightDir; 

            void main()
            {
                vec3 normal = normalize(transpose(inverse(mat3(worldMat))) * vNormal);
                vec3 tangent = normalize(transpose(inverse(mat3(worldMat))) * vTangent);
                vec3 bitangent = normalize(cross(normal,tangent));
                mat3 tbnMat = transpose(mat3(tangent, bitangent, normal));
              
              
              vec3 worldPos = (worldMat * vec4(vPosition,1)).xyz;
                
                fViewTS = tbnMat * normalize(eyePos - worldPos);
                fLightTS = tbnMat * normalize(lightDir);
                
                gl_Position = projMat * viewMat *  vec4(worldPos, 1);
                fTexCoord = vTexCoord;
            }