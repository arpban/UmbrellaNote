'use strict';

// const electron = require('electron')
// const app = electron.app
var _require = require('electron'),
    app = _require.app,
    BrowserWindow = _require.BrowserWindow,
    ipcMain = _require.ipcMain;
// const BrowserWindow = electron.BrowserWindow


var path = require('path');
var url = require('url');

var _require2 = require('electron'),
    shell = _require2.shell;
// let ipcMain = electron.ipcMain

var _require3 = require('electron-updater'),
    autoUpdater = _require3.autoUpdater;
// const log = require('electron-log');

// configure logging
// autoUpdater.logger = log;
// autoUpdater.logger.transports.file.level = 'info';
// log.info('App starting...');

var mainWindow = void 0;

function createWindow() {

	mainWindow = new BrowserWindow({
		frame: false,
		resizable: true,
		width: 1120,
		height: 640
	});
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, '/index.html'),
		protocol: 'file:',
		slashes: true
	}));

	mainWindow.on('closed', function () {
		mainWindow = null;
	});

	mainWindow.once('ready-to-show', function () {
		mainWindow.show();
	});

	// mainWindow.setMenu(null)
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', function () {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow();
	}
});

ipcMain.on('close-window', function () {
	mainWindow.close();
});
ipcMain.on('minimize-window', function () {
	mainWindow.minimize();
});
ipcMain.on('maximize-window', function () {
	mainWindow.maximize();
});

ipcMain.on('show-signup-in-browser', function () {
	shell.openExternal('https://umbrellanote.com');
});

//-------------------------------------------------------------------
// Auto updates
//-------------------------------------------------------------------
var sendStatusToWindow = function sendStatusToWindow(text) {
	// log.info(text);
	if (mainWindow) {
		mainWindow.webContents.send('message', text);
	}
};

autoUpdater.on('checking-for-update', function () {
	sendStatusToWindow('Checking for update...');
});

autoUpdater.on('update-available', function (info) {
	sendStatusToWindow('Update available.');
});

autoUpdater.on('update-not-available', function (info) {
	sendStatusToWindow('Update not available.');
});

autoUpdater.on('error', function (err) {
	sendStatusToWindow('Error in auto-updater: ' + err.toString());
});

autoUpdater.on('download-progress', function (progressObj) {
	sendStatusToWindow('Download speed: ' + progressObj.bytesPerSecond + ' - Downloaded ' + progressObj.percent + '% (' + progressObj.transferred + ' + \'/\' + ' + progressObj.total + ' + )');
});

autoUpdater.on('update-downloaded', function (info) {
	sendStatusToWindow('update-downloaded');
	// setTimeout(function() {
	//   autoUpdater.quitAndInstall();  
	// }, 5000)
});

app.on('ready', function () {
	autoUpdater.checkForUpdates();
});

ipcMain.on('update-now', function () {
	autoUpdater.quitAndInstall();
});