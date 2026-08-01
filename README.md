## 2026 CG poject
WebGL과 GLSL을 이용한 웹 애플리케이션 제작하기


## 1. 프로젝트 개요
- 프로젝트명: childhood-recollection
WebGL을 활용하여 어린시절의 추억을 3D공간으로 구현한 웹 애플리케이션입니다.
- 저장소명: 2026_Computer-graphics
- 성격: OpenGL기반 그래픽스 
- 개발 형태: JS기반 클라이언트 사이드 3D 그래픽스 렌더링
- 개발 인원: [@dbsckd4359]  https://github.com/dbsckd4359/2026_Computer-Graphics
- 개발 기간: before: 2026/06/01 ~ 2026/06/13 | after: 2026/07/21 ~ ing
- 핵심 목표:
     - WebGL 그래픽스 파이프라인의 직접 제어 및 이해
     - GLSL 셰이더를 통한 실시간 dynamic lighting 연산 구현
     - 추가사항 구현

## 흐름
`어린 시절 회상` 이라는 테마로 배경은 놀이터이며, fog를 사용한 연출로 시작을 하며 특정 위치에 진입하면 기본적인 테마인 `Morning`으로 시작합니다. 이후 타이머의 제한시간동안 기구와 분위기를 직관적으로 확인할 수 있습니다. 그외의 테마는 `Sunset`,`Night`모드가 존재합니다.

## 기술
- HTML5 | CSS3 | JavaScript ES5 ES6 혼합 | GLSL 

- Tools
  - Blender  

## 프로젝트 실행 
CG_Project.html파일을 브라우저로 열거나, vsCode의 Live Server 확장 프로그램을 사용하여 실행합니다 

## 사용흐름
우상단 사이드 패널의 내용처럼 WASD를 통해 이동할 수 있으며 빠른 흐름을 원하면 Alt + mouseWheel을 통한 이동이 가능합니다 시선 제어는 Alt + mouseMove 를 통해 제어가 가능합니다 

## 향후 추가사항
1. 가로등(LampObject)광원의 국소 조명 및 Emissive 셰이더 적용 ✓
- LampObject의 발광 부위를 추출하여 fragment shader에서 Emissive속성을 제어하여 실제 빛이
분출되는 듯한 국소 Lighting효과 구현 

2. 마우스피킹(picking) 기반의 놀이터 기구에 대한 동적 카메라 뷰 전환   

3. 오브젝트 국소 회전 애니메이션 구현 ✓
- 놀이터 기구 오브젝트의 모델 변환 행렬 독립제어를 통한 부분 회전 애니메이션 구현
 
4. 유틸리티 영역인 타이머를 전관판 오브젝트로 변경 또는 스피커와 사용자입력을 통한 인터렉션 요소 추가


## 마무리 및 정리
현 프로젝트는 AI 코드를 지양하고 컴퓨터 그래픽스 API와 수학적 레퍼런스만 참조한 프로젝트입니다
