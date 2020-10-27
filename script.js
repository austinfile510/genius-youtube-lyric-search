"use strict";

const apiKey = "AIzaSyC8VlFTOdIZ35d_fCxhKb-YQrMJtMk04Fo"; // Youtube API Key

// API Root URLS

const lyricsURL = "https://api.lyrics.ovh/v1"; // Lyrics.ovh
const youtubeURL = "https://www.googleapis.com/youtube/v3/search"; // Youtube
const audioDBURL = "https://theaudiodb.p.rapidapi.com/searchtrack.php"; // TheAudioDB

// Query Param Function

function formatQueryParams(params) {
  const queryItems = Object.keys(params).map(
    (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
  );
  return queryItems.join("&");
}

// FETCH FUNCTIONS

// Get Song Info (Description, Album, etc.) from TheAudioDB

function getSongInfo(title, artist) {
  const audioDBParams = {
    t: title,
    s: artist,
  };
  const audioDBQueryString = formatQueryParams(audioDBParams);
  const audioDBSearchURL = audioDBURL + "?" + audioDBQueryString;

  console.log(audioDBSearchURL);

  const audioDBOptions = {
    method: "GET",
    headers: {
      "x-rapidapi-host": "theaudiodb.p.rapidapi.com",
      "x-rapidapi-key": "40d715a925msh78d826f765fef9dp1ced76jsn10cd57276f2b",
    },
  };

  fetch(audioDBSearchURL, audioDBOptions)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then((responseJson) => displaySongInfo(responseJson))
    .catch((err) => {
      $("#js-error-message").text(`Something went wrong, please try again.`);
    });
}

// Get Song Lyrics

function getLyrics(artist, title) {
  const lyricsSearchURL = lyricsURL + "/" + artist + "/" + title;

  fetch(lyricsSearchURL)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then((responseJson) => displayLyrics(responseJson))
    .catch((err) => {
      $("#js-error-message").text(`Something went wrong, please try again.`);
    });
}

// Get Youtube Videos

function getYoutubeVideos(query) {
  const youtubeParams = {
    key: apiKey,
    q: query,
    part: "snippet",
  };
  const youtubeQueryString = formatQueryParams(youtubeParams);
  const youtubeSearchURL = youtubeURL + "?" + youtubeQueryString;

  console.log(youtubeSearchURL);

  fetch(youtubeSearchURL)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then((responseJson) => displayVideo(responseJson))
    .catch((err) => {
      $();
      $("#js-error-message").text(`Something went wrong, please try again.`);
    });
}

// DISPLAY FUNCTIONS

// Display Lyrics

function displayLyrics(responseJson) {
  $("#song-lyrics").empty();
  console.log(responseJson);
  if(!responseJson.lyrics) {
    $("#song-lyrics").addClass("hidden");
    $("#youtube-link").addClass("hidden");
  }
  else {
  const songLyrics = responseJson.lyrics;
  $("#song-lyrics").removeClass("hidden");
  $("#song-lyrics").append(`
  </br>
  <h3>Lyrics</h3>
  <pre>${songLyrics}</pre>
  `);
  
  }
}

// Display Video

function displayVideo(responseJson) {
  $("#youtube-link").empty();
  console.log(responseJson);
  let videoLink = responseJson.items[0];
  console.log(videoLink)
  $("#youtube-link").append(`
  <iframe width="420" height="315"
    src="https://www.youtube.com/embed/${videoLink.id.videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>>
  </iframe>
  <h2><a href = "https://www.youtube.com/watch?v=${videoLink.id.videoId}">${titleSearchTerm} - ${artistSearchTerm}</a></h2>
`);
}

// Display Song Info

function displaySongInfo(responseJson) {
  $("#error-message").empty();
  $("#song-info").empty();
  $("#results").removeClass("hidden");
  console.log(responseJson);
  if (!responseJson.track[0].strDescriptionEN) {
    $("#song-info").append(`
      <p>We're sorry, but no song info is available for this track. Please try again, or check <a href="https://www.google.com">Google</a> for more information.</p>
    `);
    $("#song-lyrics").addClass("hidden");
  } else {
    const albumTitle = responseJson.track[0].strAlbum;
    const songInfo = responseJson.track[0].strDescriptionEN;
    $("#song-info").append(`  
  </br>
  <p>Album: ${albumTitle}</p>
  <p class= "js-lyrics">${songInfo}</p>
  `);
  $("#song-lyrics").removeClass("hidden");
  }
  
}

let artistSearchTerm, titleSearchTerm; // Search Term Variables

// Watch Form Function

function watchForm() {
  $("form").submit((event) => {
    event.preventDefault();
    artistSearchTerm = $("#js-artist-search-area").val();
    titleSearchTerm = $("#js-title-search-area").val();
    getSongInfo(titleSearchTerm, artistSearchTerm);
    getLyrics(artistSearchTerm, titleSearchTerm);
    getYoutubeVideos(artistSearchTerm + " - " + titleSearchTerm);
  });
}

$(watchForm);
