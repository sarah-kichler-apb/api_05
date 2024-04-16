function response(sts,msg,aftrows,data=null){
    return{
        status: sts,
        mensagem: msg,
        //quantas linhas foram afetadas
        affected_rows:aftrows,
        data: data,
        timestramp: new Date().getTime()
    }
}

module.exports = {
    response
}