import { expect, test } from 'vitest';
import { htmlToText, sanitizeHtml } from './rich-text';

test('keeps the Word-style formats the editor offers', () => {
  const html = '<h2>Heading 1</h2><h3>Heading 2</h3><p>m<sup>2</sup> and CO<sub>2</sub> <mark>penting</mark> <strong>tebal</strong> <em>miring</em> <u>garis</u> <s>coret</s></p><ul><li>satu<ul><li>dua</li></ul></li></ul>';
  expect(sanitizeHtml(html)).toBe(html);
});

test('turns styled spans from the editor and from Word into tags', () => {
  expect(sanitizeHtml('<p><span style="background-color: rgb(255, 241, 168);">stabilo</span></p>')).toBe('<p><mark>stabilo</mark></p>');
  expect(sanitizeHtml('<p><span style="vertical-align: super">2</span></p>')).toBe('<p><sup>2</sup></p>');
  expect(sanitizeHtml('<p><span style="background: white">biasa</span></p>')).toBe('<p>biasa</p>');
});

test('still drops scripts, unsafe links, and stray attributes', () => {
  expect(sanitizeHtml('<p onclick="x()">a<script>alert(1)</script><a href="javascript:alert(1)">b</a><mark class="x">c</mark></p>')).toBe('<p>ab<mark>c</mark></p>');
  expect(htmlToText('<h2>Judul</h2><p>Isi <sup>2</sup></p>')).toBe('Judul\nIsi 2');
});
