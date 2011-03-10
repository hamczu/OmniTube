var options;
//var port = chrome.extension.connect();

chrome.extension.sendRequest({
    command: 'options'
}, function(response) {
    options = response;
    if(options.convert){
        init();
    }
});

//
//var conversion = false;
//var conversionRequest = false;
//
var regex = /http\:\/\/([a-z\-]+\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_\-]+)/i;
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
        chrome.extension.sendRequest({
            command: 'found'
        }, function(response) {

            });
    }
   
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {   
    switch (request.command) {
        case 'data':
            sendResponse(data);
            break;
        case 'convert':
            var element = document.getElementById(request.documentId);
           
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
            break;
    }
  
});

    //convert();
    /*
window.addEventListener('DOMSubtreeModified', function(e){
    console.log(conversion);
    if(!conversion && !conversionRequest){
        setTimeout(convert, 2000); // hack
        conversionRequest = true;
    }
})

     */





