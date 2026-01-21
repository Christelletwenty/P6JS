import type { UserProfile } from "~/types/profile";

type ProfileHeaderProps = {
  user: UserProfile;
};

function ProfileHeader({ user }: ProfileHeaderProps) {
  // state

  // comportements

  // render
  return (
    <section>
      <img src={user.profilePicture} alt="Profile picture" />

      <h1>
        {user.firstName} {user.lastName}
      </h1>
      <p>Membre depuis le {user.createdAt}</p>

      <h2>Votre profil</h2>
      <p>Âge : {user.age}</p>
      <p>Genre : {user.gender}</p>
      <p>Taille : {user.height}cm</p>
      <p>Poids : {user.weight}kg</p>
    </section>
  );
}

export default ProfileHeader;
