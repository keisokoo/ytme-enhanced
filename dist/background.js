console.log("background"),chrome.action.onClicked.addListener((function(o){o.id&&chrome.tabs.reload(o.id),chrome.runtime.reload()}));
//# sourceMappingURL=background.js.map