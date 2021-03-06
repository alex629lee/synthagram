import React from 'react';
import $ from "jquery";
import CommentIndex from '../comment/CommentIndex';
import CommentForm from '../comment/CommentForm';
import { Mutation } from 'react-apollo';
import { FEED, FETCH_USER } from '../../graphql/queries';
import { ADD_LIKE, REMOVE_LIKE, DELETE_PHOTO } from '../../graphql/mutations';
import { withRouter, Link } from 'react-router-dom';

class FeedIndexItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tapped: false,
      parentComment: null
    };
  }

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
        } ,1000);
      }
    } else {
      this.setState({ tapped: true });
      setTimeout(() => this.setState({ tapped: false }), 500);
    }
  }

  setReplyForm = parentComment => {
    this.setState({ parentComment });
  }

  cancelReply = () => {
    this.setState({ parentComment: null });
  }

  handleLike = (e, addLike) => {
    e.preventDefault();
    addLike({
      variables: {
        photoId: this.props.photo._id,
        userId: this.props.currentUser
      }
    })
  } 

  handleUnlike = (e, removeLike) => {
    e.preventDefault();
    removeLike({
      variables: {
        photoId: this.props.photo._id,
        userId: this.props.currentUser
      }
    })
  } 

  handleDelete = (e, deletePhoto) => {
    e.preventDefault();
    deletePhoto({
      variables: {
        photoId: this.props.photo._id
      }
    })
  }

  updateCache(cache, currentUser, deletedPhoto) {
    deletedPhoto = deletedPhoto.data.data.deletePhoto;

    let photos;
    try {
      photos = cache.readQuery({
        query: FEED,
        variables: {
          currentUserId: currentUser
        }
      });
    } catch (err) {
      return;
    }

    if (photos) {
      let feed = photos.feed;
      const newFeed = feed.filter(photo => photo._id !== deletedPhoto._id);

      cache.writeQuery({
        query: FEED,
        variables: { currentUserId: currentUser },
        data: { feed: newFeed }
      });
    }
  }

  renderLikeButton = () => {
    const { photo, currentUser } = this.props;

    if (!photo.likes.includes(currentUser)) {
      return (
        <Mutation
          mutation={ADD_LIKE}
        >
          {addLike => (
            <button 
              id={`toggle-like-${photo._id}`}
              onClick={(e => this.handleLike(e, addLike))}
            >
              <i className="fas fa-music"></i>
            </button>
          )}
        </Mutation>
      )
    } else {
      return (
        <Mutation
          mutation={REMOVE_LIKE}
        >
          {removeLike => (
            <button 
              id={`toggle-like-${photo._id}`}
              onClick={(e => this.handleLike(e, removeLike))}
            >
              <i className="fas fa-music liked"></i>
            </button>
          )}
        </Mutation>
      )
    }
  }

  renderDeleteButton = () => {
    const { photo, currentUser } = this.props;
    if (photo.user._id === currentUser) {
      return (
        <Mutation
          mutation={DELETE_PHOTO}
          update={(cache, data) => this.updateCache(cache, currentUser, { data })}
          refetchQueries={[
            {
              query: FETCH_USER,
              variables: { _id: currentUser }
            }
          ]}
        >
          {deletePhoto => (
            <button onClick={(e => this.handleDelete(e, deletePhoto))}>
              <i className="fas fa-trash-alt"></i>
            </button>
          )}
        </Mutation>
      )
    }
  }


  render() {
    const { photo, currentUser } = this.props;

    return (
      <li className="feed-index-item">
        <div className="feed-item-top">
          <Link to={`/users/${photo.user._id}`} className="feed-item-pfp-link">
             <img
               className="feed-item-profile-photo"
               src={photo.user.profileImg}
               alt=""
             />
          </Link>

          <Link to={`/users/${photo.user._id}`}>
            <p className="feed-item-username">{photo.user.username}</p>
          </Link>
        </div>
        <div className="feed-item-image-container">
          <img
            src={photo.photoUrl}
            alt=""
          />
          <div 
            id={`just-liked-modal-${photo._id}`} 
            className="just-liked-modal" 
            onClick={() => this.handleTap(photo._id)}
          >
              <i className="fas fa-music"></i>
          </div>
        </div>
        <div className="feed-item-bottom">
          
         
          <div className="feed-item-buttons">
            <div className="feed-item-buttons-left">
              {this.renderLikeButton()}
              <button 
                onClick={() => this.props.history.push(`/photos/${photo._id}`)}
              ><i className="fas fa-comment"></i>
              </button>
            </div>
            {this.renderDeleteButton()}
          </div>


          <p className="feed-item-likes-count">{photo.likes.length} likes</p>

          <div className="feed-item-body">
            <div className="feed-item-body-username">
              <Link to={`/users/${photo.user._id}`}>{photo.user.username}</Link>
            </div>
            {photo.body}
          </div>
        </div>
        <CommentIndex 
          comments={photo.comments} 
          context="photo" 
          currentUser={currentUser}
          setReplyForm={this.setReplyForm}
        />

        {
          //This isn't very dry, but React wasn't rerending the form when the 
          //parentComment changed in the state. To fix it I used 
          //this.state.parentComment directly (209 & 217) and it rerenders.
          //Find a cleaner fix later. 
        }
        {this.state.parentComment && (
          <CommentForm
            currentUser={currentUser}
            photoId={photo._id}
            parentComment={this.state.parentComment || null}
            cancelReply={this.cancelReply}
          />
        )}

        {!this.state.parentComment && (
          <CommentForm
            currentUser={currentUser}
            photoId={photo._id}
            parentComment={this.state.parentComment || null}
          />
        )}
      </li>
    )
  }
}

export default withRouter(FeedIndexItem);