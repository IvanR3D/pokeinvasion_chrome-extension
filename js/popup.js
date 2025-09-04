document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('toggleBtn');
    const collectionBtn = document.getElementById('collectionBtn');
    const statusBtn = document.getElementById('statusBtn');
    const generationSelect = document.getElementById('generationSelect');

    chrome.storage.local.get(['pokemonSettings'], function(result) {
        const settings = result.pokemonSettings || {
            generation: 1
        };        
        generationSelect.value = settings.generation;
    });

    function saveSettings() {
        const settings = {
            generation: parseInt(generationSelect.value)
        };        
        chrome.storage.local.set({pokemonSettings: settings});
        return settings;
    }

    generationSelect.addEventListener('change', saveSettings);

    function updateUI(isActive) {
        if (isActive) {
            statusBtn.className = 'status-btn active';
            statusBtn.title = 'Invasion Active - Click to stop';
            toggleBtn.textContent = '⏹️ Stop Pokemon Invasion';
            toggleBtn.classList.add('stop-mode');
        } else {
            statusBtn.className = 'status-btn inactive';
            statusBtn.title = 'Invasion Inactive - Click to start';
            toggleBtn.textContent = '🚀 Start Pokemon Invasion';
            toggleBtn.classList.remove('stop-mode');
        }
    }

    function getCurrentTab(callback) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            callback(tabs[0]);
        });
    }

    function startInvasion() {
        const settings = saveSettings();    
        getCurrentTab(function(tab) {
            chrome.tabs.sendMessage(tab.id, { 
                action: 'startInvasion',
                config: {
                    generation: settings.generation,
                    includeRare: true 
                }
            }, function(response) {
                if (chrome.runtime.lastError) {
                    console.log('Content script not ready, injecting...');
                    // If content script isn't ready, inject it manually
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['js/content.js']
                    }, function() {
                        // Also inject the Pokemon service
                        chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            files: ['js/pokemon-service.js']
                        }, function() {
                            // Try again after injection
                            setTimeout(() => {
                                chrome.tabs.sendMessage(tab.id, { 
                                    action: 'startInvasion',
                                    config: {
                                        generation: settings.generation,
                                        includeRare: true
                                    }
                                });
                            }, 100);
                        });
                    });
                }
                if (response && response.success) {
                    updateUI(true);
                } else if (response && response.error) {
                    console.error('Failed to start invasion:', response.error);
                    alert('Failed to start Pokemon invasion. Please try again.');
                }
            });
        });
    }

    function stopInvasion() {
        getCurrentTab(function(tab) {
            chrome.tabs.sendMessage(tab.id, { action: 'stopInvasion' }, function(response) {
                if (response && response.success) {
                    updateUI(false);
                }
            });
        });
    }

    statusBtn.addEventListener('click', function() {
        getCurrentTab(function(tab) {
            chrome.tabs.sendMessage(tab.id, { action: 'getStatus' }, function(response) {
                if (response && response.isActive) {
                    stopInvasion();
                } else {
                    startInvasion();
                }
            });
        });
    });

    toggleBtn.addEventListener('click', function() {
        getCurrentTab(function(tab) {
            chrome.tabs.sendMessage(tab.id, { action: 'getStatus' }, function(response) {
                if (response && response.isActive) {
                    stopInvasion();
                } else {
                    startInvasion();
                }
            });
        });
    });

    collectionBtn.addEventListener('click', function() {
        chrome.tabs.create({ 
            url: chrome.runtime.getURL('collection.html') 
        });
    });

    getCurrentTab(function(tab) {
        chrome.tabs.sendMessage(tab.id, { action: 'getStatus' }, function(response) {
            if (response && response.isActive) {
                updateUI(true);
            } else {
                updateUI(false);
            }
        });
    });

    const generationInfo = {
        1: 'Classic Pokemon from Red/Blue/Yellow',
        2: 'Pokemon from Gold/Silver/Crystal',
        3: 'Pokemon from Ruby/Sapphire/Emerald',
        4: 'Pokemon from Diamond/Pearl/Platinum',
        5: 'Pokemon from Black/White',
        6: 'Pokemon from X/Y',
        7: 'Pokemon from Sun/Moon',
        8: 'Pokemon from Sword/Shield'
    };

    generationSelect.addEventListener('change', function() {
        const gen = generationSelect.value;
        generationSelect.title = generationInfo[gen] || '';
    });

    generationSelect.title = generationInfo[generationSelect.value] || '';
});