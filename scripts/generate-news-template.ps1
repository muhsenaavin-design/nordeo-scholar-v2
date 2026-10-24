$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = Split-Path -Parent $PSScriptRoot
$build = Join-Path $env:TEMP ('nordeo-docx-' + [guid]::NewGuid().ToString('N'))
$word = Join-Path $build 'word'
$rels = Join-Path $build '_rels'
$props = Join-Path $build 'docProps'
New-Item -ItemType Directory -Path $word, $rels, $props, (Join-Path $word '_rels') -Force | Out-Null

$utf8 = New-Object System.Text.UTF8Encoding($false)
function Write-TextFile($path, $text) {
  [System.IO.File]::WriteAllText($path, $text, $utf8)
}

$contentTypes = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>
'@
Write-TextFile (Join-Path $build '[Content_Types].xml') $contentTypes

$packageRels = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
'@
Write-TextFile (Join-Path $rels '.rels') $packageRels

$documentRels = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>
'@
Write-TextFile (Join-Path $word '_rels\document.xml.rels') $documentRels

$core = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Nordeo News Submission Form</dc:title>
  <dc:creator>Nordeo Scholar Publishing</dc:creator>
  <cp:lastModifiedBy>Nordeo Scholar Publishing</cp:lastModifiedBy>
  <dc:language>id-ID</dc:language>
</cp:coreProperties>
'@
Write-TextFile (Join-Path $props 'core.xml') $core

$app = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Nordeo Scholar Publishing</Application>
</Properties>
'@
Write-TextFile (Join-Path $props 'app.xml') $app

$styles = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault><w:rPr><w:rFonts w:ascii="Manrope" w:hAnsi="Manrope" w:eastAsia="Manrope"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:rPrDefault>
    <w:pPrDefault><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:before="0" w:after="240"/></w:pPr><w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/><w:b/><w:color w:val="123742"/><w:sz w:val="48"/><w:szCs w:val="48"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="360" w:after="160"/><w:pBdr><w:top w:val="single" w:sz="8" w:space="8" w:color="D8DFDC"/></w:pBdr></w:pPr><w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/><w:b/><w:color w:val="215A68"/><w:sz w:val="30"/><w:szCs w:val="30"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Kicker"><w:name w:val="Kicker"/><w:basedOn w:val="Normal"/><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:color w:val="8F4A37"/><w:sz w:val="18"/><w:szCs w:val="18"/><w:spacing w:val="60"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Small"><w:name w:val="Small"/><w:basedOn w:val="Normal"/><w:rPr><w:color w:val="5C6B6F"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr></w:style>
</w:styles>
'@
Write-TextFile (Join-Path $word 'styles.xml') $styles

$body = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>
<w:p><w:pPr><w:pStyle w:val="Kicker"/></w:pPr><w:r><w:t>NORDEO SCHOLAR · NEWSROOM</w:t></w:r></w:p>
<w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr><w:r><w:t>Form Pengajuan Berita</w:t></w:r></w:p>
<w:p><w:r><w:t>Gunakan dokumen ini untuk menyiapkan kiriman berita sebelum mengisi formulir digital di nordeoscholar.com/news/submit. Simpan dokumen dengan format: Nama_Penulis_JudulSingkat.docx.</w:t></w:r></w:p>
<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>1. Informasi utama</w:t></w:r></w:p>
<w:tbl>
  <w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="D8DFDC"/><w:left w:val="single" w:sz="4" w:color="D8DFDC"/><w:bottom w:val="single" w:sz="4" w:color="D8DFDC"/><w:right w:val="single" w:sz="4" w:color="D8DFDC"/><w:insideH w:val="single" w:sz="4" w:color="D8DFDC"/><w:insideV w:val="single" w:sz="4" w:color="D8DFDC"/></w:tblBorders><w:tblCellMar><w:top w:w="120" w:type="dxa"/><w:left w:w="160" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:right w:w="160" w:type="dxa"/></w:tblCellMar></w:tblPr>
  <w:tblGrid><w:gridCol w:w="2800"/><w:gridCol w:w="6200"/></w:tblGrid>
  <w:tr><w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Judul berita</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t> </w:t></w:r></w:p></w:tc></w:tr>
  <w:tr><w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Kategori</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Riset / Kampus &amp; Komunitas / Kebijakan / Pengumuman</w:t></w:r></w:p></w:tc></w:tr>
  <w:tr><w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Penulis / kontributor</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t> </w:t></w:r></w:p></w:tc></w:tr>
  <w:tr><w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Email dan institusi</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t> </w:t></w:r></w:p></w:tc></w:tr>
  <w:tr><w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Ringkasan / lead</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Maksimal 200 kata. Jelaskan apa yang terjadi, mengapa penting, dan siapa yang terlibat.</w:t></w:r></w:p></w:tc></w:tr>
  <w:tr><w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Jadwal tayang</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Tanggal dan waktu (WIB). Beri catatan bila menyesuaikan momen tertentu.</w:t></w:r></w:p></w:tc></w:tr>
  <w:tr><w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Tautan sumber</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Dokumen, siaran pers, publikasi, atau data pendukung.</w:t></w:r></w:p></w:tc></w:tr>
</w:tbl>
<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>2. Berkas gambar</w:t></w:r></w:p>
<w:p><w:r><w:t>Lampirkan satu gambar utama berlisensi jelas. Rasio 16:10 atau 4:3, sisi terpendek minimal 1200 px, ukuran maksimal 5 MB. Sertakan kredit fotografer dan teks alternatif (alt text) yang menjelaskan isi gambar tanpa mengulang judul.</w:t></w:r></w:p>
<w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Nama berkas:</w:t></w:r><w:r><w:t> ______________________________________________</w:t></w:r></w:p>
<w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Kredit / lisensi:</w:t></w:r><w:r><w:t> ______________________________________</w:t></w:r></w:p>
<w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Alt text:</w:t></w:r><w:r><w:t> __________________________________________</w:t></w:r></w:p>
<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>3. Checklist kelengkapan</w:t></w:r></w:p>
<w:p><w:r><w:t>☐  Judul sudah spesifik dan tidak clickbait.</w:t></w:r></w:p>
<w:p><w:r><w:t>☐  Ringkasan memuat 5W1H dan sudah diverifikasi.</w:t></w:r></w:p>
<w:p><w:r><w:t>☐  Gambar utama tersedia, tajam, dan bebas hak atau berizin.</w:t></w:r></w:p>
<w:p><w:r><w:t>☐  Jadwal tayang sudah disepakati dengan editor.</w:t></w:r></w:p>
<w:p><w:r><w:t>☐  Narasumber sudah memberi izin kutipan dan atribusi.</w:t></w:r></w:p>
<w:p><w:r><w:t>☐  Tautan sumber dan data pendukung sudah dilampirkan.</w:t></w:r></w:p>
<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>4. Alur publikasi</w:t></w:r></w:p>
<w:p><w:r><w:rPr><w:b/></w:rPr><w:t>01 · Kirim.</w:t></w:r><w:r><w:t> Isi formulir digital dan unggah draft, gambar, serta jadwal.</w:t></w:r></w:p>
<w:p><w:r><w:rPr><w:b/></w:rPr><w:t>02 · Kurasi.</w:t></w:r><w:r><w:t> Editor memeriksa sudut cerita, kelengkapan, dan kesesuaian kanal.</w:t></w:r></w:p>
<w:p><w:r><w:rPr><w:b/></w:rPr><w:t>03 · Editing.</w:t></w:r><w:r><w:t> Penyuntingan bahasa, judul, struktur, dan verifikasi sumber.</w:t></w:r></w:p>
<w:p><w:r><w:rPr><w:b/></w:rPr><w:t>04 · Jadwal.</w:t></w:r><w:r><w:t> Artikel dijadwalkan sesuai kalender redaksi dan kesiapan gambar.</w:t></w:r></w:p>
<w:p><w:r><w:rPr><w:b/></w:rPr><w:t>05 · Terbit.</w:t></w:r><w:r><w:t> Publikasi, distribusi, dan arsip di kanal News Nordeo.</w:t></w:r></w:p>
<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>5. Kontak redaksi</w:t></w:r></w:p>
<w:p><w:r><w:t>Email: news@nordeoscholar.com · WhatsApp editorial: +62 822-3221-8619</w:t></w:r></w:p>
<w:p><w:pPr><w:pStyle w:val="Small"/></w:pPr><w:r><w:t>Nordeo Scholar Publishing · Knowledge grows when shared.</w:t></w:r></w:p>
<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>
</w:body>
</w:document>
'@
Write-TextFile (Join-Path $word 'document.xml') $body

$outDir = Join-Path $root 'public\templates'
New-Item -ItemType Directory -Path $outDir -Force | Out-Null
$outFile = Join-Path $outDir 'Nordeo-News-Submission-Form.docx'
if (Test-Path $outFile) { Remove-Item $outFile -Force }
[System.IO.Compression.ZipFile]::CreateFromDirectory($build, $outFile, [System.IO.Compression.CompressionLevel]::Optimal, $false)
Remove-Item -Recurse -Force $build

$item = Get-Item $outFile
Write-Output ("Created {0} ({1} bytes)" -f $item.FullName, $item.Length)
