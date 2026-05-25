@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

echo TETR.IO Translation Patcher
echo ===========================

:: Find TETR.IO installation path
set "TETRIO_PATH=%LOCALAPPDATA%\Programs\tetrio-desktop\TETR.IO.exe"

if not exist "%TETRIO_PATH%" (
    echo TETR.IO was not found at the default location:
    echo %TETRIO_PATH%
    echo Please install TETR.IO first.
    pause
    exit /b 1
)

echo Using TETR.IO from: %TETRIO_PATH%
echo Running patch script...

set "ELECTRON_RUN_AS_NODE=1"
"%TETRIO_PATH%" patch.js

if %ERRORLEVEL% equ 0 (
    echo.
    echo Patch completed successfully!
) else (
    echo.
    echo Patch failed.
)

pause
