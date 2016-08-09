/*global chrome */

window.onload = function() {
    let powerSwitch = window.document.getElementById('power-switch');

    chrome.runtime.sendMessage('settingsOpened', function(response) {
        powerSwitch.checked = response.gridIsEnabled;
    });

    powerSwitch.addEventListener('change', function() {
        if (powerSwitch.checked) {
            chrome.runtime.sendMessage('enableGrid');
        } else {
            chrome.runtime.sendMessage('disableGrid');
        }
    }, false);
};