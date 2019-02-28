//CPU  手の選択
var cpu;     //CPUの考えた指し手
var legalMove;  //合法手
var winMove;  //相手の王取れる手
var zyouseki_turn = 0;
var zyouseki_mode = 1;

//0:なし//1:王//2:玉//3:飛//4:角//5:金//6:銀//7:桂//8:香//9:歩//10:竜//11:馬//12:全//13:圭//14:杏//15:と
var komavalue = [0,200,200,40,38,20,20,12,12,4,48,40,20,18,18,16];  //各駒の評価

var zyouseki1 = [[6,2,6,3,0],
                 [5,2,5,3,0],
                 [7,1,6,2,0],
                 [1,1,5,1,0],
                 [4,0,3,1,0],
                 [5,0,4,1,0],
                 [3,1,2,1,0],
                 [2,1,1,1,0],
                 [6,0,6,1,0],
                 [2,0,2,1,0]];

var zyouseki2 = [[6,2,6,3,0],
                 [6,0,6,1,0],
                 [6,1,6,2,0],
                 [4,0,5,1,0],
                 [2,0,3,1,0],
                 [5,1,6,1,0],
                 [5,0,5,1,0],
                 [3,0,4,0,0],
                 [1,2,1,3,0],
                 [1,3,1,4,0]
                ];



function CPUthink(callback){
    var id,id2,i,eval,max_eval,max_num;
    var bx,by,tbx,tby,x,y;
    var Board, Member;   //一時的な盤面情報

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
        if(zyouseki_mode){
            eval = evaluation(Board,Member,Numstand,turn);
        }else{
            eval = evaluation(Board,Member,Numstand,turn) + Math.floor(Math.random ()*2)*2;
        }

        if(eval > max_eval){
            max_eval = eval;
            max_num = i;
        }
        if(i==0){
            if(max_eval <= 0){
                alert("負けました");
                winner=1
                setTimeout("draw_all()",200);
            }else{
                if(zyouseki_mode && zyouseki_turn<=9 && (max_eval == 442 || max_eval == 440)){
                    if(zyouseki_mode==1) cpu = zyouseki1[zyouseki_turn];   //CPU先手なら振り飛車
                    if(zyouseki_mode==3) cpu = zyouseki2[zyouseki_turn];   //cpu後手なら居飛車
                    zyouseki_turn += 1;
                    callback();
                }else{
                    zyouseki_mode = 0;
                    cpu = legalMove[max_num];
                    callback();
                }
                break;
            }
        }
        i--;
    }
    //alert(max_eval);
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
    var bx,by,id,i,id2;
    var eval = 0;
    for(i=0;i<Numstand.length;i++){        //駒台
        eval += (komavalue[i]-1) * Numstand[i];
    }
    for(by=0; by<board_h; by++){
        for(bx=0; bx<board_w; bx++){
            if(Member[by][bx] == m){   //自分の駒
                id = Board[by][bx];
                if(id == OU || id == GY){
                    if(takencheck(bx,by,m,Board,Member))  eval -= 1000;    //王が取られそう
                }else{
                    if(id2 = takencheck(bx,by,m,Board,Member)){                      //駒が取られそう
                        if(ukicheck(bx,by,m,Board,Member) == 0){       //浮いてる
                            eval -= komavalue[id]-1;
                        }else if(komavalue[id2] < komavalue[id]){                  //浮いてない、自分より弱い駒にとられそう
                            eval -= (komavalue[id] - komavalue[id2]);
                        }else {                                                    //浮いてない、自分より強い駒にとられそう
                            eval -= 2;
                        }
                    }
                }
                eval += komavalue[id];
            }else if(Member[by][bx] == m*(-1)){  //相手の駒
                id = Board[by][bx];
                if(id2 = takencheck(bx,by,m*(-1),Board,Member)){          //駒が取れそう
                    if(id == OU || id == GY)  eval += 3;
                    if(ukicheck(bx,by,m*(-1),Board,Member) == 0){      //浮いてる
                        eval += 2;
                        //TODO 自分浮いてるか
                    }else if(komavalue[id2] < komavalue[id]){            //浮いてない、自分より強い駒にとれそう
                        eval += 1;
                    }
                }
            }
        }
        if(by==board_h-1 && bx==board_w-1){
            return eval;
        }
    }
    return eval;
}

 //駒が相手に取られるかどうか
function takencheck(x,y,m,Board,Member){
    var i,count,id=0,m2,tbx,tby;
    var flag = 0;
    for(i=0; i<10; i++){
        tbx = x;
        tby = y;
        count = 0;
        while(flag==0){
            tbx += dx[i];
            tby += dy[i]*m*(-1);
            if(tbx<0 || board_w<=tbx || tby<0 || board_h<=tby) break;  //盤外
            m2 = Member[tby][tbx];
            if(m2 == m) break;  //自駒にぶつかる
            id = Board[tby][tbx];
            if(id>0){    //敵駒にぶつかる
                if(movtbl[id][i]>count) flag = id;
                break;
            }
            if(i==0||i==1) break;  //桂馬
            count = 1;
        }
    }
    return flag;
}

//駒が浮き駒かどうか
function ukicheck(x,y,m,Board,Member){
    var i,count,id,m2,tbx,tby;
    var flag = 0;
    for(i=0; i<10; i++){
        tbx = x;
        tby = y;
        count = 0;
        while(flag==0){
            tbx -= dx[i];
            tby -= dy[i]*m*(-1);
            if(tbx<0 || board_w<=tbx || tby<0 || board_h<=tby) break;  //盤外
            m2 = Member[tby][tbx];
            if(m2 == m*(-1)) break;  //相手駒にぶつかる
            id = Board[tby][tbx];
            if(id>0){    //自駒にぶつかる
                if(movtbl[id][i]>count) flag = id;
                break;
            }
            if(i==0||i==1) break;  //桂馬
            count = 1;
        }
    }
    return flag;
}
