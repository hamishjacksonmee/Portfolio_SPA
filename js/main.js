$(document).ready(function(){

    // Initialize

    // startLoader();  // Initiates Preloader
    setHeight();    // Sets objects to window height
    colorSet();     // Sets theme color
    routerInit();   // Initiate the router

    // Click functionality

    $('.enter-site-button').click(enterSite);
    $('.home-nav-down').click(homeScrollDown);
    $('.home-nav-up').click(homeScrollUp);

    // Prevent scroll on preloader

    $( '#preloader' ).bind( 'mousewheel DOMMouseScroll', function ( e ) {
        var e0 = e.originalEvent,
            delta = e0.wheelDelta || -e0.detail;
        e.preventDefault();
    });

    // Home nav buttons

    $('.slide-top').bind('inview', function(event, isInView) {
        var wrapper = $('.global-wrapper');
        if( wrapper.hasClass('active') ) {
            if (isInView) {
            // element is now visible in the viewport
                $('.home-nav-up').removeClass('active');
                setTimeout( function() {
                    $('.home-nav-up').addClass('hidden');
                }, 600);
            } else {
            // element has gone out of viewport
                $('.home-nav-up').removeClass('hidden');
                setTimeout( function() {
                    $('.home-nav-up').addClass('active');
                }, 600);
            }
        }
    });
    $('.slide-bottom').bind('inview', function(event, isInView) {
        var wrapper = $('.global-wrapper');
        if( wrapper.hasClass('active') ) {
            if (isInView) {
            // element is now visible in the viewport
                $('.home-nav-down').removeClass('active');
                setTimeout( function() {
                    $('.home-nav-down').addClass('hidden');
                }, 600);
            } else {
            // element has gone out of viewport
                $('.home-nav-down').removeClass('hidden');
                setTimeout( function() {
                    $('.home-nav-down').addClass('active');
                }, 600);
            }
        }
    });

    // Home Slides

    var scrollingScreen = false;
    $('#home, .nav-wrap').mousewheel(function(event, delta) {
        if ( !scrollingScreen ) {
            scrollingScreen = true; // Throttles the call
            var top = $('body').scrollTop() || // Chrome places overflow at body
                      $('html').scrollTop();   // Firefox places it at html
            // Finds slide headers above/below the current scroll top
            var candidates = $('.slide').filter(function() {
                if ( delta < 0 )
                    return $(this).offset().top > top + 1;
                else
                    return $(this).offset().top < top - 1;
            });
            // If one of more are found, updates top
            if ( candidates.length > 0 ) {
                if ( delta < 0 )
                    top = candidates.first().offset().top;
                else if ( delta > 0 )
                    top = candidates.last().offset().top;
            }
            // Performs an animated scroll to the right place
            $('html,body').animate({ scrollTop:top }, 800, 'easeInOutQuint', function() {
                scrollingScreen = false; // Releases the throttle
            });
        }
        return false; // Prevents default scrolling
    })

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
//         //}, 3000);
        
//     });

//     loader.start();

// };



// ----- Entering Site

function enterSite() {
    $('.global-wrapper').addClass('active');
    $('.preloader').addClass('entered');
    $('.nav-wrap').addClass('entered');
    //$('.home-nav-down').removeClass('hidden').addClass('active');
    if( $('body').hasClass('home') ) {
        $('.home-nav-down').removeClass('hidden');
        setTimeout( function() {
            $('.home-nav-down').addClass('active');
        }, 600);
    };
    
    preloaderRemove();
};

function preloaderRemove() {
    setTimeout(function() {
        $('.preloader').remove();
    }, 1000);
};

// function preloaderScroll() {
//     var elem = $('#preloader');
//     var initHeight = elem.height();
//     elem.css('height', initHeight * 1.1);
//     console.log('scroll caught');
// };



// ----- View Handling

var homeInit = function () { 
    $('body').removeClass('symantis right-to-retire the-vital-bowl portfolio-2014 jabber-app ch_ch-employment').addClass('home');
    setTimeout(function(){
        $('#home').addClass('viewing');
    }, 800);
};
var thevitalbowlInit = function () { 
    $('body').removeClass('home right-to-retire symantis portfolio-2014 jabber-app ch_ch-employment').addClass('the-vital-bowl');
    setTimeout(function(){
        $('#the-vital-bowl').addClass('viewing');
    }, 800);
};
var symantisInit = function () { 
    $('body').removeClass('home right-to-retire the-vital-bowl portfolio-2014 jabber-app ch_ch-employment').addClass('symantis');
    setTimeout(function(){
        $('#symantis').addClass('viewing');
    }, 800);
};
var righttoretireInit = function () { 
    $('body').removeClass('home symantis the-vital-bowl portfolio-2014 jabber-app ch_ch-employment').addClass('right-to-retire');
    setTimeout(function(){
        $('#right-to-retire').addClass('viewing');
    }, 800);
};
var portfolio2014Init = function () { 
    $('body').removeClass('home symantis the-vital-bowl right-to-retire jabber-app ch_ch-employment').addClass('portfolio-2014');
    setTimeout(function(){
        $('#portfolio-2014').addClass('viewing');
    }, 800);
};
var jabberappInit = function () { 
    $('body').removeClass('home symantis the-vital-bowl right-to-retire portfolio-2014 ch_ch-employment').addClass('jabber-app');
    setTimeout(function(){
        $('#jabber-app').addClass('viewing');
    }, 800);
};
var chchemploymentInit = function () { 
    $('body').removeClass('home symantis the-vital-bowl right-to-retire portfolio-2014 jabber-app').addClass('ch_ch-employment');
    setTimeout(function(){
        $('#ch_ch-employment').addClass('viewing');
    }, 800);
};

function routerInit() {

    var wrapper = $('html, body');

    var scrollTop = function () {
        setTimeout(function(){
            wrapper.animate( { scrollTop:0 }, 10);
        }, 700);
    };

    var notViewing = function () {
        $('section').removeClass('viewing');
    };

    var routes = {
        '/home': homeInit,
        '/the-vital-bowl': thevitalbowlInit,
        '/symantis': symantisInit,
        '/right-to-retire': righttoretireInit,
        '/portfolio-2014': portfolio2014Init,
        '/jabber-app': jabberappInit,
        '/ch_ch-employment': chchemploymentInit
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


// ---- Home Nav

function homeScrollDown() {

    var y = $(window).scrollTop();  //your current y position on the page
    windowHeight = $(window).innerHeight();

    $('html,body').animate({ scrollTop: y + windowHeight }, 800, 'easeInOutQuint' );

    // if( y < windowHeight) {
    //     $('.home-nav-up').addClass('hidden');
    // } else {
    //     $('.home-nav-up').removeClass('hidden');
    // };
};
function homeScrollUp() {

    var y = $(window).scrollTop();  //your current y position on the page
    windowHeight = $(window).innerHeight();

    $('html,body').animate({ scrollTop: y - windowHeight }, 800, 'easeInOutQuint' );

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
