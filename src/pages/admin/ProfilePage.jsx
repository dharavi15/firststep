import { useEffect, useMemo, useRef, useState } from "react";
import { Mail, MapPin, Phone, User, Pencil } from "lucide-react";
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

  // This controls view/edit mode
  const [editMode, setEditMode] = useState(false);

  // Profile fields (Firestore: users/{uid})
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Photo 
  const [photoURL, setPhotoURL] = useState("");

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

        // Local photo keeps image after refresh on the same device
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

  // Open file picker 
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

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    // Keep size small because we store base64 in localStorage
    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError("Image is too large (max 2MB).");
      return;
    }

    setError("");
    setSuccess("");

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

  function onStartEdit() {
    setError("");
    setSuccess("");
    setEditMode(true);
  }

  function onCancel() {
    setError("");
    setSuccess("");

    setFullName(initial.fullName);
    setPhone(initial.phone);
    setAddress(initial.address);
    setPhotoURL(initial.photoURL);

    // Back to view mode
    setEditMode(false);
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

      // Save profile info to Firestore
      await updateDoc(doc(db, "users", uid), {
        fullName: nameClean,
        phone: phone.trim(),
        address: address.trim(),
      });

      // Update snapshot for Cancel
      setInitial((prev) => ({
        ...prev,
        fullName: nameClean,
        phone: phone.trim(),
        address: address.trim(),
        photoURL: photoURL || prev.photoURL,
      }));

      setSuccess("Profile updated.");
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

            {/* Show pencil only in edit mode */}
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
            {/* View mode: show profile info only */}
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

              {/* Edit button */}
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

            {/* Slide-down edit menu */}
            <div className={`adminProfileSlide ${editMode ? "open" : ""}`}>
              <form className="adminProfileForm" onSubmit={onSave}>
                <div className="adminProfileHint">
                  
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