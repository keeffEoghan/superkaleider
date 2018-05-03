(function(module) {
    'use strict';

    // Detect.

    var AJAX,
        initArgs;

    if('XMLHttpRequest' in window) { // Mozilla, Safari, etc.
        AJAX = window.XMLHttpRequest;
    }
    else if('ActiveXObject' in window) { // IE
        var request;

        try {
            request = new ActiveXObject('Msxml2.XMLHTTP');
            initArgs = 'Msxml2.XMLHTTP';
        }
        catch (e) {
            request = new ActiveXObject('Microsoft.XMLHTTP');
            initArgs = 'Microsoft.XMLHTTP';
        }

        if(request) {
            AJAX = ActiveXObject;
        }
    }

    module.fetch = ((AJAX)?
            function(url) {
                return new Promise(function(resolve, reject) {
                        var request = new AJAX(initArgs);

                        request.onreadystatechange = function() {
                                if(request.readyState === 4) {
                                    if(request.status === 200) {
                                        resolve(request.responseText, url);
                                    }
                                    else {
                                        reject(request, url);
                                    }
                                }
                            };

                        request.open('GET', url, true);
                        request.send();
                    });
            }
        :   function(url) {
                return Promise.reject('Can\'t make AJAX requests', url);
            });
})(module);
