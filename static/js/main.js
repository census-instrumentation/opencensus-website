"use strict";

//////////////////////////////////////////////////////  //
//    EVENTS ON DOCUMENT READY                          //
//////////////////////////////////////////////////////  //

$(document).ready(function () {

    //// PRELOADER TRIGGER
    $(window).on("load", function() {
        $(".loading").fadeOut(500);
    });

    //// SCROLL SPY TRIGGER
 	$('body').scrollspy({
            target: '.navbar-collapse',
            offset: 195
    });

    //// SMOTH SCROLL
    $.scrollIt({
        topOffset: 0
    });

	//// COLLAPSED MENU CLOSE ON CLICK
    $(document).on('click', '.navbar-collapse.in', function (e) {
        if ($(e.target).is('a')) {
            $(this).collapse('hide');
        }
    });

    //// FIXED NAVBAR
    $(window).scroll(function() {
        if ($(window).scrollTop() > 50) {
            $('.navbar').addClass('fixed');
        } else {
            $('.navbar').removeClass('fixed');
        }
    });

    //// ISOTOPE TRIGGER
    var $grid = $('.work-content').isotope({
      itemSelector: '.work-item',
      stagger: 30
    });
    $('.filter-work').on( 'click', '.button', function() {
      var filterValue = $(this).attr('data-filter');
      $grid.isotope({ filter: filterValue });
    });
    // change is-checked class on buttons
    $('.button-group').each( function( i, buttonGroup ) {
      var $buttonGroup = $( buttonGroup );
      $buttonGroup.on( 'click', 'a', function() {
        $buttonGroup.find('.is-checked').removeClass('is-checked');
        $( this ).addClass('is-checked');
      });
    });

    //// MASONRY
    $('.work-content').isotope({
      itemSelector: '.work-caption img',
      masonry: {
        columnWidth: 0
      }
    });

    //// MAGNIFIC POPUP TRIGGER
    $('.modal-image').magnificPopup({
      type:'inline',
      midClick: true
    });

    // OWL CAROUSEL TRIGGER
    $('.owl-carousel').owlCarousel({
        items: 1,
        margin: 0,
        dots: true
     });

    //// PARSLEY TRIGGER
    $('.cont-fo').parsley();

    var snippets = $('.snippets');
    for (var i=0; i<snippets.length; i++) {
        var s = $(snippets[i]);
       
        var tabs = '<div class="snippets-header">';
        var c = s.children('div');
        for (var j=0; j< c.length; j++) {
            var snippet = $(c[j]);
            if (j != 0) {
                // Hide everything other than the first snippet.
                snippet.hide();
            }
            tabs += '<a class="snippet-choose" data-language="' + snippet.attr('class') + '">' + snippet.data('languagename') + '</a> ';
        }
        tabs += '</div>';
        s.before(tabs);
    }

    $('.snippet-choose').click(function(e) {
        var langClass = $(this).data('language');
        $('.snippets div').hide();
        $('.snippets .'+langClass).show();
    });

});