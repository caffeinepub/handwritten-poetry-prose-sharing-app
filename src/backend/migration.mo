import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  // Old actor type (without subscriptions)
  type OldActor = {
    sessionOwners : Map.Map<Text, Principal>;
  };

  // New actor type (with subscriptions)
  type NewActor = {
    sessionOwners : Map.Map<Text, Principal>;
    subscriptions : Map.Map<Principal, Bool>;
  };

  public func run(old : OldActor) : NewActor {
    { old with subscriptions = Map.empty<Principal, Bool>() };
  };
};
