param([string]$Mode = '')

$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}
Set-Location -Path $PSScriptRoot

function Test-PortOpen($HostName, $Port) {
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $result = $client.BeginConnect($HostName, $Port, $null, $null)
        $success = $result.AsyncWaitHandle.WaitOne(300)
        if ($success -and $client.Connected) { $client.Close(); return $true }
        $client.Close()
        return $false
    } catch { return $false }
}

if (Test-PortOpen '127.0.0.1' 8934) {
    Write-Host '재고현황 로컬 서버가 이미 실행 중입니다 (http://localhost:8934).' -ForegroundColor Green
    Write-Host '발주서 검증 도구에서 "실시간 재고 다운로드"를 눌러주세요.'
    Write-Host ''
    Read-Host '아무 키나 누르면 창이 닫힙니다'
    exit 0
}

$localEnv = Join-Path $PSScriptRoot '.env'
$repoRootEnv = Join-Path $PSScriptRoot '..\..\..\.env'

if (-not (Test-Path $localEnv) -and -not (Test-Path $repoRootEnv)) {
    Write-Host '[안내] .env 파일을 찾지 못했습니다.' -ForegroundColor Yellow
    Write-Host '.env.example 파일을 복사해서 이름을 .env로 바꾸고, 본인 WMS 아이디/비밀번호를 채워주세요.'
    Read-Host '아무 키나 누르면 창이 닫힙니다'
    exit 1
}

if (-not (Test-Path (Join-Path $PSScriptRoot 'node_modules'))) {
    Write-Host '처음 실행이라 필요한 패키지를 설치합니다. 잠시만 기다려주세요...'
    npm install
    Write-Host ''
}

Write-Host '재고현황 로컬 서버를 시작합니다...'
Write-Host '이 창을 닫으면 서버도 함께 꺼집니다. 발주서 검증 도구를 쓰는 동안엔 이 창을 그대로 켜두세요.'
Write-Host ''

if ($Mode -ne 'noopen') {
    $htmlPath = Join-Path $PSScriptRoot '..\발주서검증도구\발주서검증도구_웹.html'
    Start-Process -FilePath $htmlPath
}

node server.js

Write-Host ''
Write-Host '서버가 종료되었습니다.'
Read-Host '아무 키나 누르면 창이 닫힙니다'
