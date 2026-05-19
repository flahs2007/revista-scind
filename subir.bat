@echo off
echo =========================================
echo   Subiendo actualizaciones a GitHub...
echo =========================================
echo.

:: Agregar todos los cambios
git add .

:: Pedir un mensaje para el commit
set /p commit_msg="Escribe un mensaje para los cambios (o presiona Enter para usar 'Actualizacion automatica'): "

if "%commit_msg%"=="" set commit_msg=Actualizacion automatica

:: Hacer el commit
git commit -m "%commit_msg%"

:: Subir los cambios a la rama principal (main)
echo.
echo Subiendo los archivos a GitHub...
git push origin main

echo.
echo =========================================
echo   ¡Listo! Cambios subidos exitosamente.
echo =========================================
pause
