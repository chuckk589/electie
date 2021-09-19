import {app, BrowserWindow, shell, dialog } from 'electron'
import '../renderer/store'
const checkDiskSpace = require('check-disk-space').default


/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  checkDiskSpace(process.cwd()).then((diskSpace) => {
    const freeGB = Math.floor(diskSpace.free/1024/1024/1024)
    const options = {
      type: 'info',
      buttons: [],
      title: 'Свободное место',
      message: `Для успешной работы программы требуется минимум 2ГБ свободного пространства на диске, доступно ${freeGB}ГБ`,
    };
    if(freeGB < 2){
      dialog.showMessageBox(null, options, ()=>{
        app.quit()
      })
    }else{
      mainWindow = new BrowserWindow({
        height: 790,
        autoHideMenuBar: true,
        useContentSize: true,
        width: 1688,
        webPreferences: {
          nodeIntegration: true,
          webSecurity: false
        },
      })
      mainWindow.loadURL(winURL)
      if(process.env.NODE_ENV === 'development'){
        BrowserWindow.addDevToolsExtension('node_modules/vue-devtools/vender')
      }
      mainWindow.on('closed', () => {
        mainWindow = null
      })
      mainWindow.webContents.on('new-window', (event, url) => {
        event.preventDefault()
        console.log(url)
        shell.openExternal(url)
      })
    }
  })
  
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
