({
    doInit : function(component, event, helper) {
        
        (function (global, factory) {
            if (typeof define === "function" && define.amd) {
                define([], factory);
            } else if (typeof exports !== "undefined") {
                factory();
            } else {
                var mod = {
                    exports: {}
                };
                factory();
                global.FileSaver = mod.exports;
            }
        })(this, function () {
            "use strict";
            
            /*
  * FileSaver.js
  * A saveAs() FileSaver implementation.
  *
  * By Eli Grey, http://eligrey.com
  *
  * License : https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md (MIT)
  * source  : http://purl.eligrey.com/github/FileSaver.js
  */
            // The one and only way of getting global scope in all environments
            // https://stackoverflow.com/q/3277182/1008999
            var _global = typeof window === 'object' && window.window === window ? window : typeof self === 'object' && self.self === self ? self : typeof global === 'object' && global.global === global ? global : void 0;
            
            function bom(blob, opts) {
                if (typeof opts === 'undefined') opts = {
                    autoBom: false
                };else if (typeof opts !== 'object') {
                    console.warn('Deprecated: Expected third argument to be a object');
                    opts = {
                        autoBom: !opts
                    };
                } // prepend BOM for UTF-8 XML and text/* types (including HTML)
                // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
                
                if (opts.autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
                    return new Blob([String.fromCharCode(0xFEFF), blob], {
                        type: blob.type
                    });
                }
                
                return blob;
            }
            
            function download(url, name, opts) {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.responseType = 'blob';
                
                xhr.onload = function () {
                    saveAs(xhr.response, name, opts);
                };
                
                xhr.onerror = function () {
                    console.error('could not download file');
                };
                
                xhr.send();
            }
            
            function corsEnabled(url) {
                var xhr = new XMLHttpRequest(); // use sync to avoid popup blocker
                
                xhr.open('HEAD', url, false);
                
                try {
                    xhr.send();
                } catch (e) {}
                
                return xhr.status >= 200 && xhr.status <= 299;
            } // `a.click()` doesn't work for all browsers (#465)
            
            
            function click(node) {
                try {
                    node.dispatchEvent(new MouseEvent('click'));
                } catch (e) {
                    var evt = document.createEvent('MouseEvents');
                    evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
                    node.dispatchEvent(evt);
                }
            }
            
            var saveAs = _global.saveAs || ( // probably in some web worker
                typeof window !== 'object' || window !== _global ? function saveAs() {}
                /* noop */
                // Use download attribute first if possible (#193 Lumia mobile)
                : 'download' in HTMLAnchorElement.prototype ? function saveAs(blob, name, opts) {
                    var URL = _global.URL || _global.webkitURL;
                    var a = document.createElement('a');
                    name = name || blob.name || 'download';
                    a.download = name;
                    a.rel = 'noopener'; // tabnabbing
                    // TODO: detect chrome extensions & packaged apps
                    // a.target = '_blank'
                    
                    if (typeof blob === 'string') {
                        // Support regular links
                        a.href = blob;
                        
                        if (a.origin !== location.origin) {
                            corsEnabled(a.href) ? download(blob, name, opts) : click(a, a.target = '_blank');
                        } else {
                            click(a);
                        }
                    } else {
                        // Support blobs
                        a.href = URL.createObjectURL(blob);
                        setTimeout(function () {
                            URL.revokeObjectURL(a.href);
                        }, 4E4); // 40s
                        
                        setTimeout(function () {
                            click(a);
                        }, 0);
                    }
                } // Use msSaveOrOpenBlob as a second approach
                : 'msSaveOrOpenBlob' in navigator ? function saveAs(blob, name, opts) {
                    name = name || blob.name || 'download';
                    
                    if (typeof blob === 'string') {
                        if (corsEnabled(blob)) {
                            download(blob, name, opts);
                        } else {
                            var a = document.createElement('a');
                            a.href = blob;
                            a.target = '_blank';
                            setTimeout(function () {
                                click(a);
                            });
                        }
                    } else {
                        navigator.msSaveOrOpenBlob(bom(blob, opts), name);
                    }
                } // Fallback to using FileReader and a popup
                : function saveAs(blob, name, opts, popup) {
                    // Open a popup immediately do go around popup blocker
                    // Mostly only available on user interaction and the fileReader is async so...
                    popup = popup || open('', '_blank');
                    
                    if (popup) {
                        popup.document.title = popup.document.body.innerText = 'downloading...';
                    }
                    
                    if (typeof blob === 'string') return download(blob, name, opts);
                    var force = blob.type === 'application/octet-stream';
                    
                    var isSafari = /constructor/i.test(_global.HTMLElement) || _global.safari;
                    
                    var isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent);
                    
                    if ((isChromeIOS || force && isSafari) && typeof FileReader !== 'undefined') {
                        // Safari doesn't allow downloading of blob URLs
                        var reader = new FileReader();
                        
                        reader.onloadend = function () {
                            var url = reader.result;
                            url = isChromeIOS ? url : url.replace(/^data:[^;]*;/, 'data:attachment/file;');
                            if (popup) popup.location.href = url;else location = url;
                            popup = null; // reverse-tabnabbing #460
                        };
                        
                        reader.readAsDataURL(blob);
                    } else {
                        var URL = _global.URL || _global.webkitURL;
                        var url = URL.createObjectURL(blob);
                        if (popup) popup.location = url;else location.href = url;
                        popup = null; // reverse-tabnabbing #460
                        
                        setTimeout(function () {
                            URL.revokeObjectURL(url);
                        }, 4E4); // 40s
                    }
                });
            _global.saveAs = saveAs.saveAs = saveAs;
            
            if (typeof module !== 'undefined') {
                module.exports = saveAs;
            }
        });
        
        var JSZipUtils = {};
        // just use the responseText with xhr1, response with xhr2.
        // The transformation doesn't throw away high-order byte (with responseText)
        // because JSZip handles that case. If not used with JSZip, you may need to
        // do it, see https://developer.mozilla.org/En/Using_XMLHttpRequest#Handling_binary_data
        JSZipUtils._getBinaryFromXHR = function(xhr) {
            // for xhr.responseText, the 0xFF mask is applied by JSZip
            return xhr.response || xhr.responseText;
        };
        
        // taken from jQuery
        function createStandardXHR() {
            try {
                return new window.XMLHttpRequest();
            }
            catch (e) {}
        }
        
        function createActiveXHR() {
            try {
                return new window.ActiveXObject("Microsoft.XMLHTTP");
            }
            catch (e) {}
        }
        
        // Create the request object
        var createXHR = window.ActiveXObject ?
            /* Microsoft failed to properly
     * implement the XMLHttpRequest in IE7 (can't request local files),
     * so we use the ActiveXObject when it is available
     * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
     * we need a fallback.
     */
            function() {
                return createStandardXHR() || createActiveXHR();
            } :
        // For all other browsers, use the standard XMLHttpRequest object
        createStandardXHR;
        
        
        
        JSZipUtils.getBinaryContent = function(path, callback, progress) {
            /*
     * Here is the tricky part : getting the data.
     * In firefox/chrome/opera/... setting the mimeType to 'text/plain; charset=x-user-defined'
     * is enough, the result is in the standard xhr.responseText.
     * cf https://developer.mozilla.org/En/XMLHttpRequest/Using_XMLHttpRequest#Receiving_binary_data_in_older_browsers
     * In IE <= 9, we must use (the IE only) attribute responseBody
     * (for binary data, its content is different from responseText).
     * In IE 10, the 'charset=x-user-defined' trick doesn't work, only the
     * responseType will work :
     * http://msdn.microsoft.com/en-us/library/ie/hh673569%28v=vs.85%29.aspx#Binary_Object_upload_and_download
     *
     * I'd like to use jQuery to avoid this XHR madness, but it doesn't support
     * the responseType attribute : http://bugs.jquery.com/ticket/11461
     */
            try {
                
                var xhr = createXHR();
                
                xhr.open('GET', path, true);
                
                // recent browsers
                if ("responseType" in xhr) {
                    xhr.responseType = "arraybuffer";
                }
                
                // older browser
                if (xhr.overrideMimeType) {
                    xhr.overrideMimeType("text/plain; charset=x-user-defined");
                }
                
                xhr.onreadystatechange = function(evt) {
                    var file, err;
                    // use `xhr` and not `this`... thanks IE
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200 || xhr.status === 0) {
                            file = null;
                            err = null;
                            try {
                                file = JSZipUtils._getBinaryFromXHR(xhr);
                            }
                            catch (e) {
                                err = new Error(e);
                            }
                            callback(err, file);
                        }
                        else {
                            callback(new Error("Ajax error for " + path + " : " + this.status + " " + this.statusText), null);
                        }
                    }
                };
                if (progress) xhr.onprogress = progress;
                xhr.send();
                
                
                return xhr;
                
            }
            catch (e) {
                callback(new Error(e), null);
            }
        };
        
        
        
        
        var urls = [
            "https://yashkumargupta-dev-ed.lightning.force.com/sfc/servlet.shepherd/document/download/0690o00000AIjNrAAL",
            "https://yashkumargupta-dev-ed.lightning.force.com/sfc/servlet.shepherd/document/download/0690o00000AIjNmAAL",
            
        ];
            var filename = "bundle";
            //The function is called
            compressed_img(urls, filename);
            
            function compressed_img(urls, filename) {
            var zip = new JSZip();
            var count = 0;
            var name = filename + ".zip";
            urls.forEach(function(url,i) {
            
            JSZipUtils.getBinaryContent(url, function(err, data) {
            if (err) {
            throw err;
            }
            var fname = "file_"+i+".jpg";
            
            zip.file(fname, data, {
            binary: true
            });
            count++;
            if (count == urls.length) {
            zip.generateAsync({
            type: 'blob'
            }).then(function(content) {
            saveAs(content, name);
            });
            }
            }, function(e) {
            p[e.target.responseURL] = e;
        var total = 0, prog = 0;
        for(prop in p){
            total+=p[prop].total;
            prog+=p[prop].loaded;
        }
        console.log(prog/total);
        p1.value = prog/total;
    });
});
}

var p={};
}
})