import Array "mo:core/Array";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import Migration "migration";

(with migration = Migration.run)
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
    );
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

  // SUBSCRIPTION MANAGEMENT (using Stripe status, not auth role)
  //
  // Stripe integration
  var configuration : ?Stripe.StripeConfiguration = null;

  // Track session ownership for authorization
  let sessionOwners = Map.empty<Text, Principal>();

  // Store subscription status explicitly
  let subscriptions = Map.empty<Principal, Bool>();

  public query func isStripeConfigured() : async Bool {
    configuration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    configuration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (configuration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    // Verify caller owns this session or is admin
    switch (sessionOwners.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?owner) {
        if (caller != owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only check your own session status");
        };
      };
    };

    let status = await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);

    switch (status) {
      case (#completed { userPrincipal }) {
        // Mark the principal as subscribed
        switch (userPrincipal) {
          case (?principalStr) {
            // Convert Text to Principal (if valid)
            func fromText(_text : Text) : Principal {
              fromText(_text);
            };
            let principal = fromText(principalStr);
            subscriptions.add(principal, true);
          };
          case (null) {};
        };
      };
      case (_) {};
    };
    status;
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    // Only authenticated users can create checkout sessions
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create checkout sessions");
    };

    let sessionId = await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);

    // Track session ownership for authorization
    sessionOwners.add(sessionId, caller);

    sessionId;
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public query ({ caller }) func isUserSubscribed() : async Bool {
    switch (subscriptions.get(caller)) {
      case (?true) { true };
      case (_) { false };
    };
  };
};
