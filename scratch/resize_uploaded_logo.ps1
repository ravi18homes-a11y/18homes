Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param (
        [string]$SourcePath,
        [string]$DestinationPath,
        [int]$Width,
        [int]$Height
    )
    if (-not (Test-Path $SourcePath)) {
        Write-Error "Source file not found: $SourcePath"
        return
    }
    
    $img = [System.Drawing.Image]::FromFile($SourcePath)
    $bmp = New-Object System.Drawing.Bitmap($Width, $Height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    # Draw the source image resized into the destination bitmap
    $g.DrawImage($img, 0, 0, $Width, $Height)
    
    $g.Dispose()
    $img.Dispose()
    
    $tempPath = $DestinationPath + ".tmp"
    $bmp.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    
    Move-Item -Path $tempPath -Destination $DestinationPath -Force
    Write-Output "Successfully resized and saved to $DestinationPath as ${Width}x${Height} PNG"
}

$source = "C:\Users\HP\.gemini\antigravity-ide\brain\f2c2594d-a9c4-4bce-be1a-914a02c7c1f8\media__1783795664271.jpg"
$destDir = "c:\Users\HP\kush\Personal project\18homes\public"

Resize-Image -SourcePath $source -DestinationPath "$destDir\icon-192.png" -Width 192 -Height 192
Resize-Image -SourcePath $source -DestinationPath "$destDir\icon-512.png" -Width 512 -Height 512
