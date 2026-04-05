import AccessControl "./authorization/access-control";
import MixinAuth "./authorization/MixinAuthorization";

persistent actor {
  let accessControlState = AccessControl.initState();
  include MixinAuth(accessControlState);
};
