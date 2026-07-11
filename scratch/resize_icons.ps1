Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param (
        [string]$Path,
        [int]$Width,
        [int]$Height
    )
    if (-not (Test-Path $Path)) {
        Write-Error "File not found: $Path"
        return
    }
    
    $img = [System.Drawing.Image]::FromFile($Path)
    $bmp = New-Object System.Drawing.Bitmap($Width, $Height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $g.DrawImage($img, 0, 0, $Width, $Height)
    
    $g.Dispose()
    $img.Dispose()
    
    $tempPath = $Path + ".tmp"
    $bmp.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    
    Move-Item -Path $tempPath -Destination $Path -Force
    Write-Output "Successfully resized $Path to ${Width}x${Height}"
}

$dir = "c:\Users\HP\kush\Personal project\18homes\public"
Resize-Image -Path "$dir\icon-192.png" -Width 192 -Height 192
Resize-Image -Path "$dir\icon-512.png" -Width 512 -Height 512
