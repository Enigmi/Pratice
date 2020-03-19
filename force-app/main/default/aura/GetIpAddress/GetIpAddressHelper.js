({
    helperMethod : function(component, event) {
        var request = new XMLHttpRequest();
        request.open('GET', "https://api.ipify.org?format=jsonp=", true);
        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                let ipAddress = request.responseText;
                component.set("v.IP",ipAddress);
                console.log(ipAddress);
            } else {
                // We reached our target server, but it returned an error
                console.log(request.statusText);
            }
        }
        request.onerror = function () {
            // There was a connection error of some sort
            console.log(request.statusText);
        }
        request.send();

    }
})