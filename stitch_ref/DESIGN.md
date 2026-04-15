```markdown
# Design System Specification: The Editorial Clinical Aesthetic

## 1. Overview & Creative North Star
**Creative North Star: "The Curated Clinical"**

This design system moves away from the sterile, blue-heavy layouts of traditional medicine and the overly soft, generic "wellness" aesthetic of a spa. Instead, we embrace a high-end editorial direction. Think of this system as a prestigious medical publication: authoritative, expansive, and meticulously composed. 

We break the "template" look through **intentional asymmetry**, where text blocks and imagery are offset to create a sense of bespoke craftsmanship. We utilize **tonal depth** instead of structural lines, treating the interface as a physical workspace of layered fine paper and frosted glass. This approach conveys a "quiet luxury" that reinforces professional expertise and medical precision.

---

## 2. Colors & Tonal Architecture
The palette is rooted in organic, skin-adjacent tones, providing a warm yet professional backdrop for clinical excellence.

### Surface Hierarchy & Nesting
To achieve a premium feel, we prohibit 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts.
*   **The "No-Line" Rule:** Do not use dividers to separate sections. Use the `surface-container` tiers to create hierarchy. 
*   **Layering Logic:** Treat the UI as a series of physical layers. Place a `surface-container-lowest` (pure white) card on a `surface-container-low` (#f5f3ee) section to create a soft, natural lift.
*   **Glassmorphism:** For floating navigation or modals, use `surface` colors at 80% opacity with a `20px` backdrop-blur. This allows the warmth of the background to bleed through, softening the interface.

| Role | Token | Hex | Application |
| :--- | :--- | :--- | :--- |
| **Primary Background** | `surface` | `#fbf9f4` | The foundational canvas. |
| **Secondary (Accent)** | `secondary` | `#7d563b` | Terracotta copper for subtle highlights/CTAs. |
| **Primary Text** | `on_surface` | `#1b1c19` | High-contrast charcoal for clinical authority. |
| **Deepest Container** | `surface_container_highest` | `#e4e2dd` | Used for "inset" content areas. |
| **Highest Container** | `surface_container_lowest` | `#ffffff` | Used for "raised" interactive elements. |

---

## 3. Typography: High-Contrast Editorial
The contrast between the sophisticated serif and the technical sans-serif mimics the layout of a premium medical journal.

*   **Display & Headlines (`Newsreader`):** Use for patient-facing emotional hooks and section headers. The high stroke-contrast of Newsreader provides the "Editorial" soul.
    *   *Note:* Use `display-lg` (3.5rem) with generous letter-spacing (-0.02em) for hero statements to command attention.
*   **Body & UI (`Manrope`):** A modern, technical sans-serif used for clinical descriptions, data, and functional UI elements. It provides the "Medical" balance to the serif's elegance.
    *   *Note:* Maintain a line-height of `1.6` for `body-lg` to ensure the interface feels airy and legible for medical information.

---

## 4. Elevation & Depth
We eschew traditional drop shadows in favor of **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by "stacking" tones. A `surface-container-low` card sitting on a `surface` background creates a sophisticated, tactile feel without the visual "noise" of a shadow.
*   **Ambient Shadows:** Where a floating effect is required (e.g., a primary CTA button or a modal), use a shadow with a `32px` blur, `0px` spread, and a 4% opacity using the `on_surface` color. It should feel like a soft glow, not a dark edge.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use `outline_variant` at **15% opacity**. This creates a suggestion of a container without breaking the editorial flow.

---

## 5. Components

### Buttons
*   **Primary:** `on_primary_container` (#414141) background with `surface` text. Rectangular with a slight `sm` (0.125rem) or `none` radius for a sharp, professional look.
*   **Secondary:** `outline` color, but only at 0.5px thickness. No fill.
*   **Tertiary:** All caps `label-md` text with a 1px underline offset by 4px.

### Cards
*   **Rule:** No borders, no heavy shadows. 
*   **Style:** Use a `surface_container_low` background. Use `Newsreader` for titles and `Manrope` for metadata. Ensure padding is at least `32px` to respect the "Generous Whitespace" mandate.

### Input Fields
*   **Style:** Minimalist. Only a bottom border using `outline_variant`.
*   **State:** When focused, the bottom border transitions to `secondary` (Terracotta) and the label shifts to `label-sm`.

### Lists & Navigation
*   **Rule:** Forbid the use of horizontal divider lines. 
*   **Spacing:** Increase vertical padding between list items (using `1.5rem` or higher) to allow each medical service or item to "breathe." Separation is achieved through white space.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical grid layouts. Align a headline to the left and a body paragraph to the center-right to create an editorial feel.
*   **Do** use the `secondary` (Terracotta) sparingly. It should be a "discovery" color for specific call-outs, not a dominant theme.
*   **Do** prioritize imagery that features soft, natural lighting and clinical environments that look architectural and clean.

### Don’t:
*   **Don’t** use the `full` (pill-shaped) roundedness for buttons; it feels too much like a "app" and not enough like a "clinic." Stick to `sm` (0.125rem).
*   **Don’t** use standard blue for links. Links should be `on_surface` with an underline or `secondary`.
*   **Don’t** clutter the screen. If a page feels full, increase the `surface` spacing. The patient should feel a sense of calm and order.
*   **Don't** use 100% black. Always use the soft charcoal `on_surface` (#1B1C19) to maintain the delicate nature of the palette.

---

## 7. Signature Details
To elevate the experience from "Standard" to "Premium":
*   **Micro-interactions:** When hovering over a card, the background should subtly shift from `surface_container_low` to `surface_container_high`.
*   **Icons:** Use ultra-thin (1pt) linear icons. Icons should never be filled; they should appear as delicate wireframes that complement the `Newsreader` typeface.
*   **Grain:** Consider a subtle, 2% opacity noise texture overlay on the `surface` background to mimic the feel of high-quality stationary.```