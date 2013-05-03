var flickerAPI = "http://api.flickr.com/services/rest/?";
 var api_key = "1cddd65ff3197c08d166f62ca3722cc6";

 var user_id;
 var username;


function getPhotos(photoset_id, callback){
   $.getJSON( flickerAPI, {
    method: "flickr.photosets.getPhotos",
    photoset_id: photoset_id,
    per_page : 1,
    format: "json",
    api_key: api_key,
    nojsoncallback : 1
  }, callback);
}

function userResponse(rsp){
  if(rsp.stat == "ok"){
    user_id = rsp.user.id;
    username = rsp.user.username._content;
    flickrGetListOfSets(user_id, listOfSetsResponse);
  } else {
    alert("couldn't find a user");
    $("#username").show();
    reset();
    console.error(rsp);
  }
}

function listOfSetsResponse(rsp){
  if(rsp.stat == "ok"){


    $("#sets").html("");

    for(i = 0; i < rsp.photosets.photoset.length; i++){
      var photoset_id = rsp.photosets.photoset[i].id;
      var photoset_title = rsp.photosets.photoset[i].title._content;
      $("#sets").append('<option value="' + photoset_id + '">' + photoset_title + '</option>');
    }
    $("#sets").show();
    $("#loading").hide();

  } else {
    alert("unexpected error happened");
    reset();
    console.error(rsp);
  }
}

function lookupUser(url, callback){
  $.getJSON( flickerAPI, {
    method: "flickr.urls.lookupUser",
    url: url,
    format: "json",
    api_key: api_key,
    nojsoncallback : 1
  }, callback);
}

function flickrGetListOfSets(user_id, callback) {
   $.getJSON( flickerAPI, {
    method: "flickr.photosets.getList",
     user_id: user_id,
    format: "json",
    api_key: api_key,
    nojsoncallback : 1
  }, callback);
}

function flickrGetSetPhotos(photoset_id, callback){
   $.getJSON( flickerAPI, {
    method: "flickr.photosets.getPhotos",
     photoset_id: photoset_id,
    format: "json",
    api_key: api_key,
    nojsoncallback : 1
  }, callback);
}

function buildImgUrl(photo){
  //http://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_[mstzb].jpg
  return "http://farm" + photo.farm + ".staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_s.jpg";
}

function setPhotosResponse(rsp){
  if(rsp.stat == "ok"){
    photo_1 = rsp.photoset.photo[0];
    var imgUrl = buildImgUrl(photo_1);
    console.log(imgUrl);
    $("#img_placeholder").attr("src", imgUrl);

  } else {
    console.error(rsp);
  }
}

$( document ).ready(function() {


});


  function showLoading(){
    $("#go").hide();
    $("#loading").show();
  }

function reset(){
  $("#loading").hide();
    $("#go").show();
}


gadgets.util.registerOnLoadHandler(function() {
    if (!wave || !wave.isInWaveContainer()) {
        return;
    }
  $("#go").click(function() {
     lookupUser($("#username").attr("value"),userResponse);
     $("#username").hide();
     showLoading();
  });

  $("#sets").change(function(){
    photoset_id = $("#sets").val();
    console.log(photoset_id);
    flickrGetSetPhotos(photoset_id, setPhotosResponse);
  });
});