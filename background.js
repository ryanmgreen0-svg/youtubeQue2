const APP_URL = 'https://ryanmgreen0-svg.github.io/youtubeQue2/' // GitHub Pages URL for your repo

chrome.runtime.onInstalled.addListener(()=>{
  chrome.contextMenus.create({
    id:'queue-video',
    title:'Add to queue',
    contexts:['page','link','image','video']
  })
})

function extractUrlFromInfo(info, tab){
  // Prefer link (e.g., right-clicking title), then src, then page URL
  return info.linkUrl || info.srcUrl || info.pageUrl || (tab && tab.url) || null
}

chrome.contextMenus.onClicked.addListener((info, tab)=>{
  if(info.menuItemId !== 'queue-video') return
  const targetUrl = extractUrlFromInfo(info, tab)
  if(!targetUrl){
    // fallback: try to query page for location/title
    chrome.scripting.executeScript({
      target: {tabId: tab.id},
      func: ()=>({href: location.href, title: document.title})
    }).then(results=>{
      const r = results?.[0]?.result
      if(!r) return
      openQueueTabFor(r.href, r.title)
    }).catch(()=>{})
    return
  }
  // if user right-clicked a plain link, we might not have the page title
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    func: ()=>document.title
  }).then(results=>{
    const pageTitle = results?.[0]?.result || ''
    openQueueTabFor(targetUrl, pageTitle)
  }).catch(()=> openQueueTabFor(targetUrl,null))
})

function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,8) }

function openQueueTabFor(href, title){
  try{
    const u = new URL(href)
    let vid = u.searchParams.get('v')
    if(!vid){ const parts = u.pathname.split('/').filter(Boolean); vid = parts.pop() }
    const item = { id: uid(), url: href, title: title || '', videoId: vid, favorite:false, created: new Date().toISOString() }
    chrome.storage.local.get({queuedItems:[]}, (res)=>{
      const arr = res.queuedItems || []
      arr.unshift(item)
      chrome.storage.local.set({queuedItems: arr})
    })
  }catch(e){
    const item = { id: uid(), url: href||APP_URL, title: title||'', videoId: null, favorite:false, created: new Date().toISOString() }
    chrome.storage.local.get({queuedItems:[]}, (res)=>{
      const arr = res.queuedItems || []
      arr.unshift(item)
      chrome.storage.local.set({queuedItems: arr})
    })
  }
}
