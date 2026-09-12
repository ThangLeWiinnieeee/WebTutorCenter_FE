const completionSteps = [
  {
    id: "review",
    title: "Chờ trung tâm xét duyệt",
    actor: "Trung tâm",
    description:
      "Trung tâm xem xét đơn đã được chọn. Theo dõi thông báo để biết kết quả; được chọn hoặc đồng ý lời mời chưa có nghĩa là đã nhận lớp.",
  },
  {
    id: "matched",
    title: "Nhận lớp và bắt đầu giảng dạy",
    actor: "Gia sư",
    description:
      "Khi đơn được duyệt, lớp được ghép với bạn và thông tin liên hệ chi tiết của người đăng được mở. Vào Lớp đã nhận để trao đổi lịch học, yêu cầu và tổ chức giảng dạy.",
  },
  {
    id: "confirm",
    title: "Hai bên xác nhận hoàn thành",
    actor: "Gia sư & người đăng",
    description:
      "Sau khi dạy xong, gia sư và người đăng đều xác nhận hoàn thành lớp. Nếu mới có một bên xác nhận, hệ thống vẫn chờ bên còn lại.",
  },
  {
    id: "completed",
    title: "Hoàn thành và nhận đánh giá",
    actor: "Hệ thống",
    description:
      "Khi đủ hai xác nhận, lớp chuyển sang hoàn thành và cả hai bên nhận voucher theo chính sách hiện hành. Người đăng có thể đánh giá một lần cho lớp; gia sư được trả lời đánh giá đó một lần.",
  },
];

export const RECEIVING_FLOWS = [
  {
    id: "apply",
    label: "Tự ứng tuyển",
    title: "Từ ứng tuyển đến lớp học đầu tiên",
    intro: "Chủ động chọn lớp phù hợp. Người đăng lựa chọn gia sư trước khi trung tâm xét duyệt.",
    steps: [
      {
        id: "apply",
        title: "Chọn lớp và gửi ứng tuyển",
        actor: "Gia sư",
        description:
          "Đọc kỹ môn học, địa điểm, lịch học và yêu cầu gia sư ở Lớp cần gia sư. Chọn Nhận lớp và xác nhận ứng tuyển khi bạn đáp ứng điều kiện. Mỗi gia sư chỉ có một đơn cho mỗi lớp.",
      },
      {
        id: "selected",
        title: "Người đăng chọn gia sư",
        actor: "Người đăng",
        description:
          "Đơn mới ở trạng thái chờ người đăng chọn. Người đăng xem hồ sơ các ứng viên và chọn một gia sư; đơn được chọn sẽ chuyển sang chờ trung tâm duyệt.",
      },
      ...completionSteps,
    ],
    exceptions: [
      {
        title: "Không được chọn",
        description:
          "Khi một gia sư khác được duyệt, các đơn còn lại được cập nhật thành không được chọn. Bạn có thể tìm lớp khác phù hợp.",
      },
      {
        title: "Trung tâm từ chối",
        description:
          "Xem lý do trong thông báo. Người đăng có thể lựa chọn gia sư khác; không gửi lặp lại đơn cho cùng lớp.",
      },
    ],
  },
  {
    id: "invite",
    label: "Được mời dạy",
    title: "Nhận lời mời dành riêng cho bạn",
    intro:
      "Người đăng đã chọn bạn để gửi lời mời. Bạn quyết định nhận hoặc từ chối trước khi trung tâm duyệt.",
    steps: [
      {
        id: "invite",
        title: "Người đăng gửi lời mời",
        actor: "Người đăng",
        description:
          "Người đăng chọn gia sư đích danh và tạo lời mời dạy lớp. Gia sư nhận thông báo và xem yêu cầu ở mục Lời mời dạy lớp.",
      },
      {
        id: "accept",
        title: "Đọc yêu cầu và phản hồi",
        actor: "Gia sư",
        description:
          "Kiểm tra môn học, lịch và khu vực dạy. Đồng ý để chuyển đơn sang chờ trung tâm duyệt, hoặc từ chối kèm lý do để thông báo cho người đăng.",
      },
      ...completionSteps,
    ],
    exceptions: [
      {
        title: "Không phù hợp với lời mời",
        description: "Bạn có thể từ chối và nêu lý do. Việc từ chối lời mời không cần trung tâm duyệt.",
      },
      {
        title: "Lời mời không còn nhận được",
        description:
          "Chỉ lời mời còn chờ phản hồi và lớp còn mở mới có thể được chấp nhận. Kiểm tra lại trạng thái mới nhất trước khi thao tác.",
      },
    ],
  },
  {
    id: "cancel",
    label: "Rút đơn / hủy lớp",
    title: "Cần rút đơn hoặc dừng nhận lớp?",
    intro: "Cách xử lý phụ thuộc vào trạng thái đơn. Yêu cầu hủy lớp đã nhận phải được trung tâm duyệt.",
    steps: [
      {
        id: "pending",
        title: "Đơn vẫn chờ người đăng chọn",
        actor: "Gia sư",
        description:
          "Nếu đơn còn ở trạng thái chờ người đăng chọn, bạn có thể chủ động rút đơn và gửi lý do.",
      },
      {
        id: "withdraw",
        title: "Rút đơn có hiệu lực ngay",
        actor: "Hệ thống",
        description:
          "Đơn đang chờ được hủy ngay, không qua bước duyệt của trung tâm. Không thể gửi lại một đơn mới cho cùng lớp.",
      },
      {
        id: "approved",
        title: "Nếu lớp đã được nhận",
        actor: "Gia sư",
        description:
          "Đây là trường hợp khác với rút đơn đang chờ: vào Lớp đã nhận và gửi yêu cầu hủy kèm lý do khi lớp vẫn đang được ghép với bạn.",
      },
      {
        id: "request",
        title: "Chờ trung tâm duyệt hủy",
        actor: "Trung tâm",
        description:
          "Trong thời gian chờ, yêu cầu chưa có hiệu lực. Nếu bị từ chối, đơn trở lại trạng thái đã duyệt và bạn tiếp tục lớp đã nhận.",
      },
      {
        id: "cancelled",
        title: "Trung tâm đồng ý hủy",
        actor: "Trung tâm",
        description:
          "Đơn chuyển sang đã hủy. Kết quả được gửi qua thông báo và cập nhật trong danh sách lớp của bạn.",
      },
      {
        id: "open",
        title: "Lớp mở lại hoặc hết hạn",
        actor: "Hệ thống",
        description:
          "Nếu chưa tới ngày bắt đầu, lớp mở lại để tìm gia sư khác. Nếu đã tới ngày bắt đầu, lớp chuyển sang hết hạn.",
      },
    ],
    exceptions: [
      {
        title: "Đã được chọn, đang chờ trung tâm duyệt",
        description:
          "Trạng thái này chưa có thao tác rút đơn trực tiếp. Hãy liên hệ trung tâm để được hỗ trợ.",
      },
      {
        title: "Lớp đã hoàn thành",
        description: "Luồng xin hủy áp dụng cho lớp đang được ghép, không áp dụng cho lớp đã hoàn thành.",
      },
    ],
  },
];

export const RECEIVING_REQUIREMENTS = [
  {
    title: "Hồ sơ đã được duyệt",
    description: "Đăng nhập bằng tài khoản gia sư, hoàn thiện hồ sơ và giấy tờ xác thực theo yêu cầu.",
  },
  {
    title: "Đáp ứng yêu cầu lớp",
    description: "Đúng môn dạy; phù hợp yêu cầu giới tính, trình độ gia sư nếu người đăng có chỉ định.",
  },
  {
    title: "Lớp còn nhận gia sư",
    description: "Lớp còn mở, chưa được giữ cho đơn đang xét duyệt; không nhận lớp do chính mình đăng.",
  },
];
