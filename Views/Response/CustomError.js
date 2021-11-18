
module.exports =  function returnErrorJson(res,error,errorMessage,statusCode=400){
    
    res.status(statusCode).json({
        success:false,
        error: error,
        message: typeof(errorMessage)=="string"?errorMessage:errorMessage.stack
    })
    return;
}