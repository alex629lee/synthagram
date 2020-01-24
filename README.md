<p align="center">
  <a href="http://synthagram.herokuapp.com/">
    <img height="200px" src="https://github.com/eliraybon/synthagram/blob/master/client/public/synthagram-favicon.png">
  </a>
</p>


# <h1 align="center">Synthagram</h1>

#### [Live Link](http://synthagram.herokuapp.com/)

Synthagram is a music-themed clone of Instagram built with the MERN stack + GraphQL/Apollo. The design is simple, clean, and mobile-first, resulting in an app that is responsive across all screen sizes. 

Created by Alex Lee and Eli Raybon over 3 days. 

## Technologies 
- React
- Node
- MongoDB
- Express
- GraphQL
- Apollo
- Dropzone
- AWS S3
- Multer (for uploading to S3)
- BCrypt (for user auth)
- jQuery
- HTML
- CSS 

## Features
-  Drag n' drop file uploads
-  Photo upload previews
-  Double tap photo likes 
-  Comments and nested replies
-  Following and unfollowing users 
-  Search Bar
-  User Authentication


---


## Mobile-First Design

One of our main goals for this application was to create a responsive user interface that provides a visually-pleasing and content-rich experience across all devices. We wanted our application to be as clean and minimal as Instagram, while still applying our thematic twist. 


<p align="center">
  <img height="600px" width="350px" src="https://github.com/alex629lee/synthagram/blob/master/client/public/assets/images/prof2.png">
  <img height="600px" width="350px" src="https://github.com/alex629lee/synthagram/blob/master/client/public/assets/images/photo-show-mobile.png">
</p>


Of course, we wanted to adopt Instagram's signature squares in our implementation for displaying both enlarged images and thumbnails. 

For the thumbnails, this meant creating a responsive CSS grid-based layout system which appropriately resizes and positions the content according to the width of the viewport. At some point, the thumbnail images would need to stop growing in size and instead be spaced out and centered, which we accomplished using carefully established media query breakpoints. 

Shown below is an example of the grid's behavior on a large desktop window.

<p align="center">
  <img src="https://github.com/alex629lee/synthagram/blob/master/client/public/assets/images/prof1.png">
</p>

The desktop interface includes some additional features such as showing a modal on hover of a thumbnail image, which displays the number of likes and comments for that photo. 


---


## Double-Tap to Like Photos

When viewing someone's post, the user can like and unlike the photo by quickly tapping/clicking it twice. We added a modal that appears when a user likes a photo via double-tapping to convey a more interactive experience. 


<p align="center">
  <img height="600px" src="https://github.com/eliraybon/synthagram/blob/master/client/public/assets/images/feed1.PNG">
  <img height="600px" src="https://github.com/eliraybon/synthagram/blob/master/client/public/assets/images/feed2.PNG">
</p>


To have this modal transition smoothly in and out, we integrated jQuery into our application and used the jQuery `animate` function combined with some React.js code to determine whether the timing of the two taps were close enough in time to trigger a "like" event.


```javascript
handleTap = photoId => {
  if (this.state.tapped) {
    const likeButton = document.getElementById(`toggle-like-${photoId}`);
    likeButton.click();
    if (!likeButton.children[0].classList[2]) {
      $(`#just-liked-modal-${photoId}`).animate({ opacity: 1 }, 200);
      this.setState({ justLiked: true });

      setTimeout(() => {
        this.setState({ justLiked: false });
        $(`#just-liked-modal-${photoId}`).animate({ opacity: 0 }, 600);
      }, 1000);
    }
  } else {
    this.setState({ tapped: true });
    setTimeout(() => this.setState({ tapped: false }), 500);
  }
}
```



## Photo Uploads using AWS S3

Users can post pictures using the drag and drop file uploader (desktop) or by tapping the upload box (mobile). On mobile, the uploader gives you easy access to your camera roll. Once a photo is chosen, you're given a preview to make sure everything looks good before posting!


<p align="center">
  <img height="600px" src="https://github.com/eliraybon/synthagram/blob/master/client/public/assets/images/post1.PNG">
  <img height="600px" src="https://github.com/eliraybon/synthagram/blob/master/client/public/assets/images/post2.PNG">
</p>


When users upload photos, the photos are stored using AWS S3 Cloud services, allowing for our application to have faster performance and improved scalability. 


In addition, the feed is populated by the most recent photos from the users you follow, and photos in the feed are sorted using a recursive quicksort algorithm. 

```js
sortByDate = photos => {
  if (photos.length < 2) return photos;

  const pivotPhoto = photos[0];
  let older = photos.slice(1).filter(photo => photo.created > pivotPhoto.created);
  let newer = photos.slice(1).filter(photo => photo.created <= pivotPhoto.created);
  older = sortByDate(older);
  newer = sortByDate(newer);

  return older.concat([pivotPhoto]).concat(newer);
} 
```
