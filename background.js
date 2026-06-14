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
  // Try to extract the clicked element's text/title from the page first
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    func: (target)=>{
      try{
        const norm = (h)=>{ try{ return new URL(h, location.href).href }catch(e){return null} }
        const els = Array.from(document.querySelectorAll('a,area,link,img,button,source'))
        for(const e of els){
          const href = e.href || e.getAttribute('href') || e.src || e.getAttribute('src')
          if(!href) continue
          const full = norm(href)
          if(full === target){
            return (e.getAttribute('aria-label')||e.getAttribute('title')||e.alt||e.textContent||'').trim()
          }
        }
      }catch(e){}
      return ''
    },
    args: [targetUrl]
  }).then(results=>{
    const linkText = results?.[0]?.result || ''
    if(linkText){ openQueueTabFor(targetUrl, linkText); return }
    // fallback: use page title if we can't find a matching element text
    chrome.scripting.executeScript({ target: {tabId: tab.id}, func: ()=>document.title })
      .then(results2=>{ const pageTitle = results2?.[0]?.result || ''; openQueueTabFor(targetUrl, pageTitle) })
      .catch(()=> openQueueTabFor(targetUrl,null))
  }).catch(()=> openQueueTabFor(targetUrl,null))
})

function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,8) }
async function fetchPageTitle(url){
  try{
    const res = await fetch(url)
    const txt = await res.text()
    // try to parse og:title/twitter:title or fallback to <title>
    let doc
    try{ doc = new DOMParser().parseFromString(txt, 'text/html') }catch(e){ doc = null }
    if(doc){
      const og = doc.querySelector('meta[property="og:title"]')?.getAttribute('content')
      const tw = doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content')
      const t = doc.querySelector('title')?.textContent
      return (og||tw||t||'').trim()
    }
    // fallback: regex for title
    const m = txt.match(/<title[^>]*>([^<]+)<\/title>/i)
    return m ? m[1].trim() : ''
  }catch(e){ return '' }
}

function openQueueTabFor(href, title){
  // fetch the page title when possible to ensure queued item title matches the target
  (async ()=>{
    try{
      const fetched = await fetchPageTitle(href)
      const finalTitle = fetched || title || ''
      const u = new URL(href)
      let vid = u.searchParams.get('v')
      if(!vid){ const parts = u.pathname.split('/').filter(Boolean); vid = parts.pop() }
      const item = { id: uid(), url: href, title: finalTitle, videoId: vid, favorite:false, created: new Date().toISOString() }
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
  })()
}
