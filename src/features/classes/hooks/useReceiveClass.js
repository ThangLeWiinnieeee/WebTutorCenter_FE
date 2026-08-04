import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import useAuth from "@/features/auth/hooks/useAuth";
import { applyForClassThunk } from "@/features/classes/store/classThunks";
import tutorService from "@/features/tutors/services/tutorService";
import { hasCompleteTutorDocuments } from "@/features/tutors/utils/tutorDocuments";

const INITIAL_DIALOG = { open: false, type: "login", classItem: null };
const OCCUPATION_TO_LEVEL = { student: "student", graduated: "teacher", teacher: "teacher" };
const GENDER_LABEL = { male: "Nam", female: "Nữ", other: "Khác" };
const LEVEL_LABEL = { student: "Sinh viên", teacher: "Giáo viên" };

// Hook gom luồng "nhận lớp" dùng chung: kiểm tra điều kiện của gia sư,
// mở dialog phù hợp và gửi đơn ứng tuyển.
const useReceiveClass = (onApplied) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useAuth();
  const applying = useSelector((state) => state.classes.applying);
  const [receiveDialog, setReceiveDialog] = useState(INITIAL_DIALOG);

  // Kiểm tra điều kiện nhận lớp rồi mở hộp thoại xác nhận.
  const openReceive = async (classItem) => {
    if (!classItem) return;

    if (!isAuthenticated) {
      setReceiveDialog({ open: true, type: "login", classItem });
      return;
    }

    if (user?.role !== "tutor") {
      setReceiveDialog({ open: true, type: "tutorRequired", classItem });
      return;
    }

    try {
      const response = await tutorService.getProfile();
      const tutorProfile = response.data?.data?.tutor;

      // Chưa bổ sung hồ sơ chứng thực → yêu cầu cập nhật trước khi nhận lớp
      if (!hasCompleteTutorDocuments(tutorProfile)) {
        setReceiveDialog({ open: true, type: "documentsRequired", classItem });
        return;
      }

      const registeredSubjects = tutorProfile?.subjects || [];
      const mismatchReasons = [];

      if (!registeredSubjects.includes(classItem.subject)) {
        mismatchReasons.push(
          `Môn học: Lớp yêu cầu môn "${classItem.subject}" nhưng bạn chưa đăng ký dạy môn này.`,
        );
      }

      if (
        classItem.tutorGenderPref &&
        classItem.tutorGenderPref !== "any" &&
        user?.gender !== classItem.tutorGenderPref
      ) {
        const requiredGender = GENDER_LABEL[classItem.tutorGenderPref] || "Khác";
        const currentGender = GENDER_LABEL[user?.gender] || "Chưa cập nhật";
        mismatchReasons.push(
          `Giới tính: Lớp yêu cầu gia sư giới tính "${requiredGender}" nhưng giới tính tài khoản của bạn là "${currentGender}".`,
        );
      }

      if (classItem.tutorLevelPref && classItem.tutorLevelPref !== "any") {
        const requiredLevel = LEVEL_LABEL[classItem.tutorLevelPref] || "Khác";
        const currentLevel = OCCUPATION_TO_LEVEL[tutorProfile?.occupationStatus];
        if (classItem.tutorLevelPref !== currentLevel) {
          mismatchReasons.push(
            `Trình độ: Lớp yêu cầu gia sư là "${requiredLevel}" nhưng trình độ của bạn là "${LEVEL_LABEL[currentLevel] || "Chưa xác định"}".`,
          );
        }
      }

      if (mismatchReasons.length > 0) {
        setReceiveDialog({
          open: true,
          type: "mismatch",
          classItem,
          tutorSubjects: registeredSubjects,
          mismatchReasons,
        });
        return;
      }
      setReceiveDialog({ open: true, type: "confirm", classItem, tutorSubjects: registeredSubjects });
    } catch (err) {
      console.error("Failed to check tutor profile conditions", err);
      toast.error("Không thể kiểm tra hồ sơ gia sư. Vui lòng thử lại.");
    }
  };

  // Gửi đơn ứng tuyển nhận lớp.
  const confirmApply = async () => {
    const classItem = receiveDialog.classItem;
    const result = await dispatch(applyForClassThunk(classItem?.id || classItem?._id));
    if (applyForClassThunk.fulfilled.match(result)) {
      setReceiveDialog((prev) => ({ ...prev, type: "submitted" }));
      // Lớp vừa nhận sẽ bị BE ẩn khỏi danh sách của gia sư này → tải lại để nó biến mất ngay.
      onApplied?.();
    } else {
      setReceiveDialog((prev) => ({ ...prev, open: false }));
      toast.error(result.payload || "Không thể gửi yêu cầu nhận lớp");
    }
  };

  // Đóng hộp thoại nhận lớp.
  const closeDialog = () => setReceiveDialog((prev) => ({ ...prev, open: false }));

  return { receiveDialog, applying, openReceive, confirmApply, closeDialog };
};

export default useReceiveClass;
