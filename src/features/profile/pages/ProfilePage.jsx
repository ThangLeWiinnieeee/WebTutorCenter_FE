import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import useAuth from "@/features/auth/hooks/useAuth";
import { updateProfileThunk, uploadAvatarThunk, getUserInfoThunk } from "@/features/auth/store/authThunks";
import {
  getTutorProfileThunk,
  fetchMyProfileChangeRequestThunk,
  requestProfileChangeThunk,
} from "@/features/tutors/store/tutorThunks";
import { profileSchema } from "@/features/profile/schemas/profileSchema";
import { toInputDate } from "@/features/profile/constants";
import ProfileSidebar from "@/features/profile/components/ProfileSidebar";
import ProfilePersonalCard from "@/features/profile/components/ProfilePersonalCard";
import ProfileViewDetails from "@/features/profile/components/ProfileViewDetails";
import ProfileEditForm from "@/features/profile/components/ProfileEditForm";
import TutorInfoCard from "@/features/profile/components/TutorInfoCard";
import TutorProfileEditForm from "@/features/profile/components/TutorProfileEditForm";
import TutorDocumentsCard from "@/features/profile/components/TutorDocumentsCard";
import ProfileMenu from "@/features/profile/components/ProfileMenu";

const ProfilePage = () => {
  const { user, loading } = useAuth();
  const dispatch = useDispatch();
  const {
    profile: tutorProfile,
    loading: tutorLoading,
    profileChangeRequest,
    submittingProfileChange,
  } = useSelector((state) => state.tutors);
  const [searchParams] = useSearchParams();
  const focusDocuments = searchParams.get("section") === "documents";
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTutor, setIsEditingTutor] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const isTutor = user?.role === "tutor";

  // Vào trang hồ sơ → làm mới thông tin user (vd vừa được admin duyệt lên gia sư,
  // role user→tutor) để các khu vực gia sư hiển thị đúng.
  useEffect(() => {
    dispatch(getUserInfoThunk());
  }, [dispatch]);

  // Luôn tải lại hồ sơ gia sư khi vào trang / khi role chuyển thành tutor — tránh hiển
  // thị trạng thái cũ "đang chờ duyệt" sau khi admin đã duyệt (state Redux còn lưu cache).
  useEffect(() => {
    if (isTutor) {
      dispatch(getTutorProfileThunk());
    }
  }, [isTutor, dispatch]);

  // Lấy yêu cầu đổi hồ sơ đang chờ duyệt (nếu có) để khóa nút sửa + hiện banner
  useEffect(() => {
    if (isTutor) {
      dispatch(fetchMyProfileChangeRequestThunk());
    }
  }, [isTutor, dispatch]);

  const handleTutorProfileSubmit = async (changes) => {
    const result = await dispatch(requestProfileChangeThunk(changes));
    if (!result.error) {
      setIsEditingTutor(false);
    }
  };

  // Gửi bổ sung/cập nhật hồ sơ chứng thực (CCCD + thẻ SV/bằng cấp) qua luồng duyệt đổi hồ sơ
  const handleDocumentsSubmit = async (changes, onDone) => {
    const result = await dispatch(requestProfileChangeThunk(changes));
    if (!result.error) {
      onDone?.();
    }
  };

  const form = useForm({
    resolver: zodResolver(profileSchema),
    values: {
      fullName: user?.fullName ?? "",
      phone: user?.phone ?? "",
      gender: user?.gender ?? "",
      dateOfBirth: toInputDate(user?.dateOfBirth),
    },
  });

  if (!user) return null;

  const displayAvatar = avatarPreview || user.avatar;

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);
    setIsUploadingAvatar(true);

    const result = await dispatch(uploadAvatarThunk(file));

    setIsUploadingAvatar(false);

    if (result.error) {
      setAvatarPreview(null);
    } else {
      URL.revokeObjectURL(localUrl);
      setAvatarPreview(null);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEdit = () => {
    form.reset({
      fullName: user.fullName ?? "",
      phone: user.phone ?? "",
      gender: user.gender ?? "",
      dateOfBirth: toInputDate(user.dateOfBirth),
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  const onSubmit = async (data) => {
    const result = await dispatch(updateProfileThunk(data));
    if (!result.error) {
      setIsEditing(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className={`grid gap-6 ${isTutor ? "lg:grid-cols-[300px_1fr]" : "lg:grid-cols-[300px_1fr]"}`}>
        <div className="min-w-0 space-y-4" data-aos="fade-right">
          <ProfileSidebar
            user={user}
            displayAvatar={displayAvatar}
            isUploadingAvatar={isUploadingAvatar}
            fileInputRef={fileInputRef}
            onAvatarChange={handleAvatarChange}
            onPickAvatar={() => fileInputRef.current?.click()}
          />
          <ProfileMenu isTutor={isTutor} />
        </div>

        <div className="min-w-0 space-y-6" data-aos="fade-up" data-aos-delay="100">
          <ProfilePersonalCard isEditing={isEditing} onEdit={handleEdit}>
            {isEditing ? (
              <ProfileEditForm
                form={form}
                user={user}
                loading={loading}
                onSubmit={onSubmit}
                onCancel={handleCancel}
              />
            ) : (
              <ProfileViewDetails user={user} />
            )}
          </ProfilePersonalCard>

          {isTutor &&
            (isEditingTutor ? (
              <TutorProfileEditForm
                tutorProfile={tutorProfile}
                submitting={submittingProfileChange}
                onSubmit={handleTutorProfileSubmit}
                onCancel={() => setIsEditingTutor(false)}
              />
            ) : (
              <TutorInfoCard
                tutorProfile={tutorProfile}
                loading={tutorLoading}
                canEdit={tutorProfile?.status === "approved"}
                pendingRequest={profileChangeRequest}
                onEdit={() => setIsEditingTutor(true)}
              />
            ))}

          {isTutor && tutorProfile && !isEditingTutor && (
            <TutorDocumentsCard
              tutorProfile={tutorProfile}
              pendingRequest={profileChangeRequest}
              submitting={submittingProfileChange}
              onSubmit={handleDocumentsSubmit}
              autoEdit={focusDocuments}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
