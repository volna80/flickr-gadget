var Flickr = function (api_key){
    this.api_key = api_key;
    this.flickerAPI = "http://api.flickr.com/services/rest/?";
};


Flickr.prototype.getPhotos = function (photoset_id, callback){
   $.getJSON( this.flickerAPI, {
    method: "flickr.photosets.getPhotos",
    photoset_id: photoset_id,
    per_page : 1,
    format: "json",
    api_key: this.api_key,
    nojsoncallback : 1
  }, callback);
};


Flickr.prototype.getListOfSets = function(user_id, callback) {
   $.getJSON( this.flickerAPI, {
    method: "flickr.photosets.getList",
     user_id: user_id,
    format: "json",
    api_key: this.api_key,
    nojsoncallback : 1
  }, callback);
};

Flickr.prototype.lookupUser = function(url, callback){
  $.getJSON( this.flickerAPI, {
    method: "flickr.urls.lookupUser",
    url: url,
    format: "json",
    api_key: this.api_key,
    nojsoncallback : 1
  }, callback);
};

Flickr.prototype.buildImgUrl = function(photo){
  //http://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_[mstzb].jpg
  return "http://farm" + photo.farm + ".staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_s.jpg";
};


function userResponse(rsp){
  if(rsp.stat == "ok"){
    var user_id = rsp.user.id;
    flickr.getListOfSets(user_id, listOfSetsResponse);
  } else {
    alert("couldn't find a user");
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

  } else {
    alert("unexpected error happened");
    console.error(rsp);
  }
}

function setPhotosResponse(rsp){
  if(rsp.stat == "ok"){
    photo_1 = rsp.photoset.photo[0];
    var imgUrl = flickr.buildImgUrl(photo_1);
    console.log(imgUrl);
    $("#img_placeholder").attr("src", imgUrl);

  } else {
    console.error(rsp);
  }
}

var flickr = new Flickr("1cddd65ff3197c08d166f62ca3722cc6");

function init(){

  $("#go").click(function() {
     flickr.lookupUser($("#username").attr("value"),userResponse);
  });

  $("#sets").change(function(){
    photoset_id = $("#sets").val();
    flickr.getPhotos(photoset_id, setPhotosResponse);
  });
}

$( document ).ready(function() {
  init();
});

gadgets.util.registerOnLoadHandler(function() {
    if (!wave || !wave.isInWaveContainer()) {
        return;
    }
    init();
});