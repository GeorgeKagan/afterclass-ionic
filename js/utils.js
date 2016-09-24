var dd = function () {
    return console.log.apply(console, arguments);
};
var reportError = function(errorStr) {
    console.error(errorStr);
};