//CPU  手の選択
function CPUthink(){
    var a;
    if(board[1][1]!=0){
        a = [1,1,3,1];
    }else if(board[2][1]!=0){
        a = [3,1,1,1];
    }
    return a;
}
