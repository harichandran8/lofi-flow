console.log("LofiFlow service worker started");

chrome.runtime.onInstalled.addListener(() => {
  console.log("LofiFlow extension installed");
});