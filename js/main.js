/* global alert */

/*
Tweet Builder by Josh Can Help
http://www.joshcanhelp.com
 */

if (typeof String.prototype.trim === 'undefined') {

    String.prototype.trim = function () {
        'use strict';

        return this.replace(/^\s+|\s+$/g, '');
    };

}

jQuery(document).ready( function ($) {
    'use strict';

    // UTM variables added to the URL automatically
    var utmSource = 'social';
    var utmMedium = 'twitter';
    var utmCampaign = 'twitter-tweets';

    // How many chars are added by default?
    var charsUrl = 22;
    var charsVia = 6;
    var charsHash = 2;

    // Global character count
    var theButton = $('#btn_generate');

    // Global character count
    var theCount = $('#char_count');

    // Field objects
    var objTweet = $('#tweet');
    var objUrl = $('#url');
    var objVia = $('#via');
    var objHash = $('#hashtag');

    objTweet.keyup(function () {
        recalcCount();
    });

    objUrl.keyup( function() {
        recalcCount();
    });

    objVia.keyup(event, function () {
        recalcCount();
    });

    objHash.keyup(event, function () {
        recalcCount();
    });

    // Grab forum submission to build the tweet
    $('#tweet_builder').submit(function (event) {
        event.preventDefault();

        // Don't want the form submitted multiple times
        if (theButton.hasClass('btn-inactive')) {
            return false;
        }

        buttonState(false);

        processTweet(objUrl.val());

    });

    function recalcCount() {

        var newCount =
            objTweet.val().length +
            ( objUrl.val().length ? charsUrl : 0 ) +
            ( objVia.val().length ? objVia.val().length + charsVia : 0 ) +
            ( objHash.val().length ? objHash.val().length + charsHash : 0 );

        changeCount(newCount);
    }

    function processTweet(long_url) {

        if (long_url.indexOf('?') >= 0) {
            long_url = long_url.trim() + '&';
        } else {
            long_url = long_url.trim() + '?';
        }

        long_url = long_url +
            'utm_source=' + utmSource +
            '&utm_medium=' + utmMedium +
            '&utm_campaign=' + utmCampaign;

        $.ajax({
            dataType:'json',
            type:'GET',
            url:'https://api-ssl.bitly.com/v3/shorten',
            cache:false,

            data:{
                apiKey:'R_1ac633ed3e1813e46e89c0db79c22e24',
                login:'joshcanhelp',
                longUrl:encodeURI(long_url)
            }
        }).done(function (response) {
            if (response.data.url !== undefined) {
                buildTweet(response.data.url);
            } else {
                alert('bit.ly failed');
            }
        });

    }

    function buildTweet(shortUrl) {

        var theTweet = objTweet.val() + ' ' + shortUrl;

        var tweetVia = objVia.val();
        if (tweetVia !== undefined && tweetVia.length) {
            theTweet = theTweet + ' via @' + tweetVia;
        }

        var tweetHash = objHash.val();
        if (tweetHash !== undefined && tweetHash.length) {
            theTweet = theTweet + ' #' + tweetHash;
        }

        // Zero out all counts
        changeCount(0);

        // Display the tweet in a table to make copy/paste easy
        $('#all_tweets').find('tbody').append('<tr><td>' + theTweet + '</td></tr>');

        // Reactivate the button
        buttonState(true);
    }

    function changeCount(count) {

        theCount.text(count);

        if (count > 140) {
            theCount.css('color', 'red');
            buttonState(false);
        } else {
            theCount.css('color', 'green');
            buttonState(true);
        }

    }

    function buttonState(active) {
        if (active) {
            theButton.removeClass('btn-inactive').addClass('btn-success');
        } else {
            theButton.removeClass('btn-success').addClass('btn-inactive');
        }
    }

});