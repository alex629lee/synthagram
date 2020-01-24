<p align="center">
  <a href="http://synthagram.herokuapp.com/">
    <img height="200px" src="https://github.com/eliraybon/synthagram/blob/master/client/public/synthagram-favicon.png">
  </a>
</p>


# <h1 align="center">Synthagram</h1>

### [Live Link](http://synthagram.herokuapp.com/)

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


## Mobile-first Design

One of our main goals for this application was to create a responsive user interface that provides a visually-pleasing and content-rich experience across all devices. We wanted our application to be as clean and minimal as Instagram, while still applying our thematic twist. 




<p align="center">
  <img height="600px" width="350px" src="https://github.com/alex629lee/synthagram/blob/master/client/public/assets/images/prof2.png">
  <img height="600px" width="350px" src="https://github.com/alex629lee/synthagram/blob/master/client/public/assets/images/photo-show-mobile.png">
</p>

Of course, we wanted to adopt Instagram's signature squares in our implementation for displaying both enlarged images and thumbnails. For the thumbnails, this meant creating a responsive CSS grid-based layout system which appropriately resizes and positions the content according to the width of the viewport. At some point, the thumbnail images would need to stop growing in size and instead be spaced out and centered, which we accomplished using careful, calculated media queries. 

Below is an example of the grid's behavior on a large desktop window.

<p align="center">
  <img src="https://github.com/alex629lee/synthagram/blob/master/client/public/assets/images/prof1.png">
</p>


---


From your feed, you quickly jump to the profile of a particular user, where can can browse all of their synthtastic snaps.

<p align="center">
  <img height="600px" src="https://github.com/eliraybon/synthagram/blob/master/client/public/assets/images/feed1.PNG">
  <img height="600px" src="https://github.com/eliraybon/synthagram/blob/master/client/public/assets/images/feed2.PNG">
</p>

The photos above give you a quick look at the main feed of Synthagram. Your feed is populated by the most recent photos of the users that you follow. You can double-tap a photo to like it, which triggers an animation.  

Photos in the feed are sorted using a recurive quicksort algorithm. 

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

If you don't have enough synths to look at, you can head over to the explore page using the compass icon in the navbar. There, you will be served an index of users you might want to follow as well as more musical madness. 

<p align="center">
  <img height="600px" src="https://github.com/eliraybon/synthagram/blob/master/client/public/assets/images/explore.PNG">
</p>

You can post your own pictures using the drag and drop file uplaoder (desktop) or by tapping the upload box (mobile). On mobile, the uploader gives you easy access to your camera roll. Once a photo is chosen, you're given a preview to make sure everything looks good before posting!

<p align="center">
  <img height="600px" src="https://github.com/eliraybon/synthagram/blob/master/client/public/assets/images/post1.PNG">
  <img height="600px" src="https://github.com/eliraybon/synthagram/blob/master/client/public/assets/images/post2.PNG">
</p>

Along with liking photos, you can also leave comments on them, as well as reply to comments. 

<p align="center">
  <img height="600px" src="https://github.com/eliraybon/synthagram/blob/master/client/public/assets/images/comments.PNG">
</p>

The biggest backend challenge we ran into was deleting comments. Sounds simple right? But a comment can't simply be deleted from the database or it would leave behind several ghost references in its corresponding user and photo documents. Those are easy enough to clean up, so what's the big deal? Replies! When a comment is deleted, all of its replies also need to be deleted, and all of the replies of the replies. On and on and on. Sounds like a recursion problem! 

To acheive this, we needed a way to loop over a root comment's replies one by one, recurively deleting the reply as well as all of it's nested replies. But comment deletion is an asynchronous process, so we started by writing a new verion of the forEach method that utilizes async/await. 

```js
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};
```

We also wrote a helper method called removeSingleComment that takes care of deleting a comment and removing all references to it from the database. 

The final result was this removeNestedReplies function. It takes in a root comment and recursively deletes the comment and all of it's nested replies.

```js
async function removeNestedReplies(rootComment) {
  const Comment = mongoose.model('comments');

  if (!rootComment.replies.length) {
    return removeSingleComment(rootComment)
  }

  asyncForEach(rootComment.replies, async (commentId) => {
    const comment = await Comment.findById(commentId);
    await removeNestedReplies(comment);
  })

  return removeSingleComment(rootComment);
};
```


