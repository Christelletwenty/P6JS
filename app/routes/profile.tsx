import { apiUserMock } from "../mocks/apiUserMock";
import { mapApiUserToUserProfile } from "../mappers/userMapper";
import ProfileStats from "../components/profile/ProfileStats";
import ProfileHeader from "~/components/profile/ProfileHeader";

export default function Profile() {
  const user = mapApiUserToUserProfile(apiUserMock);

  return (
    <div>
      <ProfileHeader user={user} />
      <ProfileStats sessions={user.runningSessions} />
    </div>
  );
}
