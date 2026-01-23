import type { UserProfile } from "~/types/profile";

type ProfileHeaderProps = {
  user: UserProfile;
};

function ProfileHeader({ user }: ProfileHeaderProps) {
  // state

  // comportements

  // render
  return (
    <section className="profile-header">
      <div className="profile-card profile-card--identity">
        <img
          className="profile-avatar"
          src={user.profilePicture}
          alt="Profile picture"
        />

        <div className="profile-identity">
          <h1 className="profile-name">
            {user.firstName} {user.lastName}
          </h1>
          <p className="profile-since">Membre depuis le {user.createdAt}</p>
        </div>
      </div>

      <div className="profile-card profile-card--info">
        <h2 className="profile-section-title">Votre profil</h2>
        <hr className="profile-separator" />
        <ul className="profile-info-list">
          <li>Âge : {user.age}</li>
          <li>Genre : {user.gender}</li>
          <li>Taille : {user.height} cm</li>
          <li>Poids : {user.weight} kg</li>
        </ul>
      </div>
    </section>
  );
}

export default ProfileHeader;
