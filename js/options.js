var data = {};
try {
    data = JSON.parse(localStorage.options);   
}catch(e){  
}

var defaults = chrome.extension.getBackgroundPage().defaults;
var options = $.extend({}, defaults, data);

console.log(options);

window.onload = function(){
   
    $('.lang').text(function(){
        //console.log($(this).attr('id') + ' => ' + chrome.i18n.getMessage($(this).attr('id')));
        return chrome.i18n.getMessage($(this).attr('id'));
    });

    $('#save').val(chrome.i18n.getMessage('save'));

    $('span.help').toggle(function(){
        $(this).next().show();
    }, function(){
        $(this).next().hide();
    });
    
    $('#restore_defaults').bind('click', function(){
        console.log(defaults);
        window.localStorage.options = JSON.stringify(defaults);
        location.reload();       
    });

    $('#convert, #convert_title, #convert_content').bind('change', function(){
        if($(this).is(':checked')){
            $('#' + $(this).attr('id') +'_box input').attr('disabled', false);
        }else{
            $('#' + $(this).attr('id') +'_box input').attr('disabled', true);
        }
    });         
    
     
    $('#convert_title').attr('checked', options.convert_title).change();
    $('#convert_content').attr('checked', options.convert_content).change();
    $('#convert').attr('checked', options.convert).change();
    
    $('input[name="convert_mode"]').val([options.convert_mode]);
    $('input[name="convert_title_mode"]').val([options.convert_title_mode]);
    $('input[name="convert_content_mode"]').val([options.convert_content_mode]);
    
    $('#convert_title_format').val(options.convert_title_format)
    $('#convert_content_format').val(options.convert_content_format)

    if(options.omnibox_lang){
        $('#omnibox_lang').val(options.omnibox_lang);
    }else {
        chrome.i18n.getAcceptLanguages(function(languages) {
            $('#omnibox_lang').val(languages[0].substr(0, 2));
        });
    }
    
    $('input[type="text"]').keyup(function(){
        $('#save').removeClass('saved').val(chrome.i18n.getMessage('save'));
    });

    $('form').submit(function(){
        var data = {
            omnibox_lang: $('#omnibox_lang').val(),
            convert: $('#convert').is(':checked'),
            convert_mode: $('input[name="convert_mode"]:checked').val(),
            convert_title: $('#convert_title').is(':checked'),
            convert_title_mode: $('input[name="convert_title_mode"]:checked').val(),
            convert_title_format: $('#convert_title_format').val(),
            convert_content: $('#convert_content').is(':checked'),
            convert_content_mode: $('input[name="convert_content_mode"]:checked').val(),
            convert_content_format: $('#convert_content_format').val()
        }
        console.log(data);
        window.localStorage.options = JSON.stringify(data);
        chrome.extension.getBackgroundPage().updateOptions();
        $('#save').addClass('saved').val(chrome.i18n.getMessage('saved'));
        return false;
    }).change(function(){
        $('#save').removeClass('saved').val(chrome.i18n.getMessage('save'));
    });
}

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-7218577-43']);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();