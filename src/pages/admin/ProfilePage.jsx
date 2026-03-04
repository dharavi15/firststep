import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, EyeOff, Lock, Mail, MapPin, Phone, User, Pencil } from "lucide-react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

import { auth, db } from "../../firebase/firebase";
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

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // View/Edit mode
  const [editMode, setEditMode] = useState(false);

  // Profile fields (Firestore: users/{uid})
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Photo (Emergency: local preview only)
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

  // Load profile from Firestore + load local photo fallback
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

        // Emergency local photo (keeps photo after refresh on the same device)
        const localPhoto = localStorage.getItem(`profilePhoto_${uid}`) || "";

        const next = {
          fullName: profile?.fullName || storeUser?.fullName || "",
          phone: profile?.phone || "",
          address: profile?.address || "",
          // Prefer local photo first, then Firestore photoURL, then empty
          photoURL: localPhoto || profile?.photoURL || "",
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

  // Open file picker (only in edit mode)
  function onEditImageClick() {
    setError("");
    setSuccess("");
    fileInputRef.current?.click();
  }

  // image update: local preview + localStorage 
  function onImageSelected(e) {
    const file = e.target.files?.[0];

    // Reset input so user can pick same file again
    e.target.value = "";

    if (!file || !uid) return;

    // Basic file check
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    // Optional size limit (2MB for local base64)
    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError("Image is too large (max 2MB for emergency mode).");
      return;
    }

    setError("");
    setSuccess("");

    // Convert to base64 so it can survive refresh (same device)
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = String(reader.result || "");
      setPhotoURL(base64);
      localStorage.setItem(`profilePhoto_${uid}`, base64);
      setInitial((prev) => ({ ...prev, photoURL: base64 }));
      setSuccess("Profile image updated.");
    };
    reader.onerror = () => setError("Failed to read image.");
    reader.readAsDataURL(file);
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

    // Back to view mode
    setEditMode(false);
  }

  function onStartEdit() {
    setError("");
    setSuccess("");
    setEditMode(true);
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

      // Update profile info (keep this in Firestore)
      await updateDoc(doc(db, "users", uid), {
        fullName: nameClean,
        phone: phone.trim(),
        address: address.trim(),
        // Note: photoURL is NOT saved to Firestore in emergency mode
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

        const cred = EmailAuthProvider.credential(
          auth.currentUser.email,
          oldPassword.trim()
        );
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
        photoURL: photoURL || prev.photoURL,
      }));

      setSuccess(wantChangePassword ? "Profile and password updated." : "Profile updated.");

      // Back to view mode after save
      setEditMode(false);
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
            <div className="adminProfileTitle">Your Profile</div>
          </div>
          <div className="adminProfileForm">
            <div className="adminProfileMsg error">Access denied. Admin only.</div>
          </div>
        </div>
      </div>
    );
  }

  const readOnly = !editMode;

  return (
    <div className="adminProfileWrap">
      <div className="adminProfileCard">
        <div className="adminProfileTopBar">
          <div className="adminProfileTitle">Your Profile</div>
        </div>

        {/* Avatar */}
        <div className="adminProfileAvatarRow">
          <div className="adminProfileAvatarRing">
            <img
              className="adminProfileAvatarImg"
              src={photoURL || adminAvatar}
              alt="Admin"
            />

            {/* Show edit image button only in edit mode */}
            {editMode && (
              <button
                type="button"
                className="adminProfileAvatarEdit"
                onClick={onEditImageClick}
                aria-label="Edit profile image"
                title="Edit"
              >
                <Pencil size={14} />
              </button>
            )}

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
          <>
            {/* View mode summary */}
            <div className="adminProfileForm adminProfileView">
              {error && <div className="adminProfileMsg error">{error}</div>}
              {success && <div className="adminProfileMsg success">{success}</div>}

              <div className="adminProfileField">
                <div className="adminProfileLabel">
                  <User size={16} /> Name
                </div>
                <input className="adminProfileInput" value={fullName} disabled />
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
                <input className="adminProfileInput" value={phone} disabled />
              </div>

              <div className="adminProfileField">
                <div className="adminProfileLabel">
                  <MapPin size={16} /> Address
                </div>
                <input className="adminProfileInput" value={address} disabled />
              </div>

              {/* Edit button only */}
              <div className="adminProfileActions single">
                <button
                  type="button"
                  className="adminProfileBtn edit"
                  onClick={onStartEdit}
                >
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Slide-down edit menu (no popup) */}
            <div className={`adminProfileSlide ${editMode ? "open" : ""}`}>
              <form className="adminProfileForm" onSubmit={onSave}>
                {/* image */}
                <div className="adminProfileHint">
                  * Image update.
                </div>

                <div className="adminProfileField">
                  <div className="adminProfileLabel">
                    <User size={16} /> Name
                  </div>
                  <input
                    className="adminProfileInput"
                    value={fullName}
                    onChange={(ev) => setFullName(ev.target.value)}
                    placeholder="Full name"
                    disabled={readOnly}
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
                    disabled={readOnly}
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
                    disabled={readOnly}
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
                      disabled={readOnly}
                    />
                    <button
                      type="button"
                      className="adminProfileEyeBtn"
                      onClick={() => setShowOld((v) => !v)}
                      aria-label="Toggle old password"
                      title="Show/Hide"
                      disabled={readOnly}
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
                      disabled={readOnly}
                    />
                    <button
                      type="button"
                      className="adminProfileEyeBtn"
                      onClick={() => setShowNew((v) => !v)}
                      aria-label="Toggle new password"
                      title="Show/Hide"
                      disabled={readOnly}
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
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="adminProfileBtn save"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Update"}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}