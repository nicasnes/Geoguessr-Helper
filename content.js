/**
 * Geoguessr Helper Content Script
 * Author: Nic Asnes
 * Extension is open source at https://github.com/nicasnes/Geoguessr-Helper
 */

let endpointURL = getEndpoint(location.href);
let destURL = "";
let interval = 30;

/**
 * If in a Battle Royale game, run coordHandler every *interval* seconds.
 */
if (location.href.includes("geoguessr")) {
  setInterval(coordHandler, interval*1000);
}

/**
 * Run initPopup whenever popup.html is opened.
 * Note the content script matches in manifest.json providing safety
 */
if (location.href.includes("popup")) {
  initPopup(destURL);
}

/**
* Given a battle royale URL, extract the game id and return JSON from server 
*/
function getEndpoint(br) {
  let id = br.substring(br.indexOf("royale/") + 7);
  return "https://game-server.geoguessr.com/api/battle-royale/" + id;
}

/**
* Given a URL, make a GET request to the Geoguessr endpoint, storing the maps URL for the location
* if the answer has been guessed. Returns the location's coordinates. 
*/
function determineCoords(url) {
  let coords = {};

  // Make a GET request to the Geoguessr endpoint
  fetch(url, {
    // Include credentials to GET from the endpoint
    credentials: 'include'

  }).then(res=>res.json())
    .then(data => {
      let roundArr = data["rounds"];
      
      // If there has been a round
      if (roundArr && roundArr.length > 0) {

        // If the current round is over
        if (roundArr[roundArr.length-1].answer) {

          // Store the latitude and longitude in coords
          coords.lat = roundArr[roundArr.length-1].lat;
          coords.lng = roundArr[roundArr.length-1].lng;

          // Store destURL in chrome's synced storage
          destURL = 'https://maps.google.com/?q=' + coords.lat + ',' + coords.lng;
          chrome.storage.sync.set({urlKey: destURL}, function(result){});
        }
      }
    })
  .catch(err => { throw err; });
  
  return coords;
}

/**
 * Runs when popup.html is opened; modifies the HTML to update maps link
 */
function initPopup() {
  chrome.storage.sync.get(['urlKey'], function(result) { 
    document.getElementById('link').setAttribute("href", result.urlKey);
  });
}

/**
 * Calls determineCoords with the endpointURL based on the interval.
 */
function coordHandler() { 
  determineCoords(endpointURL);
}