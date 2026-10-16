@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0actualizar-ediciones.ps1"
echo.
echo Presiona una tecla para cerrar...
pause >nul
endlocal
