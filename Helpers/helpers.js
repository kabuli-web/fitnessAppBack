
isBad = (item)=>{
    if( item===null || item===undefined || item==="" || item=== {}){
        return true
    }
    return false
}

module.exports = {
   isBad: isBad
};