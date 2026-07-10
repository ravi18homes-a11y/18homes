Add-Type -AssemblyName System.Drawing
$srcPath = "c:\Users\HP\kush\Personal project\18homes\app\favicon.ico"
$destPath = "c:\Users\HP\kush\Personal project\18homes\app\favicon_new.ico"

$srcImg = [System.Drawing.Image]::FromFile($srcPath)
Write-Output "Original size: $($srcImg.Width)x$($srcImg.Height)"

$destImg = New-Object System.Drawing.Bitmap(48, 48)
$g = [System.Drawing.Graphics]::FromImage($destImg)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($srcImg, 0, 0, 48, 48)
$g.Dispose()

$destImg.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Icon)
$destImg.Dispose()
$srcImg.Dispose()
Write-Output "Saved new favicon to $destPath"
