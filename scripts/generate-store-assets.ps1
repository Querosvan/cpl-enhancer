param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot ".."))
)

Add-Type -AssemblyName System.Drawing

$assetsDir = Join-Path $Root "assets"
$storeDir = Join-Path $Root "store"
$storeAssetsDir = Join-Path $storeDir "assets"

New-Item -ItemType Directory -Force -Path $storeDir | Out-Null
New-Item -ItemType Directory -Force -Path $storeAssetsDir | Out-Null

$srcIcon = Join-Path $assetsDir "icon128.png"
$icon1024 = Join-Path $assetsDir "icon1024.png"
if (Test-Path $srcIcon) {
  if (-not (Test-Path $icon1024)) {
    Copy-Item $srcIcon $icon1024 -Force
  }
}

function New-ResizedPng {
  param(
    [string]$Source,
    [string]$Dest,
    [int]$Size
  )

  if (-not (Test-Path $Source)) {
    throw "Source image not found: $Source"
  }

  $img = [System.Drawing.Image]::FromFile($Source)
  $bmp = New-Object System.Drawing.Bitmap $Size, $Size
  $gfx = [System.Drawing.Graphics]::FromImage($bmp)
  $gfx.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $gfx.Clear([System.Drawing.Color]::Transparent)
  $gfx.DrawImage($img, 0, 0, $Size, $Size)
  $bmp.Save($Dest, [System.Drawing.Imaging.ImageFormat]::Png)
  $gfx.Dispose()
  $bmp.Dispose()
  $img.Dispose()
}

function Get-Font {
  param(
    [string]$Name,
    [float]$Size,
    [System.Drawing.FontStyle]$Style = [System.Drawing.FontStyle]::Regular
  )
  try {
    return New-Object System.Drawing.Font $Name, $Size, $Style
  } catch {
    return New-Object System.Drawing.Font "Arial", $Size, $Style
  }
}

function New-Canvas {
  param(
    [int]$Width,
    [int]$Height
  )
  $bmp = New-Object System.Drawing.Bitmap $Width, $Height
  $gfx = [System.Drawing.Graphics]::FromImage($bmp)
  $gfx.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  return @{ Bitmap = $bmp; Graphics = $gfx }
}

function Fill-Gradient {
  param(
    [System.Drawing.Graphics]$Gfx,
    [int]$Width,
    [int]$Height
  )
  $rect = New-Object System.Drawing.Rectangle 0, 0, $Width, $Height
  $start = [System.Drawing.Color]::FromArgb(255, 13, 19, 32)
  $end = [System.Drawing.Color]::FromArgb(255, 22, 98, 116)
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $start, $end, 20
  $Gfx.FillRectangle($brush, $rect)
  $brush.Dispose()

  $accent = [System.Drawing.Color]::FromArgb(32, 85, 193, 255)
  $pen = New-Object System.Drawing.Pen $accent, 2
  for ($i = 0; $i -lt 7; $i++) {
    $radius = 80 + ($i * 70)
    $x = 20 + ($i * 30)
    $y = $Height - 40 - ($i * 45)
    $Gfx.DrawEllipse($pen, $x, $y, $radius, $radius)
  }
  $pen.Dispose()
}

function Draw-Text {
  param(
    [System.Drawing.Graphics]$Gfx,
    [string]$Text,
    [System.Drawing.Font]$Font,
    [System.Drawing.Color]$Color,
    [int]$X,
    [int]$Y
  )
  $brush = New-Object System.Drawing.SolidBrush $Color
  $Gfx.DrawString($Text, $Font, $brush, $X, $Y)
  $brush.Dispose()
}

function Draw-Promo {
  param(
    [int]$Width,
    [int]$Height,
    [string]$OutPath,
    [string]$Title,
    [string]$Subtitle,
    [int]$IconSize
  )
  $canvas = New-Canvas -Width $Width -Height $Height
  $bmp = $canvas.Bitmap
  $gfx = $canvas.Graphics

  Fill-Gradient -Gfx $gfx -Width $Width -Height $Height

  $iconPath = $icon1024
  if (-not (Test-Path $iconPath)) {
    $iconPath = $srcIcon
  }
  $icon = [System.Drawing.Image]::FromFile($iconPath)
  $iconX = [int]([Math]::Round($Width * 0.07))
  $iconY = [int]([Math]::Round(($Height - $IconSize) / 2))
  $gfx.DrawImage($icon, $iconX, $iconY, $IconSize, $IconSize)
  $icon.Dispose()

  $titleFont = Get-Font -Name "Segoe UI Semibold" -Size ([Math]::Max(18, [int]($Height * 0.16))) -Style ([System.Drawing.FontStyle]::Bold)
  $subFont = Get-Font -Name "Segoe UI" -Size ([Math]::Max(14, [int]($Height * 0.08))) -Style ([System.Drawing.FontStyle]::Regular)

  $white = [System.Drawing.Color]::FromArgb(235, 244, 248)
  $accent = [System.Drawing.Color]::FromArgb(255, 85, 193, 255)

  $textX = $iconX + $IconSize + [int]([Math]::Round($Width * 0.05))
  $textY = [int]([Math]::Round($Height * 0.30))
  Draw-Text -Gfx $gfx -Text $Title -Font $titleFont -Color $white -X $textX -Y $textY
  Draw-Text -Gfx $gfx -Text $Subtitle -Font $subFont -Color $accent -X $textX -Y ($textY + [int]($Height * 0.18))

  $titleFont.Dispose()
  $subFont.Dispose()

  $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $gfx.Dispose()
  $bmp.Dispose()
}

function Draw-ScreenshotTemplate {
  param(
    [int]$Width,
    [int]$Height,
    [string]$OutPath
  )
  $canvas = New-Canvas -Width $Width -Height $Height
  $bmp = $canvas.Bitmap
  $gfx = $canvas.Graphics

  $bg = [System.Drawing.Color]::FromArgb(255, 245, 247, 250)
  $gfx.Clear($bg)

  $headerBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 18, 44, 60))
  $headerRect = New-Object System.Drawing.Rectangle 0, 0, $Width, 110
  $gfx.FillRectangle($headerBrush, $headerRect)
  $headerBrush.Dispose()

  $titleFont = Get-Font -Name "Segoe UI Semibold" -Size 30 -Style ([System.Drawing.FontStyle]::Bold)
  $subFont = Get-Font -Name "Segoe UI" -Size 16 -Style ([System.Drawing.FontStyle]::Regular)
  $white = [System.Drawing.Color]::FromArgb(255, 250, 252, 255)
  Draw-Text -Gfx $gfx -Text "CPL Enhancer" -Font $titleFont -Color $white -X 40 -Y 32
  Draw-Text -Gfx $gfx -Text "Plantilla de captura (reemplazar por pantalla real)" -Font $subFont -Color $white -X 40 -Y 72
  $titleFont.Dispose()
  $subFont.Dispose()

  $panelFill = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
  $panelBorder = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 220, 228, 235), 2)

  $panel1 = New-Object System.Drawing.Rectangle 60, 160, 560, 560
  $panel2 = New-Object System.Drawing.Rectangle 660, 160, 560, 560
  $gfx.FillRectangle($panelFill, $panel1)
  $gfx.FillRectangle($panelFill, $panel2)
  $gfx.DrawRectangle($panelBorder, $panel1)
  $gfx.DrawRectangle($panelBorder, $panel2)

  $panelTitleFont = Get-Font -Name "Segoe UI Semibold" -Size 18 -Style ([System.Drawing.FontStyle]::Bold)
  $panelBodyFont = Get-Font -Name "Segoe UI" -Size 14 -Style ([System.Drawing.FontStyle]::Regular)
  $textColor = [System.Drawing.Color]::FromArgb(255, 38, 66, 82)

  Draw-Text -Gfx $gfx -Text "Transfers: presets" -Font $panelTitleFont -Color $textColor -X 90 -Y 190
  Draw-Text -Gfx $gfx -Text "Tabs Now / Pot" -Font $panelBodyFont -Color $textColor -X 90 -Y 225
  Draw-Text -Gfx $gfx -Text "Badges y edades" -Font $panelBodyFont -Color $textColor -X 90 -Y 250

  Draw-Text -Gfx $gfx -Text "Cards resaltadas" -Font $panelTitleFont -Color $textColor -X 690 -Y 190
  Draw-Text -Gfx $gfx -Text "Bordes por habilidad" -Font $panelBodyFont -Color $textColor -X 690 -Y 225
  Draw-Text -Gfx $gfx -Text "Gradientes de edad" -Font $panelBodyFont -Color $textColor -X 690 -Y 250

  $panelTitleFont.Dispose()
  $panelBodyFont.Dispose()
  $panelFill.Dispose()
  $panelBorder.Dispose()

  $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $gfx.Dispose()
  $bmp.Dispose()
}

Write-Host "Resizing icons..."
New-ResizedPng -Source $icon1024 -Dest (Join-Path $assetsDir "icon16.png") -Size 16
New-ResizedPng -Source $icon1024 -Dest (Join-Path $assetsDir "icon48.png") -Size 48
New-ResizedPng -Source $icon1024 -Dest (Join-Path $assetsDir "icon128.png") -Size 128

Write-Host "Generating store assets..."
Draw-Promo -Width 440 -Height 280 -OutPath (Join-Path $storeAssetsDir "promo-small-440x280.png") -Title "CPL Enhancer" -Subtitle "Presets, badges y edades" -IconSize 140
Draw-Promo -Width 1400 -Height 560 -OutPath (Join-Path $storeAssetsDir "promo-marquee-1400x560.png") -Title "CPL Enhancer" -Subtitle "Mejoras rapidas para CPLManager" -IconSize 360
Draw-ScreenshotTemplate -Width 1280 -Height 800 -OutPath (Join-Path $storeAssetsDir "screenshot-template-1280x800.png")

Write-Host "Done. Assets generated in $storeAssetsDir"
