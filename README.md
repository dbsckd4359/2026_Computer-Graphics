## 2026 CG poject
WebGL과 GLSL을 이용한 웹 어플 제작하기


## 1. 프로젝트 개요

- 프로젝트명: childhood-recollection
**한림대학교 컴퓨터 그래픽스(Computer graphics) 개인 프로젝트** 
WebGL을 활용하여 어린시절의 추억을 3D공간으로 구현한 웹 애플리케이션입니다.

- 저장소명: [@dbsckd4359] https://github.com/dbsckd4359/2026_childhood-recollection
- 성격: CG 수업용 OpenGL기반 그래픽스 
- 개발 형태: ing 
- 개발 인원: 1명
- 핵심 목표: 1. 저수준 WebGL 그래픽스 파이프라인의 직접 제어 및 이해
             2. GLSL 커스텀 셰이더를 통한 실시간 dynamic lighting 연산 구현
     
## 흐름
`어린 시절 회상` 이라는 테마로 배경은 놀이터이며, fog를 사용한 연출로 시작을 하며 특정 위치에 진입하면 기본적인 테마인 `Morning`으로 시작합니다. 이후 타이머의 제한시간동안 기구와 분위기를 직관적으로 확인할 수 있습니다. 그외의 테마는 `Sunset`,`Night`모드가 존재합니다.

## 기술
- HTML5 | CSS3 | JavaScript ES6 | GLSL 


## 향후 개선점
1. 가로등(LampObject)광원의 국소 조명 및 Emissive 셰이더 적용
- LampObject의 발광 부위를 추출하여 fragment shader에서 Emissive속성을 제어하여 실제 빛이
분출되는 듯한 국소 Lighting효과 구현

2. 마우스피킹(picking) 기반의 놀이터 기구에 대한 동적 카메라 뷰 전환   

3. 오브젝트 국소 회전 애니메이션 구현
- 놀이터 기구 오브젝트의 모델 변환 행렬 독립제어를 통한 부분 회전 애니메이션 구현
 



