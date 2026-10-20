[CmdletBinding()]
param(
    [string]$ProjectPath = '',
    [switch]$NoConfirm,
    [switch]$ValidateOnly
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$Vps = 'root@72.60.51.248'
$DeployScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $ProjectPath) { $ProjectPath = Split-Path -Parent $DeployScriptRoot }

function Invoke-Checked {
    param([string]$Command, [string[]]$Arguments)
    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) { throw "$Command falhou (codigo $LASTEXITCODE)." }
}

function Invoke-RemoteScript {
    param([string]$Script, [string]$Command)
    $normalized = $Script -replace "`r`n", "`n"
    $payload = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($normalized))
    Invoke-Checked 'ssh' @('-o', 'BatchMode=yes', '-o', 'ConnectTimeout=15', $Vps, "printf '%s' '$payload' | base64 -d | $Command")
}

try {
    foreach ($command in @('git', 'node', 'ssh')) { Get-Command $command -ErrorAction Stop | Out-Null }
    if (-not (Test-Path -LiteralPath (Join-Path $ProjectPath '.git'))) { throw 'Repositorio local nao encontrado.' }
    $remoteScript = [IO.File]::ReadAllText((Join-Path $DeployScriptRoot 'deploy-vps.sh'))
    if ($ValidateOnly) {
        Invoke-RemoteScript $remoteScript 'bash -n'
        Write-Host 'Sintaxe do deploy validada. Nenhum pull ou deploy executado.' -ForegroundColor Green
        exit 0
    }
    Write-Host 'Paychinxa: pull local, testes, pull na VPS, backup, build e deploy.' -ForegroundColor Cyan
    Write-Host 'Banco, administradores e configuracao privada serao preservados.'
    if (-not $NoConfirm) {
        if ((Read-Host 'Digite DEPLOY para continuar') -cne 'DEPLOY') { throw 'Operacao cancelada. Nada foi alterado.' }
    }

    Push-Location $ProjectPath
    try {
        if ((& git branch --show-current).Trim() -ne 'main') { throw 'Selecione a branch main antes do deploy.' }
        Invoke-Checked 'git' @('diff', '--quiet')
        Invoke-Checked 'git' @('diff', '--cached', '--quiet')
        $previousLock = (& git rev-parse 'HEAD:package-lock.json').Trim()
        Invoke-Checked 'git' @('pull', '--ff-only', 'origin', 'main')
        $currentLock = (& git rev-parse 'HEAD:package-lock.json').Trim()
        if ($previousLock -ne $currentLock -or -not (Test-Path 'node_modules/typescript/bin/tsc')) {
            Invoke-Checked 'npm.cmd' @('ci', '--include=dev')
        }
        $revision = (& git rev-parse HEAD).Trim()
        if ($revision -notmatch '^[a-f0-9]{40}$') { throw 'Commit local invalido.' }
        if ($revision -ne (& git rev-parse origin/main).Trim()) { throw 'Ha commits locais ainda nao publicados no GitHub.' }
        Invoke-Checked 'node' @('node_modules/typescript/bin/tsc', '--noEmit')
        Invoke-Checked 'node' @('--experimental-strip-types', '--test', 'tests/*.test.ts')
        Invoke-Checked 'git' @('diff', '--quiet')
        Invoke-Checked 'git' @('diff', '--cached', '--quiet')
        # Reload after pull so this invocation uses the matching remote deploy script.
        $remoteScript = [IO.File]::ReadAllText((Join-Path $DeployScriptRoot 'deploy-vps.sh'))
        Invoke-RemoteScript $remoteScript "bash -s -- $revision"
    }
    finally { Pop-Location }
    Write-Host 'PULL E DEPLOY CONCLUIDOS E VALIDADOS.' -ForegroundColor Green
}
catch {
    Write-Host "ERRO: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
