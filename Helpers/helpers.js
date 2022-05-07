
isBad = (item,allChildren=false)=>{
    if( item===null || item===undefined || item==="" || item=== {}){
        return true
    }
    if(allChildren){
        for(const property in item){
            if( item[property]===null || item[property]===undefined || item[property]==="" || item[property]=== {}){
                return true
            }
        }
    }
    return false
}

module.exports = {
   isBad: isBad
};