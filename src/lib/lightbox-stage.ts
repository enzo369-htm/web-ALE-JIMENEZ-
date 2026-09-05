/** Shared desktop lightbox stage metrics — admin notes editor must match these. */
export const LIGHTBOX_STAGE_PAD =
  "relative flex min-h-0 flex-1 flex-col px-4 pb-10 md:px-10";

/**
 * Center work image inside the stage.
 * Sized vs the stage (not the viewport) so % note coords stay aligned
 * between admin NotesEditorModal and public WorkLightbox.
 */
export const LIGHTBOX_CENTER_IMG_CLASS =
  "max-h-full max-w-[42%] object-contain";
