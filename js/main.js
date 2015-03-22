$(document).ready(function(){

    // Initialize

    startLoader();  // Initiates Preloader
    setHeight();  // Sets objects to window height
    colorSet();   // Sets theme color
    routerInit(); // Initiate the router

    // Click functionality

    $('.enter-site-button').click(enterSite);

    // $('body').mousewheel(function() {
    //     homeSlides();
    // });
    // $('html').bind('mousewheel DOMMouseScroll', function (e) {
    //     var delta = (e.originalEvent.wheelDelta || -e.originalEvent.detail);

    //     if (delta < 0) {
    //         //console.log('You scrolled down');
    //     } else if (delta > 0) {
    //         //console.log('You scrolled up');
    //     }
    // });

});


// ----- Preloader

function startLoader() {

    // Images will not begin downloading until we tell the loader to start. 
    var loader = new PxLoader(), 
        backgroundImg = loader.addImage('img/jpg/assasin.jpg'), 
        backgroundImgTwo = loader.addImage('img/jpg/city.jpg');
     
    // callback that will be run once images are ready 
    loader.addCompletionListener(function() { 

        //setTimeout(function() {
            $('.global-wrapper.unloaded').removeClass('unloaded');
            $('.preloader').addClass('loaded');
            console.log("loaded");
        //}, 3000);
        
    });

    loader.start();

};


// ----- Entering Site

function enterSite() {
    $('.global-wrapper').addClass('active');
    $('.preloader').addClass('entered');
    $('.nav-wrap').addClass('entered');
    preloaderRemove();
};

function preloaderRemove() {
    setTimeout(function() {
        $('.preloader').remove();
    }, 1000);
};


// --- Home Scroll Effect

// $('body').mousewheel(function(event, delta) {

//         //if (elem.hasClass ('viewing')) {

//         var scrollingScreen = false;
//         var top = 0; // when not in an iframe, can be replaced by $("body").scrollTop()
//         if ( !scrollingScreen ) {
//             scrollingScreen = true; // Throttles the call
//             // Finds slide headers above/below the last scroll top
//             var candidates = $('.slide').filter(function() {
//                 if ( delta < 0 ) {
//                     return $(this).offset().top > top + 1;

//                 } else {
//                     return $(this).offset().top < top - 1;
//                 }
//             });
//             // If one of more are found, updates top
//             if ( candidates.length > 0 ) {
//                 if ( delta < 0 )
//                     top = candidates.first().offset().top;
//                 else if ( delta > 0 )
//                     top = candidates.last().offset().top;
//             }
//             // Performs an animated scroll to the right place
//             $('.global-wrapper').animate({ scrollTop:top }, 800, 'easeInOutQuint', function() {
//                 scrollingScreen = false; // Releases the throttle
//             });
//         }
//         return false; // Prevents default scrolling

//         //};
        
//     });


// ----- View Handling

var homeInit = function () { 
    $('body').removeClass('symantis righttoretire').addClass('home');

    setTimeout(function(){
        $('#home').addClass('viewing');
    }, 700);
};

var symantisInit = function () { 
    $('body').removeClass('home righttoretire').addClass('symantis');

    setTimeout(function(){
        $('#symantis').addClass('viewing');
    }, 700);
};

var righttoretireInit = function () { 
    $('body').removeClass('home symantis').addClass('righttoretire');

    setTimeout(function(){
        $('#righttoretire').addClass('viewing');
    }, 900);
};

function routerInit() {

    var wrapper = $('body,html');

    var scrollTop = function () {
        setTimeout(function(){
            //wrapper.animate( { scrollTop:0 }, 700, 'easeOutCubic');
            wrapper.animate( { scrollTop:0 }, 100);
        }, 700);
    };

    var notViewing = function () {
        $('section').removeClass('viewing');
    };

    var routes = {
        '/home': homeInit,
        '/symantis': symantisInit,
        '/righttoretire': righttoretireInit
    };

    var router = Router(routes);

    router.configure({
        on: scrollTop,
        after: notViewing
    });

    router.init();

};


// ----- Window Height Objects

function setHeight() {

    windowHeight = $(window).innerHeight();

    $('.full-height').css('height', windowHeight);
    $('.min-full-height').css('min-height', windowHeight);

};
  
$(window).resize(function() {
    setHeight();
});


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


// ---- Home slides 


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
