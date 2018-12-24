
var ctx;     //コンテキスト
var board = [];               //盤の初期配置
var member = [];               //各駒の初期配属
var movable = [];               //移動可能マス
var stand = [];                //持ち駒(種類と位置)リスト
var numstand = [];
var captble = [];              //持ち駒リスト

var status = 0;      //0:通常　1:駒の選択状態
var turn = 1;     //1:先手　-1:後手
var sbx,sby;     //選択状態の駒のbx,by
var ssx,ssy;     //選択状態の駒のs,sy

var font_color = ["black","maroon","lime"];    //文字の色
var out_color = "olive";   //背景の色
var board_color = ["Khaki","darkkhaki","steelblue"];  //盤面の色
var line_color = ["darkslategray" ,"darkslategray" ,"darkslategray"];   //線の色
var stand_color = ["peru","firebrick"];  //駒台の色
var width = 400;   //画面の横幅
var height = 640;   //画面の縦幅

var psize = 32;           //1マスのピクセル数
var total_w = 11, total_h = 19;    //画面全体のマス数
var board_w = 9, board_h = 9;    //将棋盤のサイズ
var mw = (total_w-board_w)/2,   mh = (total_h-board_h)/2;  //将棋盤周りの余白マス数
var stand_w = 5, stand_h = 2;    //駒台のサイズ
var msw = 1, msh = 2;     //駒台周りの余白

var nametbl = [
    "","王","玉","飛","角","金","銀","桂","香","歩",
    "竜","馬","全","圭","杏","と"
];

var dx = [-1,    1,
          -1, 0, 1,
          -1,    1,
          -1, 0, 1];      //xの移動量
var dy = [ 2,    2,
           1, 1, 1,
           0,    0,
          -1,-1,-1];          //yの移動量
var movtbl = [
    [0,0,0,0,0,0,0,0,0,0],    //0:なし
    [0,0,1,1,1,1,1,1,1,1],    //1:王
    [0,0,1,1,1,1,1,1,1,1],    //2:玉
    [0,0,0,2,0,2,2,0,2,0],    //3:飛
    [0,0,2,0,2,0,0,2,0,2],    //4:角
    [0,0,1,1,1,1,1,0,1,0],    //5:金
    [0,0,1,1,1,0,0,1,0,1],    //6:銀
    [1,1,0,0,0,0,0,0,0,0],    //7:桂
    [0,0,0,2,0,0,0,0,0,0],    //8:香
    [0,0,0,1,0,0,0,0,0,0],    //9:歩
    [0,0,1,2,1,2,2,1,2,1],    //10:竜
    [0,0,2,1,2,1,1,2,1,2],    //11:馬
    [0,0,1,1,1,1,1,0,1,0],    //12:全
    [0,0,1,1,1,1,1,0,1,0],    //13:圭
    [0,0,1,1,1,1,1,0,1,0],    //14:杏
    [0,0,1,1,1,1,1,0,1,0],    //15:と
];

var change = [0,0,0,10,11,0,12,13,14,15,-3,-4,-6,-7,-8,-9];  //成リスト

//初期化処理
function init() {
    canvas = document.getElementById("world");
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext('2d');
    ctx.font = " 24px 'ＭＳ ゴシック'";

    var touch=false;
    if(navigator.userAgent.indexOf('iPhone') > 0    //使用デバイス判定
        || navigator.userAgent.indexOf('iPod') > 0
        || navigator.userAgent.indexOf('iPad') > 0
        || navigator.userAgent.indexOf('Android') > 0) {
         touch=true;
    }
    if(touch==true){
        document.addEventListener("touchstart", touchstart);  //タッチした瞬間に処理
    }else{
        document.addEventListener("mousedown", mousedown);   //マウス押した瞬間に処理
    }

    board = [               //盤の初期配置
        [8,7,6,5,2,5,6,7,8],
        [0,3,0,0,0,0,0,4,0],
        [9,9,9,9,9,9,9,9,9],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [9,9,9,9,9,9,9,9,9],
        [0,4,0,0,0,0,0,3,0],
        [8,7,6,5,1,5,6,7,8]
    ];
    member = [               //各駒の初期配属
        [-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [0,-1,0,0,0,0,0,-1,0],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [1,1,1,1,1,1,1,1,1],
        [0,1,0,0,0,0,0,1,0],
        [1,1,1,1,1,1,1,1,1]
    ];
    movable = [            //移動可能マス
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0]
    ];
    stand = [[0,0,0,0,0,0,0,0,0,0],        //持ち駒(格納位置:駒台の場所、値:駒id)
             [0,0,0,0,0,0,0,0,0,0]];
    numstand = [[0,0,0,0,0,0,0,0,0,0],        //持ち駒(格納位置:駒id、値:個数)
                [0,0,0,0,0,0,0,0,0,0]];
    turn = 1;
    draw_all();     //画面全体を描画
}

/////////////////////////////////////描画処理/////////////////////////////////////////
//画面全体を描画
function draw_all(){
    status = 0;   //状態初期化
    draw_out();  //盤外
    for(by=0; by<board_h; by++){    //盤内
        for(bx=0; bx<board_w; bx++){
            id = board[by][bx];
            m = member[by][bx];
            movable[by][bx] = 0;
            draw_board(bx,by,id,m,0);
        }
    }
    ctx.fillStyle = line_color[0];    //駒台
    ctx.fillRect(psize*msw, psize*msh, psize*(stand_w), psize*(stand_h));
    ctx.fillRect(psize*(total_w-stand_w-msw), psize*(total_h-stand_h-msh), psize*(stand_w), psize*(stand_h));
    ctx.fillStyle = stand_color[0];
    ctx.fillRect(psize*msw+1, psize*msh+1, psize*(stand_w)-2, psize*(stand_h)-2);
    ctx.fillRect(psize*(total_w-stand_w-msw)+1, psize*(total_h-stand_h-msh)+1, psize*(stand_w)-2, psize*(stand_h)-2);
    set_stand();  //stand配列を更新
    for(sy=stand_h-1; 0<=sy; sy--){
        for(sx=stand_w-1; 0<=sx; sx--){
            id = stand[0][stand_w*sy+sx];
            id2 = stand[1][stand_w*sy+sx];
            draw_stand(sx,sy,id,1,0);
        }
    }
    for(sy=0; sy<stand_h; sy++){
        for(sx=0; sx<stand_w; sx++){
            id = stand[0][stand_w*sy+sx];
            id2 = stand[1][stand_w*sy+sx];
            draw_stand(sx,sy,id2,-1,0);
        }
    }
    ctx.fillStyle = "black";    //手番の表示
    if(turn==1){
        ctx.fillText("先手番",psize/2,total_h*psize-12);
    }else if(turn==-1){
        ctx.fillText("後手番",psize/2,psize);
    }
}
//盤内を描画
function draw_board(bx,by,id,member,color){
    px = (bx+mw)*psize;
    py = (by+mh)*psize;
    ctx.fillStyle = line_color[color];
    ctx.fillRect(px, py, psize, psize);  //枠線描画
    ctx.fillStyle = board_color[color];
    ctx.fillRect(px+1, py+1, psize-2, psize-2);  //盤面描画
    if(0<id){   //駒描画
        if(id<10){
            ctx.fillStyle = font_color[0];
        }else{
            ctx.fillStyle = font_color[1];
        }
        if(member==1){
            ctx.fillText(nametbl[id],px+4,py+24);
        }else if(member==-1){
            px = -px-psize;
            py = -py-psize;
            ctx.rotate(Math.PI); //半回転
            ctx.fillText(nametbl[id],px+4,py+24);
            ctx.rotate(Math.PI); //半回転
        }
    }
}
//駒台を描画
function draw_stand(sx,sy,id,member,color){
    if(member==1){
        px = (total_w-msw-stand_w+sx)*psize;
        py = (total_h-msh-stand_h+sy)*psize;
    }else if(member==-1){
        px = (stand_w+msw-sx-1)*psize;
        py = (stand_h+msh-sy-1)*psize;
    }
    ctx.fillStyle = stand_color[color];
    ctx.fillRect(px+1, py+1, psize-2, psize-2);  //盤面描画
    if(0<id){   //駒描画
        if(member==1){
            ctx.fillStyle = font_color[0];
            ctx.fillText(nametbl[id],px+4,py+24);
            ctx.fillStyle = font_color[2];
            if(numstand[0][id]>1)  ctx.fillText(numstand[0][id],px+18,py+32);
        }else if(member==-1){
            px = -px-psize;
            py = -py-psize;
            ctx.rotate(Math.PI); //半回転
            ctx.fillStyle = font_color[0];
            ctx.fillText(nametbl[id],px+4,py+24);
            ctx.rotate(Math.PI); //半回転
            px *= (-1);
            py *= (-1);
            ctx.fillStyle = font_color[2];
            if(numstand[1][id]>1)  ctx.fillText(numstand[1][id],px-14,py);

        }
    }
}
//盤外を描画
function draw_out(x,y,color){
    px = x*psize;
    py = y*psize;
    ctx.fillStyle = out_color;
    ctx.fillRect(0, 0, psize*total_w, psize*total_h);  //盤面描画
}

///////////////////////////////////////////動作処理////////////////////////////////////////////////////
//クリック処理(タブレット)
function touchstart(e){
    if (e.targetTouches.length == 1){
        var rect=e.target.getBoundingClientRect();  //canvas上の絶対座標(左上)
        touch = e.targetTouches[0];
        var tx = touch.pageX - rect.left;
        var ty = touch.pageY - rect.top;
        masu_select(tx, ty);
    }
}
//クリック処理(PC)
function mousedown(e){
    var rect=e.target.getBoundingClientRect();  //canvas上の絶対座標(左上)
    var tx = e.clientX - rect.left;
    var ty = e.clientY - rect.top;
    masu_select(tx, ty);
}
 //クリック(タッチ)された座標にあるマス識別
function masu_select(tx,ty){
    x = Math.floor(tx/psize);   //floor:切り捨て
    y = Math.floor(ty/psize);
    if(isinside(x,y)){
        bx = x-mw;
        by = y-mh;
        if(status==0){
            sbx = bx;
            sby = by;
            movefrom(bx,by);
            return;
        }else if(status==1){
            moveto(bx,by);
            return;
        }else if(status==2){
            setto(bx,by);
            return;
        }
    }else if(isstand(x,y)){
        if(turn==1){
            sx = x-(total_w-msw-stand_w);
            sy = y-(total_h-msh-stand_h);
        }else if(turn==-1){
            sx = msw+stand_w-x-1;
            sy = msh+stand_h-y-1;
        }
        if(status==0){
            ssx = sx;
            ssy = sy;
            setfrom(sx,sy);
            return;
        }
    }
    draw_all();
}
//移動する駒の指定
function movefrom(bx,by){
    id = board[by][bx];
    m = member[by][bx];
    if(id != 0 && m == turn){
        status = 1;
       draw_board(bx,by,id,m,1);  //選択された駒の表示変更
       for(i=0; i<10; i++){
           tbx = bx;
           tby = by;
           while(movtbl[id][i] > 0){            //移動可能マスを描画
                tbx += dx[i];
                tby += dy[i]*turn*(-1);
                if(tbx<0 || board_w<=tbx || tby<0 || board_h<=tby) break;  //盤外
                id2 = board[tby][tbx];
                m2 = member[tby][tbx];
                if(m2 == turn) break;  //自駒にぶつかる
                draw_board(tbx,tby,id2,m2,2);   //盤の色変更
                movable[tby][tbx] = 1;
                if(movtbl[id][i] == 1) break;  //一マスだけ進める場合
                if(m2 == turn*(-1)) break;  //相手駒
           }
       }
    }
}
//移動後の座標の指定
function moveto(bx,by){
    if(movable[by][bx] == 1){  //移動可能な場合
        id = board[sby][sbx];
        if(change[id] > 0){   //成処理
            if((changable(sby)==1) || (changable(by) == 1)){
                if(confirm("成りますか？")) id = change[id];
            }
        }
        if(member[by][bx] == turn*(-1)){   //駒取処理
            getid = board[by][bx];
            if(change[getid] < 0)  getid = change[getid]*(-1);
            if(turn==1) numstand[0][getid] += 1;
            if(turn==-1) numstand[1][getid] += 1;
        }
        board[by][bx] = id;
        member[by][bx] = member[sby][sbx];
        board[sby][sbx] = 0;
        member[sby][sbx] = 0;
        turn *= -1;  //手番の変更
    }
    draw_all();
}
//次に指す持ち駒の指定
function setfrom(sx,sy){
    if(turn==1){
        id = stand[0][stand_w*sy+sx];
    }else if(turn==-1){
        id = stand[1][stand_w*sy+sx];
    }
    if(id==0) return;
    status=2;
    draw_stand(sx,sy,id,turn,1);
    for(by=0; by<board_h; by++){  //置ける場所探索
        for(bx=0; bx<board_w; bx++){
            if(board[by][bx]==0){
                draw_board(bx,by,0,0,2);   //盤の色変更
                movable[by][bx] = 1;
            }
        }
    }
}
//駒を指す座標の指定
function setto(bx,by){
    if(movable[by][bx] == 1){  //移動可能な場合
        if(turn==1){
            id = stand[0][stand_w*sy+sx];
            numstand[0][id] -= 1;
        }else if(turn == -1){
            id = stand[1][stand_w*sy+sx];
            numstand[1][id] -= 1;
        }
        board[by][bx] = id;
        member[by][bx] = turn;
        turn *= -1;  //手番の変更
    }
    draw_all();
}

//stand配列を更新
function set_stand(){
    for(j=0; j<=1; j++){
        n = 0;
        for(i=0; i<numstand[j].length; i++){
            if(numstand[j][i] > 0){
                stand[j][n] = i;
                n++;
            }
        }
        for(i=n; i<numstand[j].length; i++) stand[j][n] = 0;
    }
}

////////////////////////////////////////////////////判定処理/////////////////////////////////////////////
//指定座標が盤の内か判定
function isinside(x,y){
    if((x<mw)||(x>=(mw+board_w))||(y<mh)||(y>=(mh+board_h)))  return(0);
    return(1);
}
//指定座標が駒台上か判定
function isstand(x,y){
    if(turn == -1){
        if((msw <= x)&&(x < msw+stand_w)&&(msh <= y)&&(y < msh+stand_h))  return(1);
    }else if(turn == 1){
        if((total_w-msw-stand_w <= x)&&(x < total_w-msw)&&(total_h-msh-stand_h <= y)&&(y < total_h-msh)) return(1);
    }
    return(0);
}
//敵陣に入ったかの判定
function changable(by){
    if((3-3*turn <= by) && (by <= 5 - 3*turn)) return(1);
    return(0);
}

//リセット(初期化)
function doReset() {
    init();
}
