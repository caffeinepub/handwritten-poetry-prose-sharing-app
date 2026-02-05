import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // WritingPost Types
  public type WritingType = { #poetry; #prose };

  // Post Visibility type (new)
  public type PostVisibility = {
    #publicPost;
    #linkOnly;
    #privatePost;
  };

  // WritingPost Structure (with visibility)
  public type WritingPost = {
    id : Text;
    title : Text;
    message : ?Text;
    image : Storage.ExternalBlob;
    writingType : WritingType;
    author : Principal;
    visibility : PostVisibility;
  };

  // Comparison for Sorting
  module WritingPost {
    public func compare(p1 : WritingPost, p2 : WritingPost) : Order.Order {
      Text.compare(p1.title, p2.title);
    };
  };

  // Posts storage
  let posts = Map.empty<Text, WritingPost>();

  // Create Post - Requires authenticated user, accepts visibility param
  public shared ({ caller }) func createPost(
    id : Text,
    title : Text,
    message : ?Text,
    image : Storage.ExternalBlob,
    writingType : WritingType,
    visibility : PostVisibility,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };

    if (posts.containsKey(id)) { Runtime.trap("Duplicated id") };

    if (title.size() == 0) { Runtime.trap("Title cannot be empty") };

    let post : WritingPost = {
      id;
      title;
      message;
      image;
      writingType;
      author = caller;
      visibility;
    };
    posts.add(id, post);
  };

  // Get All Public Posts - no auth required, only returns #public posts (changed)
  public query ({ caller }) func getAllPosts() : async [WritingPost] {
    posts.values().toArray().filter(
      func(p) { p.visibility == #publicPost }
    ).sort();
  };

  // Get Post by id - public, but respects visibility
  public query ({ caller }) func getPost(id : Text) : async WritingPost {
    switch (posts.get(id)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        if (post.visibility == #privatePost and caller != post.author and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Access denied: Private post");
        };
        post;
      };
    };
  };

  // Filter Public Posts by Type (filtered to public posts)
  public query ({ caller }) func getPostsByType(writingType : WritingType) : async [WritingPost] {
    posts.values().toArray().filter(
      func(p) { p.writingType == writingType and p.visibility == #publicPost }
    );
  };
};
