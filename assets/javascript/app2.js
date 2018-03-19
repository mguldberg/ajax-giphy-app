
// // |*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
// // |*|  * docCookies.getItem(name)
// // |*|  * docCookies.removeItem(name[, path[, domain]])
// // |*|  * docCookies.hasItem(name)
// // |*|  * docCookies.keys()
// // |*|
// // \*/

// var docCookies = {
//     getItem: function (sKey) {
//         if (!sKey) { return null; }
//         return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
//     },
//     setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
//         if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
//         var sExpires = "";
//         if (vEnd) {
//             switch (vEnd.constructor) {
//                 case Number:
//                     sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
//                     /*
//                     Note: Despite officially defined in RFC 6265, the use of `max-age` is not compatible with any
//                     version of Internet Explorer, Edge and some mobile browsers. Therefore passing a number to
//                     the end parameter might not work as expected. A possible solution might be to convert the the
//                     relative time to an absolute time. For instance, replacing the previous line with:
//                     */
//                     /*
//                     sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; expires=" + (new Date(vEnd * 1e3 + Date.now())).toUTCString();
//                     */
//                     break;
//                 case String:
//                     sExpires = "; expires=" + vEnd;
//                     break;
//                 case Date:
//                     sExpires = "; expires=" + vEnd.toUTCString();
//                     break;
//             }
//         }
//         document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
//         return true;
//     },
//     removeItem: function (sKey, sPath, sDomain) {
//         if (!this.hasItem(sKey)) { return false; }
//         document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
//         return true;
//     },
//     hasItem: function (sKey) {
//         if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
//         return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
//     },
//     keys: function () {
//         var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
//         for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
//         return aKeys;
//     }
// };



//constant  - can't use const because const doesn't work prior to IE 11 ; :-(
var giphyApiKey = "EH8ZXxBQVql80tOi9F65DupbUqoYfjsF";

//array of buttons to pre-load
var arrayOfTopicButtons = [
    { topic: "baseball", searchOption: "giphy" },
    { topic: "star wars", searchOption: "omdb" },
    { topic: "lawnmowers", searchOption: "us-loc" }
];
// var to get the title returned from the OMDb response
var movieTitleReturned = "";


$(document).ready(function () {

    Cookies.get();
    var tempArray = Cookies.get("topicArrayButtons");

    console.log("arrayDump-top");
    console.log(arrayOfTopicButtons);
    console.log(tempArray);

    var arrayLocal = Cookies.getJSON('topicArrayButtons');
    console.log("arrayDump");
    console.log(arrayLocal);

    if (arrayLocal != undefined)
        arrayOfTopicButtons = arrayLocal;
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
        console.log("ARRAY before: ");
        console.log(arrayOfTopicButtons);

        switch ($(".custom-select").val()) {
            case "giphy":
                //add giphy button at the top
                var newButton = $("<button class='topic-btn bg-success text-white' search-option=" + $(".custom-select").val() + " value='" + topic + "'>" + topic + "</button>");
                $('#topic-buttons').append(newButton);
                var tempObj = { topic: topic, searchOption: "giphy" };
                arrayOfTopicButtons.push(tempObj);
                queryGiphyApi(topic);
                break;

            case "omdb":

                // var to hold the name returned from the DB for the button
                queryOMDbApi(topic);

                console.log("inside Case:" +movieTitleReturned);

                //add OMDb button at the top
                //set button name to match the one returned from the OMDb query
                var newButton = $("<button class='topic-btn bg-warning' search-option=" + $(".custom-select").val() + " value='" + topic + "'>" + topic + "</button>");
                $('#topic-buttons').append(newButton);
                var tempObj = { topic: topic, searchOption: "omdb" };
                arrayOfTopicButtons.push(tempObj);
                break;

            case "us-loc":
                //add LOC button at the top
                var newButton = $("<button class='topic-btn bg-primary text-white' search-option=" + $(".custom-select").val() + " value='" + topic + "'>" + topic + "</button>");
                $('#topic-buttons').append(newButton);
                var tempObj = { topic: topic, searchOption: "us-loc" };
                arrayOfTopicButtons.push(tempObj);

                queryLibraryOfCongressApi(topic);
                break;
        };
        //call function to handle the query to Giphy

        //clear the text box    
        $("#search-button-form").trigger("reset");

        console.log("ARRAY after: ");
        console.log(arrayOfTopicButtons);

        //add to the cookie
        var status = Cookies.set("topicArrayButtons", arrayOfTopicButtons);

        var cookiesAvail = Cookies.get();
        console.log(status);
        console.log(cookiesAvail);

        console.log(Cookies.getJSON("topicArrayButtons"));

        console.log(JSON.stringify(cookiesAvail));

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

// Search
// http://loc.gov/pictures/search/?q=<query>&fo=json

// Searches descriptive information for the search terms specified by <query>.
// Options
// Search Options
// q - query, search terms (None)
// fa - facets, format = <field>|<facet value> (None)
// co - collection (None)
// co! - _not_ collection (None)
// op - operator (AND)
// va - variants, (True)
// fi - fields (None/"text")

// Results Options
// c - count (20)
// st - style, (list)
// sp - start page, (1)
// si - start index (1)
// fo - format
// sb - sort by (relevance)

// Response
// "search"
// {
// "type": "search", 
// "query": "sioux indians",
// "field": null,
// "sort_by": null,  
// "hits": "9"
// }
// "links"
// {
//     "json": "//loc.gov/pictures/search?q=sioux%20indians&fo=json",


// {
//     "source_created": "2016-12-07 00:00:00",
//         "index": 2,
//             "medium": "1 negative : glass ; 5 x 7 in.",
//                 "reproduction_number": "LC-DIG-anrc-12092 (digital file from original)",
//                     "links": {
//         "item": "//www.loc.gov/pictures/item/2017677704/",
//             "resource": "//www.loc.gov/pictures/item/2017677704/resource/"
//     },
//     "title": "Playing basketball. Greek, Armenian and Turkish girls, students at American Girl's College, Constantinople. Basketball is the favorite sport in the Turkish capital. Here is a group of Greek and Armenian girl students at play in the grounds of the American Girl's College. They get their basketballs from the United States",
//         "image": {
//         "alt": "digitized item thumbnail",
//             "full": "//www.loc.gov/pictures/cdn/service/pnp/anrc/12000/12092r.jpg",


function queryLibraryOfCongressApi(searchString) {


    // "http://www.loc.gov/pictures/search/?q=basketball&fa=displayed%3Aanywhere&c=30&sp=1&st=gallery&fo=json"
    http://www.loc.gov/pictures/search/?q=basketball&c=10&sp=1&st=gallery&fo=json&fa=displayed%3Aanywhere
    // Built by LucyBot. www.lucybot.com at the NYT api help website
    var queryURL = "http://www.loc.gov/pictures/search/";
    queryURL += '?' + $.param({
        'q': searchString,
        'c': "10",
        'sp': "1",
        'st': "gallery",
        'fo': "json",
        'fa': ""

    });

    queryURL += "displayed%3Aanywhere";
    // queryURL =  "https://loc.gov/pictures/item/89709841/?fo=json";

    console.log(queryURL);


    $.ajax({
        type: "GET",
        url: queryURL,
        dataType: 'jsonp',
        data: {
            fo: 'jsonp',
            at: 'featured'
        }
    }).done(function (getImages) {
        console.log(getImages);
        console.log(getImages.reseults.length);

    });

    $.ajax({
        METHOD: "GET",
        url: queryURL,
    }).done(function (getImages) {
        console.log(getImages);
        console.log(getImages.reseults.length);

    });
}

//query the Giphy API
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
            //  ^ 
            //  |
            // IMG
            //  |
            //  v
            //  
            // Giphy User:  123abc
            // Rating: G, PG, etc returned in query (CAPS letter), Twitter logo - linked to twitter page
            // Import date/time

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

                console.log(getGif.data[i].source_tld);
                //populate the top with the source tld
                if (getGif.data[i].source_tld != "") {
                    a.attr("href", "https://" + getGif.data[i].source_tld);
                    a.text(getGif.data[i].source_tld);
                }
                else {
                    a.attr("href", "https://www.youtube.com/watch?v=UmzsWxPLIOo");
                    a.text("I see nothing!");
                }
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
            var p = $('<p class="float-left">').prepend("Rating: " + getGif.data[i].rating.toUpperCase());

            //add information for rating before the possible twitter link
            secondRowDiv.append(p);
            secondRowDiv.append(twitterLink);

            getGifDiv.append(secondRowDiv);

            //send piece of text - other meta data
            var p2 = $("<p>").prepend("Uploaded: " + getGif.data[i].import_datetime.split(" ").shift());
            getGifDiv.append(p2);

            // wrap img in a div so I can put on a download icon
            var imgDiv = $('<div id="imgDiv">');
            //create image element with all attr to support start/stop of the animated GIF
            //also included alt element
            var topicImage = $("<img>");
            topicImage.attr("src", getGif.data[i].images.fixed_height_small.url);
            topicImage.attr("data-state", "animate");
            topicImage.attr("data-animate", getGif.data[i].images.fixed_height_small.url)
            topicImage.attr("data-still", getGif.data[i].images.fixed_height_small_still.url)
            topicImage.attr("class", "giphy-gif mx-auto d-block")
            topicImage.attr("alt", getGif.data[i].title);
            topicImage.attr("title", getGif.data[i].title);

            //format for the download icon link
            //<a href="https://media3.giphy.com/media/26hirEPeos6yugLDO/100.gif" download="100.gif" class="top-right">
            //      <i style="font-size:18px" class="fa">&#xf019</i>
            //</a>
            var downloadAnchor = $('<a id="download-link" class="top-right">');

            downloadAnchor.attr("href", getGif.data[i].images.fixed_height_small.url);
            // put the download font awesome on the row linked to the image URL
            downloadAnchor.html('<i style="font-size:18px" class="fa">&#xf019</i>');

            //fill up the imgDiv
            imgDiv.prepend(downloadAnchor);
            imgDiv.prepend(topicImage);

            //put the imgDiv at the top of the parent GIF Div
            getGifDiv.prepend(imgDiv);

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

        //populate new div with movie information from OMDb
        // Div layout
        // 
        //  ^ 
        //  |
        // IMG
        //  |
        //  v
        //  
        // Title
        // Rating 
        // Release year/date
        // Runtime
        //

        var moviePoster = getMovieInfo.Poster
        movieTitleReturned = getMovieInfo.Title;
        console.log(getMovieInfo.Title);
        console.log(getMovieInfo.Poster);
        var newDiv = $('<div class="card border bg-light">')
        newDiv.append("<p>" + getMovieInfo.Title + "</p>")
        newDiv.append("<p>" + getMovieInfo.Rated + "</p>")
        newDiv.append("<p>" + getMovieInfo.Released + "</p>")
        newDiv.append("<p>" + getMovieInfo.Runtime + "</p>")
        // wrap img in a div so I can put on a download icon
        var imgDiv = $('<div id="movieImgDiv">');

        //populate imgDiv with poster returned from OMDb
        imgDiv.append('<img src="' + moviePoster + ' " class="movie-poster">');

        //format for the download icon link
        //<a href="https://media3.giphy.com/media/26hirEPeos6yugLDO/100.gif" download="100.gif" class="top-right">
        //      <i style="font-size:18px" class="fa">&#xf019</i>
        //</a>
        var downloadAnchor = $('<a id="download-link" class="top-right">');
        downloadAnchor.attr("href", moviePoster);
        // put the download font awesome on the row linked to the image URL
        downloadAnchor.html('<i style="font-size:18px" class="fa">&#xf019</i>');

        //fill up the imgDiv
        imgDiv.append(downloadAnchor);

        //place imgDiv inside of parent movieImgDiv
        newDiv.prepend(imgDiv);

        $("#gif-content").prepend(newDiv);
        console.log(newDiv);

    });

}

//pre-populate the button row at the top of the screen
function populateButtons(functionArrayOfTopicButtons) {

    console.log("argument passed in");
    console.log(functionArrayOfTopicButtons);

    for (i = 0; i < functionArrayOfTopicButtons.length; i++) {


        console.log("Gen BUttons: " + functionArrayOfTopicButtons[i].searchOption);

        switch (functionArrayOfTopicButtons[i].searchOption) {
            case "giphy":
                //add giphy button at the top
                var newButton = $("<button class='topic-btn bg-success text-white' search-option=" + arrayOfTopicButtons[i].searchOption + " value='" + arrayOfTopicButtons[i].topic + "'>" + arrayOfTopicButtons[i].topic + "</button>");
                $('#topic-buttons').append(newButton);

                break;

            case "omdb":
                //add OMDb button at the top
                var newButton = $("<button class='topic-btn bg-warning' search-option=" + arrayOfTopicButtons[i].searchOption + " value='" + arrayOfTopicButtons[i].topic + "'>" + arrayOfTopicButtons[i].topic + "</button>");
                $('#topic-buttons').append(newButton);

                break;

            case "us-loc":
                //add LOC button at the top
                var newButton = $("<button class='topic-btn bg-primary text-white' search-option=" + arrayOfTopicButtons[i].searchOption + " value='" + arrayOfTopicButtons[i].topic + "'>" + arrayOfTopicButtons[i].topic + "</button>");
                $('#topic-buttons').append(newButton);

                break;
        };

    };

    // var stringArray = JSON.stringify(arrayOfTopicButtons);
    // Create a cookie, valid across the entire site:
    //  Cookies.set('name', 'value');

    console.log("ARRAY: ");
    console.log(functionArrayOfTopicButtons);
    var status = Cookies.set("topicArrayButtons", functionArrayOfTopicButtons);
    status = JSON.stringify(status);
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

    console.log(Cookies.get());

    // Read all visible cookies:
    //  Cookies.get(); // => { name: 'value' }

    // Delete cookie:
    //Cookies.remove('name');
    console.log(Cookies.remove("topicArrayButtons"));

}

