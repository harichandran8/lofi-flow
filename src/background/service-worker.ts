

console.log("LofiFlow service worker started");

chrome.runtime.onInstalled.addListener(() => {
  console.log("LofiFlow extension installed");
});

chrome.runtime.onMessage.addListener((message,_sender,sendResponse)=>{
    if(message.type === "GET_ACTIVE_TAB"){
        chrome.tabs.query(
            {
                active:true,
                currentWindow:true
            },
            (tabs)=>{
                const tab = tabs[0];

                if(!tab){
                    sendResponse({
                        success:false,
                        error:"No active tab found",
                    });

                    return;
                }
                sendResponse({
                    success:true,
                    tab:{
                        id:tab.id,
                        title:tab.title??'unknown Tab',
                        url:tab.url??"",
                    },
                })
            }
        )
        return true;
    }
})