import {
  mockLocations,
  mockSubjects,
  mockLookups,
  mockSettings,
  mockTutors,
  mockClasses,
  mockPricingConfig,
  mockUsers,
} from "./mockData.js";

/**
 * Cài đặt route mocks cho toàn bộ API của hệ thống
 * Giúp test luồng E2E Playwright chạy độc lập, ổn định, nhanh chóng và tin cậy.
 */
export async function setupApiMocks(page, options = {}) {
  const { userType = null } = options;
  const currentUser = userType ? mockUsers[userType] : null;

  await page.route(
    (url) => url.href.includes("/api/"),
    async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    const method = req.method();

    // 1. Settings public
    if (path.includes("/settings/public")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: mockSettings }),
      });
    }

    // 2. Lookups & Subjects
    if (path.includes("/lookups/all")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: mockLookups }),
      });
    }

    if (path.includes("/subjects")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: mockSubjects }),
      });
    }

    // 3. Locations
    if (path.includes("/locations/provinces") && path.includes("/districts")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: mockLocations.districts01 }),
      });
    }

    if (path.includes("/locations/provinces")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: mockLocations.provinces }),
      });
    }

    if (path.includes("/locations/schools")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: [] }),
      });
    }

    // 4. Auth session restoration
    if (path.includes("/auth/refresh-token")) {
      if (currentUser) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: { accessToken: "mock_jwt_access_token", user: currentUser },
          }),
        });
      }
      return route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ success: false, message: "Chưa đăng nhập" }),
      });
    }

    if (path.includes("/users/user-info")) {
      if (currentUser) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, data: { user: currentUser } }),
        });
      }
      return route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ success: false, message: "Chưa đăng nhập" }),
      });
    }

    // 5. Auth Login endpoint
    if (path.includes("/auth/login") && method === "POST") {
      const postData = req.postDataJSON() || {};
      if (postData.email === "admindemo@gmail.com" && postData.password === "Password123") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            message: "Đăng nhập thành công",
            data: { accessToken: "mock_admin_token", user: mockUsers.admin },
          }),
        });
      }
      if (postData.email === "minhanhuser@gmail.com" && postData.password === "Password123") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            message: "Đăng nhập thành công",
            data: { accessToken: "mock_user_token", user: mockUsers.student },
          }),
        });
      }
      return route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          message: "Email hoặc mật khẩu không chính xác",
        }),
      });
    }

    // 6. Auth Register endpoint
    if (path.includes("/auth/register") && method === "POST") {
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Mã OTP đã được gửi đến email của bạn",
          data: { email: "newuser@example.com" },
        }),
      });
    }

    // 7. Auth Forgot Password endpoint
    if (path.includes("/auth/forgot-password") && method === "POST") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "OTP khôi phục mật khẩu đã được gửi",
          data: { email: "test@example.com" },
        }),
      });
    }

    // 8. Admin Endpoints (phải đặt trước generic tutors/classes để không bị nuốt route)
    if (path.includes("/admin/tutors/stats")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            pendingCount: 5,
            approvedCount: 42,
            rejectedCount: 3,
            totalTutors: 50,
          },
        }),
      });
    }

    if (path.includes("/admin/tutors/pending")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            tutors: [
              {
                id: "pending_tutor_1",
                _id: "pending_tutor_1",
                fullName: "Trần Đăng Ký",
                email: "dangky@gmail.com",
                phone: "0912345678",
                status: "pending",
                subjects: ["Toán"],
                occupationStatus: "teacher",
                createdAt: "2026-11-15T08:00:00.000Z",
              },
            ],
            pagination: {
              page: 1,
              limit: 10,
              totalItems: 1,
              totalPages: 1,
            },
          },
        }),
      });
    }

    if (path.includes("/admin/users")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            users: [
              {
                _id: "user_a",
                fullName: "Nguyễn Văn A",
                email: "a@gmail.com",
                role: "user",
                isActive: true,
                createdAt: "2026-11-01T00:00:00.000Z",
              },
              {
                _id: "user_admin",
                fullName: "Admin Quản Trị",
                email: "admindemo@gmail.com",
                role: "admin",
                isActive: true,
                createdAt: "2026-10-01T00:00:00.000Z",
              },
            ],
            total: 2,
            page: 1,
            limit: 10,
          },
        }),
      });
    }

    if (path.includes("/admin/classes")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            classes: mockClasses,
            totalItems: mockClasses.length,
            totalPages: 1,
            page: 1,
            limit: 10,
          },
        }),
      });
    }

    // 9. Tutors public endpoints
    if (path.includes("/tutors/search") || path.includes("/tutors/active")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { tutors: mockTutors, total: mockTutors.length, page: 1 },
        }),
      });
    }

    if (path.includes("/tutors/top")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: mockTutors }),
      });
    }

    if (path.includes("/tutors/new")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: mockTutors }),
      });
    }

    if (!path.includes("/admin") && path.match(/\/tutors\/[^/]+$/) && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: mockTutors[0] }),
      });
    }

    if (path.includes("/tutors/register") && method === "POST") {
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Hồ sơ đăng ký gia sư đã được gửi thành công",
          data: { tutorId: "new_tutor_id" },
        }),
      });
    }

    // 10. Classes endpoints
    if (path.includes("/classes/pricing-config")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { pricingConfig: mockPricingConfig },
        }),
      });
    }

    if (path.includes("/classes/feed")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { classes: mockClasses, total: mockClasses.length, page: 1 },
        }),
      });
    }

    if (path.includes("/classes") && method === "POST") {
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Tạo yêu cầu tìm gia sư thành công",
          data: mockClasses[0],
        }),
      });
    }

    if (path.includes("/classes") && method === "GET") {
      if (path.match(/\/classes\/[^/]+$/)) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, data: mockClasses[0] }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            classes: mockClasses,
            totalItems: mockClasses.length,
            totalPages: 1,
            page: 1,
            limit: 10,
          },
        }),
      });
    }

    // 11. Notifications
    if (path.includes("/notifications")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { notifications: [], unreadCount: 0 },
        }),
      });
    }

    // Default fallback: 200 success
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: [] }),
    });
  });
}
