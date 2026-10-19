const storage_key = "themas";
//api 연동 테스트
async function initThemaStorage(){
    const init = localStorage.getItem(storage_key);

    if(!init){
       try{
        const mockData = await  fetch(`/2026_Computer-Graphics/mock.json`);
        const initData = await mockData.json();

        localStorage.setItem(storage_key, JSON.stringify(initData));
        console.log("초기 목업데이터로 localStorage구성 완료");
       }catch(e){
        console.log("mock.json 로드 실패");
         localStorage.setItem(storage_key,"[]");
       }
    }

}

//부분 조회
async function apiSearchEle(id){
    if(!id){
        console.log('적용을 위한 테마객체가 존재하지 않습니다');
        return;
    }
    const themaArr = await apiSearchThema();

    const searchThema = themaArr.filter( ele => ele.id == id); //undifined 
     console.log(searchThema);
    return searchThema; 
}
//테마 목록 조회 
async function apiSearchThema(){
    if(localStorage.getItem(storage_key) === "" ||localStorage.getItem(storage_key) === null){
        console.log(`themaStorage.js ) is data ${localStorage.getItem(storage_key)}`);
        return [];
    }

    const data = localStorage.getItem(storage_key);
    return JSON.parse(data || [] ); //[{}]
}

//테마 저장
async function apiSaveThema(newThema){
    const themaArr =  await apiSearchThema();

    newThema.id = Date.now(); 
    themaArr.push(newThema); 

    localStorage.setItem(storage_key ,JSON.stringify(themaArr));
    return newThema;
}
//테마삭제
async function apiDeleteThema(id){
    if(id === null){
        console.log("삭제 요소가 존재하지 않습니다");
        return null; 
    }
    let themaArr = await apiSearchThema();
    console.log(themaArr);

    themaArr = themaArr.filter(thema => thema.id != id); //삭제요소 필터링
    localStorage.setItem(storage_key, JSON.stringify(themaArr));
}


//export {initThemaStorage , apiSearchThema , apiSaveThema ,apiDeleteThema};
