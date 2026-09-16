$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}

$batPath = Join-Path $PSScriptRoot '재고서버_시작.bat'
$comSpec = $env:ComSpec
$command = '"' + $comSpec + '" /c start "" "' + $batPath + '" noopen'

$protoKey = 'HKCU:\Software\Classes\startstockserver'
New-Item -Path $protoKey -Force | Out-Null
Set-ItemProperty -Path $protoKey -Name '(default)' -Value 'URL:Start Stock Server Protocol'
Set-ItemProperty -Path $protoKey -Name 'URL Protocol' -Value ''

$cmdKey = Join-Path $protoKey 'shell\open\command'
New-Item -Path $cmdKey -Force | Out-Null
Set-ItemProperty -Path $cmdKey -Name '(default)' -Value $command

Write-Host '등록 완료.' -ForegroundColor Green
Write-Host '이제 발주서 검증 도구 웹페이지에서 "재고서버 켜기" 버튼이 동작합니다.'
Write-Host '처음 클릭할 때 브라우저가 "이 앱을 열까요?" 하고 물어보면, "항상 허용" 체크 후 열기를 눌러주세요.'
Write-Host '(한 번만 등록하면 됩니다. 다시 실행할 필요 없습니다.)'
Write-Host ''
Read-Host '아무 키나 누르면 창이 닫힙니다'
