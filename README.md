getting_started_with_webrtc
===========================

Example code to help you get started creating your own WebRTC applications. This application is designed to help you quickly and easily work out how WebRTC works under the hood and is written with a focus on readability. It is designed to make the Offer/Answer call setup process less opaque than the example code provided in the WebRTC API specification documents. It is not intended as a WebRTC API wrapper that hides all the complexity under a high level abstraction. Instead it provides a fully working example application with video calls, text chat and drag and drop file sharing.  It is the perfect launch point for anyone who wants to start developing their own WebRTC application and in the process really learn how the WebRTC API and signaling works.

For a full description of how all this code works and other examples described in more details see "Getting started with WebRTC" by Rob Manson, published by Packt Publishing (http://www.packtpub.com/getting-started-with-webrtc/book).

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

This requires the "websocket" package that can be installed from the command line by typing `npm install websocket`.

or `npm install` from the project root

To start this server from the command line simply type "node webrtc_signal_server.js" then point your browser at http://localhost:1234
You can replace localhost with any ip address you like and you can replace 1234 with any port you like too.

IMPORTANT: If you are trying to access this node server from more than one computer you MUST replace "localhost" with an IP address that can be accessed by all of these computers, at least via NAT/STUN (e.g. not 127.0.0.1). Firewalls may also limit access to port 1234 so this may also need to be updated. 

Extras
======

image_processing_pipeline.html
------------------------------
This code is designed to help you explore how the Video/Canvas processing pipeline works. The coding style is focused on clearly describing the concepts and is not designed to be used as production code.

The key concepts covered are:
- the Video/Canvas pipeline
- Array Buffers vs Views
- efficient frame buffer processing using multiple Views

sdp_session_manager.js & sdp_session_manager.html
-------------------------------------------------
This is a parser/renderer and example page designed to help you quickly get started exploring how to manipulate SDP based WebRTC sessions through javascript. None of this code deals with the actual sending/adding of SDP to any of the peers. This code simply handles the parsing, manipulation and rendering of SDP.

All feedback and discussion about the structure of the Javascript Object Model that represents the session is welcome.

All pull requests that improve the parsing and rendering is very welcome 8)
