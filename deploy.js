const args = process.argv.splice(2);
const deploy = require('./config/deploy');
const profileName = args[0] || 'development';
const ftpInfo = deploy(profileName);
const Client = require('ftp');
const Promise = require('promise');
const path = require('path');
const localDist = __dirname + '/dist';
const vinylFtp = require('vinyl-ftp');
const vfs = require('vinyl-fs');
const log = require('fancy-log');

const ftpConfig = {
  username: ftpInfo.user,
  password: ftpInfo.password, // optional, prompted if none given
  host: ftpInfo.host,
  port: ftpInfo.port,
  localRoot: localDist,
  remoteRoot: ftpInfo.dir,
  continueOnError: true
  // exclude: ['.git', '.idea', 'tmp/*']
};

function currentDateTimeStamp() {
  var date = new Date();
  return `${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}:${("0" + date.getSeconds()).slice(-2)}`;
}

function clearOldFiles() {
  console.log('Deleting old files...Please wait~');
  return new Promise((resolve) => {
    let c = new Client();
    c.on('ready', () => {
      // get root files
      c.list(ftpInfo.dir, (err, list) => {
        if (err) throw err;
        // get needed files for delete only (front-end files)
        let deleteFiles = list.filter((f)=> {
          return /^(vendor|main|polyfills|\d+)\..*\.(bundle|chunk|css)/gi.test(f.name) || f.name === 'index.html';
        }).map((f)=> {
          return [ftpInfo.dir, f.name].join('/');
        });

        let deletePromises = [];

        // Delete files
        deleteFiles.forEach((fp)=> {
          deletePromises.push(new Promise((r)=> {
            c.delete(fp, (error)=> {
              r();
            })
          }));
        });

        Promise.all(deletePromises)
          .then(() => {
            console.log('Deleting old files...Done!');
            c.end();
            c.destroy();
            resolve();
          });
      });
    });
    c.connect({
      host: ftpInfo.host,
      port: ftpInfo.port,
      user: ftpInfo.user,
      password: ftpInfo.password,
      secure: ftpInfo.secure
    });
  })
}

function upload() {
  console.log('Start uploading progress...');
  var conn = vinylFtp.create({
    host: ftpConfig.host,
    port: ftpConfig.port,
    user: ftpConfig.username,
    pass: ftpConfig.password,
    log: log,
    parallel: 3,
    maxConnections: 5,
    reload: false, // Clear caches before (each) stream, default is false
    idleTimeout: 360,
    secure: ftpConfig.secure
  });

  var globs = [
    'dist/**'
  ];

  vfs.src(globs, {buffer: false})
    // .pipe(conn.newer(ftpConfig.remoteRoot))
    .pipe(conn.dest(ftpConfig.remoteRoot))
    .on('finish', function () {
      console.log('Upload DONE!');
    })
}

// Delete previous version files first then upload new ones
clearOldFiles()
  .then(upload);

