@echo off
REM Git Push Script for EduNize2

echo Checking Git status...
git status

echo.
echo Adding all changes...
git add .

echo.
echo Committing changes...
git commit -m "Fix Pomodoro Timer drag dot alignment - Fixed progress calculation to use current mode duration - Updated drag handler for different mode durations - Inverted progress ring to fill clockwise - Adjusted dot angle with +90 offset for SVG rotation"

echo.
echo Checking remote repository...
git remote -v

echo.
echo If no remote is shown above, adding remote...
git remote add origin https://github.com/Divy-Panchal/EduNize2.git 2>nul

echo.
echo Pushing to GitHub...
git push -u origin main

echo.
echo If the above failed, trying master branch...
git push -u origin master

echo.
echo Done!
pause
