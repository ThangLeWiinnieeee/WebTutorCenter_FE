import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import useAuth from "@/features/auth/hooks/useAuth";
import { applyForClassThunk } from "@/features/classes/store/classThunks";
import tutorService from "@/features/tutors/services/tutorService";
import { hasCompleteTutorDocuments } from "@/features/tutors/utils/tutorDocuments";

const INITIAL_DIALOG = { open: false, type: "login", classItem: null };

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
        const requiredGender = classItem.tutorGenderPref === "male" ? "Nam" : "Nữ";
        const currentGender =
          user?.gender === "male" ? "Nam" : user?.gender === "female" ? "Nữ" : "Chưa cập nhật";
        mismatchReasons.push(
          `Giới tính: Lớp yêu cầu gia sư giới tính "${requiredGender}" nhưng giới tính tài khoản của bạn là "${currentGender}".`,
        );
      }

      if (classItem.tutorLevelPref && classItem.tutorLevelPref !== "any") {
        const requiredLevel = classItem.tutorLevelPref === "student" ? "Sinh viên" : "Giáo viên";
        const currentOccupation = tutorProfile?.occupationStatus;
        const currentLevel =
          currentOccupation === "student"
            ? "Sinh viên"
            : currentOccupation === "teacher"
              ? "Giáo viên"
              : "Khác";
        if (classItem.tutorLevelPref !== currentOccupation) {
          mismatchReasons.push(
            `Trình độ: Lớp yêu cầu gia sư là "${requiredLevel}" nhưng trình độ của bạn là "${currentLevel}".`,
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
      setReceiveDialog({ open: true, type: "confirm", classItem });
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
