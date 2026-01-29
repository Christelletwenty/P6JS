import ProfileStats from "../components/profile/ProfileStats";
import ProfileHeader from "~/components/profile/ProfileHeader";
import Menu from "~/components/layout/Menu";
import Footer from "~/components/layout/Footer";
import { useAuth } from "~/contexts/AuthContext";
import { useUserInfo } from "~/hooks/useUserInfo";
import { useUserActivity } from "~/hooks/useUserActivity";

export default function Profile() {
  const auth = useAuth();
  const userInfo = useUserInfo(auth.token).data;
  const userStats = useUserActivity(auth.token).sessions;

  return (
    <div className="profile-page">
      <Menu />

      <main className="profile-main">
        <div className="profile-left">
          {userInfo ? (
            <ProfileHeader user={userInfo?.profile} />
          ) : (
            <div>Chargement…</div>
          )}
        </div>

        <div className="profile-right">
          {userStats ? (
            <ProfileStats sessions={userStats} />
          ) : (
            <div>Chargement…</div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
