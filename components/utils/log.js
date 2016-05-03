function pad(str, len) {
  while(str.length < len) {
    str += ' ';
  }
  return str;
};

module.exports = function(ns, msg) {
  console.log(`do:${pad(ns, 8)} ${JSON.stringify(msg)}`)
};
