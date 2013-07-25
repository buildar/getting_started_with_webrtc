getting_started_with_webrtc
===========================

Example code to help you get started creating WebRTC applications

For a full description of how all this code works and other examples described in more details see "Getting started with WebRTC" by Rob Manson, published by Packt Publishing (http://www.packtpub.com/).

webrtc_polyfill.js 
------------------
(included inline within video_call_with_chat_and_file_sharing.html)
This is a simple WebRTC polyfill based loosely on adapter.js by  Adam Barth. It is designed to make it easy to write WebRTC code that runs on different browser implementations (e.g. Chrome, Firefox, etc.).

video_call_with_chat_and_file_sharing.html
------------------------------------------
This is a basic web page that connects a Caller and a Callee via a Web Socket signaling server to support a video call and text based chat with file sharing.  This utilises the new_file_arriving.png and share_new_file.png files in the images directory.

webrtc_signal_server.js
-----------------------
This is a node.js based script that provides Web server and Web Socket server functionality required to support the video_call_with_chat_and_file_sharing.html based WebRTC application.

This requires the "websocket" package that can be installed from the command line by typing "npm install websocket".

To start this server from the command line simply type "node webrtc_signal_server.js" then point your browser at http://localhost:1234
You can replace localhost with any ip address you like and you can replace 1234 with any port you like too.

NOTE: It is important that the ip address you use here is also accessible by the other person you want to join your call, at least via NAT/STUN (e.g. not 127.0.0.1).

