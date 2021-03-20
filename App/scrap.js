let btnscrap = document.getElementById('btnscrap')

btnscrap.addEventListener('click', async ()=>{
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    var port = chrome.tabs.connect(tab.id);
    port.postMessage({acction: 'scraping'});
})




