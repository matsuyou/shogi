//CPU  手の選択
var cpu;     //CPUの考えた指し手
var legalMove;  //合法手
var winMove;  //相手の王取れる手

//0:なし//1:王//2:玉//3:飛//4:角//5:金//6:銀//7:桂//8:香//9:歩//10:竜//11:馬//12:全//13:圭//14:杏//15:と
var komavalue = [0,200,200,20,18,12,10,8,6,2,24,20,10,10,10,8];  //各駒の評価

function CPUthink(callback){
    var id,id2,i,eval,max_eval,max_num;
    var bx,by,tbx,tby,x,y;
    var Board, Member;   //一時的な盤面情報
    //var eva = new Array();

    makeMoves();  //合法手生成

    i = legalMove.length-1;
    max_eval = 0;
    max_num = 0;
    while(1){   //合法手の中から評価値が最も高い手を選択
        Board = $.extend(true,[],board);    //配列のディープコピー(jquery)
        Member = $.extend(true,[],member);
        Numstand = $.extend(true,[],numstand[1]);
        cpu = legalMove[i];
        if(cpu[4]==0){
            id = Board[cpu[1]][cpu[0]];
            Board[cpu[1]][cpu[0]] = 0;
            Member[cpu[1]][cpu[0]] = 0;
            if(Board[cpu[3]][cpu[2]]>0){   //移動先に敵駒
                id2 = Board[cpu[3]][cpu[2]];
                if(change[id2]<0)  id2 = change[id2]*(-1);
                Numstand[id2] += 1;
            }
            Board[cpu[3]][cpu[2]] = id;
            Member[cpu[3]][cpu[2]] = turn;
        }else if(cpu[4]==1){
            id = stand[1][stand_w*cpu[1]+cpu[0]];
            Board[cpu[3]][cpu[2]] = id;
            Member[cpu[3]][cpu[2]] = turn;
            Numstand[id] -= 1;
        }
        eval = evaluation(Board,Member,Numstand,turn);
        //eva.push(eval);
        if(eval > max_eval){
            max_eval = eval;
            max_num = i;
        }
        if(i==0){
            //alert(eva);
            cpu = legalMove[max_num];
            callback();
            break;
        }
        i--;
    }
}

//合法手を全て追加
function makeMoves() {
    legalMove = new Array();  //配列の初期化
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
    var Move;
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
            if(m2 == turn) break;  //自駒にぶつかる;
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
//盤面の評価値計算
function evaluation(Board,Member,Numstand,m){
    var bx,by,id,i;
    var eval = 0;
    for(by=0; by<board_h; by++){
        for(bx=0; bx<board_w; bx++){
            if(Member[by][bx] == m){
                id = Board[by][bx];
                if(id == OU || id == GY || id == HI || id == KA || id == UM){
                    if(takencheck(bx,by,m,Board,Member))  eval -= komavalue[id]-1;    //大事な駒が取られそう
                }else{
                    if(takencheck(bx,by,m,Board,Member))  eval -= 1;    //駒が取られそう
                }
                eval += komavalue[id];
            }
        }
    }
    for(i=0;i<Numstand.length;i++){
        eval += komavalue[i] * Numstand[i];
    }
    return eval;
}

 //駒が相手に取られるかどうか
function takencheck(x,y,m,Board,Member){
    var i,count,id,m2,tbx,tby;
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
            id = Board[tby][tbx];
            if(id>0){    //敵駒にぶつかる
                if(movtbl[id][i]>count) flag = 1;
                break;
            }
            if(i==0||i==1) break;  //桂馬
            count = 1;
        }
    }
    if(flag==0) return(0);
    if(flag==1) return(1);
}
