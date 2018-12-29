//CPU  手の選択
var cpu = [0,0,0,0];     //CPUの考えた指し手

function CPUthink(callback){
    if(board[1][1] == 3){
        cpu = [1,1,3,1];
    }else if(board[1][3] == 3){
        cpu = [3,1,1,1];
    }
    callback();
}
