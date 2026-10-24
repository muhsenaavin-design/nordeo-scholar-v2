// Apply the post-audit markup fixes: heading levels, section numbering, image decode hints.
$ErrorActionPreference = 'Stop'
$root = 'C:\Users\Avin Sena\nordeo-scholar-v2'

$jobs = @(
  @{ File = 'src\App.jsx'; From = '<h2>Discover</h2>'; To = '<h3>Discover</h3>'; Count = 1 },
  @{ File = 'src\App.jsx'; From = '<h2>For scholars</h2>'; To = '<h3>For scholars</h3>'; Count = 1 },
  @{ File = 'src\App.jsx'; From = '<h2>Let''s connect</h2>'; To = '<h3>Let''s connect</h3>'; Count = 1 },
  @{ File = 'src\App.jsx'; From = '02 / THE NORDEO ECOSYSTEM'; To = '03 / THE NORDEO ECOSYSTEM'; Count = 1 },
  @{ File = 'src\App.jsx'; From = '03 / YOUR PUBLISHING JOURNEY'; To = '04 / YOUR PUBLISHING JOURNEY'; Count = 1 },
  @{ File = 'src\App.jsx'; From = '04 / KNOWLEDGE IN NUMBERS'; To = '05 / KNOWLEDGE IN NUMBERS'; Count = 1 },
  @{ File = 'src\App.jsx'; From = '05 / THE PEOPLE BEHIND THE PAGES'; To = '06 / THE PEOPLE BEHIND THE PAGES'; Count = 1 },
  @{ File = 'src\App.jsx'; From = 'src="/assets/logo-transparent.png" width="220" height="60" alt="Nordeo Scholar Publishing" />'; To = 'src="/assets/logo-transparent.png" width="220" height="60" alt="Nordeo Scholar Publishing" decoding="async" />'; Count = 1 },
  @{ File = 'src\App.jsx'; From = 'src="/assets/logo-light.png" width="240" height="65" alt="Nordeo Scholar Publishing" />'; To = 'src="/assets/logo-light.png" width="240" height="65" alt="Nordeo Scholar Publishing" decoding="async" />'; Count = 1 },
  @{ File = 'src\App.jsx'; From = '<img src={image} alt={alt} width="1600" height="1195" loading="lazy" />'; To = '<img src={image} alt={alt} width="1600" height="1195" loading="lazy" decoding="async" />'; Count = 1 },
  @{ File = 'src\App.jsx'; From = 'src="/assets/about-shelves.webp" alt="Rak dan lorong perpustakaan dengan koleksi buku" width="880" height="1100" loading="lazy" />'; To = 'src="/assets/about-shelves.webp" alt="Rak dan lorong perpustakaan dengan koleksi buku" width="880" height="1100" loading="lazy" decoding="async" />'; Count = 1 },
  @{ File = 'src\App.jsx'; From = '<img src={visual.image} alt={visual.alt} width="1600" height="1195" />'; To = '<img src={visual.image} alt={visual.alt} width="1600" height="1195" decoding="async" />'; Count = 1 },
  @{ File = 'src\components\Discovery.jsx'; From = '<p className="eyebrow">DISCOVERY & SCHOLARLY METADATA</p>'; To = '<p className="eyebrow">01 / DISCOVERY &amp; SCHOLARLY METADATA</p>'; Count = 1 },
  @{ File = 'src\components\Discovery.jsx'; From = '<img src={platform.src} alt="" width="180" height="44" loading="lazy" />'; To = '<img src={platform.src} alt="" width="180" height="44" loading="lazy" decoding="async" />'; Count = 1 },
  @{ File = 'src\components\JournalFinder.jsx'; From = "eyebrow = '01 / JURNAL ILMIAH KAMI'"; To = "eyebrow = '02 / JURNAL ILMIAH KAMI'"; Count = 1 }
)

$failed = 0
foreach ($job in $jobs) {
  $path = Join-Path $root $job.File
  $text = [System.IO.File]::ReadAllText($path)
  $found = ([regex]::Matches($text, [regex]::Escape($job.From))).Count
  if ($found -ne $job.Count) {
    Write-Output "SKIP  ($found found, expected $($job.Count))  $($job.File)  <<$($job.From)>>"
    $failed++
    continue
  }
  $text = $text.Replace($job.From, $job.To)
  [System.IO.File]::WriteAllText($path, $text)
  Write-Output "OK    $($job.File)  <<$($job.From.Substring(0, [Math]::Min(48, $job.From.Length)))>>"
}

Write-Output "---"
Write-Output "applied: $($jobs.Count - $failed) / $($jobs.Count)"
