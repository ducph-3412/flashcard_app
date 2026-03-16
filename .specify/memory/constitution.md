# [PROJECT_NAME] Constitution
Flashcards Learning – Học thẻ ghi nhớ (spaced repetition)
Yêu cầu: Xây dựng app học Flashcards với lịch ôn theo spaced repetition. 
Mô tả: Người dùng tạo Deck và Card, luyện tập theo phiên (session), chấm mức độ nhớ (Again/Hard/Good/Easy) để hệ thống lên lịch ôn tự động.
Lưu data vào browser local storage để ko cần dùng DB riêng
UI minimalist + modern using tailwindcss
Mobile first layout

## Core Principles

### [PRINCIPLE_1_NAME]
<!-- Example: I. Library-First -->
[PRINCIPLE_1_DESCRIPTION]
<!-- Example: Every feature starts as a standalone library; Libraries must be self-contained, independently testable, documented; Clear purpose required - no organizational-only libraries -->

### [PRINCIPLE_2_NAME]
<!-- Example: II. CLI Interface -->
[PRINCIPLE_2_DESCRIPTION]
<!-- Example: Every library exposes functionality via CLI; Text in/out protocol: stdin/args → stdout, errors → stderr; Support JSON + human-readable formats -->

### [PRINCIPLE_3_NAME]
I. Test-First (NON-NEGOTIABLE)
[PRINCIPLE_3_DESCRIPTION]
TDD mandatory: Tests written  → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced

### [PRINCIPLE_4_NAME]
II. Integration Testing
[PRINCIPLE_4_DESCRIPTION]
Focus areas requiring integration tests: New library contract tests, Contract changes, Inter-service communication, Shared schemas

### [PRINCIPLE_5_NAME]
III. Observability, IV. Versioning & Breaking Changes, V. Simplicity
[PRINCIPLE_5_DESCRIPTION]
Text I/O ensures debuggability; Structured logging required; Or: MAJOR.MINOR.BUILD format; Or: Start simple, YAGNI principles

## [SECTION_2_NAME]
<!-- Example: Additional Constraints, Security Requirements, Performance Standards, etc. -->

[SECTION_2_CONTENT]
<!-- Example: Technology stack requirements, compliance standards, deployment policies, etc. -->

## [SECTION_3_NAME]
<!-- Example: Development Workflow, Review Process, Quality Gates, etc. -->

[SECTION_3_CONTENT]
<!-- Example: Code review requirements, testing gates, deployment approval process, etc. -->

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

[GOVERNANCE_RULES]
<!-- Example: All PRs/reviews must verify compliance; Complexity must be justified; Use [GUIDANCE_FILE] for runtime development guidance -->

**Version**: [CONSTITUTION_VERSION] | **Ratified**: [RATIFICATION_DATE] | **Last Amended**: [LAST_AMENDED_DATE]
<!-- Example: Version: 2.1.1 | Ratified: 2025-06-13 | Last Amended: 2025-07-16 -->
