function sdp_session_manager() {
  /*

  sdp_session_manager.js by Rob Manson (buildAR.com)

  An SDP parsing and rendering process based on rfc4566 and rfc3264.

  basic usage
  -----------
  var sdp_sm = new sdp_session_manager(); 
  var session = sdp_sm.parse_sdp(sdp_in);
  var sdp_out = sdp_sm.render_sdp(session);

  NOTE: sdp_out should == sdp_in


  The MIT License

  Copyright (c) 2013 Rob Manson, http://buildAR.com. All rights reserved.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
 
  */

  var this_session, state, current_media, current_rtpmap;

  var sm = new sdp_session_manager();

  function sdp_session_manager() {
    return this;
  }

  sm.constructor.prototype.list_rtp_formats = function(i) {
    return this_session.media[i].rtp_formats;
  }

  sm.constructor.prototype.hold = function(i) {
    var m = this_session.media;
    if (i != undefined) {
      if (m[i] != undefined) {
        m[i].mode = "inactive";
      } else {
        console.log("ERROR: invalid media stream - "+i);
      }
    } else {
      if (m.length) {
        for (var i in m) {
          m[i].mode = "inactive";
        }
      } else {
        console.log("WARNING: no media streams in this session");
      }
    }
  }

  sm.constructor.prototype.unhold = function(i, type) {
    var m = this_session.media;
    if (i != undefined) {
      if (m[i] != undefined) {
        if (type != undefined) {
          m[i].mode = type; 
        } else {
          m[i].mode = "sendrecv";
        }
      } else {
        console.log("ERROR: invalid media stream - "+i);
      }
    } else {
      if (m.length) {
        for (var i in m) {
          m[i].mode = "sendrecv";
        }
      } else {
        console.log("WARNING: no media streams in this session");
      }
    }
  }

  sm.constructor.prototype.reject = function(i) {
    var m = this_session.media;
    if (i != undefined) {
      if (m[i] != undefined) {
        if (m[i].description != undefined) {
          m[i].description.port = 0;
        } else {
          console.log("ERROR: invalid media stream - "+i+" (no description)");
        }
      } else {
        console.log("ERROR: invalid media stream - "+i);
      }
    } else {
      if (m.length) {
        for (var i in m) {
          if (m[i].description != undefined) {
            m[i].description.port = 0;
          } else {
            console.log("ERROR: invalid media stream - "+i+" (no description)");
          }
        }
      } else {
        console.log("WARNING: no media streams in this session");
      }
    }
  }

  sm.constructor.prototype.parse_sdp = function(sdp) {
    this_session = {
      session:{
        other_attributes:{},
      },
      media:[],
    };
    state = "session";
    current_media = undefined;
    current_rtpmap = undefined;

    var obj = {};
    var obj_array = [];
    var lines = sdp.split("\r\n");

    for (var line in lines) {
      var kv = lines[line].match(/(.)=(.*)/);
      if (kv) {
        if (state == "session") {
          parse_session(kv[1], kv[2]);
        }
        if (state == "media") {
          parse_media(kv[1], kv[2]);
        }
      }
    }

    return this_session;
  }

  function split_value(value) {
    return value.split(" ");
  }

  function split_attribute_value(value) {
    var match = value.match(/(.*?):(.*)/);
    var key = match[1];
    var value = match[2]; 
    return { key:key, value:value };
  }

  function parse_session(key, value) {
    if (key == "m") {
      state = "media";
    } else if (key == "v") {
      session_param = true;
      this_session.session.version = value;
    } else if (key == "o") {
      session_param = true;
      var origin = split_value(value);
      if (origin.length == 6) {
        this_session.session.username = origin[0];
        this_session.session.id = origin[1];
        this_session.session.version = origin[2];
        this_session.session.net_type = origin[3];
        this_session.session.address_type = origin[4];
        this_session.session.address = origin[5];
      } else {
        console.log("ERROR: invalid origin line ("+value+")");
      }
    } else if (key == "s") {
      session_param = true;
      this_session.session.subject = value;
    } else if (key == "t") {
      session_param = true;
      var time = split_value(value);
      if (time.length == 2) {
        this_session.session.time = {
          start: time[0],
          stop: time[1],
        };
      } else {
        console.log("ERROR: invalid time line ("+value+")");
      }
    } else if (key == "a") {
      session_param = true;
      //value = value.replace(/:\s+/, ":");
      var obj = split_attribute_value(value);
      if (value.match("BUNDLE")) {
        var values = split_value(obj.value);
        this_session.session["group_bundle"] = values.slice(1,values.length);
      } else if (this_session.session.other_attributes[obj.key] == undefined) {
        this_session.session.other_attributes[obj.key] = obj.value;
      } else {
        console.log("ERROR: invalid session attribute ("+key+":"+value+")");
      }    
    }
  }

  function parse_media(key, value) {
    if (key == "m") {
      if (current_media == undefined) {
        current_media = 0;
      } else {
        current_media++;
      }
      if (this_session.media[current_media] == undefined) {
        this_session.media[current_media] = {
          other_attributes: {},
        };
      }
      var media = split_value(value);
      if (media.length > 3) {
        this_session.media[current_media].type = media[0];
        this_session.media[current_media].description = {
          port: media[1],
          protocol: media[2],
          rtp_format_preferences: media.slice(3,media.length),
        };
      } else {
        console.log("ERROR: invalid media line ("+value+")");
      } 
    } else if (key == "c") {
      var connection = split_value(value);
      if (connection.length == 3) {
        this_session.media[current_media].connection = {
          net_type: connection[0],
          address_type: connection[1],
          address: connection[2], 
        };
      } else {
        console.log("ERROR: invalid media line ("+value+")");
      } 
    } else if (key == "a") {
      value = value.replace(/:\s+/, ":");
      if (value.match(/(recvonly|sendrecv|sendonly|inactive)/)) {
        this_session.media[current_media].mode = value;  
      } else {
        var obj = undefined;
        try {
          obj = split_attribute_value(value);
        } catch(e) { };
        if (obj) {
          if (obj.key == "rtpmap") {
            var values = split_value(obj.value);
            var format_id = values[0];
            current_rtpmap = format_id;
            var format_params = values[1].split("/");
            var name = format_params[0];
            var rate = format_params[1];
            if (this_session.media[current_media].rtp_formats == undefined) {
              this_session.media[current_media].rtp_formats = {};
            }
            this_session.media[current_media].rtp_formats[format_id] = {
              name: name,
              rate: rate,
            };
            if (format_params[2] != undefined) {
              this_session.media[current_media].rtp_formats[format_id].encoding_parameter = format_params[2];
            }
          } else if (obj.key == "fmtp") {
            var values = split_value(obj.value);
            this_session.media[current_media].rtp_formats[current_rtpmap].format_parameters = values.splice(1,values.length).join(" "); 
          } else if (obj.key == "candidate") {
            if (this_session.media[current_media].candidates == undefined) {
              this_session.media[current_media].candidates = [];
            }
            this_session.media[current_media].candidates.push(obj.value);
          } else if (obj.key == "ssrc") {
            if (this_session.media[current_media].synchronisation_sources == undefined) {
              this_session.media[current_media].synchronisation_sources = [];
            }
            this_session.media[current_media].synchronisation_sources.push(obj.value);
          } else if (this_session.media[current_media].other_attributes[obj.key] == undefined) {
            this_session.media[current_media].other_attributes[obj.key] = obj.value;
          } else {
            var tmp = this_session.media[current_media].other_attributes[obj.key];
            if (tmp instanceof Array) {
              tmp.push(obj.value);
            } else {
              var tmp2 = [tmp];
              tmp = tmp2;
            }
          }
        } else if (this_session.media[current_media].other_attributes[value] == undefined) {
            this_session.media[current_media].other_attributes[value] = ""; 
        } else {
          var tmp = this_session.media[current_media].other_attributes[value];
          if (tmp instanceof Array) {
            tmp.push("");
          } else {
            var tmp2 = [tmp];
            tmp = tmp2;
          }
        }    
      }
    }
  }

  sm.constructor.prototype.render_sdp = function() {
    var sdp = "";
    sdp += render_session(this_session.session);
    sdp += render_media(this_session.media);
    return sdp;
  }

  function render_line(key, value) {
    return key+"="+value+"\r\n";
  }

  function render_attribute(key, value) {
    if (value == undefined || value == "") {
      return key;
    } else {
      return key+":"+value;
    }
  }

  function render_session(obj) {
    var sdp = "v=0\r\n";
    if (obj.username != undefined 
        && obj.id != undefined 
        && obj.version != undefined 
        && obj.net_type != undefined 
        && obj.address_type != undefined 
        && obj.address != undefined) {
      var o = [obj.username, obj.id, obj.version, obj.net_type, obj.address_type, obj.address].join(" ");
      sdp += render_line("o", o);
    }
    if (obj.subject != undefined) {
      sdp += render_line("s", obj.subject);
    }
    if (obj.time != undefined && obj.time.start != undefined && obj.time.stop != undefined) {
      sdp += render_line("t", obj.time.start+" "+obj.time.stop);
    }
    if (obj.group_bundle != undefined) {
      sdp += render_line("a","group:BUNDLE "+obj.group_bundle.join(" ")); 
    }
    if (Object.keys(obj.other_attributes).length) {
      for (var key in obj.other_attributes) {
        sdp += render_line("a", render_attribute(key, obj.other_attributes[key]));
      }
    }
    return sdp; 
  }

  function render_media(obj) {
    var sdp = "";
    for (var media in obj) {
      var m = obj[media];
      if (m.type != undefined
          && m.description.port != undefined
          && m.description.protocol != undefined
          && m.description.rtp_format_preferences.length) {
        var d = m.description;
        var line = [m.type, d.port, d.protocol].join(" ")+" "+d.rtp_format_preferences.join(" ");
        sdp += render_line("m", line);
      }
      if (m.description.port != 0) {
        if (m.connection != undefined
            && m.connection.net_type != undefined
            && m.connection.address_type != undefined
            && m.connection.address != undefined) {
          var c = m.connection;
          sdp += render_line("c", [c.net_type, c.address_type, c.address].join(" "));
        }
        if (m.mode != undefined) {
          sdp += render_line("a", render_attribute(m.mode)); 
        }
        if (m.rtp_formats != undefined) {
          for (var fid in m.rtp_formats) {
            var f = m.rtp_formats[fid];
            var line = "rtpmap:"+fid+" "+f.name+"/"+f.rate;
            if (f.encoding_parameters != undefined) {
              line += "/"+f.encoding_parameters;
            }
            sdp += render_line("a", line);
            if (f.format_parameters != undefined) {
              sdp += render_line("a", "fmtp:"+fid+" "+f.format_parameters);
            }
          }
        }
        if (m.other_attributes != undefined) {
          if (Object.keys(m.other_attributes).length) {
            for (var key in m.other_attributes) {
              sdp += render_line("a", render_attribute(key, m.other_attributes[key]));
            }
          }
        }
        if (m.candidates != undefined) {
          if (Object.keys(m.candidates).length) {
            for (var id in m.candidates) {
              sdp += render_line("a", "candidate:"+m.candidates[id]); 
            }
          }
        }
        if (m.synchronisation_sources != undefined) {
          if (Object.keys(m.synchronisation_sources).length) {
            for (var id in m.synchronisation_sources) {
              sdp += render_line("a", "ssrc:"+m.synchronisation_sources[id]); 
            }
          }
        }
      }
    }
    return sdp;
  }
  return sm;
}
