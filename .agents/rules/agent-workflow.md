---
description: AI Agent workflow for daily-purchase-admin. Enforces the 11-stage development lifecycle and mandatory rules.
alwaysApply: true
---

# DAILY PURCHASE ADMIN - AGENT WORKFLOW (`agent-workflow.md`)

## 1. Nguyên Tắc Cốt Lõi (Core Directive)

AI Agent khi thực hiện bất kỳ công việc nào trong dự án **`daily-purchase-admin`** bắt buộc phải tuân thủ nghiêm ngặt:
1. **Vòng đời 11 bước**: `GRILL → PLAN APPROVED → IMPLEMENT → TEST → FIX ↺ → TEST PASS → AUDIT → HARDEN → REGRESSION PASS → ACCEPTED → CLOSED`.
2. **Khóa an toàn Git**: Tuyệt đối không tự ý chạy `git add`, `git commit`, `git push`.
3. **Secret Zero**: Tuyệt đối không hardcode mật khẩu, mã PIN, token hay credentials.
4. **Minimal SaaS 2026–2027 & Galaxy A35 5G**: Touch targets $\ge 44\text{px}$, font input $\ge 16\text{px}$, `tabular-nums` cho số lượng và VNĐ, triệt tiêu tràn ngang và biểu tượng AI thừa thãi.
5. **Tài liệu song ngữ**: Duy trì song song `README.md` và `README_en.md`.

Chi tiết toàn bộ quy chuẩn xem tại:
- [setting-rules.md](file:///d:/01_HOME/005_VIBE_AI/08_daily-purchase-admin/.agents/rules/setting-rules.md)
- [lifecycle-11-stages.md](file:///d:/01_HOME/005_VIBE_AI/08_daily-purchase-admin/.agents/rules/lifecycle-11-stages.md)
- [git-safety-and-secrets.md](file:///d:/01_HOME/005_VIBE_AI/08_daily-purchase-admin/.agents/rules/git-safety-and-secrets.md)
- [ui-ux-design-rules.md](file:///d:/01_HOME/005_VIBE_AI/08_daily-purchase-admin/.agents/rules/ui-ux-design-rules.md)
- [fullstack-architecture.md](file:///d:/01_HOME/005_VIBE_AI/08_daily-purchase-admin/.agents/rules/fullstack-architecture.md)
- [testing-and-verification.md](file:///d:/01_HOME/005_VIBE_AI/08_daily-purchase-admin/.agents/rules/testing-and-verification.md)
- [language-and-docs.md](file:///d:/01_HOME/005_VIBE_AI/08_daily-purchase-admin/.agents/rules/language-and-docs.md)

