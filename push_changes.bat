@echo off
echo ========================================
echo  Pushing EduNize2 to GitHub
echo ========================================
echo.
echo Your changes are ready to push!
echo Commit: Fix blank screen and notification settings
echo.
echo When prompted, sign in with your GitHub account:
echo Username: Divy-Panchal
echo Password: Use your GitHub password or Personal Access Token
echo.
pause
echo.
echo Pushing to GitHub...
git push -u origin master
echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo  SUCCESS! Changes pushed to GitHub
    echo ========================================
) else (
    echo ========================================
    echo  FAILED! Please check your credentials
    echo ========================================
)
echo.
pause
