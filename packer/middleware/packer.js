module.exports = function(config) {
    var noProblem = true;
    if(config.framework === undefined) {
        console.log("Незадан параметр \"framework\" в конфиге packer");
        noProblem = false;
    }

    if(config.imgCompressPolicy === undefined) {
        console.log("Незадан параметр \"imgCompressPolicy\" в конфиге packer");
        noProblem = false;
    }

    if(config.pugOrganizationCodePolicy === undefined) {
        console.log("Незадан параметр \"pugOrganizationCodePolicy\" в конфиге packer");
        noProblem = false;
    }

    return noProblem;
};