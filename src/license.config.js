const packageData = require('../package.json');

const LICENSE = `/**!
 * @license Emoji-Fallback.js - ${packageData.description}
 * VERSION: ${packageData.version}
 * LICENSED UNDER ${packageData?.license} LICENSE
 * MORE INFO CAN BE FOUND AT https://github.com/MarketingPipeline/Emoji-Fallback.js/
 */`;


const FILENAME = "emojiFallback" // used for output file name

const packageCONFIG = {LICENSE,FILENAME}

module.exports = packageCONFIG
