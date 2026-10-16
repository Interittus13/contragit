import { describe, it, expect } from 'vitest';
import { renderTextToPixelMatrix, STENCILS } from '../lib/utils/pixelFont';

describe('pixelFont', () => {
  it('renders standard letters into 7-row boolean matrix', () => {
    const matrix = renderTextToPixelMatrix('HI');
    expect(matrix).toHaveLength(7);
    // 'H' (5 cols) + spacing (1 col) + 'I' (3 cols) = 9 columns
    expect(matrix[0].length).toBe(9);
  });

  it('handles spaces and symbols gracefully', () => {
    const matrix = renderTextToPixelMatrix('A B!');
    expect(matrix).toHaveLength(7);
    expect(matrix[0].length).toBeGreaterThan(0);
  });

  it('sanitizes unsupported characters cleanly', () => {
    const cleanMatrix = renderTextToPixelMatrix('OK');
    const dirtyMatrix = renderTextToPixelMatrix('O@#$%^&K');
    expect(dirtyMatrix[0].length).toBe(cleanMatrix[0].length);
  });

  it('contains valid predefined stencils with 7 rows', () => {
    expect(STENCILS.heart).toHaveLength(7);
    expect(STENCILS.invader).toHaveLength(7);
    expect(STENCILS.zigzag).toHaveLength(7);
  });
});
