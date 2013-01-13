function escape_utf8(data) {
  if (data == '' || data == null){
    return '';
  }
  data = data.toString();
  var buffer = '';
  for(var i=0; i<data.length; i++){
    var c = data.charCodeAt(i);
    var bs = new Array();
    if (c > 0x10000){
    // 4 bytes
      bs[0] = 0xF0 | ((c &amp; 0x1C0000) >>> 18);
      bs[1] = 0x80 | ((c &amp; 0x3F000) >>> 12);
      bs[2] = 0x80 | ((c &amp; 0xFC0) >>> 6);
      bs[3] = 0x80 | (c &amp; 0x3F);
    }else if (c > 0x800){
    // 3 bytes
      bs[0] = 0xE0 | ((c &amp; 0xF000) >>> 12);
      bs[1] = 0x80 | ((c &amp; 0xFC0) >>> 6);
       bs[2] = 0x80 | (c &amp; 0x3F);
    }else if (c > 0x80){
    // 2 bytes
      bs[0] = 0xC0 | ((c &amp; 0x7C0) >>> 6);
      bs[1] = 0x80 | (c &amp; 0x3F);
    }else{
    // 1 byte
      bs[0] = c;
    }
    for(var j=0; j<bs.length; j++){
      var b = bs[j];
       var hex = nibble_to_hex((b &amp; 0xF0) >>> 4) + nibble_to_hex(b &amp;0x0F);
       buffer += '%'+hex;
    }
  }
  return buffer;
}

function nibble_to_hex(nibble){
  var chars = '0123456789ABCDEF';
  return chars.charAt(nibble);
}

