const path = require('path')
const url = require('url')
const {app, BrowserWindow, ipcMain} = require('electron')
const {shell} = require('electron')
const {autoUpdater} = require('electron-updater');

let mainWindow

function createWindow () {

	mainWindow = new BrowserWindow({
		frame: false,
		resizable: true,
		width: 1040,
		height: 580
	})


	const startUrl = process.env.ELECTRON_START_URL || url.format({
		pathname: path.join(__dirname, '/../build/index.html'),
		protocol: 'file:',
		slashes: true
	});
	mainWindow.loadURL(startUrl);

	mainWindow.on('closed', function () {
		mainWindow = null
	})
}

app.on('ready', createWindow)

// Quit when all windows are closed.
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

ipcMain.on('visit-website', () => {
	shell.openExternal("https://umbrellanote.com")
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
  
  setTimeout(function(){
  	autoUpdater.checkForUpdates();
  }, 60000)

});

ipcMain.on('update-now', ()=>{
	autoUpdater.quitAndInstall();
})