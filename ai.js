//CPU  手の選択
var cpu;     //CPUの考えた指し手
var legalMove;  //合法手
var getMove;  //駒取れる手

function CPUthink(callback){
    var cpu_id,id2,m2;
    var bx,by,tbx,tby;

    makeMoves();

    if(getMove.length>0){  //取れる駒は取る
        choice=Math.floor(Math.random() * getMove.length);
        if(cpu = getMove[choice]){
            callback();
        }
    }else{   //ランダムに移動
        var choice = Math.floor(Math.random() * legalMove.length);    //0～choice_num-1までのランダムな整数
        if(cpu = legalMove[choice]){
            callback();
        }
    }
}
//合法手を全て追加
function makeMoves() {
    legalMove = new Array();  //配列の初期化
    getMove = new Array();

    var bx,by,sx,sy,id;

    for(by=0; by<board_h; by++){
        for(bx=0; bx<board_w; bx++){
            if(member[by][bx]==turn){
                addMove1(bx,by);
            }
        }
    }
    for(sy=0; sy<stand_h; sy++){
        for(sx=0; sx<board_w; sx++){
            if(id=stand[1][stand_w*sy+sx]){
                addMove2(sx,sy,id);
            }
        }
    }
}
//盤上の駒の合法手追加
function addMove1(x,y){
    var id,i;
    var Move, GMove;
    id = board[y][x];
    for(i=0; i<10; i++){
        var tbx = x;
        var tby = y;
        while(movtbl[id][i] > 0){            //移動可能マスを描画
            tbx += dx[i];
            tby += dy[i]*turn*(-1);
            if(tbx<0 || board_w<=tbx || tby<0 || board_h<=tby) break;  //盤外
            id2 = board[tby][tbx];
            m2 = member[tby][tbx];
            if(m2 == turn){  //自駒にぶつかる
                break;
            }else if(m2 == turn*(-1)){  //敵駒にぶつかる
                GMove = [x,y,tbx,tby,0];
                getMove.push(GMove);    //getMove追加
            }
            Move = [x,y,tbx,tby,0];
            legalMove.push(Move);    //legalMove追加
            if(movtbl[id][i] == 1) break;  //一マスだけ進める場合
            if(m2 == turn*(-1)) break;  //相手駒にぶつかる
       }
    }
}
 //駒台の駒の合法手追加
function addMove2(x,y,id){
    var Move;
    var bx,by,pawn;
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
            if(id==9 && by==board_h-1) continue;   //端に歩置けない
            if(id==8 && by==board_h-1) continue;   //端に歩置けない
            if(id==7 && board_h-3<by) continue;    //端に桂置けない
            if(board[by][bx]==0){
                Move = [x,y,bx,by,1];
                legalMove.push(Move);    //legalMove追加

            }
        }
    }
}
