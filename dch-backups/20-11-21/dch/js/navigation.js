$(document).ready(begin());

function begin() {
    $(".section").hide();
}


function openSection(section) {
    $(".section").hide();
    var k = "#" + section+"-sec";
    $(k).slideDown(100);
    $('.section-selector .tab').removeClass('active-tab');
    $('#' + section + '-tab').addClass('active-tab');
}


////////////////////// vanila navigation

// document.querySelector('.menu-icon').addEventListener('click', () => {
//     document.querySelector('.small-menu').classList.toggle('hide');
// })






