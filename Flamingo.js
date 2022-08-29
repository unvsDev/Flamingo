// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: dove;
// Flamingo Widget v1.1 - by UnvsDev
// Dive into the world of art, in your iPhone.
// Learn More: https://github.com/unvsDev/Flamingo

let today = new Date()
let fm = FileManager.iCloud()
const fDir = fm.joinPath(fm.documentsDirectory(), "/Flamingo/")
const fDir2 = fm.joinPath(fDir, "/artworks/")
const localPath = fm.joinPath(fDir, "artwork.txt")
const prefPath = fm.joinPath(fDir, "flamPref.txt")
var prefData = {
  artist: "!weekly",
  local: 0,
  refresh: 1800,
  title: true,
  rtitle: false,
  load: 0
}

var artworkOrgPref = {
  author: [],
  name: [],
  url: [],
  image: []
}

var bnum = 101 // Do not edit this area

if(!fm.fileExists(fDir)){ fm.createDirectory(fDir) }
if(fm.fileExists(prefPath)){
  prefData = JSON.parse(fm.readString(prefPath))
}
if(!fm.fileExists(localPath)){
  fm.writeString(localPath, JSON.stringify(artworkOrgPref))
  fm.createDirectory(fDir2)
}

var artveeCollections = {
  "Advertising Lithographs" : "https://artvee.com/collection/advertising-lithographs/",
  "Fashion Lithographs" : "https://artvee.com/collection/fashion-lithographs/",
  "Popular American Songs Covers" : "https://artvee.com/collection/popular-american-songs-covers/",
  "Fairy Tale illustrations" : "https://artvee.com/collection/fairy-tale-illustrations-from-elizabeth-tylers-home-and-school-series/",
  "NASA's Visions of the Future" : "https://artvee.com/collection/nasas-visions-of-the-future/",
  "Dietmar Winkler's MIT Posters" : "https://artvee.com/collection/dietmar-winklers-mit-posters/",
  "Book Promo Posters" : "https://artvee.com/collection/book-promo-posters/"
}

var endMode = false
if(config.runsInApp){
  const settings = new UITable()
  settings.showSeparators = true
  
  const info = new UITableRow()
  info.dismissOnSelect = false
  info.addText("Welcome to Flamingo", "Developed by unvsDev")
  settings.addRow(info)
  
  const selectArtist = new UITableRow()
  selectArtist.dismissOnSelect = false
  selectArtist.addText("Set Artwork Filter")
  settings.addRow(selectArtist)
  selectArtist.onSelect = async () => {
    let alert = new Alert()
    alert.title = "Choose Topic"
    alert.message = "What artwork do you want to show in your widget?"
    alert.addAction("Specific Artist")
    alert.addAction("Artvee's Weekly Pick")
    alert.addAction("Special Collections")
    alert.addCancelAction("Cancel")
    
    let response = await alert.present()
    if(response == 0) {
      let inAlert = new Alert()
      inAlert.title = "Type your Artist"
      inAlert.message = "Just type artist's name,\nlike \"Leonardo Da Vinci\"."
      inAlert.addTextField("Leonardo Da Vinci", "")
      inAlert.addAction("Done")
      inAlert.addCancelAction("Cancel")
      
      if(await inAlert.present() != -1){
        prefData.artist = inAlert.textFieldValue()
      }
    } else if(response == 1){
      prefData.artist = "!weekly"
    } else if(response == 2){
      const collectionView = new UITable()
      collectionView.showSeparators = true
      
      for(name in artveeCollections){
        const collectionRow = new UITableRow()
        collectionRow.dismissOnSelect = true
        collectionRow.addText(name)
        collectionView.addRow(collectionRow)
        
        collectionRow.onSelect = async () => {
          prefData.artist = artveeCollections[name]
        }
      }
      
      await collectionView.present()
    }
  }
  
  const selectLocal = new UITableRow()
  selectLocal.dismissOnSelect = false
  selectLocal.addText("Local Artworks")
  settings.addRow(selectLocal)
  selectLocal.onSelect = async () => {
    let alert = new Alert()
    alert.title = "Get Local Artworks?"
    alert.message = "Widget will load only downloaded Artworks, enable you to surf through offline."
    alert.addAction("Always download Artworks")
    alert.addAction("Show only local Artworks")
    alert.addDestructiveAction("Never download Artworks")
    alert.addCancelAction("Cancel")
    
    let response = await alert.present()
    if(response != -1){
      prefData.local = response
    }
  }
  
  const selectRef = new UITableRow()
  selectRef.dismissOnSelect = false
  selectRef.addText("Refresh Interval")
  settings.addRow(selectRef)
  selectRef.onSelect = async () => {
    let alert = new Alert()
    alert.title = "Refresh Interval?"
    alert.message = "Due to iOS Widget policy, refresh could be delayed up to several hours."
    alert.addTextField("(second)", prefData.refresh.toString())
    alert.addAction("Done")
    alert.addCancelAction("Cancel")
    
    let response = await alert.present()
    if(response != -1){
      prefData.refresh = parseInt(alert.textFieldValue())
    }
  }
  
  const selectTitle = new UITableRow()
  selectTitle.dismissOnSelect = false
  selectTitle.addText("Show Artwork's Detail")
  settings.addRow(selectTitle)
  selectTitle.onSelect = async () => {
    let alert = new Alert()
    alert.title = "Show Artwork's Detail?"
    alert.message = "Widget will show Artwork's Name and Author."
    alert.addAction("Yes")
    alert.addAction("No")
    
    let response = await alert.present()
    if(response != -1){
      prefData.title = response ? false : true
    }
  }
  
  const selectRt = new UITableRow()
  selectRt.dismissOnSelect = false
  selectRt.addText("Show Last Refreshed Time")
  settings.addRow(selectRt)
  selectRt.onSelect = async () => {
    let alert = new Alert()
    alert.title = "Show Last Refreshed Time?"
    alert.message = "Widget will show Artwork's last refreshed time."
    alert.addAction("Yes")
    alert.addAction("No")
    
    let response = await alert.present()
    if(response != -1){
      prefData.rtitle = response ? false : true
    }
  }
  
  const selectLoad = new UITableRow()
  selectLoad.dismissOnSelect = false
  selectLoad.addText("Artwork Search Range")
  settings.addRow(selectLoad)
  selectLoad.onSelect = async () => {
    let alert = new Alert()
    alert.title = "Input search range"
    alert.message = "Widget will search this amount of artworks at once. Larger range allows you to find various artworks, However smaller range lets you see artwork faster. Remember that if there's not enough artworks, this range can be ignored."
    alert.addAction("20 (Small)")
    alert.addAction("50 (Medium)")
    alert.addAction("100 (Big)")
    alert.addAction("200 (Large)")
    alert.addCancelAction("Cancel")
    
    let response = await alert.present()
    if(response != -1){
      prefData.load = response
    }
  }
  
  const resetOption = new UITableRow()
  resetOption.dismissOnSelect = true
  resetOption.addText("Reset all data")
  settings.addRow(resetOption)
  resetOption.onSelect = async () => {
    endMode = true
    let alert = new Alert()
    alert.title = "Reset Confirmation"
    alert.message = "Do you really want to reset all data? Since Thanos helps me to delete them, you cannot undo your action."
    alert.addDestructiveAction("Delete only user data")
    alert.addDestructiveAction("Delete all artworks with data")
    alert.addCancelAction("No")
    
    let response = await alert.present()
    if(response == 0){
      await fm.remove(prefPath)
    } else if(response == 1){
      await fm.remove(fDir)
    }
  }
  
  const saveOption = new UITableRow()
  saveOption.dismissOnSelect = true
  saveOption.addText("Save and quit")
  settings.addRow(saveOption)
  saveOption.onSelect = () => {
    endMode = true
  }
  
  await settings.present()
  fm.writeString(prefPath, JSON.stringify(prefData))
}

if(endMode){ return 0 }

prefData = JSON.parse(fm.readString(prefPath))

const artistInput = prefData.artist
const artist = artistInput.replace(/ /gi, "-").toLowerCase()
  
async function loadArts(artist){
  var chunk
  if(prefData.load == 0) { chunk = 20 }
  else if(prefData.load == 1) { chunk = 50 }
  else if(prefData.load == 2) { chunk = 100 }
  else { chunk = 200 }
  
  const baseUrl = 'https://artvee.com'
  var source
  if(artistInput == "!weekly") {
    source = 'https://artvee.com/highlights/'
  } else if(artistInput.indexOf("http") != -1){
    source = artistInput
  } else {
    source = `${baseUrl}/artist/${artist}/?per_page=`+ chunk
  }
  
  let webView = new WebView()
  await webView.loadURL(source)
  
  return webView.evaluateJavaScript(`
     let arts = [...document.querySelectorAll('.products .product-grid-item .product-wrapper')].map((ele) => {
        let productLinkEle = ele.querySelector('.product-element-top')
        let imageEle = productLinkEle.querySelector('img')
        let productInfoEle = ele.querySelector('.product-element-bottom')
        return {
           id: parseInt(productInfoEle.querySelector('.linko').dataset.id),
           title: productInfoEle.querySelector('h3.product-title > a').innerText,
           artist: {
              name: productInfoEle.querySelector('.woodmart-product-brands-links > a').innerText,
              info: productInfoEle.querySelector('.woodmart-product-brands-links').innerText,
              link: productInfoEle.querySelector('.woodmart-product-brands-links > a').getAttribute('href'),
           },
           link: productLinkEle.getAttribute('href'),
           image: {
              link: imageEle.getAttribute('src'),
              width: imageEle.getAttribute('width'),
              height: imageEle.getAttribute('height'),
           }
        }
     }).sort((prev, next) => prev.id - next.id)
                  
     completion(arts)
          `, true)
}

var offlineMode = (prefData.local == 1) ? true : false

let arts = []
try{
  const uServer = "https://github.com/unvsDev/Flamingo/raw/main/VERSION"
  const cServer = "https://github.com/unvsDev/Flamingo/raw/main/Flamingo.js"
  var minVer = parseInt(await new Request(uServer).loadString())
  if(bnum < minVer){
    var code = await new Request(cServer).loadString()
    fm.writeString(fm.joinPath(fm.documentsDirectory(), Script.name() + ".js"), code)
    return 0
  }
} catch(e) {
  offlineMode = true
}

if(!offlineMode){
  arts = await loadArts(artist)
  if(arts.length < 1){
    throw new Error("[!] No result found.")
    return 0
  }
}

let targetArt; let todayIdx
if(offlineMode){
  let localData = JSON.parse(fm.readString(localPath))
  todayIdx = Math.floor(Math.random() * localData.image.length)
  
  var artAuthor = localData.author[todayIdx]
  var artName = localData.name[todayIdx]
  var artUrl = localData.url[todayIdx]
  targetArt = await fm.readImage(fm.joinPath(fDir2, localData.image[todayIdx] + ".jpg"))
} else {
  // console.log('arts: ' + JSON.stringify(arts, null, 4))
  todayIdx = Math.floor(Math.random() * arts.length)
  let todayArt = arts[todayIdx]
  
  var artId = todayArt.id
  var artAuthor = todayArt.artist.info.split("(")[0]
  var artName = todayArt.title.split("(")[0]
  var artUrl = todayArt.link
  
  let localData = JSON.parse(fm.readString(localPath))
  if(localData.image.indexOf(artId) != -1){
    targetArt = await fm.readImage(fm.joinPath(fDir2, artId + ".jpg"))
    console.log("[*] Getting preloaded image.. (" + artId + ")")
  } else {
    targetArt = await new Request(todayArt.image.link).loadImage()
    console.log("[*] Downloaded image.. (" + artId + ")")
  }
  
  if(prefData.local == 0){
    let localData = JSON.parse(fm.readString(localPath))
    if(localData.image.indexOf(artId) == -1){
      localData.author.push(artAuthor)
      localData.name.push(artName)
      localData.image.push(artId)
      localData.url.push(artUrl)
      fm.writeImage(fm.joinPath(fDir2, artId + ".jpg"), targetArt)
      fm.writeString(localPath, JSON.stringify(localData))
    }
  }
}

let widget = new ListWidget()
widget.refreshAfterDate = new Date(Date.now() + 1000 * prefData.refresh)
widget.url = artUrl

widget.addSpacer()

let hStack = widget.addStack()
hStack.layoutHorizontally()

let lStack = hStack.addStack()
lStack.layoutVertically()

lStack.addSpacer()

if(prefData.title){
  let author = lStack.addText(artAuthor)
  author.textColor = Color.white()
  author.font = Font.lightMonospacedSystemFont(12)
  
  let title = lStack.addText(artName)
  title.textColor = Color.white()
  title.font = Font.boldMonospacedSystemFont(15)
}

if(prefData.rtitle){
  let rTitle = lStack.addText("Last updated: " + formatTime(today) + " (" + `${todayIdx + 1} / ${arts.length}` + ", ID: " + artId + ")")
  rTitle.textColor = Color.white()
  rTitle.font = Font.lightMonospacedSystemFont(9)
}
  
function formatTime(date) {
  let df = new DateFormatter()
  df.useNoDateStyle()
  df.useShortTimeStyle()
  return df.string(date)
}

hStack.addSpacer()

let rStack = hStack.addStack()
rStack.layoutVertically()

rStack.addSpacer()

let logo = rStack.addText("FLAMINGO")
logo.textColor = Color.white()
logo.font = Font.blackMonospacedSystemFont(8)

widget.addSpacer(3)

widget.backgroundImage = targetArt
widget.presentLarge()
