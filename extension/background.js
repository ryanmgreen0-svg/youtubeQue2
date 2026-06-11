const APP_URL = 'https://YOUR_GITHUB_PAGES_URL/' // replace with your hosted app URL

chrome.runtime.onInstalled.addListener(()=>{
  chrome.contextMenus.create({
    id:'queue-video',
    title:'Queue video to My Queue',
    contexts:['page','video']
  })
})

chrome.contextMenus.onClicked.addListener((info, tab)=>{
  if(info.menuItemId !== 'queue-video') return
  // ask the page for current video/url/title
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    func: ()=>({href: location.href, title: document.title})
  }).then(results=>{
    const r = results?.[0]?.result
    if(!r) return
    // try to extract v= param
    try{
      const u = new URL(r.href)
      let vid = u.searchParams.get('v')
      if(!vid){ const p=u.pathname.split('/'); vid = p.pop() }
      const title = encodeURIComponent(r.title.replace(/ - YouTube$/i, ''))
      const target = `${APP_URL}?videoId=${vid}&title=${title}`
      chrome.tabs.create({url: target})
    }catch(e){
      chrome.tabs.create({url: APP_URL})
    }
  })
})
