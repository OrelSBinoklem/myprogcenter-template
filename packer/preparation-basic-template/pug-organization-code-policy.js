'use strict';
const fs = require('fs');
const path = require('path');
const copydir = require('copy-dir');

module.exports = function(config) {
    if( !fs.existsSync(path.join(process.cwd(), config.src, '/main.pug')) && !fs.existsSync(path.join(process.cwd(), config.src, 'pug/layouts/site.pug'))  ) {
        if(config.pugOrganizationCodePolicy == "extends") {
            copydir.sync(path.join(process.cwd(), 'packer/preparation-basic-template/pug-organization-code-policy/extends'), path.join(process.cwd(), config.src));
        } else if(config.pugOrganizationCodePolicy == "includes") {
            copydir.sync(path.join(process.cwd(), 'packer/preparation-basic-template/pug-organization-code-policy/includes'), path.join(process.cwd(), config.src));
        }
    }
};