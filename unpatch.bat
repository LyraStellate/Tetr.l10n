@echo off
setlocal
chcp 65001 >nul

echo TETR.IO Translation Unpatcher
echo =============================

set "RESOURCES_PATH=%LOCALAPPDATA%\Programs\tetrio-desktop\resources"

if not exist "%RESOURCES_PATH%\app.asar.bak" (
    echo Backup file app.asar.bak not found.
    echo It seems the patch is not installed, or the backup was deleted.
    pause
    exit /b 1
)

echo Restoring original app.asar...
copy /Y "%RESOURCES_PATH%\app.asar.bak" "%RESOURCES_PATH%\app.asar" >nul
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to restore app.asar. Make sure TETR.IO is closed!
    pause
    exit /b 1
)

echo Removing backup file...
del /Q "%RESOURCES_PATH%\app.asar.bak"

if exist "%RESOURCES_PATH%\app_unpacked_old" (
    echo Restoring old unpacked app directory...
    if exist "%RESOURCES_PATH%\app" rmdir /S /Q "%RESOURCES_PATH%\app"
    ren "%RESOURCES_PATH%\app_unpacked_old" "app"
)

echo Removing translation files...
if exist "%RESOURCES_PATH%\translation_patch" (
    rmdir /S /Q "%RESOURCES_PATH%\translation_patch"
)

echo Cleaning up any temporary files...
if exist "%RESOURCES_PATH%\app_temp" rmdir /S /Q "%RESOURCES_PATH%\app_temp"
if exist "%RESOURCES_PATH%\app.asar.tmp" del /Q "%RESOURCES_PATH%\app.asar.tmp"
if exist "%RESOURCES_PATH%\temp_extract.asar" del /Q "%RESOURCES_PATH%\temp_extract.asar"

echo Cleaning up patch scripts if they were placed in the resources folder...
if exist "%RESOURCES_PATH%\patch.js" del /Q "%RESOURCES_PATH%\patch.js"
if exist "%RESOURCES_PATH%\patch.bat" del /Q "%RESOURCES_PATH%\patch.bat"
if exist "%RESOURCES_PATH%\translate.js" del /Q "%RESOURCES_PATH%\translate.js"
if exist "%RESOURCES_PATH%\translations.csv" del /Q "%RESOURCES_PATH%\translations.csv"
if exist "%RESOURCES_PATH%\unpatch.bat" (
    echo Unpatch completed successfully! TETR.IO is now in its original state.
    del /Q "%RESOURCES_PATH%\unpatch.bat"
    exit /b 0
)

echo.
echo Unpatch completed successfully! TETR.IO is now in its original state.
pause
