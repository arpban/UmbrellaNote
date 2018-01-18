// const electron = require('electron')
// const app = electron.app
const {app, BrowserWindow, ipcMain} = require('electron')
// const BrowserWindow = electron.BrowserWindow
const path = require('path')
const url = require('url')
const {shell} = require('electron')
// let ipcMain = electron.ipcMain

const {autoUpdater} = require('electron-updater');
// const log = require('electron-log');

// configure logging
// autoUpdater.logger = log;
// autoUpdater.logger.transports.file.level = 'info';
// log.info('App starting...');

let mainWindow

function createWindow() {

	mainWindow = new BrowserWindow({
		frame: false,
		resizable: true,
		width: 1120,
		height: 640
	})
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, '/index.html'),
		protocol: 'file:',
		slashes: true
	}))

	mainWindow.on('closed', function () {
		mainWindow = null
	})

	mainWindow.once('ready-to-show', () => {
		mainWindow.show()
	})

	// mainWindow.setMenu(null)

}


app.on('ready', createWindow)

app.on('window-all-closed', function () {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', function () {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow()
	}
})


ipcMain.on('close-window', () => {
	mainWindow.close();
})
ipcMain.on('minimize-window', () => {
	mainWindow.minimize();
})
ipcMain.on('maximize-window', () => {
	mainWindow.maximize();
})

ipcMain.on('show-signup-in-browser', ()=>{
	shell.openExternal('https://umbrellanote.com')
})



//-------------------------------------------------------------------
// Auto updates
//-------------------------------------------------------------------
const sendStatusToWindow = (text) => {
  // log.info(text);
  if (mainWindow) {
    mainWindow.webContents.send('message', text);
  }
};

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
});

autoUpdater.on('update-available', info => {
  sendStatusToWindow('Update available.');
});

autoUpdater.on('update-not-available', info => {
  sendStatusToWindow('Update not available.');
});

autoUpdater.on('error', err => {
  sendStatusToWindow(`Error in auto-updater: ${err.toString()}`);
});

autoUpdater.on('download-progress', progressObj => {
  sendStatusToWindow(
    `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred} + '/' + ${progressObj.total} + )`
  );
});

autoUpdater.on('update-downloaded', info => {
  sendStatusToWindow('update-downloaded');
  // setTimeout(function() {
  //   autoUpdater.quitAndInstall();  
  // }, 5000)
});

app.on('ready', function()  {
  autoUpdater.checkForUpdates();
});

ipcMain.on('update-now', ()=>{
	autoUpdater.quitAndInstall();
})