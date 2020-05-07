//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;
 
var gumStream; //stream from getUserMedia()
var rec; //Recorder.js object
var input; //MediaStreamAudioSourceNode we'll be recording
 
// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContext; //new audio context to help us record
 
var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");
var pauseButton = document.getElementById("pauseButton"); 
 
//add events to those 3 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
pauseButton.addEventListener("click", pauseRecording);



function startRecording() {
    console.log("recordButton clicked");
 
    /*
    Simple constraints object, for more advanced audio features see
    <div class="video-container"><blockquote class="wp-embedded-content" data-secret="vNsz0nPBL4"><a href="https://addpipe.com/blog/audio-constraints-getusermedia/">Supported Audio Constraints in getUserMedia()</a></blockquote><iframe class="wp-embedded-content" sandbox="allow-scripts" security="restricted" style="position: absolute; clip: rect(1px, 1px, 1px, 1px);" src="https://addpipe.com/blog/audio-constraints-getusermedia/embed/#?secret=vNsz0nPBL4" data-secret="vNsz0nPBL4" width="600" height="338" title="“Supported Audio Constraints in getUserMedia()” — Pipe Blog" frameborder="0" marginwidth="0" marginheight="0" scrolling="no"></iframe></div>
    */
 
    var constraints = { audio: true, video:false }
 
    /*
    Disable the record button until we get a success or fail from getUserMedia()
    */
 
    recordButton.disabled = true;
    stopButton.disabled = false;
    pauseButton.disabled = false;
 
    /*
    We're using the standard promise based getUserMedia()
    https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    */
 
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        console.log("getUserMedia() success, stream created, initializing Recorder.js ...");
 
        /* assign to gumStream for later use */
        gumStream = stream;
 
        /* use the stream */
        input = audioContext.createMediaStreamSource(stream);
 
         
        // Create the Recorder object and configure to record mono sound (1 channel)
        // Recording 2 channels  will double the file size
        
        rec = new Recorder(input,{numChannels:1})
 
        //start the recording process
        rec.record()
 
        console.log("Recording started");
 
    }).catch(function(err) {
        //enable the record button if getUserMedia() fails
        recordButton.disabled = false;
        stopButton.disabled = true;
        pauseButton.disabled = true
    });
}


function pauseRecording(){
    console.log("pauseButton clicked rec.recording=",rec.recording );
    if (rec.recording){
        //pause
        rec.stop();
        pauseButton.innerHTML="Resume";
    }else{
        //resume
        rec.record()
        pauseButton.innerHTML="Pause";
    }
}


function stopRecording() {
    console.log("stopButton clicked");
 
    //disable the stop button, enable the record too allow for new recordings
    stopButton.disabled = true;
    recordButton.disabled = false;
    pauseButton.disabled = true;
 
    //reset button just in case the recording is stopped while paused
    pauseButton.innerHTML="Pause";
 
    //tell the recorder to stop the recording
    rec.stop();
 
    //stop microphone access
    gumStream.getAudioTracks()[0].stop();
 
    //create the wav blob and pass it on to createDownloadLink
    rec.exportWAV(sendToMongo);
}


function sendToMongo(blob,err){
	if (err){
		console.log(err);
	}
	var fd = new FormData();
	fd.append('fname', 'test.wav');
	fd.append('data', blob);
	console.log('Hello')
	$.ajax({
	    type: 'POST',
	    url: '/recordings',
	    data: fd,
	    processData: false,
	    contentType: false
	}).done(function(data) {
	       console.log(data);
	});
}


