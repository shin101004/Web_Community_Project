import * as FETCH from "../fetch.js";
import * as REND from "../render.js";
import * as EVENT from "../event.js";
import * as REND_LIST from "../list/render.js";
import * as MAIN from "../main.js"
// import * as REND_ASIDE from "../aside/render.js";

let POST_PAGE_COUNT = 1;
// POST_PAGE_COUNT는 무한스크롤시 증가하는 페이지 넘버 , post 로드시에 초기화된다.

//=========전체 post 조회하는 함수============
export async function loading_post(hashValue) { // load_post()
  try {
    POST_PAGE_COUNT = 1; //페이지 넘버 초기화
    const data = await FETCH.fetch_getPost(hashValue[1], POST_PAGE_COUNT++); //data는 fetch의 response객체를 반환
    const code = data.status; //데이터의 반환코드부분

    if (document.querySelector('.post_input') == null) REND_LIST.init_post(); //post_info에서 다시 POST전체조회로 넘어오게될때 존재해야될 기본페이지 랜더링 요소 초기화
    document.querySelector('.side_search').style.cssText = 'display : block';
    //전체게시판에서 넘어왔을경우 side_search가 가려져있는 것을 다시보이게함

    REND.render_inputOff(); //인풋창 랜더링
    EVENT.handle_Input() // 인풋창 이벤트 부착

    if (code == 204) REND_LIST.no_Post(); //마지막 post인경우 지막페이지 확인표시 랜더링
    else {
      const post = await data.json(); //데이터의 담긴 결과값을 json형식으로 변환
      document.querySelector('.post_lists').innerHTML = ''; //포스트 전체 조회부분 초기화
      await REND_LIST.post_main(post); //post들 랜더링
      if (post.length < 20) REND_LIST.no_Post(); //랜더링한 포스트의 개수가 20개이하일경우 마지막페이지 확인표시 랜더링
    }
  } catch (error) {
    console.log(error);
  }
}

/*=============무한스크롤 게시글 불러오기============
최상단에 선언된  POST_PAGE_COUNT으로 해당 페이지를 불러온다.
hashvalue에 따라서 페이지가 구분되므로 postmain 페이지일때 무한스크롤과
search일때로 나누어짐
*/
export async function loading_new_post(hashValue) { // add_newPosts()
  try {
    if (hashValue[2] == 'postmain') {
      const data = await FETCH.fetch_getPost(hashValue[1], POST_PAGE_COUNT++); //페이지로드, 반환값은 response객체
      const code = data.status;
      if (code == 204) REND_LIST.no_Post(); //마지막페이지일 경우 서버에서 204반환,내용에 데이터없음
      else {
        const post = await data.json();
        REND_LIST.post_main(post); //받아온 데이터로 게시글 랜더링
      }
    } else if (hashValue[2] == 'search') {
      const data = await FETCH.fetch_search(`${hashValue[3]}${POST_PAGE_COUNT++}`, hashValue[1]);
      const code = data.status;
      if (code == 204) REND_LIST.no_Post(); //마지막페이지
      else {
        const post = await data.json();
        //console.log(post);
        if (hashValue[1] == 'total') await REND_LIST.post_main(post.returnlist, 'total');
        //전체 게시판에서의 검색일경우 함수 두번째인자에 1을 넘겨서 구분
        else REND_LIST.post_main(post.returnlist);
      }
    }
  } catch (error) {
    console.log(error);
  }
}

/*===================검색 화면===================*/
export async function loading_search_result(hashValue) { // load_searchpost()
  try {
    POST_PAGE_COUNT = 1; //페이지 카운트 초기화
    const data = await FETCH.fetch_search(`${hashValue[3]}${POST_PAGE_COUNT++}`, hashValue[1]); //검색정보 전송
    const code = data.status;
    let board;
    console.log('hi');

    await loading_board_information(hashValue).then((result)=>{
      board = result;
    })
    //파라미터를 url로 넘겨주면 urf-8로 디코딩 ,인코딩 해줘야함
    const title = decodeURI(hashValue[3].split('&')[1].split('=')[1]);

    //랜더링
    if (code == 204) { //불러온 페이지가 없을경우 (검색결과가 없을경우 )
      REND_LIST.init_post();
      const ele = document.querySelector('.post_input');
      const div = MAIN.get_htmlObject('div', ['class'], ['search_result'], `'${title}' ${ board.board_name} 게시판 검색결과가 없습니다.`);
      ele.appendChild(div);
      if (board.id == null) { //전체게시판 검색일경우
        document.querySelector('.side_search').style.cssText = 'display : none';
        document.querySelector('.post_title').querySelector('h1').textContent = `메인으로`;
      }
      REND_LIST.no_Post();
    } else {
      const json = await data.json();
      await REND_LIST.search_results(title, board, json);
    }
  } catch (error) {
    console.log(error);
  }
}

export async function loading_board_information(hashValue) {
  let board_information;

  //현재 전체검색이 아닌경우 보드정보를 불러오고 전체검색인경우 보드정보를 직접만듬
  if(hashValue[1] != 'total'){
    await FETCH.fetch_getBoard(hashValue[1]).then((result) => {
      board_information = result;
    })
  }else board_information = {
      board_name: '전체',
      id: null
    };
  return board_information;
}
// 보드정보 불러오는 코드 매서드 추출