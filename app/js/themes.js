'use strict';

//THEMES
function setTheme(i) {
    var x = '<link rel="stylesheet" type="text/css" href="css/' + i + '.css">';
    $('head').append(x);
}

function initThemes() {
    if (localStorage.theme == null) {
        localStorage.theme = 'blue_theme';
    }
    setTheme(localStorage.theme);
    $('.themes select').val(localStorage.theme);
}

function changeTheme() {
    var i = $('.themes select').val();
    setTheme(i);
    localStorage.theme = i;
}