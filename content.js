// Test URL: "https://game-server.geoguessr.com/api/battle-royale/a7b231e7-6985-4700-b737-ecf3812a74e6/";

let serverJSON = getServerJSON(location.href);
let destURL = ""

/* Given a battle royale URL, extract the game id and return JSON from server */
// getServerJSON(br: string): string
function getServerJSON(br) {
  let id = br.substring(br.indexOf("royale/") + 7);
  return "https://game-server.geoguessr.com/api/battle-royale/" + id;
}


// determineLocation(url: string): Object{number, number, string}
function determineCoords(url) {
  let coords = {};
  fetch(url, {
    credentials: 'include',
  }).then(res=>res.json())
    .then(data => {
      console.log('JSON:', data);
      let roundArr = data["rounds"];
      if (roundArr.length > 0) {
        let roundAns = roundArr[roundArr.length-1];
        if (roundAns["answer"]) {
          coords.lat = roundArr[roundArr.length-1].lat;
          coords.lng = roundArr[roundArr.length-1].lng;
          coords.panoId = roundArr[roundArr.length-1].panoId;
          console.log(coords.lat);
          console.log(coords.lng);
          console.log(coords.panoId)
          destURL = 'https://maps.google.com/?q=' + coords.lat + ',' + coords.lng;
          chrome.storage.sync.set({urlKey: destURL}, function(result){
          console.log('Value is set to ' + destURL);
          });
        }
      }
    })
  .catch(err => { throw err; });
  return coords;
}

function setURL() { 
  console.log("Setting url to:" + destURL);
  chrome.storage.sync.get(['urlKey'], function(result) { 
    console.log("result is: " + result.urlKey);
    document.getElementById('link').setAttribute("href", result.urlKey);
  });
}

if (location.href.includes("geoguessr")) {
  console.log("server json from api: " + serverJSON);
  determineCoords(serverJSON);
}

if (location.href.includes("popup")) {
  setURL(destURL);
}

/**
 * 
 * TODO:
 * Handle error with undefined,undefined when no guesses made
 * Change from battle-royale/* to exclude battle-royale/ main page --- fixed, now fix on first load
 * Handle error with undefined,undefined after wrong guess
 * Make it so you don't have to refresh
 * You rank X in this lobby.
 * Find most recent coordinates, not just last index coords
 */