var options;
//var port = chrome.extension.connect();

chrome.runtime.sendMessage({
    command: 'options'
}, function(response) {
    options = response;
    if(options.convert){
        init();
    }
});

var regex = /https?\:\/\/([a-z\-]+\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_\-]+)/i;
var converted = false;
var data = [];
function init(){
    var links = document.getElementsByTagName('a');
    for(var i = 0; i < links.length; i++){
        if(links[i].className !== 'omnitube-disable'){
            var href = links[i].getAttribute('href');
            if(href){
                var match = href.match(regex)
                if(match && match.length > 2){
                    if(!links[i].id){
                        links[i].id = match[2] + '|' + Math.random(); // random in case 2 identical links
                    }
                    data.push({
                        id: match[2],
                        documentId: links[i].id
                    });
                }
            }
        }        
    }
    
    if(data.length){
        chrome.runtime.sendMessage({
            command: 'found'
        }, function(response) {

        });
    }   
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {   
    switch (request.command) {
        case 'convert':
            for(var i = 0; i < data.length; i++){
                var req = new XMLHttpRequest();
                req.open("GET", "http://gdata.youtube.com/feeds/api/videos/" + data[i].id + "?alt=jsonc&v=2", true);
                req.documentId = data[i].documentId;
                req.onload = function(){
                    var title = null;
                    var content = null;
                    if(this.status == 200){
                        try{
                            var data = JSON.parse(this.responseText).data;
                            data.time = secondsToTime(data.duration);                            
                        } catch(e){

                        }
                        if(options.convert_title){
                            title = tmpl(options.convert_title_format, data);
                        }
                        if(options.convert_content){
                            content = tmpl(options.convert_content_format, data);
                        }
                    } else if (this.status == 404){
                        title = chrome.i18n.getMessage('video_404');
                        content = chrome.i18n.getMessage('video_404');
                    }
                    
                    if(title !== null){
                        convert(document.getElementById(this.documentId), {
                            title: title,
                            content: content
                        });
                    }
                };
                req.onerror = function(){
                    console.log(this);
                };
                req.send();
            }
          
            break;        
    }  
});

function convert(element, request){
    if(options.convert_title){
        if(options.convert_title_mode == 'always'  || !element.getAttribute('title')){
            element.setAttribute('title', request.title);
        }
    }

    if(options.convert_content){
        var hasChildElements = false;
        if(options.convert_content_mode == 'text'){
            var child;
            hasChildElements = false;
            for (child = element.firstChild; child; child = child.nextSibling) {
                if (child.nodeType == 1) { // 1 == Element
                    hasChildElements = true;
                    break;
                }
            }                   
        }
        
        if(options.convert_content_mode == 'always' ||
            options.convert_content_mode == 'text' && !hasChildElements ||
            options.convert_content_mode == 'link' && element.textContent == element.getAttribute('href')){
            element.textContent = request.content;
        }
    }
}

function tmpl(tpl, data){
    for(var name in data){
        tpl = tpl.replace('$' + name, data[name]);
    }
    return tpl;
}

function secondsToTime(time){
    var minutes = Math.floor(time / 60);
    var seconds = time - minutes * 60;
    if(seconds < 10){
        seconds = '0' + seconds;
    }
    return minutes + ':' + seconds;
}

