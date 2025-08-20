MyCat 🐾
MyCat là một phiên bản tùy biến mở rộng, và dịch đa ngôn ngữ của ứng dụng "Bongo Cat" nổi tiếng, cho phép bạn hiển thị một chú mèo (hoặc bất kỳ nhân vật nào khác) tương tác với chuột, bàn phím, và gamepad của bạn ngay trên màn hình desktop.

Dự án này được xây dựng lại từ đầu bằng Tauri, Vue 3, và Vite, mang lại hiệu năng cao, dung lượng nhẹ và khả năng tùy biến mạnh mẽ.

✨ Tính năng nổi bật
Hỗ trợ đa nhân vật: Không chỉ giới hạn ở một chú mèo, bạn có thể dễ dàng thêm nhiều nhân vật (model) khác nhau.

Hỗ trợ đa chế độ (Mode): Mỗi nhân vật có thể có nhiều chế độ tương tác khác nhau (ví dụ: gõ phím, dùng chuột, chơi game).

Hiệu năng cao: Được viết bằng Rust và Tauri, MyCat rất nhẹ và tiêu thụ ít tài nguyên hệ thống.

Tùy biến linh hoạt: Dễ dàng thêm các model và keymap mới thông qua việc tạo các thư mục và file hình ảnh.

Giao diện cài đặt hiện đại: Giao diện cài đặt trực quan giúp bạn dễ dàng chuyển đổi giữa các nhân vật, điều chỉnh tỷ lệ và các thiết lập khác.

Tự động cập nhật: Ứng dụng có sẵn tính năng tự động kiểm tra và cài đặt các phiên bản mới.

🚀 Cài đặt
Bạn có thể tải phiên bản mới nhất cho hệ điều hành của mình từ trang Releases.

Windows: Tải file .exe hoặc .msi và chạy để cài đặt.

macOS: Tải file .dmg. -> lười chưa làm

Linux: Tải file .AppImage hoặc .deb. -> lười tiếp

🛠️ Hướng dẫn sử dụng
Sau khi cài đặt và khởi chạy, nhân vật mặc định sẽ xuất hiện trên màn hình của bạn.

Mở Cài đặt (Settings): Chuột phải vào nhân vật và chọn "Settings" để mở cửa sổ cài đặt.

Chọn nhân vật (Model): Trong tab "Mô hình", bạn có thể thấy danh sách tất cả các nhân vật hiện có. Click vào một card để chuyển đổi.

Tùy chỉnh khác:

Chung: Cài đặt các tùy chọn như khởi động cùng hệ thống, tỷ lệ (scale) của nhân vật.

Phím tắt: Thiết lập các phím tắt toàn cục để điều khiển ứng dụng.


🎨 Tùy biến: Thêm nhân vật của riêng bạn
Đây là phần thú vị nhất! Bạn có thể dễ dàng thêm các nhân vật của riêng mình.

Cấu trúc thư mục
Ứng dụng sẽ tự động nhận diện các model theo cấu trúc thư mục sau trong thư mục cài đặt (assets/models):

assets/models/
├── TenNhanVat1/
│   ├── che_do_1/
│   │   ├── resources/
│   │   │   ├── cover.png  (Ảnh bìa, gợi ý 612x354)
│   │   │   └── ...
│   │   ├── left-keys/     (Chứa các ảnh cho tay trái)
│   │   └── right-keys/    (Chứa các ảnh cho tay phải)
│   └── che_do_2/
│       └── ...
└── TenNhanVat2/
    └── ...

Các bước thực hiện:
Tìm thư mục assets: Chuột phải vào nhân vật trên màn hình -> "Settings" -> tab "Mô hình". Click vào biểu tượng thư mục trên bất kỳ model nào để mở thư mục assets/models.

Tạo thư mục nhân vật: Trong models, tạo một thư mục mới với tên nhân vật của bạn (ví dụ: Paimon).

Tạo thư mục chế độ: Bên trong thư mục Paimon, tạo một thư mục con cho chế độ (ví dụ: standard).

Thêm các file cần thiết:

Tạo thư mục resources và đặt ảnh bìa cover.png vào đó.

Tạo các thư mục left-keys, right-keys,... và đặt các file ảnh tương ứng (ví dụ: a.png, b.png, mouse.png,...) vào đó.

Khởi động lại ứng dụng: Khởi động lại MyCat để nó nhận diện model mới của bạn.

💻 Dành cho Lập trình viên (Development)
Nếu bạn muốn đóng góp hoặc tự build dự án, hãy làm theo các bước sau:

Yêu cầu:

Node.js (khuyến nghị dùng pnpm)

Rust

Các dependency cho Tauri (làm theo hướng dẫn của Tauri)

Các bước cài đặt:

# Clone repository
git clone https://github.com/chill4share/MyCat.git
cd MyCat

# Cài đặt các gói phụ thuộc
pnpm install

# Chạy môi trường development
pnpm dev

Build ứng dụng:

pnpm tauri build -->> có thể mở PS để chạy trực tiếp lệnh build: .\buildEXE.ps1

🙏 Đóng góp
Mọi đóng góp đều được chào đón! Vui lòng tạo một "Issue" để thảo luận về các thay đổi lớn hoặc tạo một "Pull Request" cho các bản sửa lỗi và cải tiến nhỏ.

Giấy phép
Dự án này được cấp phép theo MIT License.