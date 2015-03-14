$(document).ready(function(){

    // Initialize

    //startLoader();  // Initiates Preloader

    setHeight();  // Sets objects to window height
    colorSet();   // Sets theme color


    // Click functionality

    $('.enter-site-button').click(enterSite);

});


// ----- Preloader

// function startLoader() {

//     // Images will not begin downloading until we tell the loader to start. 
//     var loader = new PxLoader(), 
//         backgroundImg = loader.addImage('img/jpg/assasin.jpg'), 
//         backgroundImgTwo = loader.addImage('img/jpg/city.jpg');
     
//     // callback that will be run once images are ready 
//     loader.addCompletionListener(function() { 

//         //setTimeout(function() {
//             $('.global-wrapper.unloaded').removeClass('unloaded');
//             $('.preloader').addClass('loaded');
//             console.log("loaded");
//         //}, 2000);
        
//     });

//     loader.start();

// };




// ----- View Handling

// -- home
app.page("home", function() 
{
    // initialize view variables
        
    // present the view - load data and show: 
    return function(params) {

    };
});
// -- project1
app.page("symantis", function() 
{
    // initialize view variables
        
    // present the view - load data and show: 
    return function(params) {

    };
});

// ----- Window Height Objects

function setHeight() {

    windowHeight = $(window).innerHeight();

    $('.full-height').css('height', windowHeight);
    $('.m-height').css('min-height', windowHeight);

};
  
$(window).resize(function() {
    setHeight();
});


// ----- Entering Site

function enterSite() {
    $('.global-wrapper').addClass('active');
    $('.preloader').addClass('entered');
    preloaderRemove();
};

function preloaderRemove() {
    setTimeout(function() {
        $('.preloader').remove();
    }, 1000);
};


// ------- Setting color theme

function colorSet(){

    var selector = Math.floor(Math.random() * (4 - 1 + 1)) + 1;
    console.log(selector);

    switch(selector) {
        case 1: // green

            $('.global-wrapper').addClass('orangeTheme');
            $('.preloader').addClass('orangeTheme');

            break;

        case 2: // red

            $('.global-wrapper').addClass('pinkTheme');
            $('.preloader').addClass('pinkTheme');

            break;

        case 3: // blue

            $('.global-wrapper').addClass('blueTheme');
            $('.preloader').addClass('blueTheme');

            break;

        case 4: // purple

            $('.global-wrapper').addClass('purpleTheme');
            $('.preloader').addClass('purpleTheme');
            
            break;

        default: // Default

            $('.global-wrapper').addClass('purpleTheme');
            $('.preloader').addClass('purpleTheme');

            break;
    };
};


// ---- Stop home menu going to top

// $('.projects-container a').click(function(e) {
//     e.preventDefault();
// });


// ---- Menu Button

// $(".toggle-menu").click(function() {
//     $(this).toggleClass("active");
//     $(".menu-wrap").toggleClass("open");
//     return false;
// });


// // ---- Vertical Navigation selection

// function vNavSelect(obj) {
//     $(".nav-inner li").children("a").removeClass("selected");
//     $(obj).addClass("selected");
//     $('.nav-inner a').css({'color': 'white' });
// };
// $(".nav-inner li").children("a").click(function() { vNavSelect(this) });
