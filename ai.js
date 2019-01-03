//CPU  手の選択
var cpu;     //CPUの考えた指し手
var legalMove;  //合法手
var getMove;  //駒取れる手
var winMove;  //相手の王取れる手

function CPUthink(callback){
    var id,i;
    var bx,by,tbx,tby,x,y;
    var Board, Member;   //一時的な盤面情報

    makeMoves();  //合法手生成

    if(winMove.length){
        cpu = winMove;
        callback();
    }else if(takenKing(turn,board,member)){         //王手された
        i=0;
        while(i<legalMove.length){     //王手を回避出来る手の中からランダムに選んで選択
            Board = $.extend(true,[],board);    //配列のディープコピー(jquery)
            Member = $.extend(true,[],member);
            cpu = legalMove[i];
            if(cpu[4]==0){
                id = Board[cpu[1]][cpu[0]];
                Board[cpu[1]][cpu[0]] = 0;
                Member[cpu[1]][cpu[0]] = 0;
                Board[cpu[3]][cpu[2]] = id;
                Member[cpu[3]][cpu[2]] = turn;
            }else if(cpu[4]==1){
                id = stand[1][stand_w*cpu[1]+cpu[0]];
                Board[cpu[3]][cpu[2]] = id;
                Member[cpu[3]][cpu[2]] = turn;
            }
            if(i==legalMove.length-1 || takenKing(turn,Board,Member)==0){  //回避手見つかったか最後まで見つからなかったとき
                callback();
                break;
            }
            i++;
        }
    }else if(getMove.length>0){  //取れる駒は取る
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
    winMove = new Array();
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
                if(id2 == OU || id2 == GY){  //相手の王取れる
                    winMove = GMove;
                    break;
                }
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

function takenKing(m,Board,Member){   //王手チェック
    var bx,by,id;
    for(by=0; by<board_h; by++){
        for(bx=0; bx<board_w; bx++){
            id = Board[by][bx];
            if((id==OU || id == GY) && Member[by][bx] == m){
                return takencheck(bx,by,id,m,Board,Member)
            }
        }
    }
}
function takencheck(x,y,id,m,Board,Member){   //駒が相手に取られるかどうか
    var i,count,id2,m2,tbx,tby;
    var flag = 0;
    for(i=0; i<10; i++){
        tbx = x;
        tby = y;
        count = 0;
        while(flag==0){
            tbx += dx[i];
            tby += dy[i]*turn*(-1);
            if(tbx<0 || board_w<=tbx || tby<0 || board_h<=tby) break;  //盤外
            m2 = Member[tby][tbx];
            if(m2 == m) break;  //自駒にぶつかる
            id2 = Board[tby][tbx];
            if(id2>0 && movtbl[id2][i]>count){
                flag = 1;
                break;
            }
            if(i==0||i==1) break;  //桂馬
            count = 1;
        }
    }
    if(flag==0) return(0);
    if(flag==1) return(1);
}
