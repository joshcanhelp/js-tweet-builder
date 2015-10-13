/*
Tweet Builder by PROPER Development
http://theproperweb.com
 */

 // bit.ly

// UTM variables added to the URL automatically
var smtUtmSource = 'hootsuite';
var smtUtmMedium = 'twitter';
var smtUtmCampaign = 'hootsuite_tweets';

// How many chars are added by default?
var charsUrl = 21;
var charsVia = 6;
var charsHash = 2;

// Total tweets created
var smtTweetCount = 0;

// Running character count
var smtCharCount = 0;

if (typeof String.prototype.trim === undefined) {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    };
}

$(document).ready( function ($) {

    // Global character count
    var theButton = $('#btn_generate');

    // Global character count
    var theCount = $('#char_count');

    // Field objects
    var objTweet = $('#tweet');
    var objUrl = $('#url');
    var objVia = $('#via');
    var objHash = $('#hashtag');

    // Grab forum submission to build the tweet
    $('#tweet_builder').submit( function(event) {
        event.preventDefault();

        // Don't want the form submitted multiple times
        if (theButton.hasClass('btn-inactive')) {
            return false;
        }

        smtButtonState(false);

        // Grab the URL field and process the tweet
        smtUrl = objUrl.val();
        smtProcessTweet(smtUrl);

    });

    objTweet.change(function () {
        smtRecalcCount($(this), 0);
    })

    objUrl.change( function() {
        smtRecalcCount($(this), charsUrl);
    })

    objVia.change(event, function () {
        smtRecalcCount( $(this), charsVia);
    })

    objHash.change(event, function () {
        smtRecalcCount( $(this), charsHash);
    });

    function smtRecalcCount(field, addThis) {

        // Storing the current value to use next time around as the old value
        field.data('old', field.data('new') || '');

        // Since we're using inputs and areas, get the highest/only count
        var currentValue = field.val() > field.text() ? field.val() : field.text();

        // URLs are shortened so we don't need to include their length
        if (field.attr('type') !== 'url') {
            smtCharCount = smtCharCount - field.data('old').length;
        }

        if (currentValue) {
            // URLs are shortened so we don't need to include their length
            if (field.attr('type') !== 'url') {
                smtCharCount = smtCharCount + currentValue.length;
            }

            // Add additional characters if the value was empty but is not now
            if (!field.data('old').length) {
                smtCharCount = smtCharCount + addThis;
            }
        } else {
            smtCharCount = smtCharCount - addThis;
        }

        field.data('new', field.val());

        smtChangeCount(smtCharCount);
    }

    function smtProcessTweet(long_url) {

        if (long_url.indexOf('?') >= 0) {
            long_url = long_url.trim() + '&'
        } else {
            long_url = long_url.trim() + '?'
        }

        long_url = long_url +
            'utm_source=' + smtUtmSource +
            '&utm_medium=' + smtUtmMedium +
            '&utm_campaign=' + smtUtmCampaign;

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
                if (response.data.url !== undefined)
                    smtBuiltTweet(response.data.url);
                else
                    console.log('bit.ly failed');
            });

    }

    function smtBuiltTweet(shortUrl) {

        var smtTweet = objTweet.val() + ' ' + shortUrl;

        var smtVia = objVia.val();
        if (smtVia !== undefined && smtVia.length) {
            smtTweet = smtTweet + ' via @' + smtVia;
        }

        var smtHash = objHash.val();
        if (smtHash !== undefined && smtHash.length) {
            smtTweet = smtTweet + ' #' + smtHash;
        }

        smtTweetCount++;

        // Zero out all counts
        objTweet.val('').removeData('old').removeData('new');
        objUrl.val('').removeData('old').removeData('new');
        objVia.val('').removeData('old').removeData('new');
        objHash.val('').removeData('old').removeData('new');
        smtChangeCount(0);
        smtCharCount = 0;

        // Display the tweet in a table to make copy/paste easy
        $('#all_tweets').find('tbody').append('<tr><td>' + smtTweet + '</td></tr>');

        // Reactivate the button
        smtButtonState(true);
    }

    function smtChangeCount(count) {

        theCount.text(count);

        if (count > 140) {
            theCount.css('color', 'red');
            smtButtonState(false);
        } else {
            theCount.css('color', 'green');
            smtButtonState(true);
        }

    }

    function smtButtonState(active) {
        if (active) {
            theButton.removeClass('btn-inactive').addClass('btn-success');
        } else {
            theButton.removeClass('btn-success').addClass('btn-inactive');
        }
    }

});