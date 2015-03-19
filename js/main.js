$(document).ready(function(){

    // Initialize

    //startLoader();  // Initiates Preloader

    setHeight();  // Sets objects to window height
    colorSet();   // Sets theme color


    // Click functionality

    // $('.enter-site-button').click(enterSite);

    routerInit();

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

function routerInit() {

    var homeInit = function () { 
        $('body').removeClass('symantis righttoretire').addClass('home');
        // setTimeout(function(){
        //     $( '.global-wrapper' ).scrollTop( 300 );
        //     console.log('TOP');
        // }, 500);
    };
    var symantisInit = function () { 
        $('body').removeClass('home righttoretire').addClass('symantis');
        // setTimeout(function(){
        //     $( '.global-wrapper' ).scrollTop( 300 );
        //     console.log('TOP');
        // }, 500);
    };
    var righttoretireInit = function () { 
        $('body').removeClass('home symantis').addClass('righttoretire');
        // setTimeout(function(){
        //     $( '.global-wrapper' ).scrollTop( 300 );
        //     console.log('TOP');
        // }, 500);
    };

    // var scrollTop = function() {
    //     setTimeout(function(){
    //         $( '.global-wrapper' ).scrollTop( 300 );
    //         console.log('TOP');
    //     }, 1000);
        
    // };

    //
    // define the routing table.
    //
    var routes = {
    '/home': homeInit,
    '/symantis': symantisInit,
    '/righttoretire': righttoretireInit
    };

    //
    // instantiate the router.
    //
    var router = Router(routes);

    //
    // a global configuration setting.
    //
    // router.configure({
    //     //on: scrollTop
    //     //after: scrollTop
    // });

    router.init();

};


// $('.view').click(function(e){
//   page('/user/12')
//   e.preventDefault()
// })


// ----- Window Height Objects

function setHeight() {

    windowHeight = $(window).innerHeight();

    $('.full-height').css('height', windowHeight);
    $('.min-full-height').css('min-height', windowHeight);

};
  
$(window).resize(function() {
    setHeight();
    //heightBug();
});

// ----- Height bug being that the height of the global wrapper is set to window height and not the inner page height
// ----- this sets the height of global wrapper to be the same as the body when on home page

// heightBug();

// function heightBug() {

//     var body = $('body');
//     var homePageHeight = $('#home').height();
//     var siteWrap = $('.global-wrapper');

//     if ( body.hasClass('home') ) {
//         body.css( 'height', homePageHeight );
//         siteWrap.css('height', '100%');
//     } else {
//         body.css( 'height', 'auto' );
//         siteWrap.css('height', 'auto');
//     };

// };

// ---- Stops home page jumping to top but also breaks navigation

// $('.projects-container a').click(function(e) {
//     e.preventDefault();
//     // return false;
// });




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
