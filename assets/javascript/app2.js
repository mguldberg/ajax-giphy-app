
// |*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
// |*|  * docCookies.getItem(name)
// |*|  * docCookies.removeItem(name[, path[, domain]])
// |*|  * docCookies.hasItem(name)
// |*|  * docCookies.keys()
// |*|
// \*/

var docCookies = {
    getItem: function (sKey) {
        if (!sKey) { return null; }
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    },
    setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
        var sExpires = "";
        if (vEnd) {
            switch (vEnd.constructor) {
                case Number:
                    sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                    /*
                    Note: Despite officially defined in RFC 6265, the use of `max-age` is not compatible with any
                    version of Internet Explorer, Edge and some mobile browsers. Therefore passing a number to
                    the end parameter might not work as expected. A possible solution might be to convert the the
                    relative time to an absolute time. For instance, replacing the previous line with:
                    */
                    /*
                    sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; expires=" + (new Date(vEnd * 1e3 + Date.now())).toUTCString();
                    */
                    break;
                case String:
                    sExpires = "; expires=" + vEnd;
                    break;
                case Date:
                    sExpires = "; expires=" + vEnd.toUTCString();
                    break;
            }
        }
        document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
        return true;
    },
    removeItem: function (sKey, sPath, sDomain) {
        if (!this.hasItem(sKey)) { return false; }
        document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
        return true;
    },
    hasItem: function (sKey) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
        return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    },
    keys: function () {
        var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
        for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
        return aKeys;
    }
};



//constant  - can't use const because const doesn't work prior to IE 11 ; :-(
var giphyApiKey = "EH8ZXxBQVql80tOi9F65DupbUqoYfjsF";

//array of buttons to pre-load
var arrayOfTopicButtons = [
    { topic: "baseball", searchOption: "giphy" },
    { topic: "star wars", searchOption: "omdb" },
    { topic: "lawnmowers", searchOption: "us-loc" }
];

$(document).ready(function () {

    //pre-populate the button row at the top of the screen
    populateButtons(arrayOfTopicButtons);

    // listen for click on the Topic Search button
    $("#add-topic").on("click", function (event) {
        // Preventing the submit button from trying to submit the form
        // We're optionally using a form so the user may hit Enter to search instead of clicking the button
        event.preventDefault();

        //get the val inputed into the search box. id set by the line
        // <input type="text" id="topic-input">
        var topic = $("#topic-input").val();
        console.log($("#topic-input").val());

        console.log($(".custom-select").val());

        switch ($(".custom-select").val()) {
            case "giphy":
                //add giphy button at the top
                var newButton = $("<button class='topic-btn bg-success' search-option=" + $(".custom-select").val() + " value='" + topic + "'>" + topic + "</button>");
                $('#topic-buttons').append(newButton);
                arrayOfTopicButtons.push(topic);

                queryGiphyApi(topic);
                break;

            case "omdb":
                //add OMDb button at the top
                var newButton = $("<button class='topic-btn bg-warning' search-option=" + $(".custom-select").val() + " value='" + topic + "'>" + topic + "</button>");
                $('#topic-buttons').append(newButton);
                arrayOfTopicButtons.push(topic);

                queryOMDbApi(topic);
                break;

            case "us-loc":
                //add LOC button at the top
                var newButton = $("<button class='topic-btn bg-danger' search-option=" + $(".custom-select").val() + " value='" + topic + "'>" + topic + "</button>");
                $('#topic-buttons').append(newButton);
                arrayOfTopicButtons.push(topic);

                queryLibraryOfCongressApi(topic);
                break;
        };
        //call function to handle the query to Giphy

        //clear the text box    
        $("#search-button-form").trigger("reset");

    });

    //animate or stop the GIFs
    $("#gif-content").on("click", ".giphy-gif", function () {
        console.log("in onclick gif handler");
        var state = $(this).attr("data-state")
        var stateAnimate = $(this).attr("data-animate")
        var stateStill = $(this).attr("data-still")
        if (state == "still") {
            $(this).attr("src", stateAnimate)
            $(this).attr("data-state", "animated")
        }
        else {
            $(this).attr("src", stateStill)
            $(this).attr("data-state", "still")

        }

    });


    $("#topic-buttons").on("click", ".topic-btn", function (event) {
        console.log("inside btn click handler");
        // Preventing the submit button from trying to submit the form
        // We're optionally using a form so the user may hit Enter to search instead of clicking the button
        event.preventDefault();

        // Here we grab the text from the input box
        var topic = $(this).val();

        console.log($(this).attr("search-option"));

        switch ($(this).attr("search-option")) {
            case "giphy":
                queryGiphyApi(topic);
                break;

            case "omdb":
                queryOMDbApi(topic);
                break;

            case "us-loc":
                queryLibraryOfCongressApi(topic);
                break;
        };
    });


});

//query the API - TODO add in drop down box to search other apis
function queryGiphyApi(searchString) {

    // proper form from the giphy api generator page - https://developers.giphy.com/explorer
    //  https://api.giphy.com/v1/gifs/search?api_key=EH8ZXxBQVql80tOi9F65DupbUqoYfjsF&q=&limit=25&offset=0&rating=G&lang=en


    // Built by LucyBot. www.lucybot.com at the NYT api help website
    var queryURL = "https://api.giphy.com/v1/gifs/search";
    queryURL += '?' + $.param({
        'api_key': giphyApiKey,
        'q': searchString,
        'limit': "10",

    });

    console.log(queryURL);

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (getGif) {
        console.log(getGif)



        console.log(getGif.data.length);
        for (var i = 0; i < getGif.data.length; i++) {
            console.log(i);
            var getGifDiv = $("<div class='card border bg-light' >");
            // Div layout
            //  
            // Giphy User:  123abc
            // Rating: G, PG, etc returned in query (CAPS letter), Twitter logo - linked to twitter page
            // Import date/time
            // 
            //  ^ 
            //  |
            // IMG
            //  |
            //  v
            //


            //right after the opening text...get the username if available
            //check to see if there is a valid username of the GIF contributor
            // if true
            //  populate information from response
            // else if false
            //  put down 'unknown'
            console.log(getGif.data[i].user);
            var a = $("<a>");
            var twitterLink = $('<a id="twitter-link" class="float-right">');

            //check if user data exists or not - not doing this will an error
            if (getGif.data[i].user != undefined) {

                //prepend text so it isn't part of the <a href> link prepending the 'a' just before this
                getGifDiv.prepend("Giphy User: ");

                //check if twitter data exists or not - not doing this will an error
                if (getGif.data[i].user.twitter != undefined) {

                    console.log(getGif.data[i].user.twitter);
                    console.log("https://twitter.com/" + getGif.data[i].user.twitter.slice(1));
                    console.log(getGif.data[i].user.twitter.slice(1));

                    //test for twitter data in teh Giphy DB that isn't @ formatted (ex. mlb)
                    if (getGif.data[i].user.twitter[0] == "@") {
                        twitterLink.attr("href", "https://twitter.com/" + getGif.data[i].user.twitter.slice(1));
                        // put the twitter font awesome on the row linked to the twitter page
                        twitterLink.html('<i style="font-size:24px" class="fa">&#xf099;</i>');

                    }
                    else {
                        twitterLink.attr("href", "https://twitter.com/" + getGif.data[i].user.twitter);
                        // put the twitter font awesome on the row linked to the twitter page
                        twitterLink.html('<i style="font-size:24px" class="fa">&#xf099;</i>');

                    }

                };

                console.log(getGif.data[i].user.display_name);
                console.log(getGif.data[i].user.profile_url);

                a.attr("href", getGif.data[i].user.profile_url);
                a.text(getGif.data[i].user.display_name);


                //add image to the GIF div returned in the API call to Giphy
                console.log(getGif.data[i].images.fixed_height.url);
                //check if they have a twitter account  - append logo at the end if true

            }
            else {

                //prepend text so it isn't part of the <a href> link prepending the 'a' just before this
                getGifDiv.prepend("Source: ");

                //populate the top with the source tld
                a.attr("href", "https://" + getGif.data[i].source_tld);
                a.text(getGif.data[i].source_tld);
                //put the username/link before the rating but after the opening text
                getGifDiv.append(a);
                console.log(a);

            }
            //put the username/link before the rating but after the opening text
            getGifDiv.append(a);
            console.log(a);

            //add rating to the topic GIF div
            console.log(getGif.data[i].rating);
            var secondRowDiv = $('<div class="container-fluid row justify-content-between">');
            // var secondRowCol = $('<div class="container col-md-12">');
            // secondRowDiv.append(secondRowCol);

            var p = $('<p class="float-left">').prepend("Rating: " + getGif.data[i].rating.toUpperCase());

            //add information for rating before the possible twitter link
            secondRowDiv.append(p);
            secondRowDiv.append(twitterLink);

            getGifDiv.append(secondRowDiv);

            //send piece of text - other meta data
            var p2 = $("<p>").prepend("Uploaded: " + getGif.data[i].import_datetime.split(" ").shift());
            getGifDiv.append(p2);


            //create image element with all attr to support start/stop of the animated GIF
            //also included alt element
            var topicImage = $("<img>");
            topicImage.attr("src", getGif.data[i].images.fixed_height_small.url);
            topicImage.attr("data-state", "animate");
            topicImage.attr("data-animate", getGif.data[i].images.fixed_height_small.url)
            topicImage.attr("data-still", getGif.data[i].images.fixed_height_small_still.url)
            topicImage.attr("class", "giphy-gif mx-auto d-block")
            topicImage.attr("alt", getGif.data[i].title);

            var state = $(this).attr("data-state")
            var stateAnimate = $(this).attr("data-animate")
            var stateStill = $(this).attr("data-still")
            getGifDiv.append(topicImage);

            console.log(getGifDiv);
            $("#gif-content").prepend(getGifDiv);

        }

    });
}


function queryOMDbApi(topic) {

    // URL format  "http://www.omdbapi.com/?apikey=trilogy&t=topic&plot=short";

    // Built by LucyBot. www.lucybot.com at the NYT api help website
    var queryURL = "http://www.omdbapi.com/";
    queryURL += '?' + $.param({
        't': topic,   //movie title name
        'plot': "short", //short or long plot description returned
        'apikey': "trilogy",
    });

    console.log(queryURL);

    $.ajax({
        url: queryURL,
        method: "GET"
    }).done(function (getMovieInfo) {
        console.log(getMovieInfo)

        var moviePoster = getMovieInfo.Poster
        console.log(getMovieInfo.Poster);
        var newDiv = $('<div class="card border bg-light">')
        newDiv.append("<p>" + getMovieInfo.Title + "</p>")
        newDiv.append("<p>" + getMovieInfo.Rated + "</p>")
        newDiv.append("<p>" + getMovieInfo.Released + "</p>")
        newDiv.append("<p>" + getMovieInfo.Runtime + "</p>")
        newDiv.append('<img src="' + moviePoster + ' " class="movie-poster">');
        $("#gif-content").prepend(newDiv);
        console.log(newDiv);

    });
}

//pre-populate the button row at the top of the screen
function populateButtons(arrayOfTopicButtons) {

    for (i = 0; i < arrayOfTopicButtons.length; i++) {


        console.log("Gen BUttons: " + arrayOfTopicButtons[i].searchOption);

        switch (arrayOfTopicButtons[i].searchOption) {
            case "giphy":
                //add giphy button at the top
                var newButton = $("<button class='topic-btn bg-success' search-option=" + arrayOfTopicButtons[i].searchOption + " value='" + arrayOfTopicButtons[i].topic + "'>" + arrayOfTopicButtons[i].topic + "</button>");
                $('#topic-buttons').append(newButton);
                
                break;

            case "omdb":
                //add OMDb button at the top
                var newButton = $("<button class='topic-btn bg-warning' search-option=" + arrayOfTopicButtons[i].searchOption + " value='" + arrayOfTopicButtons[i].topic + "'>" + arrayOfTopicButtons[i].topic + "</button>");
                $('#topic-buttons').append(newButton);
                
                break;

            case "us-loc":
                //add LOC button at the top
                var newButton = $("<button class='topic-btn bg-primary' search-option=" + arrayOfTopicButtons[i].searchOption + " value='" + arrayOfTopicButtons[i].topic + "'>" + arrayOfTopicButtons[i].topic + "</button>");
                $('#topic-buttons').append(newButton);
                
                break;
        };

    };

    // var stringArray = JSON.stringify(arrayOfTopicButtons);
    // Create a cookie, valid across the entire site:
    //  Cookies.set('name', 'value');

    var status = Cookies.set("topicArrayButtons", arrayOfTopicButtons);

    var cookiesAvail = Cookies.get();
    console.log(status);
    console.log(cookiesAvail);
    topic = "gopher";
    // stringArray.push(topic);

    //Read cookie:
    //  Cookies.get('name'); // => 'value'
    //  Cookies.get('nothing'); // => undefined
    var arrayLocal = Cookies.getJSON('topicArrayButtons');
    console.log("arrayDump");
    console.log(arrayLocal);

    // Read all visible cookies:
    //  Cookies.get(); // => { name: 'value' }

    // Delete cookie:
    //Cookies.remove('name');

    document.cookie = "Gophers";

    console.log(document.cookie);

    var docStatus = docCookies.setItem("topicArrayButtons2", arrayOfTopicButtons);
    console.log(docStatus);

    var localFirst = docCookies.getItem("topicArrayButtons2");
    console.log(localFirst);
}

