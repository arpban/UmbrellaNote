// FONTS 

function setFont(i){
    let x = '<link rel="stylesheet" type="text/css" href="css/'+ i +'.css">'
    $('head').append(x);
}

function initFonts(){
    if(localStorage.font == null){
        localStorage.font = 'times-new-roman'
    }
    setFont(localStorage.font)
    $('.fonts select').val(localStorage.font)
}

function changeFont(){
    var i = $('.fonts select').val()
    setFont(i)
    localStorage.font = i
}