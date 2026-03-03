// src/pages/admin/ProfilePage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, EyeOff, Lock, Mail, MapPin, Phone, User, Pencil } from "lucide-react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { auth, db, storage } from "../../firebase/firebase";
import { getUserProfile } from "../../firebase/userProfile";
import useAuthStore from "../../store/useAuthStore";

import adminAvatar from "../../assets/admin.png";

export default function ProfilePage() {
  const storeUser = useAuthStore((s) => s.user);

  const uid = storeUser?.uid || auth.currentUser?.uid || "";
  const email = storeUser?.email || auth.currentUser?.email || "";

  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Profile fields (Firestore: users/{uid})
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [photoURL, setPhotoURL] = useState("");

  // Password fields (optional)
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Snapshot for Cancel
  const [initial, setInitial] = useState({
    fullName: "",
    phone: "",
    address: "",
    photoURL: "",
  });

  const canUsePage = useMemo(() => {
    // Admin only (if store role not ready yet, allow when uid exists)
    if (!uid) return false;
    if (!storeUser?.role) return true;
    return storeUser.role === "admin";
  }, [uid, storeUser?.role]);

  // Load profile from Firestore
  useEffect(() => {
    let alive = true;

    async function loadProfile() {
      setLoading(true);
      setError("");
      setSuccess("");

      try {
        if (!uid) {
          setError("No user session found. Please login again.");
          return;
        }

        const profile = await getUserProfile(uid);
        if (!alive) return;

        const next = {
          fullName: profile?.fullName || storeUser?.fullName || "",
          phone: profile?.phone || "",
          address: profile?.address || "",
          photoURL: profile?.photoURL || "",
        };

        setFullName(next.fullName);
        setPhone(next.phone);
        setAddress(next.address);
        setPhotoURL(next.photoURL);
        setInitial(next);
      } catch (err) {
        console.error("Load profile error:", err);
        setError("Failed to load profile.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      alive = false;
    };
  }, [uid, storeUser?.fullName]);

  // Open file picker
  function onEditImageClick() {
    setError("");
    setSuccess("");
    fileInputRef.current?.click();
  }

  // Upload image -> Storage -> Save photoURL to Firestore
  async function onImageSelected(e) {
    const file = e.target.files?.[0];

    // Reset input so user can pick same file again
    e.target.value = "";

    if (!file || !uid) return;

    // Basic file check
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    // Optional size limit (5MB)
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError("Image is too large (max 5MB).");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      // Use a stable path, file extension not required
      const imageRef = ref(storage, `adminProfiles/${uid}`);

      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);

      await updateDoc(doc(db, "users", uid), { photoURL: url });

      setPhotoURL(url);
      setInitial((prev) => ({ ...prev, photoURL: url }));
      setSuccess("Profile image updated.");
    } catch (err) {
      console.error("Upload image error:", err);
      const code = err?.code ? `(${err.code}) ` : "";
      setError(`${code}${err?.message || "Image upload failed."}`);
    } finally {
      setUploading(false);
    }
  }

  function onCancel() {
    setError("");
    setSuccess("");

    setFullName(initial.fullName);
    setPhone(initial.phone);
    setAddress(initial.address);
    setPhotoURL(initial.photoURL);

    setOldPassword("");
    setNewPassword("");
    setShowOld(false);
    setShowNew(false);
  }

  async function onSave(e) {
    e.preventDefault();
    if (!uid) return;
    if (saving) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const nameClean = fullName.trim();
      if (!nameClean) {
        setError("Name is required.");
        return;
      }

      // Update profile info
      await updateDoc(doc(db, "users", uid), {
        fullName: nameClean,
        phone: phone.trim(),
        address: address.trim(),
      });

      // Change password only if both fields are filled
      const wantChangePassword = oldPassword.trim() && newPassword.trim();
      if (wantChangePassword) {
        if (newPassword.trim().length < 6) {
          setError("New Password must be at least 6 characters.");
          return;
        }

        if (!auth.currentUser?.email) {
          setError("Missing auth email. Please login again.");
          return;
        }

        const cred = EmailAuthProvider.credential(auth.currentUser.email, oldPassword.trim());
        await reauthenticateWithCredential(auth.currentUser, cred);
        await updatePassword(auth.currentUser, newPassword.trim());

        setOldPassword("");
        setNewPassword("");
        setShowOld(false);
        setShowNew(false);
      }

      // Update snapshot for Cancel
      setInitial((prev) => ({
        ...prev,
        fullName: nameClean,
        phone: phone.trim(),
        address: address.trim(),
      }));

      setSuccess(wantChangePassword ? "Profile and password updated." : "Profile updated.");
    } catch (err) {
      console.error("Save profile error:", err);
      const code = err?.code ? `(${err.code}) ` : "";
      setError(`${code}${err?.message || "Update failed."}`);
    } finally {
      setSaving(false);
    }
  }

  if (!canUsePage) {
    return (
      <div className="adminProfileWrap">
        <div className="adminProfileCard">
          <div className="adminProfileTopBar">
            <div className="adminProfileTitle">Edit Profile</div>
          </div>
          <div className="adminProfileForm">
            <div className="adminProfileMsg error">Access denied. Admin only.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="adminProfileWrap">
      <div className="adminProfileCard">
        <div className="adminProfileTopBar">
          <div className="adminProfileTitle">Edit Profile</div>
        </div>

        {/* Avatar */}
        <div className="adminProfileAvatarRow">
          <div className="adminProfileAvatarRing">
            <img
              className="adminProfileAvatarImg"
              src={photoURL || adminAvatar}
              alt="Admin"
            />

            <button
              type="button"
              className="adminProfileAvatarEdit"
              onClick={onEditImageClick}
              disabled={uploading}
              aria-label="Edit profile image"
              title="Edit"
            >
              <Pencil size={14} />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onImageSelected}
              style={{ display: "none" }}
            />
          </div>
        </div>

        {loading ? (
          <div className="adminProfileForm">
            <div className="adminProfileHint">Loading...</div>
          </div>
        ) : (
          <form className="adminProfileForm" onSubmit={onSave}>
            {error && <div className="adminProfileMsg error">{error}</div>}
            {success && <div className="adminProfileMsg success">{success}</div>}

            <div className="adminProfileField">
              <div className="adminProfileLabel">
                <User size={16} /> Name
              </div>
              <input
                className="adminProfileInput"
                value={fullName}
                onChange={(ev) => setFullName(ev.target.value)}
                placeholder="Full name"
              />
            </div>

            <div className="adminProfileField">
              <div className="adminProfileLabel">
                <Mail size={16} /> Email
              </div>
              <input className="adminProfileInput" value={email || "-"} disabled />
            </div>

            <div className="adminProfileField">
              <div className="adminProfileLabel">
                <Phone size={16} /> Phone
              </div>
              <input
                className="adminProfileInput"
                value={phone}
                onChange={(ev) => setPhone(ev.target.value)}
                placeholder="Phone number"
              />
            </div>

            <div className="adminProfileField">
              <div className="adminProfileLabel">
                <MapPin size={16} /> Address
              </div>
              <input
                className="adminProfileInput"
                value={address}
                onChange={(ev) => setAddress(ev.target.value)}
                placeholder="Address"
              />
            </div>

            <div className="adminProfileDivider" />

            {/* Old password */}
            <div className="adminProfileField">
              <div className="adminProfileLabel">
                <Lock size={16} /> Old Password
              </div>
              <div className="adminProfilePwdRow">
                <input
                  className="adminProfileInput"
                  type={showOld ? "text" : "password"}
                  value={oldPassword}
                  onChange={(ev) => setOldPassword(ev.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="adminProfileEyeBtn"
                  onClick={() => setShowOld((v) => !v)}
                  aria-label="Toggle old password"
                  title="Show/Hide"
                >
                  {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div className="adminProfileField">
              <div className="adminProfileLabel">
                <Lock size={16} /> New Password
              </div>
              <div className="adminProfilePwdRow">
                <input
                  className="adminProfileInput"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(ev) => setNewPassword(ev.target.value)}
                  placeholder="New password"
                />
                <button
                  type="button"
                  className="adminProfileEyeBtn"
                  onClick={() => setShowNew((v) => !v)}
                  aria-label="Toggle new password"
                  title="Show/Hide"
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="adminProfileHint">
                * If you do not enter Old/New Password, only the profile information will be updated.
              </div>
            </div>

            <div className="adminProfileActions">
              <button
                type="button"
                className="adminProfileBtn cancel"
                onClick={onCancel}
                disabled={saving || uploading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="adminProfileBtn save"
                disabled={saving || uploading}
              >
                {saving ? "Saving..." : uploading ? "Uploading..." : "Save Update"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}