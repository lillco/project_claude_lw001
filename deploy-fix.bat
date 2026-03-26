@echo off
REM Deployment script for database fix
REM This uploads the fixed files to the production server

echo ========================================
echo Deploying Database Fix to Production
echo ========================================
echo.

REM Set your FTP/SFTP details here
set SERVER=lwtest.lillco.de
set REMOTE_PATH=/httpdocs/association

echo Uploading api/Database.php...
echo Uploading api/.htaccess...
echo.
echo Please use your preferred FTP client to upload:
echo   - api/Database.php
echo   - api/.htaccess
echo.
echo Or use this lftp command:
echo lftp -u username,%SERVER% -e "cd %REMOTE_PATH%; put api/Database.php; put api/.htaccess; bye"
echo.
pause
