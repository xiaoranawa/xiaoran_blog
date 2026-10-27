# 在 Windows 服务器上用管理员身份运行：把 rss-server 和 cloudflared 隧道注册成开机自启的计划任务
# 用法：powershell -ExecutionPolicy Bypass -File install-windows.ps1
# 隧道的转发规则直接写在命令行里（--url），不需要 config.yml
param(
  [string]$ServerDir = $PSScriptRoot,
  [string]$Cloudflared = 'D:\cloudflared\cloudflared.exe',
  [string]$TunnelId = '79586263-f68b-4a37-8e76-b93b70bc6054',
  [string]$Credentials = "$env:USERPROFILE\.cloudflared\$TunnelId.json",
  [string]$Origin = 'http://127.0.0.1:8787'
)

$ErrorActionPreference = 'Stop'

foreach ($path in @((Join-Path $ServerDir 'rss-server.exe'), (Join-Path $ServerDir 'config.json'), $Cloudflared, $Credentials)) {
  if (-not (Test-Path $path)) { throw "找不到 $path ，先把文件放好再运行" }
}

# 以 SYSTEM 身份开机就跑，不用登录；不限运行时长（默认 3 天会被强制停掉）；挂了每分钟重启
$principal = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 999 `
  -RestartInterval (New-TimeSpan -Minutes 1) -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

$config = Join-Path $ServerDir 'config.json'
$cache = Join-Path $ServerDir 'data\cache.json'
$server = New-ScheduledTaskAction -Execute (Join-Path $ServerDir 'rss-server.exe') `
  -Argument "-config `"$config`" -cache `"$cache`"" -WorkingDirectory $ServerDir
Register-ScheduledTask -TaskName 'rss-server' -Action $server -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null

# 用隧道 ID 加凭据文件启动，SYSTEM 账号下不需要 cert.pem；固定用 http2，你那边 QUIC 不太通
$tunnelArgs = "tunnel --protocol http2 --url $Origin run --credentials-file `"$Credentials`" $TunnelId"
$tunnelAction = New-ScheduledTaskAction -Execute $Cloudflared -Argument $tunnelArgs
Register-ScheduledTask -TaskName 'cloudflared-rss' -Action $tunnelAction -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null

Start-ScheduledTask -TaskName 'rss-server'
Start-ScheduledTask -TaskName 'cloudflared-rss'
Write-Host '已注册并启动 rss-server 和 cloudflared-rss 两个计划任务，浏览器打开 https://rss.xiaoowo.top/api/circle 检查一下'
