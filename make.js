
const child_process = require( 'child_process' )
    , spawn = child_process.spawn
    , fs = require( 'fs' )
    , path = require( 'path' )

    , spawnOption = {
    detached: true,
    stdio: [ 0, 'pipe', 'pipe' ]
}

    , frame = '@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@';


//------------------------------------------------------------
//
// NPM init & install modules
//
//------------------------------------------------------------


/**
 * terminal 명령어를 실행한다.
 * 1. Promise를 반환하여 비동기 처리를 할 수 있다.
 * @param  {[type]} command [description]
 * @param  {[type]} opt     [description]
 * @return {[type]}         [description]
 */
function terminal( command, opt ){

    const a = command.split( ' ' ),
        cmd = a[0],
        args = a.slice(1);

    const child = spawn( cmd, args, opt || spawnOption );

    return new Promise( (resolve, reject) =>{

        child.stdout.on( 'data', data => console.log( "-", data.toString() ) );
        child.stderr.on( 'data', data => console.log( "x", data.toString() ) );

        child.on( 'close', code =>{

            if( code == 0 ) return resolve(code);

            return reject(code);
        })
    });
}

/**
 * log와 함께 command를 실행한다.
 * @param  {[type]} message [description]
 * @param  {[type]} command [description]
 * @return {[type]}         [description]
 */
function exec( log, command ){

    alert( log );

    return terminal( command );
}

/**
 * 프로젝트 설정에 필요한 터미널 명령어 배열.
 * 1. 로그 메세지, 터미널 명령어의 두 개가 한 쌍으로 이루어진다.
 * @type {Array}
 */
const nodemodules = [
    // npm 초기화
    'Initialize NPM & Install Node Modules', 'npm init',
    // install babel
    'Install Babel-Core', 'npm install babel-core --save',
    'Install Babel-Cli', 'npm install babel-cli --save',
    'Install Babel-Plugin-Transform-Runtime', 'npm install babel-plugin-transform-runtime --save-dev',
    'Install Babel-Runtime', 'npm install babel-runtime --save',
    'Install Babel-polyfill', 'npm install babel-polyfill --save',
    'Install Babel-Preset-Latest', 'npm install babel-preset-latest --save',
    // install webpack
    'Install Webpack', 'npm install webpack --save',
    'Install Babel-loader', 'npm install babel-loader --save',
    'Install Webpack-Dev-Server', 'npm install webpack-dev-server --save-dev',
];

/**
 * npm 초기화 & es6 프로젝트에 필요한 패키지 설치.
 * 1. nodemodules 배열안의 모든 명령어가 모두 실행될 때까지 자신을 호출한다.
 * @return {[type]} [description]
 */
function installNodeModules( nodemodules ){

    return new Promise( (resolve, reject) =>{

        (function recursive(){

            if( nodemodules.length == 0 )
                return resolve( null );

            exec( nodemodules.shift(), nodemodules.shift() )
                .then( recursive )
                .catch( e => reject(e) );
        })();
    });
}




//------------------------------------------------------------
//
// MakeDirectories
//
//------------------------------------------------------------

/**
 * fs.mkdir를 이용해 name 디렉토리를 생성한다.
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
function mkdir( name ){

    return new Promise( ( resolve, reject ) =>{

        fs.mkdir( path.resolve( __dirname, name ), err =>{

            if( err && err.code != 'EEXIST' ) return reject(err);

            resolve(null);
        })
    })
}

/**
 * 프로젝트에 필요한 디렉토리를 추가한다.
 * @type {Array}
 */
const paths = [
    'src',
    'dist',
];

/**
 * paths 배열안의 모든 디렉토리를 생성한다.
 * @param  {[type]} paths [description]
 * @return {[type]}       [description]
 */
function makeDirectories( paths ){

    return new Promise( (resolve, reject) =>{

        (function recursive(){

            if( paths.length == 0 )
                return resolve( null );

            mkdir( paths.shift() )
                .then( recursive )
                .catch( e => reject(e) );

        })();
    })
}




//------------------------------------------------------------
//
// Make Files
//
//------------------------------------------------------------


/**
 * fs.writeFile을 이용해 프로젝트에 필요한 기본 파일을 생성한다.
 * @param  {[type]} name    [description]
 * @param  {[type]} content [description]
 * @return {[type]}         [description]
 */
function writeFile( name, content ){

    return new Promise( (resolve, reject) =>{

        fs.writeFile( path.resolve( __dirname, name ), content, err =>{

            if( err ) return reject( err );

            resolve();
        });
    })
}


const templates = [
    '.babelrc', 				'{\n\t\'presets\': [ \'latest\' ],\n\t\'plugins\': [ \n\t\t[ \'transform-runtime\', {\n\t\t\t\'helpers\': true,\n\t\t\t\'polyfill\': true,\n\t\t\t\'regenerator\': true,\n\t\t\t\'moduleName\': \'babel-runtime\'\n\t\t}]\n\t]\n}',
    'webpack.config.js', 		'/**\n * webpack is fed via a configuration object. \n * It is passed in one of two ways depending on how you are using webpack: through the terminal or via Node.js. \n * All the available configuration options are specified below.\n * @ https://webpack.js.org/configuration/\n */\n\nconst path = require( \'path\' );\n\nmodule.exports = {\n\n\t// The point or points to enter the application. \n\t// At this point the application starts executing. \n\t// If an array is passed all items will be executed.\n\t// @ https://webpack.js.org/configuration/entry-context/#entry\n\tentry: {\n\t\tindex: \'./src/index.js\',\n\t},\n\n\t// The top-level output key contains set of options instructing \n\t// webpack on how and where it should output your bundles, \n\t// assets and anything else you bundle or load with webpack.\n\t// @ https://webpack.js.org/configuration/output/\n\toutput: {\n\t\tfilename: \'[name].bundle.js\',\n\t\tpath: path.resolve( __dirname, \'dist\' )\n\t},\n\n\t// These options determine how the different types of modules \n\t// within a project will be treated.\n\t// @ https://webpack.js.org/configuration/module/\n\tmodule: {\n\n\t\t// An array of Rules which are matched to requests when modules are created. \n\t\t// These rules can modify how the module is created. \n\t\t// They can apply loaders to the module, or modify the parser.\n\t\t// @ https://webpack.js.org/configuration/module/#module-rules \n\t\trules: [\n\t\t\t{\n\t\t\t\t// A RegExp Condition: It\'s tested with the input.\n\t\t\t\ttest: /\\.js$/,\n\t\t\t\t//  The Condition must match. The convention is the provide \n\t\t\t\t//  a string or array of strings here, but it\'s not enforced.\n\t\t\t\tinclude: [\n\t\t\t\t\tpath.resolve( __dirname, \'src\' ),\n\t\t\t\t],\n\t\t\t\t//  The Condition must NOT match. The convention is the provide \n\t\t\t\t//  a string or array of strings here, but it\'s not enforced.\n\t\t\t\texclude: [\n\t\t\t\t\tpath.resolve( __dirname, \'node_modules\' ),\n\t\t\t\t],\n\t\t\t\t// A list of UseEntries which are applied to modules. \n\t\t\t\t// Each entry specifies a loader to be used.\n\t\t\t\t// @ https://webpack.js.org/configuration/module/#rule-use\n\t\t\t\tuse: [\n\t\t\t\t\t{\n\t\t\t\t\t\tloader: \'babel-loader\'\n\t\t\t\t\t},\n\t\t\t\t]\n\t\t\t}\n\t\t]\n\t},\n\n\t// These options change how modules are resolved. \n\t// webpack provides reasonable defaults, \n\t// but it is possible to change the resolving in detail. \n\t// Have a look at Module Resolution for more explanation of how the resolver works.\n\t// @ https://webpack.js.org/configuration/resolve/\n\tresolve: {\n\t\tmodules: [\n\t\t\t\'node_modules\',\n\t\t]\n\t},\n\n\t// This option controls if and how Source Maps are generated.\n\t// @ https://webpack.js.org/configuration/devtool/\n\tdevtool: \'source-map\', // or \'eval\' for development\n\n\t// webpack can compile for multiple environments or targets.\n\t// @ https://webpack.js.org/configuration/target/\n\ttarget: \'web\',\n\n\t// This set of options is picked up by webpack-dev-server \n\t// and can be used to change its behavior in various ways. \n\t// @ https://webpack.js.org/configuration/dev-server/\n\tdevServer: {\n\t\tcontentBase: path.join( __dirname, \'dist\' ), // boolean | string | array, static file location\n\t\tcompress: true, // boolean | string | array, static file location\n\t\t// It is possible to configure advanced options for serving static files from contentBase.\n\t\t// @ http://expressjs.com/en/4x/api.html#express.static\n\t\tstaticOptions: {\n\t\t\tredirect: true\n\t\t},\n\t\t// Control options related to watching the files.\n\t\twatchOptions: {\n\t\t\tpoll: true\n\t\t}\n\t}\n} \n',
    'dist/index.html', 			'<html>\n<head>\n\t<title></title>\n\t<script type="text/javascript" src=\'index.bundle.js\'></script>\n</head>\t\n<body>\n</body>\n</html>',
    'src/index.js', 			'document.write( `project intialized at ${navigator.userAgent}` )'
];

/**
 * gulp.js, webpack.config.js, babelrc등 프로젝트 설정에 필요한 파일들을 생성한다.
 * @return {[type]} [description]
 */
function makeFiles( templates ){

    return new Promise( (resolve, reject) =>{

        (function recursive(){

            if( templates.length == 0 )
                return resolve( null );

            writeFile( templates.shift(), templates.shift() )
                .then( recursive )
                .catch( e => reject(e) );

        })();
    })
}




//------------------------------------------------------------
//
// Modify Package.json
//
//------------------------------------------------------------

/**
 * package.json 파일에 wepack script 추가.
 * @return {[type]} [description]
 */
function modifyPackageJson(){

    return readFile( 'package.json' )
        .then( string => writeScript( string, scripts ) )
        .then( string => writeFile( 'package.json', string ) );
}

/**
 * 파일을 읽어들여 string으로 반환한다.
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
function readFile( name ){

    return new Promise( (resolve, reject) => {

        fs.readFile( path.resolve( __dirname, name ), (err, data) =>{

            if( err ) return reject(err);

            resolve( data.toString() );
        });
    })
}

const scripts = {
    webpack: 'webpack',
    dev: 'webpack-dev-server --open'
}

/**
 * [writeScript description]
 * @param  {[type]} string  [description]
 * @param  {[type]} scripts [description]
 * @return {[type]}         [description]
 */
function writeScript( string, scripts ){

    var o = JSON.parse( string );

    o.scripts = o.scripts || {};

    Object.assign( o.scripts, scripts )

    return JSON.stringify( o, null, 4 );
}


/**
 * 실행.
 */
installNodeModules( nodemodules )
    .then( () => makeDirectories( paths ) )
    .then( () => makeFiles( templates ) )
    .then( () => modifyPackageJson() )
    .then( () => alert( 'Project Initialization Complete' ) )
    .then( () => terminal( 'npm run dev' ) )
    .catch( e => console.warn(e) );



//------------------------------------------------------------
//
// Utils
//
//------------------------------------------------------------

/**
 * 문자열 반복
 * @param  {[type]} char [description]
 * @param  {[type]} len  [description]
 * @return {[type]}      [description]
 */
function repeat( char, len ){

    var c = '';

    for( ; len-- ; ) c += char;

    return c;
}

/**
 * makeLine( 'test', '*', 10 ) -> '*   test  *' ; 반환.
 * @param  {[type]} text [description]
 * @param  {[type]} char [description]
 * @param  {[type]} len  [description]
 * @return {[type]}      [description]
 */
function makeLine( text, char, len ){

    var s = repeat( ' ', len ).split( '' );

    s[0] = char;
    s[ s.length - 1 ] = char;

    text = text.slice( 0, len - 2 );

    var start = ( len - text.length ) / 2 | 0;

    for( var i = 0; i < text.length; i++ ){
        s[ start + i ] = text.charAt(i);
    }

    return s.join('');
}

/**
 * alert 메세지 생성.
 * @param  {[type]} message [description]
 * @return {[type]}         [description]
 */
function alert( message ){

    const char = frame.charAt(0),
        a = [
            frame,
            makeLine( ' ', char, frame.length ),
            makeLine( message, char, frame.length ),
            makeLine( ' ', char, frame.length ),
            frame,
        ];

    console.log( a.join( '\n' ) );
}