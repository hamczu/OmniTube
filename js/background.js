var options = {};
var currentRequest = null;
var vid = 'id:';
var favorites = [];
var defaults = {};
var ports = {};

function updateOptions(lang){
    defaults = {
        omnibox_lang: lang,
        convert: true,
        convert_mode: 'auto',
        convert_title: true,
        convert_title_mode: 'always',
        convert_title_format: '$title ($time)',
        convert_content: true,
        convert_content_mode: 'link',
        convert_content_format: '$title ($time)'
    };

    try {
        options = JSON.parse(localStorage.options);
    } catch(e){
    }
    
    for(var key in defaults){
        if(options[key] == undefined){
            options[key] = defaults[key];
        }
    }
}

chrome.i18n.getAcceptLanguages(function(languages) {
    updateOptions(languages[0].substr(0, 2));
});

chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
    if (currentRequest != null) {
        currentRequest.onreadystatechange = null;
        currentRequest.abort();
        currentRequest = null;
    }        

    updateDefaultSuggestion(text);
    
    if(text.length > 0){
        currentRequest = suggests(text, function(data) {
            var results = [];
            for(var i = 0; i < data[1].length; i++){
                results.push({
                    content: data[1][i][0],
                    description: data[1][i][0]
                });
            }

            suggest(results);
        });
    } else {

    }
});

function resetDefaultSuggestion() {      
    chrome.omnibox.setDefaultSuggestion({
        description: ' '
    });
}

resetDefaultSuggestion();
var searchLabel = chrome.i18n.getMessage('search_label');
function updateDefaultSuggestion(text) {      
    chrome.omnibox.setDefaultSuggestion({
        description: searchLabel + ': %s'
    });
}

chrome.omnibox.onInputStarted.addListener(function() {
    updateDefaultSuggestion('');
});

chrome.omnibox.onInputCancelled.addListener(function() {
    resetDefaultSuggestion();
});

function suggests(query, callback) {
    var req = new XMLHttpRequest();
    // hjson=t - callback ?
    // hl - lang
    // cp - ?
    // http://suggestqueries.google.com/complete/search?hl=pl&ds=yt&client=youtube&hjson=t&jsonp=window.yt.www.suggest.handleResponse&q=szy&cp=3
    // hl:pl
    //ds:yt
    //client:youtube
    //hjson:t
    //jsonp:window.yt.www.suggest.handleResponse
    //q:szy
    //cp:3
    req.open("GET", "http://suggestqueries.google.com/complete/search?hl=" + options.omnibox_lang + "&ds=yt&client=youtube&hjson=t&q=" + query, true);
    req.onload = function(){
        if(this.status == 200){
            try{
                callback(JSON.parse(this.responseText));
            }catch(e){
                this.onerror();
            }
        } else {
            this.onerror();
        }
    };
    req.onerror = function(){

    };
    req.send();
}

chrome.omnibox.onInputEntered.addListener(function(text) {
    chrome.tabs.update(null, {url: "http://www.youtube.com/results?search_query=" + text});
});

function convert(tabId){
    chrome.tabs.sendMessage(tabId, {
        command: 'convert'
    }, function(data) {            
    });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {       
    switch(request.command){
        case 'options':
            sendResponse(options);
            break;
        case 'found':
            chrome.pageAction.show(sender.tab.id);
            sendResponse();
            if(options.convert_mode == 'auto'){
                convert(sender.tab.id);
            }
            break;
    }
});

chrome.pageAction.onClicked.addListener(function(tab) { 
    convert(tab.id);        
});

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-7218577-43']);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();