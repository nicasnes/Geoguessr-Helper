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
    credentials: 'include'
  }).then(res=>res.json())
    .then(data => {
      let roundArr = data["rounds"];
      if (roundArr.length > 0) {
        let roundAns = roundArr[roundArr.length-1];
        coords.lat = roundArr[roundArr.length-1].lat;
        coords.lng = roundArr[roundArr.length-1].lng;
        coords.panoId = roundArr[roundArr.length-1].panoId;
        destURL = 'https://maps.google.com/?q=' + coords.lat + ',' + coords.lng;
        chrome.storage.sync.set({urlKey: destURL}, function(result){
          });
      }
    })
  .catch(err => { throw err; });
  return coords;
}

function setURL() {
  chrome.storage.sync.get(['urlKey'], function(result) { 
    document.getElementById('link').setAttribute("href", result.urlKey);
  });
}

function coordHandler() { 
  determineCoords(serverJSON);
}

if (location.href.includes("geoguessr")) {
  setInterval(coordHandler, 5*1000);
}

if (location.href.includes("popup")) {
  setURL(destURL);
}

/**
 * 
 * TODO:
 * Fix open url on first load
 * You rank X in this lobby.
 * Find most recent coordinates, not just last index coords
 */