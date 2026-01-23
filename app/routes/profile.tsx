import { apiUserMock } from "../mocks/apiUserMock";
import { mapApiUserToUserProfile } from "../mappers/userMapper";
import ProfileStats from "../components/profile/ProfileStats";
import ProfileHeader from "~/components/profile/ProfileHeader";
import Menu from "~/components/layout/Menu";
import Footer from "~/components/layout/Footer";

export default function Profile() {
  const user = mapApiUserToUserProfile(apiUserMock);

  return (
    <div className="profile-page">
      <Menu />

      <main className="profile-main">
        <div className="profile-left">
          <ProfileHeader user={user} />
        </div>

        <div className="profile-right">
          <ProfileStats sessions={user.runningSessions} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
