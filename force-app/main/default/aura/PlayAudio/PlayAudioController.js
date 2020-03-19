({
		getURLParameter : function(param) {
    var result=decodeURIComponent
        ((new RegExp('[?|&]' + param + '=' + '([^&;]+?)(&|#|;|$)').
            exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    console.log('Param ' + param + ' from URL = ' + result);
    return result;
    }
})