var Flickr = function (api_key){
    this.api_key = api_key;
    this.flickerAPI = "http://api.flickr.com/services/rest/?";
};


Flickr.prototype.getPhotos = function (photoset_id, page, callback){
   $.getJSON( this.flickerAPI, {
    method: "flickr.photosets.getPhotos",
    photoset_id: photoset_id,
    per_page : 1,
    format: "json",
    page: page,
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

Flickr.prototype.buildImgUrl = function(photo, size){
  //http://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_[mstzb].jpg
  return "http://farm" + photo.farm + ".staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_" + size + ".jpg";
};


//===========================================================================
//===========================================================================
//===========================================================================


var photo;
var photoset_id;
var mode;
var size;


function userResponse(rsp){
  if(rsp.stat == "ok"){
    var user_id = rsp.user.id;
    console.log("user_id" + user_id);
    flickr.getListOfSets(user_id, listOfSetsResponse);
  } else {
    alert("couldn't look up an user");
    console.error(rsp);
  }
}

function listOfSetsResponse(rsp){
  if(rsp.stat == "ok"){

    $("#sets").html("");

    for(i = 0; i < rsp.photosets.photoset.length; i++){
      var _photoset_id = rsp.photosets.photoset[i].id;
      var _photoset_title = rsp.photosets.photoset[i].title._content;
      $("#sets").append('<option value="' + _photoset_id + '">' + _photoset_title + '</option>');
    }

    photoset_id = $("#sets").val();
    recalc();

  } else {
    alert("unexpected error happened");
    console.error(rsp);
  }
}


function firstPhotos(rsp){
  if(rsp.stat == "ok"){
    photo = rsp.photoset.photo[0];
    refreshImage();
  } else {
    console.error(rsp);
  }
}

function lastPhotos(rsp){
  if(rsp.stat == "ok"){

    if(rsp.photoset.pages == 1){
      //small set
      photo = rsp.photoset.photo[rsp.photoset.photo.length - 1];
      refreshImage();
    } else {
      if(rsp.photoset.page == 1) {
        //request last page
        flickr.getPhotos(photoset_id, rsp.photoset.pages, lastPhotos);
      } else {
        //it should be the latest page
        photo = rsp.photoset.photo[rsp.photoset.photo.length - 1];
        refreshImage();
      }
    }
  } else {
    console.error(rsp);
  }
}

function randomPhotos(rsp){
  if(rsp.stat == "ok"){

    var pages = rsp.photoset.pages;

    if(rsp.photoset.page == 1){
      //I know, we never will show first photo in random mode
      flickr.getPhotos(photoset_id, (Math.random() * pages) % pages, randomPhotos);
    } else {
      photo = rsp.photoset.photo[0];
      refreshImage();
    }

  } else {
    console.error(rsp);
  }
}

function refreshImage(){
  var imgUrl = flickr.buildImgUrl(photo, size);
  console.log(imgUrl);
  $("#img_placeholder").attr("src", imgUrl);

  //up
  $("#img_placeholder").load(function(){
      gadgets.window.adjustHeight();
    });

}

function recalc(){
    flickr.getPhotos(photoset_id, 1, function(rsp){
        window[mode](rsp);
    });
  }


var flickr = new Flickr("1cddd65ff3197c08d166f62ca3722cc6");

function init(){

  size = $("#photo_size").val();
  mode = $("#mode").val();

  $("#username").change(function() {
     flickr.lookupUser($("#username").attr("value"),userResponse);
  });

  $("#sets").change(function(){
    photoset_id = $("#sets").val();
    recalc();
  });

  $("#photo_size").change(function(){
    size = $("#photo_size").val();
    refreshImage();
  });

  $("#mode").change(function(){
    mode = $("#mode").val();
    recalc();
  });

  $("#save").click(function(){

    $("#form").fadeOut();

    var state = wave.getState();
    state.submitDelta({photoset_id: photoset_id});
    state.submitDelta({photo_farm:photo.farm});
    state.submitDelta({photo_server:photo.server});
    state.submitDelta({photo_id:photo.id});
    state.submitDelta({photo_secret:photo.secret});
    state.submitDelta({size:size});
    state.submitDelta({mode:mode});
  });

}


$( document ).ready(function() {
  init();
});

gadgets.util.registerOnLoadHandler(function() {
    if (!wave || !wave.isInWaveContainer()) {
        return;
    }

    console.log(wave.getState());

    if(wave.getState() != null && wave.getState().get('photo_id') != null){

      $("#form").hide();

      photo = new Object();
      photo.id = wave.getState().get('photo_id');
      photo.farm = wave.getState().get('photo_farm');
      photo.server = wave.getState().get('photo_server');
      photo.secret = wave.getState().get('photo_secret');
      photoset_id = wave.getState().get("photoset_id");
      size = wave.getState().get("size");
      mode = wave.getState().get("mode");
      recalc();
    } else {

      $("#form").show();

      init();
    }
});