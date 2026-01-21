import { apiUserMock } from "../mocks/apiUserMock";
import { mapApiUserToUserProfile } from "../mappers/userMapper";
import RegisterProfile from "~/components/auth/RegisterProfileForm";

export default function Register() {
  const user = mapApiUserToUserProfile(apiUserMock);

  return (
    <div>
      <RegisterProfile user={user} />
    </div>
  );
}
