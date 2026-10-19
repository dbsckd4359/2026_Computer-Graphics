let rainVertCount =0;
let rainArr = [];
function initRain(){
    const rain_cnt = 4000;
    const area = 60; //-30~30
    const height = 30; //y

    rainArr = new Float32Array(rain_cnt*4);

    for(let i=0; i< rain_cnt; i++){
       
        rainArr[i*4 + 0] = (Math.random() - 0.5) * area;  
        rainArr[i*4 +1] =   Math.random() * area;
         rainArr[i*4 +2] = (Math.random() - 0.5) * area;
          rainArr[i*4 +3] =15 + Math.random() * 10;  //낙하속도
          
       
         rainVertCount++;
    }
    console.log("rain count:",rainVertCount);
    return  rainArr;
}