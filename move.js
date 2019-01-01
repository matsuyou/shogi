//各駒の定義と動作

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


///////////////////////////////////////////動作処理////////////////////////////////////////////////////
//移動する駒の指定
function movefrom(bx,by){
    var id = board[by][bx];
    var m = member[by][bx];
    var id2,m2;
    if(id != 0 && m == turn){
        status = 1;
        draw_board(bx,by,id,m,1);  //選択された駒の表示変更
        for(i=0; i<10; i++){
            var tbx = bx;
            var tby = by;
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
    var id = board[sby][sbx];
    if(change[id] > 0){   //成処理
        if((changable(sby)==1) || (changable(by) == 1)){
            if((id==7||id==8||id==9)&&(by==turn*(-4)+4)){   //歩と香が端に来た
                id = change[id];
            }else if((id==7)&&(by==turn*(-3)+4)){  　 //桂が端2に来た
                id = change[id];
            }else if(turn==-1 && (mode==1||mode==3)){
                id = change[id];
            }else{
                if(confirm("成りますか？")) id = change[id];
            }
        }
    }
    if(member[by][bx] == turn*(-1)){   //駒取処理
        var getid = board[by][bx];
        if(change[getid] < 0)  getid = change[getid]*(-1);
        if(turn==1) numstand[0][getid] += 1;
        if(turn==-1) numstand[1][getid] += 1;
    }
    board[by][bx] = id;
    member[by][bx] = member[sby][sbx];
    board[sby][sbx] = 0;
    member[sby][sbx] = 0;
    recentx=bx;
    recenty=by;
}
//次に指す持ち駒の指定
function setfrom(sx,sy){
    var id,pawn,bx,by;
    if(turn==1){
        id = stand[0][stand_w*sy+sx];
    }else if(turn==-1){
        id = stand[1][stand_w*sy+sx];
    }
    if(id==0) return;
    status=2;
    draw_stand(sx,sy,id,turn,1);   //置く駒の色変更
    for(bx=0; bx<board_w; bx++){  //置ける場所探索
        if(id==9){        //歩の場合
            pawn = 0;
            for(by=0; by<board_h; by++){
                if(board[by][bx]==9 && member[by][bx]==turn){
                    pawn += 1;
                    break;
                }
            }
            if(pawn > 0) continue;    //二歩禁止
        }
        for(by=0; by<board_h; by++){
            if(turn==1){
                if(id==9 && by==0) continue;   //端に歩置けない
                if(id==8 && by<1) continue;    //端に香置けない
                if(id==7 && by<2) continue;    //端に桂置けない
            }else if(turn==-1){
                if(id==9 && by==board_h-1) continue;   //端に歩置けない
                if(id==8 && by==board_h-1) continue;   //端に歩置けない
                if(id==7 && board_h-3<by) continue;    //端に桂置けない
            }
            if(board[by][bx]==0){
                draw_board(bx,by,0,0,2);   //盤の色変更
                movable[by][bx] = 1;
            }
        }
    }
}
//駒を指す座標の指定
function setto(bx,by){
    var id;
    if(turn==1){
        id = stand[0][stand_w*ssy+ssx];
        numstand[0][id] -= 1;
    }else if(turn == -1){
        id = stand[1][stand_w*ssy+ssx];
        numstand[1][id] -= 1;
    }
    board[by][bx] = id;
    member[by][bx] = turn;
    recentx=bx;
    recenty=by;
}

////////////////////////////////////////////////////判定・調整処理/////////////////////////////////////////////
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
