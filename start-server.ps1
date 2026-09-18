# PowerShell Скрипт за стартиране на локален уеб сървър за Spica Astro
$Port = 8080
$Prefix = "http://localhost:$Port/"
$RootPath = $PSScriptRoot

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  Spica Astro - Астрологичен Портал" -ForegroundColor Yellow
Write-Host "  Сървърът работи на: $Prefix" -ForegroundColor Green
Write-Host "  Натиснете Ctrl+C за спиране на сървъра" -ForegroundColor DarkGray
Write-Host "======================================================" -ForegroundColor Cyan

# Отваряме браузъра
Start-Process $Prefix

$Listener = New-Object System.Net.HttpListener
$Listener.Prefixes.Add($Prefix)
$Listener.Start()

$MimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
}

try {
    while ($Listener.IsListening) {
        $Context = $Listener.GetContext()
        $Request = $Context.Request
        $Response = $Context.Response

        $UrlPath = $Request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($UrlPath)) {
            $UrlPath = "index.html"
        }

        $FilePath = Join-Path $RootPath $UrlPath

        if (Test-Path $FilePath -PathType Leaf) {
            $Ext = [System.IO.Path]::GetExtension($FilePath).ToLower()
            $ContentType = if ($MimeTypes.ContainsKey($Ext)) { $MimeTypes[$Ext] } else { "application/octet-stream" }
            $Response.ContentType = $ContentType

            $Bytes = [System.IO.File]::ReadAllBytes($FilePath)
            $Response.ContentLength64 = $Bytes.Length
            $Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
        } else {
            $Response.StatusCode = 404
            $Buffer = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $Response.OutputStream.Write($Buffer, 0, $Buffer.Length)
        }
        $Response.Close()
    }
} finally {
    $Listener.Stop()
    $Listener.Close()
}
