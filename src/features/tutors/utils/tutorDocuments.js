// Hồ sơ chứng thực đầy đủ khi: có CCCD 2 mặt + (sinh viên: thẻ SV 2 mặt | còn lại: ≥1 bằng cấp).
// Dùng để chặn nhận lớp ở FE và hiển thị trạng thái trong trang hồ sơ.
export const hasCompleteTutorDocuments = (profile) => {
  if (!profile) return false;
  if (!profile.cccdFrontImage || !profile.cccdBackImage) return false;
  if (profile.occupationStatus === "student") {
    return Boolean(profile.studentCardFrontImage && profile.studentCardBackImage);
  }
  return Array.isArray(profile.certificateImages) && profile.certificateImages.length >= 1;
};
