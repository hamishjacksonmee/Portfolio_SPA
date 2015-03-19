// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());


/* ----------- PX Loader ------------ */

/*global define: true */ 

(function(global) {

    /*
     * PixelLab Resource Loader
     * Loads resources while providing progress updates.
     */
    function PxLoader(settings) {

        // merge settings with defaults
        settings = settings || {};
        this.settings = settings;

        // how frequently we poll resources for progress
        if (settings.statusInterval == null) {
            settings.statusInterval = 5000; // every 5 seconds by default
        }

        // delay before logging since last progress change
        if (settings.loggingDelay == null) {
            settings.loggingDelay = 20 * 1000; // log stragglers after 20 secs
        }

        // stop waiting if no progress has been made in the moving time window
        if (settings.noProgressTimeout == null) {
            settings.noProgressTimeout = Infinity; // do not stop waiting by default
        }

        var entries = [],
            // holds resources to be loaded with their status
            progressListeners = [],
            timeStarted, progressChanged = Date.now();

        /**
         * The status of a resource
         * @enum {number}
         */
        var ResourceState = {
            QUEUED: 0,
            WAITING: 1,
            LOADED: 2,
            ERROR: 3,
            TIMEOUT: 4
        };

        // places non-array values into an array.
        var ensureArray = function(val) {
            if (val == null) {
                return [];
            }

            if (Array.isArray(val)) {
                return val;
            }

            return [val];
        };

        // add an entry to the list of resources to be loaded
        this.add = function(resource) {

            // TODO: would be better to create a base class for all resources and
            // initialize the PxLoaderTags there rather than overwritting tags here
            resource.tags = new PxLoaderTags(resource.tags);

            // ensure priority is set
            if (resource.priority == null) {
                resource.priority = Infinity;
            }

            entries.push({
                resource: resource,
                status: ResourceState.QUEUED
            });
        };

        this.addProgressListener = function(callback, tags) {
            progressListeners.push({
                callback: callback,
                tags: new PxLoaderTags(tags)
            });
        };

        this.addCompletionListener = function(callback, tags) {
            progressListeners.push({
                tags: new PxLoaderTags(tags),
                callback: function(e) {
                    if (e.completedCount === e.totalCount) {
                        callback(e);
                    }
                }
            });
        };

        // creates a comparison function for resources
        var getResourceSort = function(orderedTags) {

            // helper to get the top tag's order for a resource
            orderedTags = ensureArray(orderedTags);
            var getTagOrder = function(entry) {
                var resource = entry.resource,
                    bestIndex = Infinity;
                for (var i = 0; i < resource.tags.length; i++) {
                    for (var j = 0; j < Math.min(orderedTags.length, bestIndex); j++) {
                        if (resource.tags.all[i] === orderedTags[j] && j < bestIndex) {
                            bestIndex = j;
                            if (bestIndex === 0) {
                                break;
                            }
                        }
                        if (bestIndex === 0) {
                            break;
                        }
                    }
                }
                return bestIndex;
            };
            return function(a, b) {
                // check tag order first
                var aOrder = getTagOrder(a),
                    bOrder = getTagOrder(b);
                if (aOrder < bOrder) { return -1; }
                if (aOrder > bOrder) { return 1; }

                // now check priority
                if (a.priority < b.priority) { return -1; }
                if (a.priority > b.priority) { return 1; }
                return 0;
            };
        };

        this.start = function(orderedTags) {
            timeStarted = Date.now();

            // first order the resources
            var compareResources = getResourceSort(orderedTags);
            entries.sort(compareResources);

            // trigger requests for each resource
            for (var i = 0, len = entries.length; i < len; i++) {
                var entry = entries[i];
                entry.status = ResourceState.WAITING;
                entry.resource.start(this);
            }

            // do an initial status check soon since items may be loaded from the cache
            setTimeout(statusCheck, 100);
        };

        var statusCheck = function() {
            var checkAgain = false,
                noProgressTime = Date.now() - progressChanged,
                timedOut = (noProgressTime >= settings.noProgressTimeout),
                shouldLog = (noProgressTime >= settings.loggingDelay);

            for (var i = 0, len = entries.length; i < len; i++) {
                var entry = entries[i];
                if (entry.status !== ResourceState.WAITING) {
                    continue;
                }

                // see if the resource has loaded
                if (entry.resource.checkStatus) {
                    entry.resource.checkStatus();
                }

                // if still waiting, mark as timed out or make sure we check again
                if (entry.status === ResourceState.WAITING) {
                    if (timedOut) {
                        entry.resource.onTimeout();
                    } else {
                        checkAgain = true;
                    }
                }
            }

            // log any resources that are still pending
            if (shouldLog && checkAgain) {
                log();
            }

            if (checkAgain) {
                setTimeout(statusCheck, settings.statusInterval);
            }
        };

        this.isBusy = function() {
            for (var i = 0, len = entries.length; i < len; i++) {
                if (entries[i].status === ResourceState.QUEUED || entries[i].status === ResourceState.WAITING) {
                    return true;
                }
            }
            return false;
        };

        var onProgress = function(resource, statusType) {
            
            var entry = null,
                i, len, numResourceTags, listener, shouldCall;

            // find the entry for the resource    
            for (i = 0, len = entries.length; i < len; i++) {
                if (entries[i].resource === resource) {
                    entry = entries[i];
                    break;
                }
            }

            // we have already updated the status of the resource
            if (entry == null || entry.status !== ResourceState.WAITING) {
                return;
            }
            entry.status = statusType;
            progressChanged = Date.now();

            numResourceTags = resource.tags.length;

            // fire callbacks for interested listeners
            for (i = 0, len = progressListeners.length; i < len; i++) {
                
                listener = progressListeners[i];
                if (listener.tags.length === 0) {
                    // no tags specified so always tell the listener
                    shouldCall = true;
                } else {
                    // listener only wants to hear about certain tags
                    shouldCall = resource.tags.intersects(listener.tags);
                }

                if (shouldCall) {
                    sendProgress(entry, listener);
                }
            }
        };

        this.onLoad = function(resource) {
            onProgress(resource, ResourceState.LOADED);
        };
        this.onError = function(resource) {
            onProgress(resource, ResourceState.ERROR);
        };
        this.onTimeout = function(resource) {
            onProgress(resource, ResourceState.TIMEOUT);
        };

        // sends a progress report to a listener
        var sendProgress = function(updatedEntry, listener) {
            // find stats for all the resources the caller is interested in
            var completed = 0,
                total = 0,
                i, len, entry, includeResource;
            for (i = 0, len = entries.length; i < len; i++) {
                
                entry = entries[i];
                includeResource = false;

                if (listener.tags.length === 0) {
                    // no tags specified so always tell the listener
                    includeResource = true;
                } else {
                    includeResource = entry.resource.tags.intersects(listener.tags);
                }

                if (includeResource) {
                    total++;
                    if (entry.status === ResourceState.LOADED ||
                        entry.status === ResourceState.ERROR ||
                        entry.status === ResourceState.TIMEOUT) {

                        completed++;
                    }
                }
            }

            listener.callback({
                // info about the resource that changed
                resource: updatedEntry.resource,

                // should we expose StatusType instead?
                loaded: (updatedEntry.status === ResourceState.LOADED),
                error: (updatedEntry.status === ResourceState.ERROR),
                timeout: (updatedEntry.status === ResourceState.TIMEOUT),

                // updated stats for all resources
                completedCount: completed,
                totalCount: total
            });
        };

        // prints the status of each resource to the console
        var log = this.log = function(showAll) {
            if (!window.console) {
                return;
            }

            var elapsedSeconds = Math.round((Date.now() - timeStarted) / 1000);
            window.console.log('PxLoader elapsed: ' + elapsedSeconds + ' sec');

            for (var i = 0, len = entries.length; i < len; i++) {
                var entry = entries[i];
                if (!showAll && entry.status !== ResourceState.WAITING) {
                    continue;
                }

                var message = 'PxLoader: #' + i + ' ' + entry.resource.getName();
                switch(entry.status) {
                    case ResourceState.QUEUED:
                        message += ' (Not Started)';
                        break;
                    case ResourceState.WAITING:
                        message += ' (Waiting)';
                        break;
                    case ResourceState.LOADED:
                        message += ' (Loaded)';
                        break;
                    case ResourceState.ERROR:
                        message += ' (Error)';
                        break;
                    case ResourceState.TIMEOUT:
                        message += ' (Timeout)';
                        break;
                }

                if (entry.resource.tags.length > 0) {
                    message += ' Tags: [' + entry.resource.tags.all.join(',') + ']';
                }

                window.console.log(message);
            }
        };
    }


    // Tag object to handle tag intersection; once created not meant to be changed
    // Performance rationale: http://jsperf.com/lists-indexof-vs-in-operator/3
     
    function PxLoaderTags(values) {
     
        this.all = [];
        this.first = null; // cache the first value
        this.length = 0;

        // holds values as keys for quick lookup
        this.lookup = {};
     
        if (values) {

            // first fill the array of all values
            if (Array.isArray(values)) {
                // copy the array of values, just to be safe                
                this.all = values.slice(0);
            } else if (typeof values === 'object') {
                for (var key in values) {
                    if(values.hasOwnProperty(key)) {
                        this.all.push(key);
                    }
                }
            } else {
                this.all.push(values);
            }

            // cache the length and the first value
            this.length = this.all.length;
            if (this.length > 0) {
                this.first = this.all[0];
            }
     
            // set values as object keys for quick lookup during intersection test
            for (var i = 0; i < this.length; i++) {
                this.lookup[this.all[i]] = true;
            }
        }
    }

    // compare this object with another; return true if they share at least one value
    PxLoaderTags.prototype.intersects = function(other) {

        // handle empty values case
        if (this.length === 0 || other.length === 0) {
            return false;
        } 

        // only a single value to compare?
        if (this.length === 1 && other.length === 1) {
            return this.first === other.first;
        }

        // better to loop through the smaller object
        if (other.length < this.length) {
            return other.intersects(this); 
        }
         
        // loop through every key to see if there are any matches
        for (var key in this.lookup) {
            if (other.lookup[key]) {
                return true;
            }
        }

        return false;
    };

    // AMD module support
    if (typeof define === 'function' && define.amd) {
        define('PxLoader', [], function() {
            return PxLoader;
        });
    }

    // exports
    global.PxLoader = PxLoader;

}(this));

// Date.now() shim for older browsers
if (!Date.now) {
    Date.now = function now() {
        return new Date().getTime();
    };
}

// shims to ensure we have newer Array utility methods
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
if (!Array.isArray) {
    Array.isArray = function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };
}



/*global PxLoader: true, define: true */ 

// PxLoader plugin to load images
function PxLoaderImage(url, tags, priority) {
    var self = this,
        loader = null;

    this.img = new Image();
    this.tags = tags;
    this.priority = priority;

    var onReadyStateChange = function() {
        if (self.img.readyState === 'complete') {
            removeEventHandlers();
            loader.onLoad(self);
        }
    };

    var onLoad = function() {
        removeEventHandlers();
        loader.onLoad(self);
    };

    var onError = function() {
        removeEventHandlers();
        loader.onError(self);
    };

    var removeEventHandlers = function() {
        self.unbind('load', onLoad);
        self.unbind('readystatechange', onReadyStateChange);
        self.unbind('error', onError);
    };

    this.start = function(pxLoader) {
        // we need the loader ref so we can notify upon completion
        loader = pxLoader;

        // NOTE: Must add event listeners before the src is set. We
        // also need to use the readystatechange because sometimes
        // load doesn't fire when an image is in the cache.
        self.bind('load', onLoad);
        self.bind('readystatechange', onReadyStateChange);
        self.bind('error', onError);

        self.img.src = url;
    };

    // called by PxLoader to check status of image (fallback in case
    // the event listeners are not triggered).
    this.checkStatus = function() {
        if (self.img.complete) {
            removeEventHandlers();
            loader.onLoad(self);
        }
    };

    // called by PxLoader when it is no longer waiting
    this.onTimeout = function() {
        removeEventHandlers();
        if (self.img.complete) {
            loader.onLoad(self);
        } else {
            loader.onTimeout(self);
        }
    };

    // returns a name for the resource that can be used in logging
    this.getName = function() {
        return url;
    };

    // cross-browser event binding
    this.bind = function(eventName, eventHandler) {
        if (self.img.addEventListener) {
            self.img.addEventListener(eventName, eventHandler, false);
        } else if (self.img.attachEvent) {
            self.img.attachEvent('on' + eventName, eventHandler);
        }
    };

    // cross-browser event un-binding
    this.unbind = function(eventName, eventHandler) {
        if (self.img.removeEventListener) {
            self.img.removeEventListener(eventName, eventHandler, false);
        } else if (self.img.detachEvent) {
            self.img.detachEvent('on' + eventName, eventHandler);
        }
    };

}

// add a convenience method to PxLoader for adding an image
PxLoader.prototype.addImage = function(url, tags, priority) {
    var imageLoader = new PxLoaderImage(url, tags, priority);
    this.add(imageLoader);

    // return the img element to the caller
    return imageLoader.img;
};

// AMD module support
if (typeof define === 'function' && define.amd) {
    define('PxLoaderImage', [], function() {
        return PxLoaderImage;
    });
}


//
// Generated on Tue Dec 16 2014 12:13:47 GMT+0100 (CET) by Charlie Robbins, Paolo Fragomeni & the Contributors (Using Codesurgeon).
// Version 1.2.6
//
(function(a){function k(a,b,c,d){var e=0,f=0,g=0,c=(c||"(").toString(),d=(d||")").toString(),h;for(h=0;h<a.length;h++){var i=a[h];if(i.indexOf(c,e)>i.indexOf(d,e)||~i.indexOf(c,e)&&!~i.indexOf(d,e)||!~i.indexOf(c,e)&&~i.indexOf(d,e)){f=i.indexOf(c,e),g=i.indexOf(d,e);if(~f&&!~g||!~f&&~g){var j=a.slice(0,(h||1)+1).join(b);a=[j].concat(a.slice((h||1)+1))}e=(g>f?g:f)+1,h=0}else e=0}return a}function j(a,b){var c,d=0,e="";while(c=a.substr(d).match(/[^\w\d\- %@&]*\*[^\w\d\- %@&]*/))d=c.index+c[0].length,c[0]=c[0].replace(/^\*/,"([_.()!\\ %@&a-zA-Z0-9-]+)"),e+=a.substr(0,c.index)+c[0];a=e+=a.substr(d);var f=a.match(/:([^\/]+)/ig),g,h;if(f){h=f.length;for(var j=0;j<h;j++)g=f[j],g.slice(0,2)==="::"?a=g.slice(1):a=a.replace(g,i(g,b))}return a}function i(a,b,c){c=a;for(var d in b)if(b.hasOwnProperty(d)){c=b[d](a);if(c!==a)break}return c===a?"([._a-zA-Z0-9-%()]+)":c}function h(a,b,c){if(!a.length)return c();var d=0;(function e(){b(a[d],function(b){b||b===!1?(c(b),c=function(){}):(d+=1,d===a.length?c():e())})})()}function g(a){var b=[];for(var c=0,d=a.length;c<d;c++)b=b.concat(a[c]);return b}function f(a,b){for(var c=0;c<a.length;c+=1)if(b(a[c],c,a)===!1)return}function c(){return b.hash===""||b.hash==="#"}var b=document.location,d={mode:"modern",hash:b.hash,history:!1,check:function(){var a=b.hash;a!=this.hash&&(this.hash=a,this.onHashChanged())},fire:function(){this.mode==="modern"?this.history===!0?window.onpopstate():window.onhashchange():this.onHashChanged()},init:function(a,b){function d(a){for(var b=0,c=e.listeners.length;b<c;b++)e.listeners[b](a)}var c=this;this.history=b,e.listeners||(e.listeners=[]);if("onhashchange"in window&&(document.documentMode===undefined||document.documentMode>7))this.history===!0?setTimeout(function(){window.onpopstate=d},500):window.onhashchange=d,this.mode="modern";else{var f=document.createElement("iframe");f.id="state-frame",f.style.display="none",document.body.appendChild(f),this.writeFrame(""),"onpropertychange"in document&&"attachEvent"in document&&document.attachEvent("onpropertychange",function(){event.propertyName==="location"&&c.check()}),window.setInterval(function(){c.check()},50),this.onHashChanged=d,this.mode="legacy"}e.listeners.push(a);return this.mode},destroy:function(a){if(!!e&&!!e.listeners){var b=e.listeners;for(var c=b.length-1;c>=0;c--)b[c]===a&&b.splice(c,1)}},setHash:function(a){this.mode==="legacy"&&this.writeFrame(a),this.history===!0?(window.history.pushState({},document.title,a),this.fire()):b.hash=a[0]==="/"?a:"/"+a;return this},writeFrame:function(a){var b=document.getElementById("state-frame"),c=b.contentDocument||b.contentWindow.document;c.open(),c.write("<script>_hash = '"+a+"'; onload = parent.listener.syncHash;<script>"),c.close()},syncHash:function(){var a=this._hash;a!=b.hash&&(b.hash=a);return this},onHashChanged:function(){}},e=a.Router=function(a){if(this instanceof e)this.params={},this.routes={},this.methods=["on","once","after","before"],this.scope=[],this._methods={},this._insert=this.insert,this.insert=this.insertEx,this.historySupport=(window.history!=null?window.history.pushState:null)!=null,this.configure(),this.mount(a||{});else return new e(a)};e.prototype.init=function(a){var e=this,f;this.handler=function(a){var b=a&&a.newURL||window.location.hash,c=e.history===!0?e.getPath():b.replace(/.*#/,"");e.dispatch("on",c.charAt(0)==="/"?c:"/"+c)},d.init(this.handler,this.history),this.history===!1?c()&&a?b.hash=a:c()||e.dispatch("on","/"+b.hash.replace(/^(#\/|#|\/)/,"")):(this.convert_hash_in_init?(f=c()&&a?a:c()?null:b.hash.replace(/^#/,""),f&&window.history.replaceState({},document.title,f)):f=this.getPath(),(f||this.run_in_init===!0)&&this.handler());return this},e.prototype.explode=function(){var a=this.history===!0?this.getPath():b.hash;a.charAt(1)==="/"&&(a=a.slice(1));return a.slice(1,a.length).split("/")},e.prototype.setRoute=function(a,b,c){var e=this.explode();typeof a=="number"&&typeof b=="string"?e[a]=b:typeof c=="string"?e.splice(a,b,s):e=[a],d.setHash(e.join("/"));return e},e.prototype.insertEx=function(a,b,c,d){a==="once"&&(a="on",c=function(a){var b=!1;return function(){if(!b){b=!0;return a.apply(this,arguments)}}}(c));return this._insert(a,b,c,d)},e.prototype.getRoute=function(a){var b=a;if(typeof a=="number")b=this.explode()[a];else if(typeof a=="string"){var c=this.explode();b=c.indexOf(a)}else b=this.explode();return b},e.prototype.destroy=function(){d.destroy(this.handler);return this},e.prototype.getPath=function(){var a=window.location.pathname;a.substr(0,1)!=="/"&&(a="/"+a);return a};var l=/\?.*/;e.prototype.configure=function(a){a=a||{};for(var b=0;b<this.methods.length;b++)this._methods[this.methods[b]]=!0;this.recurse=a.recurse||this.recurse||!1,this.async=a.async||!1,this.delimiter=a.delimiter||"/",this.strict=typeof a.strict=="undefined"?!0:a.strict,this.notfound=a.notfound,this.resource=a.resource,this.history=a.html5history&&this.historySupport||!1,this.run_in_init=this.history===!0&&a.run_handler_in_init!==!1,this.convert_hash_in_init=this.history===!0&&a.convert_hash_in_init!==!1,this.every={after:a.after||null,before:a.before||null,on:a.on||null};return this},e.prototype.param=function(a,b){a[0]!==":"&&(a=":"+a);var c=new RegExp(a,"g");this.params[a]=function(a){return a.replace(c,b.source||b)};return this},e.prototype.on=e.prototype.route=function(a,b,c){var d=this;!c&&typeof b=="function"&&(c=b,b=a,a="on");if(Array.isArray(b))return b.forEach(function(b){d.on(a,b,c)});b.source&&(b=b.source.replace(/\\\//ig,"/"));if(Array.isArray(a))return a.forEach(function(a){d.on(a.toLowerCase(),b,c)});b=b.split(new RegExp(this.delimiter)),b=k(b,this.delimiter),this.insert(a,this.scope.concat(b),c)},e.prototype.path=function(a,b){var c=this,d=this.scope.length;a.source&&(a=a.source.replace(/\\\//ig,"/")),a=a.split(new RegExp(this.delimiter)),a=k(a,this.delimiter),this.scope=this.scope.concat(a),b.call(this,this),this.scope.splice(d,a.length)},e.prototype.dispatch=function(a,b,c){function h(){d.last=e.after,d.invoke(d.runlist(e),d,c)}var d=this,e=this.traverse(a,b.replace(l,""),this.routes,""),f=this._invoked,g;this._invoked=!0;if(!e||e.length===0){this.last=[],typeof this.notfound=="function"&&this.invoke([this.notfound],{method:a,path:b},c);return!1}this.recurse==="forward"&&(e=e.reverse()),g=this.every&&this.every.after?[this.every.after].concat(this.last):[this.last];if(g&&g.length>0&&f){this.async?this.invoke(g,this,h):(this.invoke(g,this),h());return!0}h();return!0},e.prototype.invoke=function(a,b,c){var d=this,e;this.async?(e=function(c,d){if(Array.isArray(c))return h(c,e,d);typeof c=="function"&&c.apply(b,(a.captures||[]).concat(d))},h(a,e,function(){c&&c.apply(b,arguments)})):(e=function(c){if(Array.isArray(c))return f(c,e);if(typeof c=="function")return c.apply(b,a.captures||[]);typeof c=="string"&&d.resource&&d.resource[c].apply(b,a.captures||[])},f(a,e))},e.prototype.traverse=function(a,b,c,d,e){function l(a){function c(a){for(var b=a.length-1;b>=0;b--)Array.isArray(a[b])?(c(a[b]),a[b].length===0&&a.splice(b,1)):e(a[b])||a.splice(b,1)}function b(a){var c=[];for(var d=0;d<a.length;d++)c[d]=Array.isArray(a[d])?b(a[d]):a[d];return c}if(!e)return a;var d=b(a);d.matched=a.matched,d.captures=a.captures,d.after=a.after.filter(e),c(d);return d}var f=[],g,h,i,j,k;if(b===this.delimiter&&c[a]){j=[[c.before,c[a]].filter(Boolean)],j.after=[c.after].filter(Boolean),j.matched=!0,j.captures=[];return l(j)}for(var m in c)if(c.hasOwnProperty(m)&&(!this._methods[m]||this._methods[m]&&typeof c[m]=="object"&&!Array.isArray(c[m]))){g=h=d+this.delimiter+m,this.strict||(h+="["+this.delimiter+"]?"),i=b.match(new RegExp("^"+h));if(!i)continue;if(i[0]&&i[0]==b&&c[m][a]){j=[[c[m].before,c[m][a]].filter(Boolean)],j.after=[c[m].after].filter(Boolean),j.matched=!0,j.captures=i.slice(1),this.recurse&&c===this.routes&&(j.push([c.before,c.on].filter(Boolean)),j.after=j.after.concat([c.after].filter(Boolean)));return l(j)}j=this.traverse(a,b,c[m],g);if(j.matched){j.length>0&&(f=f.concat(j)),this.recurse&&(f.push([c[m].before,c[m].on].filter(Boolean)),j.after=j.after.concat([c[m].after].filter(Boolean)),c===this.routes&&(f.push([c.before,c.on].filter(Boolean)),j.after=j.after.concat([c.after].filter(Boolean)))),f.matched=!0,f.captures=j.captures,f.after=j.after;return l(f)}}return!1},e.prototype.insert=function(a,b,c,d){var e,f,g,h,i;b=b.filter(function(a){return a&&a.length>0}),d=d||this.routes,i=b.shift(),/\:|\*/.test(i)&&!/\\d|\\w/.test(i)&&(i=j(i,this.params));if(b.length>0){d[i]=d[i]||{};return this.insert(a,b,c,d[i])}{if(!!i||!!b.length||d!==this.routes){f=typeof d[i],g=Array.isArray(d[i]);if(d[i]&&!g&&f=="object"){e=typeof d[i][a];switch(e){case"function":d[i][a]=[d[i][a],c];return;case"object":d[i][a].push(c);return;case"undefined":d[i][a]=c;return}}else if(f=="undefined"){h={},h[a]=c,d[i]=h;return}throw new Error("Invalid route context: "+f)}e=typeof d[a];switch(e){case"function":d[a]=[d[a],c];return;case"object":d[a].push(c);return;case"undefined":d[a]=c;return}}},e.prototype.extend=function(a){function e(a){b._methods[a]=!0,b[a]=function(){var c=arguments.length===1?[a,""]:[a];b.on.apply(b,c.concat(Array.prototype.slice.call(arguments)))}}var b=this,c=a.length,d;for(d=0;d<c;d++)e(a[d])},e.prototype.runlist=function(a){var b=this.every&&this.every.before?[this.every.before].concat(g(a)):g(a);this.every&&this.every.on&&b.push(this.every.on),b.captures=a.captures,b.source=a.source;return b},e.prototype.mount=function(a,b){function d(b,d){var e=b,f=b.split(c.delimiter),g=typeof a[b],h=f[0]===""||!c._methods[f[0]],i=h?"on":e;h&&(e=e.slice((e.match(new RegExp("^"+c.delimiter))||[""])[0].length),f.shift());h&&g==="object"&&!Array.isArray(a[b])?(d=d.concat(f),c.mount(a[b],d)):(h&&(d=d.concat(e.split(c.delimiter)),d=k(d,c.delimiter)),c.insert(i,d,a[b]))}if(!!a&&typeof a=="object"&&!Array.isArray(a)){var c=this;b=b||[],Array.isArray(b)||(b=b.split(c.delimiter));for(var e in a)a.hasOwnProperty(e)&&d(e,b.slice(0))}}})(typeof exports=="object"?exports:window)



