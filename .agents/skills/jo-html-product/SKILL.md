---
name: jo-html-product
description: >-
  Rules and design guidelines for creating and optimizing HTML prototypes.
  Ensures multi-terminal responsiveness, strict metadata filtering, code/data sector separation, and structured optimization.
---

# jo-html-product

## Overview
This skill acts as a guidelines wrapper for implementing and optimizing HTML prototypes based on Product Manager (PM) requirements. It configures the agent to act as a Senior Engineer, Senior Product Manager, and Senior UI Designer.

> [!IMPORTANT]
> Whenever you perform ANY modification or optimization to existing HTML code in this workspace, you MUST first read the optimization requirements in this skill.

## Dependencies
- None. (Optional: [html-prd-annotator](file:///Users/barry/Desktop/工作/享宇森云/商流/.agents/skills/html-prd-annotator/SKILL.md) if annotator is needed).

## Design Rules

### 1. Multi-Terminal Strategy
- Distinguish between H5 (mobile) and Web (desktop) requirements.
- Separate implementations into different HTML files per terminal type (e.g. `index_h5.html` and `index_web.html`).
- Adapt interaction patterns, layout structure, and spacing specifically for each device form factor.

### 2. Code-Level Menu/Sector Partitioning
- Avoid over-engineering UI design with unnecessary visual features. Keep it minimal and clean.
- Partition components and functional sections at the **code level** (using comments or wrapper containers) to define "menus" or "sectors":
  ```html
  <!-- ==========================================
       SECTOR: [Menu/Sector Name]
       DESCRIPTION: [Purpose/Context of this sector]
       ========================================== -->
  ```
- Keep all local styles, templates, and scripts scoped or grouped within these sector comments to facilitate fast code lookup.

### 3. Data-Level Sector Partitioning
- Separate application states or mock data at the script level mapped directly to the code-level sectors:
  ```javascript
  const state = {
    global: {},
    sector_auth: {},
    sector_product_list: {},
  };
  ```

### 4. Direct Instruction Filtering
- Do not print metadata rules or design descriptions directly on the UI labels.
- For example: if a requirement lists a field as "required", "optional", or "must be integer", implement these as functional constraints (red asterisk validation, input attributes like `required` or `type="number"`, placeholders) but do not output the literal text words "required"/"optional"/"must be integer" as field helpers unless explicitly requested to do so for public display.

## Optimization Workflow
When the user requests optimization for a specific HTML file and menu/sector:
1. **Always read this SKILL.md first** to align with the core guidelines.
2. Locate the target HTML file specified by the user.
3. Identify the sector block comments within that file.
4. Keep modifications surgical. Do not leak styles or logic outside the targeted sector unless global synchronization is required.
5. Update state properties within the corresponding data namespace.

## Common Mistakes
1. **Direct Instruction Rendering**: Writing "(required)" or "(integer only)" directly inside labels instead of using attributes (`required`, `step="1"`).
2. **Global Spillover**: Editing styles or functions outside the target sector comment blocks, causing regression in other menus/sectors.
3. **No Terminal Adaptation**: Using a single desktop layout scaled down for mobile instead of a dedicated H5 file layout.
