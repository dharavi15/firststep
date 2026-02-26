import { firebaseLogin, firebaseLogout } from "../firebase/auth";
import { getUserProfileByEmail } from "../firebase/userProfile";

export async function loginAsAdmin(email, password) {
  const user = await firebaseLogin(email, password);

  const profile = await getUserProfileByEmail(user.email);
  if (!profile) {
    await firebaseLogout();
    throw new Error("No user profile found in Firestore (users).");
  }

  if (profile.role !== "admin") {
    await firebaseLogout();
    throw new Error("This account is not admin.");
  }

  if (profile.isActive === false) {
    await firebaseLogout();
    throw new Error("Admin account is inactive.");
  }

  return {
    uid: user.uid,
    email: user.email,
    profile,
  };
}

export async function logout() {
  await firebaseLogout();
}